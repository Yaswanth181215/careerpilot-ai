import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { ActivityLog } from '../models/activityLog.model';
import { TokenService } from '../services/token.service';
import { AppError, UnauthorizedError, ValidationError } from '@careerpilot/shared';

const logAudit = async (userId: string | undefined, action: string, req: Request, metadata?: any) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      ip: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata,
    });
  } catch (error) {
    console.error('Audit logging failed', error);
  }
};

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        throw new ValidationError('Email is already registered');
      }

      const user = new User({ name, email, password, role });
      await user.save();

      await logAudit(user._id.toString(), 'REGISTER', req, { email, role });

      res.status(201).json({
        success: true,
        message: 'Registration successful. You can now login.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Need to explicitly request password since find query pre-excludes it? No, in mongoose it's returned by default unless specified select: false
      const user = await User.findOne({ email });
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const accessToken = TokenService.generateAccessToken({ userId: user._id.toString(), role: user.role });
      const refreshToken = TokenService.generateRefreshToken({ userId: user._id.toString() });

      // Save refresh token to user token array
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push(refreshToken);
      await user.save();

      await logAudit(user._id.toString(), 'LOGIN', req);

      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          xp: user.xp,
          level: user.level,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      const decoded = TokenService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        // Token reuse or breach detected! Clear all tokens for the user
        if (user) {
          user.refreshTokens = [];
          await user.save();
          await logAudit(user._id.toString(), 'TOKEN_BREACH_REVOCATION', req, { attemptedToken: refreshToken });
        }
        throw new UnauthorizedError('Stale session detected. Force logout.');
      }

      // Rotate token: Remove used token, generate new pairs
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      
      const newAccessToken = TokenService.generateAccessToken({ userId: user._id.toString(), role: user.role });
      const newRefreshToken = TokenService.generateRefreshToken({ userId: user._id.toString() });
      
      user.refreshTokens.push(newRefreshToken);
      await user.save();

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        const decoded = TokenService.verifyRefreshToken(refreshToken);
        if (decoded) {
          const user = await User.findById(decoded.userId);
          if (user && user.refreshTokens) {
            user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
            await user.save();
            await logAudit(user._id.toString(), 'LOGOUT', req);
          }
        }
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
