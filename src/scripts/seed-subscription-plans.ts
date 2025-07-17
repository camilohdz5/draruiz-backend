import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Seeding subscription plans...');

    // Delete existing plans
    await prisma.subscriptionPlan.deleteMany();

    // Create subscription plans
    const plans = [
      {
        name: 'Basic Plan',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        platform_availability: ['web', 'mobile'],
        features: [
          'Basic AI conversations',
          '5 conversations per month',
          'Email support'
        ]
      },
      {
        name: 'Pro Plan',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        platform_availability: ['web', 'mobile'],
        features: [
          'Unlimited AI conversations',
          'Priority support',
          'Advanced analytics',
          'Custom integrations'
        ]
      },
      {
        name: 'Enterprise Plan',
        price: 49.99,
        currency: 'USD',
        interval: 'month',
        platform_availability: ['web', 'mobile'],
        features: [
          'Everything in Pro',
          'Dedicated support',
          'Custom AI training',
          'API access',
          'White-label solution'
        ]
      }
    ];

    for (const plan of plans) {
      await prisma.subscriptionPlan.create({
        data: plan
      });
    }

    console.log('✅ Subscription plans seeded successfully!');
    
    // Display created plans
    const createdPlans = await prisma.subscriptionPlan.findMany();
    console.log('\n📋 Created plans:');
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/${plan.interval}`);
    });

  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedSubscriptionPlans(); 