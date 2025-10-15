import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAnalyticsFieldsToUser1739468000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add analytics-related fields to user table
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'lastLoginAt',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'region',
        type: 'varchar',
        length: '10',
        isNullable: true,
        comment: 'ISO country code',
      }),
      new TableColumn({
        name: 'analyticsOptOut',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'analyticsConsent',
        type: 'boolean',
        default: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove analytics-related fields from user table
    await queryRunner.dropColumns('user', [
      'lastLoginAt',
      'region',
      'analyticsOptOut',
      'analyticsConsent',
    ]);
  }
}
