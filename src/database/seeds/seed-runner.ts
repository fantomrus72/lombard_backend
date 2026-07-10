import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedDatabase } from './seed-data';
import { Tariff } from '../../modules/tariffs/entities/tariff.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Client } from '../../modules/clients/entities/client.entity';
import { Pledge } from '../../modules/pledges/entities/pledge.entity';
import { PledgeItem } from '../../modules/pledges/entities/pledge-item.entity';

config();

async function runSeed() {
  console.log('Starting seed runner...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'postgres',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'pioneer_user',
    password: process.env.DATABASE_PASSWORD || 'pioneer_password',
    database: process.env.DATABASE_NAME || 'lombard_pioneer',
    entities: [Tariff, Category, Client, Pledge, PledgeItem],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected');

    await seedDatabase(dataSource);

    console.log('Seeding completed successfully');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeed();