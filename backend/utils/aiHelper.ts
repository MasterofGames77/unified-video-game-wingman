import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getClientCredentialsAccessToken } from './twitchAuth';

// Load environment variables from .env
dotenv.config();
console.log("Client ID:", process.env.TWITCH_CLIENT_ID);
console.log("RAWG API Key:", process.env.RAWG_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility function to clean and match titles
function cleanAndMatchTitle(queryTitle: string, recordTitle: string): boolean {
    const cleanQuery = queryTitle.toLowerCase().trim();
    const cleanRecord = recordTitle.toLowerCase().trim();
    return cleanQuery === cleanRecord; // Simple exact match
}

export async function fetchFromIGDB(gameTitle: string): Promise<string | null> {
  try {
    const accessToken = await getClientCredentialsAccessToken();

    // Using ~ for partial matching in the IGDB query
    const query = `
      fields name, release_dates.date, platforms.name, developers.name, publishers.name;
      where name ~ "${gameTitle}";
    `;

    console.log("IGDB Query:", query); // Log query for debugging
    console.log("Headers:", {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`,
    });

    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      query,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID as string,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.length > 0) {
      // Find the most relevant match based on title matching
      const game = response.data.find((g: any) => cleanAndMatchTitle(gameTitle, g.name));
      if (game) {
        const releaseDate = game.release_dates?.[0]?.date
          ? new Date(game.release_dates[0].date * 1000).toLocaleDateString()
          : "unknown release date";
        const developers = game.developers?.map((d: any) => d.name).join(", ") || "unknown developers";
        const publishers = game.publishers?.map((p: any) => p.name).join(", ") || "unknown publishers";
        const platforms = game.platforms?.map((p: any) => p.name).join(", ") || "unknown platforms";

        return `${game.name} was released on ${releaseDate}, developed by ${developers} and published by ${publishers}, available on ${platforms}.`;
      }
    }

    return `No information found for the game title "${gameTitle}".`;
  } catch (error) {
    console.error("Error fetching data from IGDB:", error);
    return "Error fetching game information from IGDB.";
  }
}

export async function fetchFromRAWG(gameTitle: string): Promise<string | null> {
    try {
      const url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(gameTitle)}`;
      const response = await axios.get(url);
  
      if (response.data && response.data.results.length > 0) {
        const game = response.data.results.find((g: any) => cleanAndMatchTitle(gameTitle, g.name));
        if (game) {
          return `${game.name} was released on ${game.released}, developed by ${game.developers?.map((d: any) => d.name).join(", ") || "unknown developers"} and published by ${game.publishers?.map((p: any) => p.name).join(", ") || "unknown publishers"}, available on ${game.platforms?.map((p: any) => p.platform.name).join(", ") || "unknown platforms"}.`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching data from RAWG:", error);
      return null;
    }
}

async function fetchSeriesFromIGDB(seriesTitle: string): Promise<any[] | null> {
    try {
      const accessToken = await getClientCredentialsAccessToken();
      const response = await axios.post(
        'https://api.igdb.com/v4/games',
        `fields name, release_dates.date, platforms.name; where series.name ~ "${seriesTitle}";`,
        {
          headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID as string,
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      return response.data || null;
    } catch (error) {
      console.error("Error fetching series data from IGDB:", error);
      return null;
    }
  }
  
async function fetchSeriesFromRAWG(seriesTitle: string): Promise<any[] | null> {
  try {
    const url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(seriesTitle)}`;
    const response = await axios.get(url);
    return response.data.results || null;
  } catch (error) {
    console.error("Error fetching series data from RAWG:", error);
    return null;
  }
}

export const getChatCompletion = async (question: string): Promise<string | null> => {
    try {
      // Check if the question is about a game series
      if (question.toLowerCase().includes("list all of the games in the")) {
        const seriesTitle = question.match(/list all of the games in the (.+?) series/i)?.[1];
        if (seriesTitle) {
          let games = await fetchSeriesFromIGDB(seriesTitle) || await fetchSeriesFromRAWG(seriesTitle);
          if (games) {
            return games.map((game: any, index: number) => `${index + 1}. ${game.name}`).join("\n");
          }
        }
        return "Series not found.";
      }
  
      // Try IGDB or RAWG for game data
      let response = await fetchFromIGDB(question) || await fetchFromRAWG(question);
  
      // Fallback to OpenAI if no response from APIs
      if (!response) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an AI assistant specializing in video games.' },
            { role: 'user', content: question }
          ],
          max_tokens: 800,
        });
        response = completion.choices[0].message.content;
      }
      return response;
    } catch (error) {
      console.error("Failed to get completion:", error);
      return null;
    }
};

export const analyzeUserQuestions = (questions: Array<{ question: string }>): string[] => {
    const genreMapping: Record<string, string> = {
      "rpg": "Role-Playing Game",
      "role-playing": "Role-Playing Game",
      "first-person shooter": "First-Person Shooter",
      "third-person shooter": "Third-Person Shooter",
      "top-down shooter": "Top-Down Shooter",
      "fps": "First-Person Shooter",
      "action-adventure": "Action-Adventure",
      "platformer": "Platformer",
      "strategy": "Strategy",
      "puzzle": "Puzzle",
      "puzzle-platformer": "Puzzle-Platformer",
      "simulation": "Simulation",
      "sports": "Sports",
      "racing": "Racing",
      "fighting": "Fighting",
      "adventure": "Adventure",
      "horror": "Horror",
      "survival": "Survival",
      "sandbox": "Sandbox",
      "mmo": "Massively Multiplayer Online",
      "mmorpg": "Massively Multiplayer Online Role-Playing Game",
      "battle royale": "Battle Royale",
      "open world": "Open World",
      "stealth": "Stealth",
      "rhythm": "Rhythm",
      "party": "Party",
      "visual novel": "Visual Novel",
      "indie": "Indie",
      "arcade": "Arcade",
      "shooter": "Shooter",
      "text-based": "Text Based",
      "turn-based tactics": "Turn-Based Tactics",
      "real-time strategy": "Real-Time Strategy",
      "tactical rpg": "Tactical RPG",
      "tactical role-playing game": "Tactical Role-Playing Game",
      "artillery": "Artillery",
      "endless runner": "Endless Runner",
      "tile-matching": "Tile-Matching",
      "hack and slash": "Hack and Slash",
      "4X": "4X",
      "moba": "Multiplayer Online Battle Arena",
      "multiplayer online battle arena": "Multiplayer Online Battle Arena",
      "maze": "Maze",
      "tower defense": "Tower Defense",
      "digital collectible card game": "Digital Collectible Card Game",
      "roguelike": "Roguelike",
      "point and click": "Point and Click",
      "social simulation": "Social Simulation",
      "interactive story": "Interactive Story",
      "level editor": "Level Editor",
      "game creation system": "Game Creation System",
      "exergaming": "Exergaming",
      "exercise": "Exergaming",
      "run and gun": "Run and Gun",
      "rail shooter": "Rail Shooter",
      "beat 'em up": "Beat 'em up",
      "metroidvania": "Metroidvania",
      "survival horror": "Survival Horror",
      "action rpg": "Action Role-Playing Game",
      "action role-playing game": "Action Role-Playing Game",
      "immersive sim": "Immersive Sim",
      "construction and management sim": "Construction and Management Simulation"
    };
  
    const genres: Record<string, number> = {}; // Initialize an object to store genre counts
  
    // Update the loop to use the corrected types
    questions.forEach(({ question }) => {
      Object.keys(genreMapping).forEach(keyword => {
        if (question.toLowerCase().includes(keyword)) {
          const genre = genreMapping[keyword];
          genres[genre] = (genres[genre] || 0) + 1;
        }
      });
    });
  
    // Return genres sorted by frequency
    return Object.keys(genres).sort((a, b) => genres[b] - genres[a]);
};  

export const fetchRecommendations = async (genre: string): Promise<string[]> => {
    const url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&genres=${encodeURIComponent(genre)}`;
    try {
      const response = await axios.get(url);
      return response.data.results.map((game: any) => game.name) || [];
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
};
