import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddELI5Fields1739467800000 implements MigrationInterface {
  name = 'AddELI5Fields1739467800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add ELI5 fields to stories table
    await queryRunner.query(`
      ALTER TABLE "stories" 
      ADD COLUMN "eli5_summary" text,
      ADD COLUMN "simple_summary" text,
      ADD COLUMN "technical_summary" text
    `);

    // Create eli5_suggestions table
    await queryRunner.query(`
      CREATE TABLE "eli5_suggestions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "story_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "mode" character varying(20) NOT NULL,
        "suggested_text" text NOT NULL,
        "explanation" text,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "reviewed_by" uuid,
        "review_notes" text,
        "reviewed_at" TIMESTAMP,
        "upvotes" integer NOT NULL DEFAULT 0,
        "downvotes" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eli5_suggestions" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for eli5_suggestions
    await queryRunner.query(`
      CREATE INDEX "IDX_eli5_suggestions_story_id" ON "eli5_suggestions" ("story_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eli5_suggestions_user_id" ON "eli5_suggestions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eli5_suggestions_status" ON "eli5_suggestions" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eli5_suggestions_mode" ON "eli5_suggestions" ("mode")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eli5_suggestions_reviewed_by" ON "eli5_suggestions" ("reviewed_by")
    `);

    // Add foreign key constraints for eli5_suggestions
    await queryRunner.query(`
      ALTER TABLE "eli5_suggestions" 
      ADD CONSTRAINT "FK_eli5_suggestions_story_id" 
      FOREIGN KEY ("story_id") 
      REFERENCES "stories"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "eli5_suggestions" 
      ADD CONSTRAINT "FK_eli5_suggestions_user_id" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "eli5_suggestions" 
      ADD CONSTRAINT "FK_eli5_suggestions_reviewed_by" 
      FOREIGN KEY ("reviewed_by") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    // Add constraints for eli5_suggestions
    await queryRunner.query(`
      ALTER TABLE "eli5_suggestions" 
      ADD CONSTRAINT "CHK_eli5_suggestions_mode" 
      CHECK ("mode" IN ('simple', 'technical'))
    `);

    await queryRunner.query(`
      ALTER TABLE "eli5_suggestions" 
      ADD CONSTRAINT "CHK_eli5_suggestions_status" 
      CHECK ("status" IN ('pending', 'approved', 'rejected'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove constraints
    await queryRunner.query(`ALTER TABLE "eli5_suggestions" DROP CONSTRAINT "CHK_eli5_suggestions_status"`);
    await queryRunner.query(`ALTER TABLE "eli5_suggestions" DROP CONSTRAINT "CHK_eli5_suggestions_mode"`);

    // Remove foreign key constraints
    await queryRunner.query(`ALTER TABLE "eli5_suggestions" DROP CONSTRAINT "FK_eli5_suggestions_reviewed_by"`);
    await queryRunner.query(`ALTER TABLE "eli5_suggestions" DROP CONSTRAINT "FK_eli5_suggestions_user_id"`);
    await queryRunner.query(`ALTER TABLE "eli5_suggestions" DROP CONSTRAINT "FK_eli5_suggestions_story_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_eli5_suggestions_reviewed_by"`);
    await queryRunner.query(`DROP INDEX "IDX_eli5_suggestions_mode"`);
    await queryRunner.query(`DROP INDEX "IDX_eli5_suggestions_status"`);
    await queryRunner.query(`DROP INDEX "IDX_eli5_suggestions_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_eli5_suggestions_story_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "eli5_suggestions"`);

    // Remove ELI5 fields from stories table
    await queryRunner.query(`
      ALTER TABLE "stories" 
      DROP COLUMN "technical_summary",
      DROP COLUMN "simple_summary",
      DROP COLUMN "eli5_summary"
    `);
  }
}

