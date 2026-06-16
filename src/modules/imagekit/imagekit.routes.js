import { Router } from 'express';
import { getAuthParams } from './imagekit.controller.js';
import { authenticate } from '../auth/auth.middleware.js';

const router = Router();

// Expose the ImageKit auth endpoint (protected, so only logged in users can get upload credentials)
router.get('/auth', authenticate, getAuthParams);

export default router;
