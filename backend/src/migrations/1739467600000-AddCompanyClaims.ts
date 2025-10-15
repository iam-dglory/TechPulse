import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyClaims1739467600000 implements MigrationInterface {
  name = 'AddCompanyClaims1739467600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add claim status to companies table
    await queryRunner.query(`
      ALTER TABLE "companies" 
      ADD COLUMN "claim_status" character varying(20) NOT NULL DEFAULT 'unclaimed'
    `);

    // Create company_claims table
    await queryRunner.query(`
      CREATE TABLE "company_claims" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "company_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "company_name" character varying(255) NOT NULL,
        "official_email" character varying(255) NOT NULL,
        "website_url" character varying(500) NOT NULL,
        "contact_person" character varying(255) NOT NULL,
        "phone_number" character varying(50),
        "proof_documents" jsonb NOT NULL,
        "verification_method" character varying(20) NOT NULL,
        "additional_info" text,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "review_notes" text,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "email_sent_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_claims" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_company_claims_company_id" ON "company_claims" ("company_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_company_claims_user_id" ON "company_claims" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_company_claims_status" ON "company_claims" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_company_claims_reviewed_by" ON "company_claims" ("reviewed_by")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "company_claims" 
      ADD CONSTRAINT "FK_company_claims_company_id" 
      FOREIGN KEY ("company_id") 
      REFERENCES "companies"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "company_claims" 
      ADD CONSTRAINT "FK_company_claims_user_id" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "company_claims" 
      ADD CONSTRAINT "FK_company_claims_reviewed_by" 
      FOREIGN KEY ("reviewed_by") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    // Add constraint to ensure valid claim status values
    await queryRunner.query(`
      ALTER TABLE "companies" 
      ADD CONSTRAINT "CHK_companies_claim_status" 
      CHECK ("claim_status" IN ('unclaimed', 'pending_review', 'approved', 'rejected'))
    `);

    await queryRunner.query(`
      ALTER TABLE "company_claims" 
      ADD CONSTRAINT "CHK_company_claims_status" 
      CHECK ("status" IN ('pending', 'approved', 'rejected'))
    `);

    await queryRunner.query(`
      ALTER TABLE "company_claims" 
      ADD CONSTRAINT "CHK_company_claims_verification_method" 
      CHECK ("verification_method" IN ('website', 'email', 'documents'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove constraints
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "CHK_companies_claim_status"`);
    await queryRunner.query(`ALTER TABLE "company_claims" DROP CONSTRAINT "CHK_company_claims_status"`);
    await queryRunner.query(`ALTER TABLE "company_claims" DROP CONSTRAINT "CHK_company_claims_verification_method"`);

    // Remove foreign key constraints
    await queryRunner.query(`ALTER TABLE "company_claims" DROP CONSTRAINT "FK_company_claims_reviewed_by"`);
    await queryRunner.query(`ALTER TABLE "company_claims" DROP CONSTRAINT "FK_company_claims_user_id"`);
    await queryRunner.query(`ALTER TABLE "company_claims" DROP CONSTRAINT "FK_company_claims_company_id"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_company_claims_reviewed_by"`);
    await queryRunner.query(`DROP INDEX "IDX_company_claims_status"`);
    await queryRunner.query(`DROP INDEX "IDX_company_claims_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_company_claims_company_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "company_claims"`);

    // Remove claim status column
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "claim_status"`);
  }
}
