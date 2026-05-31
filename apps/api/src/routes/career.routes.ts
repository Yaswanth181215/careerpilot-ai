import { Router } from 'express';
import { body } from 'express-validator';
import { CareerController } from '../controllers/career.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.post(
  '/coach/ask',
  [body('userMessage').notEmpty().withMessage('Message must not be empty')],
  validateRequest,
  CareerController.askCoach
);

router.post(
  '/roadmap/generate',
  [body('goal').notEmpty().withMessage('Career goal is required')],
  validateRequest,
  CareerController.generateRoadmap
);

router.get('/roadmap/list', CareerController.getRoadmaps);
router.post('/linkedin/analyze', CareerController.analyzeLinkedIn);
router.get('/portfolio/generate', CareerController.generatePortfolio);

export default router;
export const careerRoutes = router;
