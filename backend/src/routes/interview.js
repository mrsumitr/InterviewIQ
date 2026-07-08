import { Router } from 'express';
import {
  createInterview,
  getMyInterviews,
  getInterviewByRoomId,
  updateInterviewCode,
  startInterview,
  endInterview,
  lockInterview,
  saveInterviewerFeedback,
} from '../controllers/interview.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createInterview);
router.get('/', protect, getMyInterviews);
router.get('/:roomId', protect, getInterviewByRoomId);
router.patch('/:roomId/code', protect, updateInterviewCode);
router.patch('/:roomId/start', protect, startInterview);
router.patch('/:roomId/end', protect, endInterview);
router.patch('/:roomId/lock', protect, lockInterview);
router.patch('/:roomId/feedback', protect, saveInterviewerFeedback);

export default router;
