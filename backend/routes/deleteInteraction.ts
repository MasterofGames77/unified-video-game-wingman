import { Router, Request, Response } from 'express';
import connectToMongoDB from '../utils/mongodb';
import Question from '../models/Question';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.post('/deleteInteraction', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Interaction ID is required' });
      return;
    }

    await connectToMongoDB();
    const result = await Question.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Interaction not found' });
      return;
    }

    res.status(200).json({ message: 'Interaction deleted successfully' });
  })
);

export default router;