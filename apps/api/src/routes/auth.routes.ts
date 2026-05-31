import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
const router = Router();

router.post(
  '/register',
  authRateLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['Student', 'Mentor', 'Admin', 'Super Admin']).withMessage('Invalid role classification'),
  ],
  validateRequest,
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  AuthController.login
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validateRequest,
  AuthController.refresh
);

router.post('/logout', AuthController.logout);

export default router;
// Make sure this is standard ES export
export const authRoutes = router;
