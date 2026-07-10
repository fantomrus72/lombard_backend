import { DataSource } from 'typeorm';
import { Tariff } from '../../modules/tariffs/entities/tariff.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Client } from '../../modules/clients/entities/client.entity';

export async function seedDatabase(dataSource: DataSource) {
  console.log('🌱 Seeding database...');

  const tariffRepo = dataSource.getRepository(Tariff);
  const categoryRepo = dataSource.getRepository(Category);
  const clientRepo = dataSource.getRepository(Client);

  // Проверяем, есть ли уже данные
  const tariffsCount = await tariffRepo.count();
  if (tariffsCount > 0) {
    console.log('Data already exists, skipping seed');
    return;
  }

  // Очищаем таблицы (только если есть данные)
  await tariffRepo.delete({});
  await categoryRepo.delete({});
  await clientRepo.delete({});

  console.log('Creating tariffs...');

  // Тарифы
  const tariffs = await tariffRepo.save([
    {
      name: 'Техника 5 дней 2,158%',
      basePeriodDays: 5,
      basePeriodRate: 2.158,
      overduePeriodDays: 30,
      overdueRate: 0.5,
    },
    {
      name: 'Техника 10 дней 3,5%',
      basePeriodDays: 10,
      basePeriodRate: 3.5,
      overduePeriodDays: 30,
      overdueRate: 0.7,
    },
    {
      name: 'Драгоценности 30 дней 5%',
      basePeriodDays: 30,
      basePeriodRate: 5.0,
      overduePeriodDays: 60,
      overdueRate: 0.3,
    },
    {
      name: 'Часы 15 дней 2,5%',
      basePeriodDays: 15,
      basePeriodRate: 2.5,
      overduePeriodDays: 30,
      overdueRate: 0.4,
    },
  ]);

  console.log(`Created ${tariffs.length} tariffs`);

  console.log('Creating categories...');

  // Категории с JSON-схемами
  const categories = await categoryRepo.save([
    {
      name: 'Смартфон',
      characteristicsSchema: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            title: 'Модель',
          },
          memory: {
            type: 'string',
            title: 'Объём памяти',
            enum: ['64GB', '128GB', '256GB', '512GB', '1TB'],
          },
          screenCondition: {
            type: 'string',
            title: 'Состояние экрана',
            enum: ['Без царапин', 'Небольшие царапины', 'Сколы', 'Трещины'],
          },
        },
        required: ['model'],
      },
    },
    {
      name: 'Монитор',
      characteristicsSchema: {
        type: 'object',
        properties: {
          diagonal: {
            type: 'number',
            title: 'Диагональ (дюймы)',
            minimum: 15,
            maximum: 49,
          },
          resolution: {
            type: 'string',
            title: 'Разрешение',
            enum: ['1920x1080', '2560x1440', '3840x2160'],
          },
          panelType: {
            type: 'string',
            title: 'Тип матрицы',
            enum: ['IPS', 'VA', 'TN', 'OLED'],
          },
          hasScratches: {
            type: 'boolean',
            title: 'Наличие царапин',
          },
        },
        required: ['diagonal', 'resolution'],
      },
    },
    {
      name: 'Ноутбук',
      characteristicsSchema: {
        type: 'object',
        properties: {
          brand: {
            type: 'string',
            title: 'Бренд',
            enum: ['Apple', 'Lenovo', 'Dell', 'HP', 'Asus', 'Acer'],
          },
          model: {
            type: 'string',
            title: 'Модель',
          },
          screenSize: {
            type: 'number',
            title: 'Диагональ экрана (дюймы)',
            minimum: 11,
            maximum: 18,
          },
          ram: {
            type: 'string',
            title: 'Оперативная память',
            enum: ['4GB', '8GB', '16GB', '32GB', '64GB'],
          },
          storage: {
            type: 'string',
            title: 'Накопитель',
            enum: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD'],
          },
        },
        required: ['brand', 'model'],
      },
    },
  ]);

  console.log(`Created ${categories.length} categories`);

  console.log('Creating test clients...');

  // Тестовые клиенты
  const clients = await clientRepo.save([
    {
      fullName: 'Иванов Иван Иванович',
      phone: '+7 (999) 123-45-67',
      passportData: '4510 123456',
    },
    {
      fullName: 'Петров Петр Петрович',
      phone: '+7 (999) 765-43-21',
      passportData: '4520 654321',
    },
    {
      fullName: 'Сидоров Сидор Сидорович',
      phone: '+7 (999) 111-22-33',
      passportData: '4530 111222',
    },
    {
      fullName: 'Кузнецова Анна Сергеевна',
      phone: '+7 (999) 888-77-66',
      passportData: '4540 888777',
    },
  ]);

  console.log(`Created ${clients.length} clients`);

  console.log('Seeding completed!');
}