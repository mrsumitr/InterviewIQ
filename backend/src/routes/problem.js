import { Router } from 'express';
import { getProblems, getProblemBySlug } from '../controllers/problem.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getProblems);
router.get('/:slug', protect, getProblemBySlug);

export default router;
