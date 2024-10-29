import { Request, Response, Router } from 'express';
import User from '../models/User';

const router = Router();

// POST /api/waitlist
router.post('/waitlist', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: 'Email is already on the waitlist' });
      return;
    }

    const position = await User.countDocuments() + 1;

    const newUser = new User({
      email,
      position,
      isApproved: false,
    });

    await newUser.save();

    res.status(201).json({
      message: 'Congratulations! You\'ve been added to the waitlist.',
      position,
    });
  } catch (err) {
    console.error('Error adding email to waitlist:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

export default router;