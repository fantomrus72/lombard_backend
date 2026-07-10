import { Test, TestingModule } from '@nestjs/testing';
import { InterestCalculatorService } from '../services/interest-calculator.service';
import { Pledge } from '../../pledges/entities/pledge.entity';
import { Tariff } from '../../tariffs/entities/tariff.entity';
import { PledgeStatus } from '../../pledges/entities/pledge.entity';

describe('InterestCalculatorService', () => {
  let service: InterestCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestCalculatorService],
    }).compile();

    service = module.get<InterestCalculatorService>(InterestCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRedemption', () => {
    let tariff: Tariff;
    let pledge: Pledge;

    beforeEach(() => {
      tariff = {
        id: 'tariff-1',
        name: 'Техника 5 дней 2,158%',
        basePeriodDays: 5,
        basePeriodRate: 2.158,
        overduePeriodDays: 30,
        overdueRate: 0.5,
        createdAt: new Date(),
        pledges: [],
      } as Tariff;

      pledge = {
        id: 'pledge-1',
        tariffId: tariff.id,
        clientId: 'client-1',
        dueDate: new Date(),
        totalAmount: 10000,
        status: PledgeStatus.ACTIVE,
        redeemedAt: null,
        redemptionAmount: null,
        createdAt: new Date(),
        tariff: tariff,
        client: null,
        items: [],
      } as unknown as Pledge;
    });

    describe('Выкуп в срок (без просрочки)', () => {
      it('должен рассчитать сумму выкупа без просрочки', () => {
        // Даем дату "до" через 5 дней
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);
        pledge.dueDate = dueDate;

        // Текущая дата - сегодня (до даты "до")
        const currentDate = new Date();

        const result = service.calculateRedemption(pledge, currentDate);

        // Ожидаем: 10000 + 2.158% = 10215.8
        expect(result.totalRedemptionAmount).toBeCloseTo(10215.8, 2);
        expect(result.baseInterest).toBeCloseTo(215.8, 2);
        expect(result.overdueInterest).toBe(0);
        expect(result.daysOverdue).toBe(0);
        expect(result.isOverdue).toBe(false);
      });

      it('выкуп ровно в дату "до" - просрочки нет', () => {
        // Дата "до" - сегодня
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        pledge.dueDate = today;

        const currentDate = new Date(today);

        const result = service.calculateRedemption(pledge, currentDate);

        expect(result.isOverdue).toBe(false);
        expect(result.daysOverdue).toBe(0);
        expect(result.totalRedemptionAmount).toBeCloseTo(10215.8, 2);
      });
    });

    describe('Выкуп с просрочкой', () => {
      it('должен начислить проценты за просрочку', () => {
        // Дата "до" была 5 дней назад
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 5);
        pledge.dueDate = dueDate;

        const currentDate = new Date();

        const result = service.calculateRedemption(pledge, currentDate);

        // Ожидаем: 10000 + 2.158% + (0.5% * 5 дней) = 10000 + 215.8 + 250 = 10465.8
        expect(result.totalRedemptionAmount).toBeCloseTo(10465.8, 2);
        expect(result.baseInterest).toBeCloseTo(215.8, 2);
        expect(result.overdueInterest).toBeCloseTo(250, 2);
        expect(result.daysOverdue).toBeGreaterThan(0);
        expect(result.isOverdue).toBe(true);
      });

      it('должен правильно считать дни просрочки', () => {
        const dueDate = new Date('2026-07-01T00:00:00.000Z');
        const currentDate = new Date('2026-07-10T00:00:00.000Z');
        pledge.dueDate = dueDate;

        const result = service.calculateRedemption(pledge, currentDate);

        expect(result.daysOverdue).toBe(9);
        expect(result.overdueInterest).toBeCloseTo(10000 * 0.005 * 9, 2);
      });
    });

    describe('Разные тарифы', () => {
      it('должен показывать разный результат для разных тарифов', () => {
        const tariff1: Tariff = {
          ...tariff,
          basePeriodRate: 2.158,
          overdueRate: 0.5,
        };

        const tariff2: Tariff = {
          ...tariff,
          id: 'tariff-2',
          name: 'Техника 10 дней 3,5%',
          basePeriodRate: 3.5,
          overdueRate: 0.7,
        };

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);

        const pledge1: Pledge = {
          ...pledge,
          tariff: tariff1,
          totalAmount: 10000,
          dueDate: dueDate,
        };

        const pledge2: Pledge = {
          ...pledge,
          id: 'pledge-2',
          tariff: tariff2,
          totalAmount: 10000,
          dueDate: dueDate,
        };

        const result1 = service.calculateRedemption(pledge1);
        const result2 = service.calculateRedemption(pledge2);

        expect(result1.totalRedemptionAmount).not.toBe(
          result2.totalRedemptionAmount,
        );
        expect(result1.totalRedemptionAmount).toBeCloseTo(10215.8, 2);
        expect(result2.totalRedemptionAmount).toBeCloseTo(10350, 2);
      });
    });

    describe('Граничные случаи', () => {
      it('должен корректно обрабатывать нулевую сумму залога', () => {
        pledge.totalAmount = 0;

        const result = service.calculateRedemption(pledge);

        expect(result.totalRedemptionAmount).toBe(0);
        expect(result.baseInterest).toBe(0);
        expect(result.overdueInterest).toBe(0);
        expect(result.daysOverdue).toBe(0);
        expect(result.isOverdue).toBe(false);
      });

      it('должен корректно обрабатывать большую сумму залога', () => {
        pledge.totalAmount = 1000000;

        const result = service.calculateRedemption(pledge);

        expect(result.totalRedemptionAmount).toBeCloseTo(1021580, 2);
        expect(result.baseInterest).toBeCloseTo(21580, 2);
      });

      it('должен корректно обрабатывать разные даты', () => {
        const dueDate = new Date('2026-07-01T00:00:00.000Z');
        pledge.dueDate = dueDate;

        const currentDate = new Date('2026-07-01T00:00:00.000Z');
        const result1 = service.calculateRedemption(pledge, currentDate);
        expect(result1.isOverdue).toBe(false);

        const currentDate2 = new Date('2026-07-02T00:00:00.000Z');
        const result2 = service.calculateRedemption(pledge, currentDate2);
        expect(result2.isOverdue).toBe(true);
        expect(result2.daysOverdue).toBe(1);
      });
    });
  });
});
