import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { UserProfile } from "./UserProfile";
import { UserSubscription } from "./UserSubscription";
import { Conversation } from "./Conversation";

@Entity()
@Index(["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({
    type: "enum",
    enum: ["mobile", "web"],
    default: "mobile"
  })
  platform!: "mobile" | "web";

  @Column({ default: false })
  is_verified!: boolean;

  @Column({ default: false })
  biometric_enabled!: boolean;

  @Column({ nullable: true })
  biometric_data?: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  last_login?: Date;

  @OneToOne(() => UserProfile, { cascade: true, nullable: true })
  @JoinColumn()
  profile?: UserProfile;

  @OneToMany(() => UserSubscription, (subscription) => subscription.user)
  subscriptions!: UserSubscription[];

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations!: Conversation[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
