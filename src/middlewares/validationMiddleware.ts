import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Internal server error',
      });
    }
  };
};

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
    }
    
    userRequests.count++;
    return next();
  };
};

// Error handling middleware
export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error handler:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  
  // Handle specific error types
  if (errorName === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: errorMessage,
      origin: 'validation.middleware',
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
    });
  }
  
  if (errorName === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Unauthorized',
      origin: 'auth.middleware',
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
    });
  }
  
  if (errorName === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Resource not found',
      origin: 'route.handler',
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
    });
  }
  
  // Default error
  const status = error.status || 500;
  const message = errorMessage || 'Internal server error';
  
  return res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : 'Error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    origin: 'global.error.handler',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: errorStack,
      details: {
        name: errorName,
        status: status,
        timestamp: new Date().toISOString()
      }
    }),
  });
}; 