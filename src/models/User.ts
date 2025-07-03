import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserProfile } from "./UserProfile";
import { UserSubscription } from "./UserSubscription";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  platform!: "mobile" | "web";

  @OneToOne(() => UserProfile, { cascade: true, nullable: true })
  @JoinColumn()
  profile?: UserProfile;

  @OneToMany(() => UserSubscription, (subscription) => subscription.user)
  subscriptions!: UserSubscription[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
