import { Router } from 'express';
import { generateToken } from '../controllers/livekit.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/token', protect, generateToken);

export default router;
