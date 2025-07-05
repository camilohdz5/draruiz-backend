import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ENV } from '../config';

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
          message: 'Datos de entrada inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error interno del servidor',
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
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
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
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No autorizado',
    });
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Recurso no encontrado',
    });
  }
  
  // Default error
  const status = error.status || 500;
  const message = error.message || 'Error interno del servidor';
  
  return res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : 'Error',
    message: ENV.NODE_ENV === 'production' ? 'Error interno del servidor' : message,
    ...(ENV.NODE_ENV === 'development' && { stack: error.stack }),
  });
}; 