import { Request, Response } from 'express';
import connectToMongoDB from '../utils/mongodb';
import Question from '../models/Question';
import User from '../models/User';
import path from 'path';

import { 
  getChatCompletion, 
  fetchRecommendations, 
  analyzeUserQuestions 
} from '../utils/aiHelper';

import {
  getAccessToken, 
  getTwitchUserData, 
  redirectToTwitch 
} from '../utils/twitchAuth';

import { readCSVFile } from '../utils/csvHelper';

const CSV_FILE_PATH = path.join(__dirname, '../data/Video Games Data.csv');

// Fetch game data from the CSV file
const getGameInfoFromCSV = async (gameTitle: string): Promise<string | null> => {
  try {
    const gameData = await readCSVFile(CSV_FILE_PATH);
    const game = gameData.find(g => g.title.toLowerCase() === gameTitle.toLowerCase());

    if (game) {
      return `${game.title} was released in ${game.release_year} for ${game.console}. Genre: ${game.genre}. Published by ${game.publisher}. Critic Score: ${game.critic_score}, Total Sales: ${game.total_sales} million units.`;
    } else {
      return `Sorry, I couldn't find information on ${gameTitle} in our database.`;
    }
  } catch (error) {
    console.error("Error reading CSV file:", error);
    return "Error fetching game data from CSV.";
  }
};

// Fetch and combine game data from various sources
const fetchAndCombineGameData = async (question: string, answer: string): Promise<string> => {
  const gameName = question.replace(/when (was|did) (.*?) (released|come out)/i, "$2").trim();

  try {
    const rawgResponse = await fetchRecommendations(gameName);
    const igdbResponse = await fetchRecommendations(gameName);

    let finalResponse = "Combined Game Information:\n";
    if (rawgResponse) finalResponse += `\nFrom RAWG: ${rawgResponse}`;
    if (igdbResponse) finalResponse += `\nFrom IGDB: ${igdbResponse}`;

    return finalResponse || answer;
  } catch (error) {
    console.error('Error fetching game data:', error);
    return `${answer}\n\nAdditional Information:\nFailed to fetch data due to an error.`;
  }
};

// Main assistant handler
const assistantHandler = async (req: Request, res: Response) => {
  console.log("Received request body:", req.body);
  const { userId, question, code } = req.body;

  console.log("Received userId:", userId);

  try {
    console.log("Received question:", question);
    await connectToMongoDB();

    let answer: string | null = null;

    if (question.toLowerCase().includes("information on")) {
      const gameTitle = question.replace(/information on/i, "").trim();
      answer = await getGameInfoFromCSV(gameTitle);
      answer = answer || `I'm sorry, I couldn't find information on ${gameTitle} in our database.`;
    }
    else if (question.toLowerCase().includes("recommendations")) {
      const previousQuestions = await Question.find({ userId });
      const genres = analyzeUserQuestions(previousQuestions);
      const recommendations = genres.length > 0 ? await fetchRecommendations(genres[0]) : [];

      answer = recommendations.length > 0 
        ? `Based on your preferences, I recommend these games: ${recommendations.join(', ')}.` 
        : "I couldn't find any recommendations based on your preferences.";
    }
    else if (question.toLowerCase().includes("when was") || question.toLowerCase().includes("when did")) {
      answer = await getChatCompletion(question);
      answer = answer ? await fetchAndCombineGameData(question, answer) : "I'm sorry, I couldn't generate a response. Please try again.";
    }
    // Twitch user data request handling with environment-based URL for redirect
    else if (question.toLowerCase().includes("twitch user data")) {
      if (!code) {
        // Modify redirect URL for local testing if needed
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : 'https://video-game-wingman-57d61bef9e61.herokuapp.com';
        redirectToTwitch(res, baseUrl);
        return;
      }
      const accessToken = await getAccessToken(code);
      const userData = await getTwitchUserData(accessToken);
      answer = `Twitch User Data: ${JSON.stringify(userData)}`;
    }
    else {
      answer = await getChatCompletion(question);
      answer = answer ? await fetchAndCombineGameData(question, answer) : "I'm sorry, I couldn't generate a response. Please try again.";
    }

    await Question.create({ userId, question, response: answer });
    await User.findOneAndUpdate({ userId }, { $inc: { conversationCount: 1 } });

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error in assistant handler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default assistantHandler;
