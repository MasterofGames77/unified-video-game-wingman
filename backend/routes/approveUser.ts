import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

// POST /api/approveUser
router.post('/approveUser', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Approve the user and remove them from the waitlist
    user.position = null;
    user.isApproved = true;
    await user.save();

    // Recalculate positions for remaining users on the waitlist
    const users = await User.find({ position: { $ne: null } }).sort('position');
    for (const [index, user] of users.entries()) {
      user.position = index + 1;
      await user.save();
    }

    res.status(200).json({ message: 'User approved and positions updated' });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;