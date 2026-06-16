import express from 'express';
import cors from 'cors';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const app = express();

app.use(cors({ origin: ENV.CLIENT_URL }));
app.use(express.json());

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

