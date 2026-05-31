import { Router } from 'express';
import { body } from 'express-validator';
import { MentorController } from '../controllers/mentor.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/list', MentorController.listMentors);

router.post(
  '/book',
  [
    body('mentorId').notEmpty().withMessage('Mentor ID is required'),
    body('slot').notEmpty().withMessage('Slot time is required'),
  ],
  validateRequest,
  MentorController.bookSession
);

router.post(
  '/review',
  requireRole(['Mentor', 'Admin', 'Super Admin']),
  [
    body('answerId').notEmpty().withMessage('Answer ID is required'),
    body('reviewText').notEmpty().withMessage('Review details are required'),
  ],
  validateRequest,
  MentorController.submitReview
);

export default router;
export const mentorRoutes = router;
