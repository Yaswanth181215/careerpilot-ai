import { Router } from 'express';
import { body } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['Admin', 'Super Admin']));

router.get('/users', AdminController.getUsers);

router.post(
  '/user/role',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('role').isIn(['Student', 'Mentor', 'Admin', 'Super Admin']).withMessage('Role classification is invalid'),
  ],
  validateRequest,
  AdminController.updateUserRole
);

router.post(
  '/feature/toggle',
  [
    body('name').trim().notEmpty().withMessage('Feature name is required'),
    body('isEnabled').isBoolean().withMessage('isEnabled state must be boolean'),
  ],
  validateRequest,
  AdminController.toggleFeature
);

router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
export const adminRoutes = router;
