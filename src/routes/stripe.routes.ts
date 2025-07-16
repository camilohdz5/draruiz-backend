import { Router } from 'express';
import { 
  createCheckoutSession, 
  createPortalSession, 
  handleWebhook,
  getSubscriptionPlans,
  getUserSubscription
} from '../controllers/stripe.controller';
import { validateRequest } from '../middlewares/validationMiddleware';
import { createCheckoutSessionSchema, createPortalSessionSchema } from '../schemas/stripe.schemas';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/webhook', handleWebhook);
router.get('/plans', getSubscriptionPlans);

// Protected routes (require authentication)
router.post('/create-checkout-session', authMiddleware, validateRequest(createCheckoutSessionSchema), createCheckoutSession);
router.post('/create-portal-session', authMiddleware, validateRequest(createPortalSessionSchema), createPortalSession);
router.get('/subscription', authMiddleware, getUserSubscription);

export default router; 