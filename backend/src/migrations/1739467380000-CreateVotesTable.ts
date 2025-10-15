import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateVotesTable1739467380000 implements MigrationInterface {
  name = 'CreateVotesTable1739467380000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create votes table
    await queryRunner.createTable(
      new Table({
        name: 'votes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'storyId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'industry',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'voteValue',
            type: 'enum',
            enum: ['helpful', 'harmful', 'neutral'],
            default: "'neutral'",
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create foreign key constraint
    await queryRunner.createForeignKey(
      'votes',
      new ForeignKey({
        columnNames: ['storyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stories',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'votes',
      new Index({
        name: 'IDX_votes_storyId',
        columnNames: ['storyId'],
      }),
    );

    await queryRunner.createIndex(
      'votes',
      new Index({
        name: 'IDX_votes_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'votes',
      new Index({
        name: 'IDX_votes_industry',
        columnNames: ['industry'],
      }),
    );

    await queryRunner.createIndex(
      'votes',
      new Index({
        name: 'IDX_votes_voteValue',
        columnNames: ['voteValue'],
      }),
    );

    await queryRunner.createIndex(
      'votes',
      new Index({
        name: 'IDX_votes_createdAt',
        columnNames: ['createdAt'],
      }),
    );

    // Create composite index for unique voting per user per story
    await queryRunner.createIndex(
      'votes',
      new Index({
        name: 'IDX_votes_storyId_userId_unique',
        columnNames: ['storyId', 'userId'],
        isUnique: true,
        where: 'userId IS NOT NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('votes');
  }
}
