import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1752000000000 implements MigrationInterface {
    name = 'InitialSetup1752000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types
        await queryRunner.query(`
            CREATE TYPE "public"."user_platform_enum" AS ENUM('mobile', 'web')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."conversation_status_enum" AS ENUM('active', 'archived', 'deleted')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."message_sender_enum" AS ENUM('user', 'assistant')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."message_content_type_enum" AS ENUM('text', 'audio', 'voice')
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "platform" "public"."user_platform_enum" NOT NULL DEFAULT 'mobile',
                "is_verified" boolean NOT NULL DEFAULT false,
                "biometric_enabled" boolean NOT NULL DEFAULT false,
                "biometric_data" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "last_login" TIMESTAMP,
                "email_verified_at" TIMESTAMP,
                "emergency_contact" character varying,
                "emergency_contact_phone" character varying,
                "crisis_detection_enabled" boolean NOT NULL DEFAULT false,
                "therapist_consent_date" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);

        // Create user_profile table
        await queryRunner.query(`
            CREATE TABLE "user_profile" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying,
                "last_name" character varying,
                "phone" character varying,
                "date_of_birth" TIMESTAMP,
                "gender" character varying,
                "primary_concern" character varying,
                "current_therapist" character varying,
                "medications" character varying,
                "diagnosis" character varying,
                "therapy_history" character varying,
                "crisis_history" character varying,
                "support_system" character varying,
                "goals" character varying,
                "preferences" character varying,
                "metadata" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c240" PRIMARY KEY ("id")
            )
        `);

        // Create conversation table
        await queryRunner.query(`
            CREATE TABLE "conversation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "title" character varying,
                "status" "public"."conversation_status_enum" NOT NULL DEFAULT 'active',
                "summary" character varying,
                "mood_score" integer,
                "crisis_detected" boolean,
                "crisis_escalated" boolean,
                "duration_seconds" integer,
                "audio_file_url" character varying,
                "transcript_url" character varying,
                "metadata" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id")
            )
        `);

        // Create message table
        await queryRunner.query(`
            CREATE TABLE "message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "conversation_id" uuid NOT NULL,
                "user_id" uuid,
                "sender" "public"."message_sender_enum" NOT NULL DEFAULT 'user',
                "content_type" "public"."message_content_type_enum" NOT NULL DEFAULT 'text',
                "content" text NOT NULL,
                "audio_url" character varying,
                "audio_duration" integer,
                "sentiment_score" double precision,
                "crisis_keywords" text array,
                "ai_model_used" character varying,
                "tokens_used" integer,
                "processing_time_ms" integer,
                "is_flagged" boolean NOT NULL DEFAULT false,
                "flagged_reason" character varying,
                "metadata" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_be8bd3c9c231c4a4e928c62847" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e22" ON "user" ("email")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_conversation_user_created" ON "conversation" ("user_id", "created_at")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_message_conversation_created" ON "message" ("conversation_id", "created_at")
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "user_profile" ADD CONSTRAINT "FK_f44d0cd18cfd80b0fed7806c240" 
            FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "conversation" ADD CONSTRAINT "FK_conversation_user" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "message" ADD CONSTRAINT "FK_message_conversation" 
            FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "message" ADD CONSTRAINT "FK_message_user" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_user"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_conversation"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_conversation_user"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_f44d0cd18cfd80b0fed7806c240"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_message_conversation_created"`);
        await queryRunner.query(`DROP INDEX "IDX_conversation_user_created"`);
        await queryRunner.query(`DROP INDEX "IDX_e12875dfb3b1d92d7d7c5377e22"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
        await queryRunner.query(`DROP TABLE "user_profile"`);
        await queryRunner.query(`DROP TABLE "user"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "public"."message_content_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."message_sender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."conversation_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_platform_enum"`);
    }
} 