import { MigrationInterface, QueryRunner, Table, TableForeignKey, Index } from 'typeorm';

export class CreateModerationTables1739467900000 implements MigrationInterface {
  name = 'CreateModerationTables1739467900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create flags table
    await queryRunner.createTable(
      new Table({
        name: 'flags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'story_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reporter_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'evidence',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '20',
            default: "'medium'",
          },
          {
            name: 'reviewed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'review_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_auto_hidden',
            type: 'boolean',
            default: false,
          },
          {
            name: 'auto_hidden_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'requires_legal_review',
            type: 'boolean',
            default: false,
          },
          {
            name: 'escalated_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create moderation_actions table
    await queryRunner.createTable(
      new Table({
        name: 'moderation_actions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'action_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'varchar',
            length: '20',
            default: "'info'",
          },
          {
            name: 'moderator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'target_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'story_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'flag_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'justification',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_appealable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'effective_until',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_reversed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'reversed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reversed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'reversal_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'event_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'varchar',
            length: '20',
            default: "'info'",
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: 255,
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: 45,
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: 500,
            isNullable: true,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: 255,
            isNullable: true,
          },
          {
            name: 'http_method',
            type: 'varchar',
            length: 10,
            isNullable: true,
          },
          {
            name: 'status_code',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'request_body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'response_body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'correlation_id',
            type: 'varchar',
            length: 50,
            isNullable: true,
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_retained',
            type: 'boolean',
            default: false,
          },
          {
            name: 'retention_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key constraints for flags table
    await queryRunner.createForeignKey(
      'flags',
      new TableForeignKey({
        columnNames: ['story_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stories',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'flags',
      new TableForeignKey({
        columnNames: ['reporter_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'flags',
      new TableForeignKey({
        columnNames: ['reviewed_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    // Add foreign key constraints for moderation_actions table
    await queryRunner.createForeignKey(
      'moderation_actions',
      new TableForeignKey({
        columnNames: ['moderator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'moderation_actions',
      new TableForeignKey({
        columnNames: ['target_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'moderation_actions',
      new TableForeignKey({
        columnNames: ['story_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stories',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'moderation_actions',
      new TableForeignKey({
        columnNames: ['flag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'flags',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'moderation_actions',
      new TableForeignKey({
        columnNames: ['reversed_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    // Add foreign key constraints for audit_logs table
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      })
    );

    // Create indexes for performance
    await queryRunner.createIndex('flags', new Index('IDX_flags_story_id', ['story_id']));
    await queryRunner.createIndex('flags', new Index('IDX_flags_reporter_id', ['reporter_id']));
    await queryRunner.createIndex('flags', new Index('IDX_flags_status', ['status']));
    await queryRunner.createIndex('flags', new Index('IDX_flags_priority', ['priority']));
    await queryRunner.createIndex('flags', new Index('IDX_flags_created_at', ['created_at']));
    await queryRunner.createIndex('flags', new Index('IDX_flags_reviewed_by', ['reviewed_by']));

    await queryRunner.createIndex('moderation_actions', new Index('IDX_moderation_actions_moderator_id', ['moderator_id']));
    await queryRunner.createIndex('moderation_actions', new Index('IDX_moderation_actions_target_user_id', ['target_user_id']));
    await queryRunner.createIndex('moderation_actions', new Index('IDX_moderation_actions_story_id', ['story_id']));
    await queryRunner.createIndex('moderation_actions', new Index('IDX_moderation_actions_flag_id', ['flag_id']));
    await queryRunner.createIndex('moderation_actions', new Index('IDX_moderation_actions_action_type', ['action_type']));
    await queryRunner.createIndex('moderation_actions', new Index('IDX_moderation_actions_created_at', ['created_at']));

    await queryRunner.createIndex('audit_logs', new Index('IDX_audit_logs_user_id', ['user_id']));
    await queryRunner.createIndex('audit_logs', new Index('IDX_audit_logs_event_type', ['event_type']));
    await queryRunner.createIndex('audit_logs', new Index('IDX_audit_logs_severity', ['severity']));
    await queryRunner.createIndex('audit_logs', new Index('IDX_audit_logs_ip_address', ['ip_address']));
    await queryRunner.createIndex('audit_logs', new Index('IDX_audit_logs_created_at', ['created_at']));
    await queryRunner.createIndex('audit_logs', new Index('IDX_audit_logs_correlation_id', ['correlation_id']));

    // Add constraints
    await queryRunner.query(`
      ALTER TABLE flags 
      ADD CONSTRAINT CHK_flags_reason 
      CHECK (reason IN ('spam', 'harassment', 'false_information', 'copyright_violation', 'privacy_violation', 'hate_speech', 'violence', 'illegal_content', 'personal_attack', 'misinformation', 'manipulated_media', 'other'))
    `);

    await queryRunner.query(`
      ALTER TABLE flags 
      ADD CONSTRAINT CHK_flags_status 
      CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'escalated'))
    `);

    await queryRunner.query(`
      ALTER TABLE flags 
      ADD CONSTRAINT CHK_flags_priority 
      CHECK (priority IN ('low', 'medium', 'high', 'critical'))
    `);

    await queryRunner.query(`
      ALTER TABLE moderation_actions 
      ADD CONSTRAINT CHK_moderation_actions_action_type 
      CHECK (action_type IN ('story_hidden', 'story_restored', 'story_deleted', 'flag_approved', 'flag_rejected', 'flag_escalated', 'content_edited', 'user_warned', 'user_suspended', 'user_banned', 'legal_notice_sent', 'dmca_takedown', 'privacy_violation_handled'))
    `);

    await queryRunner.query(`
      ALTER TABLE moderation_actions 
      ADD CONSTRAINT CHK_moderation_actions_severity 
      CHECK (severity IN ('info', 'warning', 'severe', 'critical'))
    `);

    await queryRunner.query(`
      ALTER TABLE audit_logs 
      ADD CONSTRAINT CHK_audit_logs_event_type 
      CHECK (event_type IN ('user_login', 'user_logout', 'user_registration', 'user_profile_update', 'story_created', 'story_updated', 'story_deleted', 'story_viewed', 'flag_created', 'flag_reviewed', 'moderation_action', 'company_claimed', 'company_verified', 'vote_cast', 'comment_created', 'api_access', 'rate_limit_exceeded', 'suspicious_activity', 'legal_request', 'privacy_request', 'data_export', 'data_deletion'))
    `);

    await queryRunner.query(`
      ALTER TABLE audit_logs 
      ADD CONSTRAINT CHK_audit_logs_severity 
      CHECK (severity IN ('info', 'warning', 'error', 'critical'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop constraints
    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT CHK_audit_logs_severity');
    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT CHK_audit_logs_event_type');
    await queryRunner.query('ALTER TABLE moderation_actions DROP CONSTRAINT CHK_moderation_actions_severity');
    await queryRunner.query('ALTER TABLE moderation_actions DROP CONSTRAINT CHK_moderation_actions_action_type');
    await queryRunner.query('ALTER TABLE flags DROP CONSTRAINT CHK_flags_priority');
    await queryRunner.query('ALTER TABLE flags DROP CONSTRAINT CHK_flags_status');
    await queryRunner.query('ALTER TABLE flags DROP CONSTRAINT CHK_flags_reason');

    // Drop tables
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('moderation_actions');
    await queryRunner.dropTable('flags');
  }
}
