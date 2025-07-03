import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
} 