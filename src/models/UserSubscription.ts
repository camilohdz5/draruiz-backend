import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { SubscriptionPlan } from './SubscriptionPlan';

@Entity()
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.subscriptions)
  user!: User;

  @ManyToOne(() => SubscriptionPlan, plan => plan.subscriptions)
  plan!: SubscriptionPlan;

  @Column()
  status!: 'active' | 'canceled' | 'past_due' | 'unpaid';

  @Column()
  current_period_start!: Date;

  @Column()
  current_period_end!: Date;

  @Column({ default: false })
  cancel_at_period_end!: boolean;

  @Column()
  platform_source!: string; // 'stripe', 'apple', 'google'
} 