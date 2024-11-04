import mongoose, { Document, Schema } from 'mongoose';

interface Progress {
  firstQuestion?: number;
  frequentAsker?: number;
  rpgEnthusiast?: number;
  bossBuster?: number;
  strategySpecialist?: number;
  actionAficionado?: number;
  battleRoyale?: number;
  sportsChampion?: number;
  adventureAddict?: number;
  shooterSpecialist?: number;
  puzzlePro?: number;
  racingExpert?: number;
  stealthSpecialist?: number;
  horrorHero?: number;
  triviaMaster?: number;
  totalQuestions?: number;
  dailyExplorer?: number;
  speedrunner?: number;
  collectorPro?: number;
  dataDiver?: number;
  performanceTweaker?: number;
  conversationalist?: number;
}

interface Achievement {
  name: string;
  dateEarned: Date;
}

export interface IUser extends Document {
  email: string;
  userId: string; // Unique user-friendly identifier
  position: number | null; // Waitlist position
  isApproved: boolean; // Approval status for main app access
  hasProAccess: boolean; // Pro access status
  conversationCount: number; // Count of user interactions in main app
  achievements: Achievement[]; // List of achievements for gamification
  progress: Progress; // Tracking user progress for achievements
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  userId: { type: String, unique: true, required: true, default: () => `user-${Date.now()}` }, // Unique identifier with default value
  position: { type: Number, default: null }, // Allow null for the position if not assigned yet
  isApproved: { type: Boolean, default: false },
  hasProAccess: { type: Boolean, default: false },
  conversationCount: { type: Number, required: true, default: 0 },
  achievements: [
    {
      name: { type: String, required: true },
      dateEarned: { type: Date, required: true },
    },
  ],
  progress: {
    firstQuestion: { type: Number, default: 0 },
    frequentAsker: { type: Number, default: 0 },
    rpgEnthusiast: { type: Number, default: 0 },
    bossBuster: { type: Number, default: 0 },
    strategySpecialist: { type: Number, default: 0 },
    actionAficionado: { type: Number, default: 0 },
    battleRoyale: { type: Number, default: 0 },
    sportsChampion: { type: Number, default: 0 },
    adventureAddict: { type: Number, default: 0 },
    shooterSpecialist: { type: Number, default: 0 },
    puzzlePro: { type: Number, default: 0 },
    racingExpert: { type: Number, default: 0 },
    stealthSpecialist: { type: Number, default: 0 },
    horrorHero: { type: Number, default: 0 },
    triviaMaster: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    dailyExplorer: { type: Number, default: 0 },
    speedrunner: { type: Number, default: 0 },
    collectorPro: { type: Number, default: 0 },
    dataDiver: { type: Number, default: 0 },
    performanceTweaker: { type: Number, default: 0 },
    conversationalist: { type: Number, default: 0 },
  },
}, { collection: 'users' }); // Name of the collection in MongoDB

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;