import { Router, Request, Response } from 'express';
import connectToMongoDB from '../utils/mongodb';
import Question from '../models/Question';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.get('/getConversation', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    await connectToMongoDB();
    const conversations = await Question.find({ userId }).sort({ timestamp: -1 });
    res.status(200).json(conversations);
    console.log("Received request for getConversation with userId:", req.query.userId);
  })
);

export default router;