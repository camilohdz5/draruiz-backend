import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        platform: string;
      };
    }
  }
}

// Use interface for JWTPayload for type safety and consistency
export interface JWTPayload {
  id: string;
  email: string;
  platform: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ENV.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization token required'
      });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required'
      });
    }
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }
    // TODO: Replace with proper logger
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Internal server error'
    });
  }
};

// Optional auth middleware for endpoints that can work with or without auth
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!ENV.JWT_SECRET) {
      return next();
    }
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
      req.user = decoded;
    }
    return next();
  } catch (_error) {
    // Continue without authentication if token is invalid
    return next();
  }
};
