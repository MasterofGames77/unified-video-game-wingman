import type { Request, Response } from 'express';
import { redirectToTwitch } from '../utils/twitchAuth';

export default function handler(req: Request, res: Response) {
  console.log("Redirecting to Twitch for OAuth");

  // Determine the base URL based on environment
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://video-game-wingman-57d61bef9e61.herokuapp.com';

  // Pass the baseUrl as the second argument
  redirectToTwitch(res, baseUrl);
}