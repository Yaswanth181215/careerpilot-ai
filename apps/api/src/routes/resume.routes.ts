import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth.middleware';
import { resumeUpload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze', resumeUpload.single('resume'), ResumeController.analyze);
router.get('/latest', ResumeController.getLatest);

export default router;
export const resumeRoutes = router;
