import { Router } from 'express';
import { body } from 'express-validator';
import { CodingController } from '../controllers/coding.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.post(
  '/submit',
  [
    body('problemId').notEmpty().withMessage('Problem ID is required'),
    body('language').isIn(['javascript', 'python', 'java', 'cpp']).withMessage('Language selected is not supported'),
    body('code').notEmpty().withMessage('Code submission cannot be empty'),
  ],
  validateRequest,
  CodingController.submit
);

router.get('/history', CodingController.getHistory);

export default router;
export const codingRoutes = router;
