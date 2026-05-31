import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecretaccess';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretrefresh';

export class TokenService {
  public static generateAccessToken(payload: { userId: string; role: string }): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  }

  public static generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  }

  public static verifyAccessToken(token: string): { userId: string; role: string } | null {
    try {
      return jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string };
    } catch {
      return null;
    }
  }

  public static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, REFRESH_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }
}
