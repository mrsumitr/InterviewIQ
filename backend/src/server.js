import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import { initSocket } from './lib/socket.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import livekitRoutes from './routes/livekit.js';
import interviewRoutes from './routes/interview.js';
import problemRoutes from './routes/problem.js';
import codeExecutionRoutes from './routes/codeExecution.js';

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// credentials: true allows cookies to be sent in cross-origin requests, which is essential for maintaining user sessions and authentication states when the frontend and backend are hosted on different domains or ports.
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/livekit', livekitRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/execute', codeExecutionRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ msg: "API is healthy" });
});
app.get('/books', (req, res) => {
  res.status(200).json({ msg: "this is the book endpoint" });
});
const startServer = async () => {
  try{
  await connectDB();
  httpServer.listen(ENV.PORT, () => {
  console.log('Server is running on port', ENV.PORT);
  });
  }
  catch(error){
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};
startServer();
