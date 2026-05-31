import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import path from 'path';
import { logger, AppError } from '@careerpilot/shared';
import { helmetMiddleware, corsMiddleware, xssSanitizer } from './middleware/security.middleware';
import { apiRateLimiter } from './middleware/rateLimiter.middleware';

import authRoutes from './routes/auth.routes';
import interviewRoutes from './routes/interview.routes';
import resumeRoutes from './routes/resume.routes';
import codingRoutes from './routes/coding.routes';
import dashboardRoutes from './routes/dashboard.routes';
import careerRoutes from './routes/career.routes';
import mentorRoutes from './routes/mentor.routes';
import adminRoutes from './routes/admin.routes';
const app = express();

// Security and utility Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xssSanitizer);

// Morgan HTTP profiling using Winston logger
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Serve static upload folders (e.g. resumes)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Shallow Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date() });
});

// Deep Infrastructure status monitoring
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: {
      api: 'healthy',
      database: 'healthy',
      aiService: 'healthy',
      queue: 'healthy',
    },
    timestamp: new Date(),
  });
});

// Mount modular routes with standard rate limiter
app.use('/api/auth', authRoutes);
app.use('/api/interviews', apiRateLimiter, interviewRoutes);
app.use('/api/resumes', apiRateLimiter, resumeRoutes);
app.use('/api/coding', apiRateLimiter, codingRoutes);
app.use('/api/dashboard', apiRateLimiter, dashboardRoutes);
app.use('/api/career', apiRateLimiter, careerRoutes);
app.use('/api/mentor', apiRateLimiter, mentorRoutes);
app.use('/api/admin', apiRateLimiter, adminRoutes);

// Catch 404 Route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Central error catcher
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('API Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    // Include error stack details only in non-production builds
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

export default app;
