import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableUnique,
  TableCheck,
} from 'typeorm';

export class CreateTables1700000000000 implements MigrationInterface {
  name = 'CreateTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Тарифы
    await queryRunner.createTable(
      new Table({
        name: 'tariffs',
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
            isNullable: false,
          },
          {
            name: 'base_period_days',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'base_period_rate',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'overdue_period_days',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'overdue_rate',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
        checks: [
          {
            name: 'CK_tariffs_base_period_days',
            expression: 'base_period_days > 0',
          },
          {
            name: 'CK_tariffs_base_period_rate',
            expression: 'base_period_rate > 0',
          },
          {
            name: 'CK_tariffs_overdue_period_days',
            expression: 'overdue_period_days > 0',
          },
          {
            name: 'CK_tariffs_overdue_rate',
            expression: 'overdue_rate > 0',
          },
        ],
      }),
    );

    // Клиенты
    await queryRunner.createTable(
      new Table({
        name: 'clients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'passport_data',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    // Индексы для clients
    await queryRunner.createIndex(
      'clients',
      new TableIndex({
        name: 'idx_clients_phone',
        columnNames: ['phone'],
      }),
    );

    await queryRunner.createIndex(
      'clients',
      new TableIndex({
        name: 'idx_clients_passport',
        columnNames: ['passport_data'],
      }),
    );

    // Уникальный индекс только для активных записей
    await queryRunner.query(`
            CREATE UNIQUE INDEX idx_clients_passport_unique_active 
            ON clients(passport_data) WHERE deleted_at IS NULL
        `);

    // Категории
    await queryRunner.createTable(
      new Table({
        name: 'item_categories',
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
            isNullable: false,
          },
          {
            name: 'characteristics_schema',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
    );

    // GIN индекс для JSONB
    await queryRunner.query(`
            CREATE INDEX idx_categories_schema ON item_categories USING gin (characteristics_schema)
        `);

    // Залоги
    await queryRunner.createTable(
      new Table({
        name: 'pledges',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tariff_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'client_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'due_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'active'",
          },
          {
            name: 'redeemed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'redemption_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_pledges_tariff',
            columnNames: ['tariff_id'],
            referencedTableName: 'tariffs',
            referencedColumnNames: ['id'],
          },
          {
            name: 'FK_pledges_client',
            columnNames: ['client_id'],
            referencedTableName: 'clients',
            referencedColumnNames: ['id'],
          },
        ],
        checks: [
          {
            name: 'CK_pledges_total_amount',
            expression: 'total_amount > 0',
          },
          {
            name: 'CK_pledges_status',
            expression: "status IN ('active', 'redeemed')",
          },
        ],
      }),
    );

    // Индексы для pledges
    await queryRunner.createIndex(
      'pledges',
      new TableIndex({
        name: 'idx_pledges_client_status',
        columnNames: ['client_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'pledges',
      new TableIndex({
        name: 'idx_pledges_due_date',
        columnNames: ['due_date'],
      }),
    );

    // Товары в залоге
    await queryRunner.createTable(
      new Table({
        name: 'pledge_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'pledge_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'category_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'characteristics',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'estimated_value',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_pledge_items_pledge',
            columnNames: ['pledge_id'],
            referencedTableName: 'pledges',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK_pledge_items_category',
            columnNames: ['category_id'],
            referencedTableName: 'item_categories',
            referencedColumnNames: ['id'],
          },
        ],
        checks: [
          {
            name: 'CK_pledge_items_estimated_value',
            expression: 'estimated_value > 0',
          },
        ],
      }),
    );

    // Индексы для pledge_items
    await queryRunner.createIndex(
      'pledge_items',
      new TableIndex({
        name: 'idx_pledge_items_pledge',
        columnNames: ['pledge_id'],
      }),
    );

    // GIN индекс для JSONB
    await queryRunner.query(`
            CREATE INDEX idx_pledge_items_characteristics ON pledge_items USING gin (characteristics)
        `);

    // Комментарии к таблицам
    await queryRunner.query(
      `COMMENT ON TABLE tariffs IS 'Тарифы для расчета процентов'`,
    );
    await queryRunner.query(`COMMENT ON TABLE clients IS 'Клиенты ломбарда'`);
    await queryRunner.query(
      `COMMENT ON TABLE item_categories IS 'Категории товаров с JSON-схемами характеристик'`,
    );
    await queryRunner.query(`COMMENT ON TABLE pledges IS 'Залоги'`);
    await queryRunner.query(
      `COMMENT ON TABLE pledge_items IS 'Товары в залоге'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pledge_items');
    await queryRunner.dropTable('pledges');
    await queryRunner.dropTable('item_categories');
    await queryRunner.dropTable('clients');
    await queryRunner.dropTable('tariffs');
  }
}
