import { Request, Response } from 'express';
import { stripeService } from '../services/stripe.service';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { prisma } from '../config/database';

export const createCheckoutSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    const userId = (req as any).user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await stripeService.createCheckoutSession({
      userId,
      planId,
      successUrl,
      cancelUrl,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
};

export const createPortalSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { returnUrl } = req.body;
    const userId = (req as any).user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await stripeService.createPortalSession({
      userId,
      returnUrl,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Create portal session error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create portal session'
    });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<Response> => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !STRIPE_CONFIG.webhookSecret) {
    return res.status(400).json({
      success: false,
      message: 'Missing stripe signature or webhook secret'
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Webhook signature verification failed'
    });
  }

  try {
    await stripeService.handleWebhook(event);
    return res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handling error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook handling failed'
    });
  }
};

export const getSubscriptionPlans = async (req: Request, res: Response): Promise<Response> => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
              where: {
          platform_availability: {
            has: (req.query.platform as string) || 'web'
          }
        },
      orderBy: {
        price: 'asc'
      }
    });

    return res.json({
      success: true,
      plans
    });
  } catch (error: any) {
    console.error('Get subscription plans error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscription plans'
    });
  }
};

export const getUserSubscription = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        user_id: userId,
        status: 'active'
      },
      include: {
        plan: true
      }
    });

    return res.json({
      success: true,
      subscription
    });
  } catch (error: any) {
    console.error('Get user subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user subscription'
    });
  }
}; 