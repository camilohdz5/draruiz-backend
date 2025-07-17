import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { emailService } from './email.service';

const prisma = new PrismaClient();

export interface RegisterData {
  email: string;
  password: string;
  platform?: 'mobile' | 'web';
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Generate verification token
      const verificationToken = emailService.generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password_hash: passwordHash,
          platform: data.platform || 'mobile',
          verification_token: verificationToken,
          verification_token_expires: tokenExpires,
        },
        select: {
          id: true,
          email: true,
          is_verified: true,
          platform: true,
          created_at: true,
        }
      });

      // Send verification email
      await emailService.sendVerificationEmail({
        email: data.email,
        token: verificationToken,
      });

      return {
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          is_verified: user.is_verified,
          platform: user.platform,
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          profile: true,
        }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }
      
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          platform: user.platform
        },
        Buffer.from(process.env.JWT_SECRET, 'utf8'),
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          is_verified: user.is_verified,
          platform: user.platform,
          profile: user.profile,
          is_subscription_active: user.is_subscription_active,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    try {
      // Find user by verification token
      const user = await prisma.user.findFirst({
        where: {
          verification_token: token,
          verification_token_expires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          is_verified: true,
          email_verified_at: new Date(),
          verification_token: null,
          verification_token_expires: null,
        }
      });

      return {
        success: true,
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          is_verified: true,
        }
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.is_verified) {
        throw new Error('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = emailService.generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verification_token: verificationToken,
          verification_token_expires: tokenExpires,
        }
      });

      // Send verification email
      await emailService.sendVerificationEmail({
        email: user.email,
        token: verificationToken,
      });

      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 