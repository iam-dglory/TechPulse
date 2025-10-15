import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateCompaniesTable1739467200000 implements MigrationInterface {
  name = 'CreateCompaniesTable1739467200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create companies table
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'logoUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'sectorTags',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'fundingStage',
            type: 'enum',
            enum: [
              'pre-seed',
              'seed',
              'series-a',
              'series-b',
              'series-c',
              'series-d',
              'series-e',
              'ipo',
              'acquired',
              'private',
            ],
            default: "'private'",
          },
          {
            name: 'investors',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'hqLocation',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ethicsStatementUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'privacyPolicyUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'credibilityScore',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'ethicsScore',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'hypeScore',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'verifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'companies',
      new Index({
        name: 'IDX_companies_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new Index({
        name: 'IDX_companies_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new Index({
        name: 'IDX_companies_verified',
        columnNames: ['verified'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('companies');
  }
}
