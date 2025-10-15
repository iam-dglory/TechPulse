import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateStoriesTable1739467320000 implements MigrationInterface {
  name = 'CreateStoriesTable1739467320000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create stories table
    await queryRunner.createTable(
      new Table({
        name: 'stories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'sourceUrl',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'companyId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'sectorTag',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'hypeScore',
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
            name: 'realityCheck',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'impactTags',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'publishedAt',
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

    // Create foreign key constraint
    await queryRunner.createForeignKey(
      'stories',
      new ForeignKey({
        columnNames: ['companyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'SET NULL',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'stories',
      new Index({
        name: 'IDX_stories_companyId',
        columnNames: ['companyId'],
      }),
    );

    await queryRunner.createIndex(
      'stories',
      new Index({
        name: 'IDX_stories_sectorTag',
        columnNames: ['sectorTag'],
      }),
    );

    await queryRunner.createIndex(
      'stories',
      new Index({
        name: 'IDX_stories_publishedAt',
        columnNames: ['publishedAt'],
      }),
    );

    await queryRunner.createIndex(
      'stories',
      new Index({
        name: 'IDX_stories_createdBy',
        columnNames: ['createdBy'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stories');
  }
}
