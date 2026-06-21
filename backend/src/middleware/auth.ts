import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/token';
import { User, UserRole } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        name: string;
        email: string;
      };
    }
  }
}

export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  const cookieToken = (req as any).cookies?.accessToken;
  const token = headerToken || cookieToken;

  if (!token) {
    throw ApiError.unauthorized('No authentication token provided');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer exists or is inactive');
  }

  req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
  next();
});

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`Role '${req.user.role}' is not permitted to perform this action`);
    }
    next();
  };
};
