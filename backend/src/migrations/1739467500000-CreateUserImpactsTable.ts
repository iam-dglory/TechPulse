import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserImpactsTable1739467500000 implements MigrationInterface {
  name = 'CreateUserImpactsTable1739467500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_impacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "job" character varying(100) NOT NULL,
        "location" character varying(200) NOT NULL,
        "tech_used" jsonb NOT NULL,
        "industry" character varying(100) NOT NULL,
        "automation_risk" numeric(3,1) NOT NULL DEFAULT '0',
        "skill_obsolescence_risk" numeric(3,1) NOT NULL DEFAULT '0',
        "privacy_risk" numeric(3,1) NOT NULL DEFAULT '0',
        "overall_risk_score" numeric(3,1) NOT NULL DEFAULT '0',
        "risk_factors" jsonb,
        "recommended_actions" jsonb,
        "last_calculated_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_impacts" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_impacts_user_id" ON "user_impacts" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_impacts_industry" ON "user_impacts" ("industry")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_impacts_user_unique" ON "user_impacts" ("user_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "user_impacts" 
      ADD CONSTRAINT "FK_user_impacts_user_id" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_impacts" DROP CONSTRAINT "FK_user_impacts_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_impacts_user_unique"`);
    await queryRunner.query(`DROP INDEX "IDX_user_impacts_industry"`);
    await queryRunner.query(`DROP INDEX "IDX_user_impacts_user_id"`);
    await queryRunner.query(`DROP TABLE "user_impacts"`);
  }
}

