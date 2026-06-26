import { Router } from 'express';
import {
  createInterview,
  getMyInterviews,
  startInterview,
  endInterview,
} from '../controllers/interview.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createInterview);
router.get('/', protect, getMyInterviews);
router.patch('/:roomId/start', protect, startInterview);
router.patch('/:roomId/end', protect, endInterview);

export default router;
