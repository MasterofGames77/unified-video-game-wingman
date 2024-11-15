import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './middleware/realtime';
import connectToMongoDB from './utils/mongodb';

// Route Imports
import assistantHandler from './routes/assistant';
import authRoutes from './routes/auth';
import waitlistRoutes from './routes/waitlist';
import getGameTitlesRoute from './routes/getGameTitle';
import getWaitlistPositionRoute from './routes/getWaitlistPosition';
import approveUserRoute from './routes/approveUser';
import getConversationRoute from './routes/getConversation';
import deleteInteractionRoute from './routes/deleteInteraction';
import initiateRoute from './routes/initiate';

dotenv.config();
const port = process.env.PORT || 5000;
const expressApp = express();

// CORS Setup
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const whitelist = [
      'http://localhost:3000'
      // 'https://video-game-wingman-57d61bef9e61.herokuapp.com/',
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

// Route Logging Middleware
expressApp.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
  next();
});

// Route Setup
expressApp.use('/api/auth', authRoutes);
expressApp.use('/api/waitlist', waitlistRoutes);
expressApp.use('/api/position', getWaitlistPositionRoute);
expressApp.use('/api/approveUser', approveUserRoute);
expressApp.use('/api/initiate', initiateRoute);
expressApp.use('/api/getGameTitles', getGameTitlesRoute);

// Assistant-related Routes
expressApp.use('/api/assistant', getConversationRoute);
expressApp.use('/api/assistant', deleteInteractionRoute);
expressApp.post('/api/assistant', assistantHandler);  // Main assistant endpoint

// Error Handling Middleware
expressApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Global error handler:`, err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// HTTP Server and Socket.IO Initialization
const server = createServer(expressApp);
initSocket(server);

// Start the Server
server.listen(port, () => {
  console.log(`> Server ready on http://localhost:${port}`);
});