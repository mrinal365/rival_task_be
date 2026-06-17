import { Router } from 'express';
import { signup, login, getMe, makeAdmin } from './auth.controller.js';
import { validateSignup, validateLogin } from './auth.validation.js';
import { authenticate } from './auth.middleware.js';

const router = Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/make-admin/:userId', makeAdmin);

// Protected route
router.get('/me', authenticate, getMe);

export default router;
