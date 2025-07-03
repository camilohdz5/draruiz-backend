import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202506240230283011750732228510 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_profile" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "first_name" varchar,
                "last_name" varchar,
                "phone" varchar,
                "metadata" jsonb
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "email" varchar UNIQUE NOT NULL,
                "password_hash" varchar NOT NULL,
                "platform" varchar NOT NULL,
                "profileId" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_user_profile" FOREIGN KEY ("profileId") REFERENCES "user_profile"("id") ON DELETE SET NULL
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "subscription_plan" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar NOT NULL,
                "price" decimal NOT NULL,
                "currency" varchar NOT NULL,
                "interval" varchar NOT NULL,
                "platform_availability" text[] NOT NULL,
                "features" text[] NOT NULL
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "user_subscription" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" uuid NOT NULL,
                "planId" uuid NOT NULL,
                "status" varchar NOT NULL,
                "current_period_start" TIMESTAMP NOT NULL,
                "current_period_end" TIMESTAMP NOT NULL,
                "cancel_at_period_end" boolean NOT NULL DEFAULT false,
                "platform_source" varchar NOT NULL,
                CONSTRAINT "FK_user_subscription_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_user_subscription_plan" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE CASCADE
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_subscription";`);
        await queryRunner.query(`DROP TABLE "subscription_plan";`);
        await queryRunner.query(`DROP TABLE "user";`);
        await queryRunner.query(`DROP TABLE "user_profile";`);
    }

}
