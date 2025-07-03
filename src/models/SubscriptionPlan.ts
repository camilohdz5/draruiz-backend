import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserSubscription } from './UserSubscription';

@Entity()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('decimal')
  price!: number;

  @Column()
  currency!: string;

  @Column()
  interval!: 'month' | 'year';

  @Column('text', { array: true })
  platform_availability!: string[];

  @Column('text', { array: true })
  features!: string[];

  @OneToMany(() => UserSubscription, subscription => subscription.plan)
  subscriptions!: UserSubscription[];
} 