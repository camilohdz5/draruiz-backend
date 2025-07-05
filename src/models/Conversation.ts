import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
@Index(["user_id", "created_at"])
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  user_id!: string;

  @Column({ nullable: true })
  title?: string;

  @Column({
    type: "enum",
    enum: ["active", "archived", "deleted"],
    default: "active"
  })
  status!: "active" | "archived" | "deleted";

  @Column({ nullable: true })
  summary?: string;

  @Column({ nullable: true })
  mood_score?: number;

  @Column({ nullable: true })
  audio_file_url?: string;

  @Column({ nullable: true })
  transcript_url?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, (user) => user.conversations)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
} 