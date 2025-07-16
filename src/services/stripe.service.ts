import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { prisma } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCheckoutSessionData {
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionData {
  userId: string;
  returnUrl: string;
}

export class StripeService {
  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(data: CreateCheckoutSessionData) {
    try {
      // Get the subscription plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: data.planId }
      });

      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Get the user
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.currency,
              product_data: {
                name: plan.name,
                description: `Subscription to ${plan.name}`,
              },
              unit_amount: Math.round(parseFloat(plan.price.toString()) * 100), // Convert to cents
              recurring: {
                interval: plan.interval as 'month' | 'year',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          userId: data.userId,
          planId: data.planId,
        },
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw error;
    }
  }

  /**
   * Create a customer portal session
   */
  async createPortalSession(data: CreatePortalSessionData) {
    try {
      // Obtener el usuario y su Stripe Customer ID
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user?.stripe_customer_id) {
        throw new Error('No Stripe customer found for this user');
      }
      // Create portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: data.returnUrl,
      });
      return {
        success: true,
        url: session.url,
      };
    } catch (error) {
      console.error('Create portal session error:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: any) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutSessionCompleted(session: any) {
    const { userId, planId } = session.metadata;
    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: { is_subscription_active: true }
    });

    // Guardar el Stripe Customer ID en el usuario
    const customerId = session.customer || (session.subscription && session.subscription.customer);
    if (customerId) {
      await prisma.user.update({
        where: { id: userId },
        data: { stripe_customer_id: customerId }
      });
    }

    // Extraer los timestamps de la suscripción (pueden venir anidados o no)
    const sub = session.subscription || {};
    const now = new Date();
    const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000) : now;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : now;
    const platformSource = sub.id || session.subscription_id || 'unknown';

    // Create or update user subscription record
    await prisma.userSubscription.upsert({
      where: {
        user_id_plan_id: {
          user_id: userId,
          plan_id: planId,
        },
      },
      update: {
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        platform_source: platformSource,
      },
      create: {
        id: uuidv4(),
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        platform_source: platformSource,
      },
    });
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(subscription: any) {
    // Handle subscription creation if needed
    console.log('Subscription created:', subscription.id);
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(subscription: any) {
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { platform_source: subscription.id }
    });

    if (userSubscription) {
      await prisma.userSubscription.update({
        where: { id: userSubscription.id },
        data: {
          status: subscription.status as any,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
      });

      // Update user subscription status
      await prisma.user.update({
        where: { id: userSubscription.user_id },
        data: { 
          is_subscription_active: subscription.status === 'active'
        }
      });
    }
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(subscription: any) {
    const userSubscription = await prisma.userSubscription.findFirst({
      where: { platform_source: subscription.id }
    });

    if (userSubscription) {
      await prisma.userSubscription.update({
        where: { id: userSubscription.id },
        data: { status: 'canceled' },
      });

      // Update user subscription status
      await prisma.user.update({
        where: { id: userSubscription.user_id },
        data: { is_subscription_active: false }
      });
    }
  }

  /**
   * Handle payment succeeded
   */
  private async handlePaymentSucceeded(invoice: any) {
    console.log('Payment succeeded:', invoice.id);
  }

  /**
   * Handle payment failed
   */
  private async handlePaymentFailed(invoice: any) {
    console.log('Payment failed:', invoice.id);
  }
}

export const stripeService = new StripeService(); 