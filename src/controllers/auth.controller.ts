import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Register error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(400).json({
      error: 'Registration failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        stack: errorStack,
        origin: 'auth.controller.register'
      } : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(401).json({
      error: 'Login failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        stack: errorStack,
        origin: 'auth.controller.login'
      } : undefined
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.status(200).json(result);
  } catch (error) {
    console.error('Email verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(400).json({
      error: 'Email verification failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        stack: errorStack,
        origin: 'auth.controller.verifyEmail'
      } : undefined
    });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email);
    res.status(200).json(result);
  } catch (error) {
    console.error('Resend verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(400).json({
      error: 'Resend verification failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        stack: errorStack,
        origin: 'auth.controller.resendVerification'
      } : undefined
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // This will be implemented with JWT middleware
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await authService.getUserById(userId);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(400).json({
      error: 'Get profile failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        stack: errorStack,
        origin: 'auth.controller.getProfile'
      } : undefined
    });
  }
};
