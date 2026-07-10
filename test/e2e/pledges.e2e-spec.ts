import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Tariff } from '../../src/modules/tariffs/entities/tariff.entity';
import { Client } from '../../src/modules/clients/entities/client.entity';
import { Category } from '../../src/modules/categories/entities/category.entity';

describe('Pledges E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tariff: Tariff;
  let client: Client;
  let category: Category;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    // Очищаем базу
    await dataSource.query('TRUNCATE TABLE pledge_items CASCADE');
    await dataSource.query('TRUNCATE TABLE pledges CASCADE');
    await dataSource.query('TRUNCATE TABLE clients CASCADE');
    await dataSource.query('TRUNCATE TABLE tariffs CASCADE');
    await dataSource.query('TRUNCATE TABLE item_categories CASCADE');

    // Создаем тестовые данные
    const tariffRepo = dataSource.getRepository(Tariff);
    tariff = await tariffRepo.save({
      name: 'Техника 5 дней 2,158%',
      basePeriodDays: 5,
      basePeriodRate: 2.158,
      overduePeriodDays: 30,
      overdueRate: 0.5,
    });

    const clientRepo = dataSource.getRepository(Client);
    client = await clientRepo.save({
      fullName: 'Тестов Клиент',
      phone: '+79991234567',
      passportData: '1234 567890',
    });

    const categoryRepo = dataSource.getRepository(Category);
    category = await categoryRepo.save({
      name: 'Смартфон',
      characteristicsSchema: {
        type: 'object',
        properties: {
          model: { type: 'string' },
          memory: { type: 'string' },
        },
      },
    });
  });

  describe('POST /api/pledges', () => {
    it('должен создать залог с существующим клиентом', async () => {
      const createData = {
        tariffId: tariff.id,
        clientId: client.id,
        items: [
          {
            categoryId: category.id,
            name: 'iPhone 15',
            characteristics: {
              model: 'iPhone 15',
              memory: '128GB',
            },
            estimatedValue: 45000,
          },
          {
            categoryId: category.id,
            name: 'Samsung S24',
            characteristics: {
              model: 'Samsung S24',
              memory: '256GB',
            },
            estimatedValue: 35000,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/pledges')
        .send(createData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.totalAmount).toBe(80000);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.items).toHaveLength(2);
    });

    it('должен создать залог с новым клиентом', async () => {
      const createData = {
        tariffId: tariff.id,
        client: {
          fullName: 'Новый Клиент',
          phone: '+79991234568',
          passportData: '1234 567891',
        },
        items: [
          {
            categoryId: category.id,
            name: 'iPhone 15',
            characteristics: {
              model: 'iPhone 15',
              memory: '128GB',
            },
            estimatedValue: 45000,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/pledges')
        .send(createData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.client.fullName).toBe('Новый Клиент');
    });

    it('должен вернуть ошибку при дубликате клиента', async () => {
      const createData = {
        tariffId: tariff.id,
        client: {
          fullName: 'Тестов Клиент',
          phone: '+79991234567',
          passportData: '1234 567890', // Такой уже есть
        },
        items: [
          {
            categoryId: category.id,
            name: 'iPhone 15',
            characteristics: {
              model: 'iPhone 15',
              memory: '128GB',
            },
            estimatedValue: 45000,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/pledges')
        .send(createData)
        .expect(409);

      expect(response.body.message).toContain('уже существует');
    });

    it('должен вернуть ошибку при несуществующем тарифе', async () => {
      const createData = {
        tariffId: 'invalid-tariff-id',
        clientId: client.id,
        items: [
          {
            categoryId: category.id,
            name: 'iPhone 15',
            characteristics: {
              model: 'iPhone 15',
              memory: '128GB',
            },
            estimatedValue: 45000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/pledges')
        .send(createData)
        .expect(404);
    });

    it('должен вернуть ошибку при несуществующей категории', async () => {
      const createData = {
        tariffId: tariff.id,
        clientId: client.id,
        items: [
          {
            categoryId: 'invalid-category-id',
            name: 'iPhone 15',
            characteristics: {
              model: 'iPhone 15',
              memory: '128GB',
            },
            estimatedValue: 45000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/pledges')
        .send(createData)
        .expect(404);
    });

    it('должен вернуть ошибку при отсутствии товаров', async () => {
      const createData = {
        tariffId: tariff.id,
        clientId: client.id,
        items: [],
      };

      const response = await request(app.getHttpServer())
        .post('/api/pledges')
        .send(createData)
        .expect(400);

      expect(response.body.message).toContain('items');
    });
  });

  describe('GET /api/pledges/client/:clientId/active', () => {
    it('должен вернуть активные залоги клиента', async () => {
      // Создаем залог
      const createData = {
        tariffId: tariff.id,
        clientId: client.id,
        items: [
          {
            categoryId: category.id,
            name: 'iPhone 15',
            characteristics: {
              model: 'iPhone 15',
              memory: '128GB',
            },
            estimatedValue: 45000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/pledges')
        .send(createData)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/pledges/client/${client.id}/active`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('active');
    });

    it('должен вернуть пустой список если нет активных залогов', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/pledges/client/${client.id}/active`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
