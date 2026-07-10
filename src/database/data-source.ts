import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Загружаем .env
config();

// Определяем пути для сущностей и миграций
const entitiesPath = path.join(
  __dirname,
  '..',
  'modules',
  '**',
  '*.entity{.ts,.js}',
);
const migrationsPath = path.join(__dirname, 'migrations', '*.{.ts,.js}');

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'pioneer_user',
  password: process.env.DATABASE_PASSWORD || 'pioneer_password',
  database: process.env.DATABASE_NAME || 'lombard_pioneer',
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: false,
  migrationsTransactionMode: 'each',
});
