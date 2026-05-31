import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Interview } from '../models/interview.model';
import { CodingSubmission } from '../models/codingSubmission.model';
import { Resume } from '../models/resume.model';
import { User } from '../models/user.model';
import { ValidationError } from '@careerpilot/shared';

export class DashboardController {
  public static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new ValidationError('Invalid session user');

      const user = await User.findById(userId);
      if (!user) throw new Error('User record missing');

      // Aggregate Interviews Count
      const interviewCount = await Interview.countDocuments({ userId, status: 'Completed' });

      // Aggregate Coding Submissions
      const codingCount = await CodingSubmission.countDocuments({ userId, passed: true });

      // Latest Resume Score
      const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
      const atsScore = latestResume ? latestResume.atsScore : 0;

      // Calculate Placement Readiness Score
      // Formula: (Interview completions (max 5) * 10) + (Coding solutions (max 10) * 5) + (ATS Score * 0.4)
      const interviewComponent = Math.min(interviewCount * 10, 40); // Max 40%
      const codingComponent = Math.min(codingCount * 5, 30); // Max 30%
      const atsComponent = atsScore * 0.3; // Max 30%
      const placementReadinessScore = Math.round(interviewComponent + codingComponent + atsComponent);

      // Simple mock datasets representing weaknesses and strengths for charts
      const radarAnalytics = [
        { subject: 'Technical Accuracy', A: latestResume ? 80 : 50, fullMark: 100 },
        { subject: 'Communication', A: interviewCount > 0 ? 85 : 45, fullMark: 100 },
        { subject: 'Confidence', A: interviewCount > 0 ? 90 : 60, fullMark: 100 },
        { subject: 'Coding Speed', A: codingCount > 0 ? 75 : 40, fullMark: 100 },
        { subject: 'ATS Keywords', A: atsScore || 50, fullMark: 100 },
      ];

      res.json({
        success: true,
        stats: {
          totalInterviews: interviewCount,
          totalCodingSolved: codingCount,
          atsScore,
          placementReadinessScore,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
        },
        analytics: {
          radarAnalytics,
          monthlyProgress: [
            { name: 'Jan', XP: 100 },
            { name: 'Feb', XP: 250 },
            { name: 'Mar', XP: user.xp },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
