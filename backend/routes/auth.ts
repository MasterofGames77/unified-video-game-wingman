import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction
  ? 'https://vgw-splash-page-frontend-71431835113b.herokuapp.com/'
  : 'http://localhost:3000';

// Helper function to get the correct ordinal suffix for a position
function getOrdinalSuffix(position: number): string {
  const remainder10 = position % 10;
  const remainder100 = position % 100;

  if (remainder10 === 1 && remainder100 !== 11) return `${position}st`;
  if (remainder10 === 2 && remainder100 !== 12) return `${position}nd`;
  if (remainder10 === 3 && remainder100 !== 13) return `${position}rd`;
  return `${position}th`;
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  console.log('Signup request received:', req.body);

  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isApproved) {
        res.status(200).json({
          message: 'You have already signed up and are approved.',
          link: 'https://video-game-wingman-57d61bef9e61.herokuapp.com/',
        });
        return;
      }
      res.status(200).json({
        message: `You have already signed up and are on the waitlist. Your current waitlist position is ${existingUser.position}.`,
      });
      return;
    }

    const position = await User.countDocuments() + 1;
    const newUser = new User({ email, position, isApproved: false });
    await newUser.save();

    const bonusMessage = position <= 5000
      ? `You are the ${getOrdinalSuffix(position)} of the first 5,000 users to sign up! You will receive 1 year of Wingman Pro for free!`
      : '';

    res.status(201).json({
      message: `Congratulations! You've been added to the waitlist. ${bonusMessage}`,
      position,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error adding email to the waitlist' });
  }
});

export default router;