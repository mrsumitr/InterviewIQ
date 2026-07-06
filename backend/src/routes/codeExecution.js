import express from 'express';
import { executeCode } from '../controllers/codeExecution.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.post('/', protect, executeCode);
export default router;
