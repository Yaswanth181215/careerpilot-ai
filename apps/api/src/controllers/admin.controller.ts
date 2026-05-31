import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';
import { FeatureFlag } from '../models/featureFlag.model';
import { ActivityLog } from '../models/activityLog.model';
import { ValidationError, NotFoundError } from '@careerpilot/shared';

export class AdminController {
  public static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await User.find({}, '-password');
      res.json({ success: true, users: list });
    } catch (error) {
      next(error);
    }
  }

  public static async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role } = req.body;
      if (!['Student', 'Mentor', 'Admin', 'Super Admin'].includes(role)) {
        throw new ValidationError('Invalid role selection');
      }

      const user = await User.findById(userId);
      if (!user) throw new NotFoundError('User not found');

      user.role = role;
      await user.save();

      res.json({
        success: true,
        message: `User role updated to ${role} successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async toggleFeature(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, isEnabled } = req.body;
      let flag = await FeatureFlag.findOne({ name });
      
      if (!flag) {
        flag = new FeatureFlag({ name, isEnabled });
      } else {
        flag.isEnabled = isEnabled;
      }
      await flag.save();

      res.json({
        success: true,
        message: `Feature flag '${name}' is now ${isEnabled ? 'enabled' : 'disabled'}.`,
        flag,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action } = req.query;
      const filter: Record<string, any> = {};
      if (action) filter.action = action;

      const logs = await ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(100);

      res.json({
        success: true,
        logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
