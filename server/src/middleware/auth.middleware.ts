import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // DEBUG: Log auth header
  // console.log('[AUTH MIDDLEWARE] Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'No token provided', 401);
    return;
  }

  const token = authHeader.split(' ')[1] as string;

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;

    // DEBUG: Log authenticated user
    // console.log('[AUTH MIDDLEWARE] Authenticated userId:', req.userId);

    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};
