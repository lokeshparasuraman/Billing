import { Router } from 'express';
import { register, login, getMe, deleteAccount } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.delete('/account', authMiddleware, deleteAccount);
router.post('/account/delete', authMiddleware, deleteAccount);
router.post('/account', authMiddleware, deleteAccount);

export default router;
