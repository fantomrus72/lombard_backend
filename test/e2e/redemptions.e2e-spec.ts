import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Tariff } from '../../src/modules/tariffs/entities/tariff.entity';
import { Client } from '../../src/modules/clients/entities/client.entity';
import {
  Pledge,
  PledgeStatus,
} from '../../src/modules/pledges/entities/pledge.entity';
import { Category } from '../../src/modules/categories/entities/category.entity';
import { PledgeItem } from '../../src/modules/pledges/entities/pledge-item.entity';

describe('Redemptions E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tariff: Tariff;
  let client: Client;
  let category: Category;
  let pledge: Pledge;

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
    // Очищаем базу перед каждым тестом
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
        },
      },
    });
  });

  describe('POST /api/redemptions/:pledgeId', () => {
    beforeEach(async () => {
      // Создаем залог для каждого теста
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5);

      const pledgeRepo = dataSource.getRepository(Pledge);
      pledge = await pledgeRepo.save({
        tariffId: tariff.id,
        clientId: client.id,
        dueDate: dueDate,
        totalAmount: 10000,
        status: PledgeStatus.ACTIVE,
      });

      const itemRepo = dataSource.getRepository(PledgeItem);
      await itemRepo.save({
        pledgeId: pledge.id,
        categoryId: category.id,
        name: 'iPhone 15',
        characteristics: { model: 'iPhone 15' },
        estimatedValue: 10000,
      });
    });

    describe('Выкуп в срок', () => {
      it('должен рассчитать сумму выкупа без просрочки', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/redemptions/${pledge.id}`)
          .send({})
          .expect(201);

        expect(response.body.data.status).toBe('redeemed');
        expect(response.body.data.redemptionAmount).toBeCloseTo(10215.8, 1);
        expect(response.body.data.redeemedAt).toBeDefined();
      });

      it('должен вернуть ошибку при повторном выкупе', async () => {
        // Первый выкуп
        await request(app.getHttpServer())
          .post(`/api/redemptions/${pledge.id}`)
          .send({})
          .expect(201);

        // Второй выкуп - ошибка
        const response = await request(app.getHttpServer())
          .post(`/api/redemptions/${pledge.id}`)
          .send({})
          .expect(400);

        expect(response.body.message).toContain('уже выкуплен');
      });
    });

    describe('Выкуп с просрочкой', () => {
      it('должен начислить проценты за просрочку', async () => {
        // Меняем дату "до" на 5 дней назад
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 5);
        await dataSource.getRepository(Pledge).update(pledge.id, { dueDate });

        const response = await request(app.getHttpServer())
          .post(`/api/redemptions/${pledge.id}`)
          .send({})
          .expect(201);

        // 10000 + 2.158% + 0.5% * 5 = 10465.8
        expect(response.body.data.redemptionAmount).toBeCloseTo(10465.8, 1);
      });
    });

    describe('Граничные случаи', () => {
      it('выкуп ровно в дату "до" - просрочки нет', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await dataSource
          .getRepository(Pledge)
          .update(pledge.id, { dueDate: today });

        const response = await request(app.getHttpServer())
          .post(`/api/redemptions/${pledge.id}`)
          .send({})
          .expect(201);

        expect(response.body.data.redemptionAmount).toBeCloseTo(10215.8, 1);
      });

      it('попытка выкупа несуществующего залога - ошибка 404', async () => {
        await request(app.getHttpServer())
          .post('/api/redemptions/invalid-id')
          .send({})
          .expect(404);
      });
    });
  });

  describe('GET /api/redemptions/:pledgeId/preview', () => {
    beforeEach(async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5);

      const pledgeRepo = dataSource.getRepository(Pledge);
      pledge = await pledgeRepo.save({
        tariffId: tariff.id,
        clientId: client.id,
        dueDate: dueDate,
        totalAmount: 10000,
        status: PledgeStatus.ACTIVE,
      });
    });

    it('должен показать расчет суммы выкупа без изменения статуса', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/redemptions/${pledge.id}/preview`)
        .expect(200);

      expect(response.body.data.totalRedemptionAmount).toBeCloseTo(10215.8, 1);
      expect(response.body.data.isOverdue).toBe(false);
      expect(response.body.data.daysOverdue).toBe(0);

      // Статус не должен измениться
      const pledgeCheck = await dataSource.getRepository(Pledge).findOne({
        where: { id: pledge.id },
      });

      // @ts-ignore
      expect(pledgeCheck.status).toBe(PledgeStatus.ACTIVE);
    });

    it('должен показать просрочку в предпросмотре', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 5);
      await dataSource.getRepository(Pledge).update(pledge.id, { dueDate });

      const response = await request(app.getHttpServer())
        .get(`/api/redemptions/${pledge.id}/preview`)
        .expect(200);

      expect(response.body.data.isOverdue).toBe(true);
      expect(response.body.data.daysOverdue).toBeGreaterThan(0);
      expect(response.body.data.totalRedemptionAmount).toBeCloseTo(10465.8, 1);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
