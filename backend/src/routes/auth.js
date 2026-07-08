import { Router } from 'express';
import { register, login, logout, refreshToken, lookupUserByEmail, switchRole } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/users/lookup', protect, lookupUserByEmail);
router.patch('/switch-role', protect, switchRole);

export default router;
