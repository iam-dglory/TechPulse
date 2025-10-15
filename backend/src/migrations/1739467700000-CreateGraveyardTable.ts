import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGraveyardTable1739467700000 implements MigrationInterface {
  name = 'CreateGraveyardTable1739467700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "graveyard" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "original_claim_story_id" uuid NOT NULL,
        "company_id" uuid,
        "title" character varying(255) NOT NULL,
        "follow_up_summary" text NOT NULL,
        "actual_outcome" text NOT NULL,
        "outcome_date" TIMESTAMP NOT NULL,
        "failure_type" character varying(50) NOT NULL DEFAULT 'broken-promise',
        "impact_assessment" jsonb,
        "original_promises" text,
        "sources" jsonb,
        "created_by" uuid NOT NULL,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "is_published" boolean NOT NULL DEFAULT false,
        "published_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graveyard" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_graveyard_original_claim_story_id" ON "graveyard" ("original_claim_story_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_graveyard_company_id" ON "graveyard" ("company_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_graveyard_outcome_date" ON "graveyard" ("outcome_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_graveyard_failure_type" ON "graveyard" ("failure_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_graveyard_is_published" ON "graveyard" ("is_published")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_graveyard_created_by" ON "graveyard" ("created_by")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "graveyard" 
      ADD CONSTRAINT "FK_graveyard_original_claim_story_id" 
      FOREIGN KEY ("original_claim_story_id") 
      REFERENCES "stories"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "graveyard" 
      ADD CONSTRAINT "FK_graveyard_company_id" 
      FOREIGN KEY ("company_id") 
      REFERENCES "companies"("id") 
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "graveyard" 
      ADD CONSTRAINT "FK_graveyard_created_by" 
      FOREIGN KEY ("created_by") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "graveyard" 
      ADD CONSTRAINT "FK_graveyard_reviewed_by" 
      FOREIGN KEY ("reviewed_by") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    // Add constraint to ensure valid failure type values
    await queryRunner.query(`
      ALTER TABLE "graveyard" 
      ADD CONSTRAINT "CHK_graveyard_failure_type" 
      CHECK ("failure_type" IN (
        'broken-promise', 'overhyped', 'failed-delivery', 
        'misleading-claims', 'cancelled-project', 'delayed-indefinitely'
      ))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove constraints
    await queryRunner.query(`ALTER TABLE "graveyard" DROP CONSTRAINT "CHK_graveyard_failure_type"`);
    await queryRunner.query(`ALTER TABLE "graveyard" DROP CONSTRAINT "FK_graveyard_reviewed_by"`);
    await queryRunner.query(`ALTER TABLE "graveyard" DROP CONSTRAINT "FK_graveyard_created_by"`);
    await queryRunner.query(`ALTER TABLE "graveyard" DROP CONSTRAINT "FK_graveyard_company_id"`);
    await queryRunner.query(`ALTER TABLE "graveyard" DROP CONSTRAINT "FK_graveyard_original_claim_story_id`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_graveyard_created_by"`);
    await queryRunner.query(`DROP INDEX "IDX_graveyard_is_published"`);
    await queryRunner.query(`DROP INDEX "IDX_graveyard_failure_type"`);
    await queryRunner.query(`DROP INDEX "IDX_graveyard_outcome_date"`);
    await queryRunner.query(`DROP INDEX "IDX_graveyard_company_id"`);
    await queryRunner.query(`DROP INDEX "IDX_graveyard_original_claim_story_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "graveyard"`);
  }
}
