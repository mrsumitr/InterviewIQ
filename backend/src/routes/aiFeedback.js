import express from 'express';
import { getAIFeedback } from '../controllers/aiFeedback.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.post('/', protect, getAIFeedback);
export default router;
