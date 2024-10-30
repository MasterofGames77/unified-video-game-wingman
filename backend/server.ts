import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './middleware/realtime';
import authRoutes from './routes/auth';
import waitlistRoutes from './routes/waitlist';
import getWaitlistPositionRoute from './routes/getWaitlistPosition';
import approveUserRoute from './routes/approveUser';
import connectToMongoDB from './utils/mongodb';

dotenv.config();

const port = process.env.PORT || 5000;
const expressApp = express();

// Set up CORS
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const whitelist = [
      'http://localhost:3000',
      'https://video-game-wingman-57d61bef9e61.herokuapp.com/',
    ];
    if (!origin || whitelist.includes(origin)) {
      console.log(`CORS request from origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS request blocked from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

expressApp.use(cors(corsOptions));
expressApp.use(express.json());

// MongoDB Connection
connectToMongoDB();

// Middleware to log routes
expressApp.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
  next();
});

// Express routes for backend API
expressApp.use('/api/auth', authRoutes);
expressApp.use('/api/waitlist', waitlistRoutes);
expressApp.use('/api/position', getWaitlistPositionRoute);
expressApp.use('/api/approveUser', approveUserRoute);

// Global error handling middleware
expressApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Global error handler:`, err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Create HTTP server and attach Express app to it
const server = createServer(expressApp);

// Initialize Socket.IO server
initSocket(server);

// Start the server
server.listen(port, () => {
  console.log(`> Server ready on http://localhost:${port}`);
});