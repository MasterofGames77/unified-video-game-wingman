import { Router, Request, Response } from 'express';
import { getTwitchUserData } from '../utils/twitchAuth';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.get(
  '/userData',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { accessToken } = req.query;

    if (!accessToken) {
      console.error("Access token is missing");
      res.status(400).json({ error: 'Access token is missing' });
      return;
    }

    try {
      const userData = await getTwitchUserData(accessToken as string);
      console.log("Fetched Twitch user data:", userData);
      res.status(200).json({ userData });
    } catch (error) {
      console.error("Error fetching Twitch user data:", error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  })
);

export default router;