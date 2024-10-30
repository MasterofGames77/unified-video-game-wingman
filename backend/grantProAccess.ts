import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const grantProAccessToApprovedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    // Update approved users without Pro Access, regardless of position
    const updatedUsers = await User.updateMany(
      { isApproved: true, hasProAccess: false },
      { $set: { hasProAccess: true } }
    );

    console.log(`Updated ${updatedUsers.modifiedCount} users with Pro Access.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

grantProAccessToApprovedUsers();