import { Router } from 'express';
import { body } from 'express-validator';
import { InterviewController } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.post(
  '/start',
  [
    body('domain').trim().notEmpty().withMessage('Domain is required'),
    body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
    body('experienceLevel').isIn(['Fresher', 'Intermediate', 'Advanced']).withMessage('Invalid experienceLevel'),
  ],
  validateRequest,
  InterviewController.start
);

router.post(
  '/submit-answer',
  [
    body('interviewId').notEmpty().withMessage('Interview ID is required'),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    body('userAnswerText').notEmpty().withMessage('Answer text cannot be empty'),
  ],
  validateRequest,
  InterviewController.submitAnswer
);

router.post(
  '/complete',
  [body('interviewId').notEmpty().withMessage('Interview ID is required')],
  validateRequest,
  InterviewController.complete
);

router.get('/history', InterviewController.getHistory);
router.get('/report/:id', InterviewController.getReport);

export default router;
export const interviewRoutes = router;
