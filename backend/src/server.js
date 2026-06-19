import express from 'express';
import cors from 'cors';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import livekitRoutes from './routes/livekit.js';
const app = express();
// credentials: true allows cookies to be sent in cross-origin requests, which is essential for maintaining user sessions and authentication states when the frontend and backend are hosted on different domains or ports.
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/livekit', livekitRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ msg: "API is healthy" });
});
app.get('/books', (req, res) => {
  res.status(200).json({ msg: "this is the book endpoint" });
});
const startServer = async () => {
  try{
  await connectDB();
  app.listen(ENV.PORT, () => {
  console.log('Server is running on port', ENV.PORT);
  });
  }
  catch(error){
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};
startServer();

