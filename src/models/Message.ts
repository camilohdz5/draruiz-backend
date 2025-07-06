import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Conversation } from "./Conversation";

@Entity()
@Index(["conversation_id", "created_at"])
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  conversation_id!: string;

  @Column({ nullable: true })
  user_id?: string;

  @Column({
    type: "enum",
    enum: ["user", "assistant"],
    default: "user"
  })
  sender!: "user" | "assistant";

  @Column({
    type: "enum",
    enum: ["text", "audio", "voice"],
    default: "text"
  })
  content_type!: "text" | "audio" | "voice";

  @Column({ nullable: true })
  audio_url?: string;

  @Column({ nullable: true })
  ai_model_used?: string;

  @Column({ nullable: true })
  tokens_used?: number;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: "conversation_id" })
  conversation!: Conversation;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
} 