import { Injectable } from '@nestjs/common';
import { Pledge } from '../../pledges/entities/pledge.entity';

export interface RedemptionCalculation {
  baseInterest: number;
  overdueInterest: number;
  totalRedemptionAmount: number;
  daysOverdue: number;
  isOverdue: boolean;
}

@Injectable()
export class InterestCalculatorService {
  /**
   * Рассчитывает сумму выкупа залога
   *
   * @param pledge - Объект залога с загруженным тарифом
   * @param currentDate - Текущая дата (для тестов можно передать свою)
   * @returns Результат расчета
   */
  calculateRedemption(
    pledge: Pledge,
    currentDate: Date = new Date(),
  ): RedemptionCalculation {
    const tariff = pledge.tariff;
    const principal = Number(pledge.totalAmount);
    const baseRate = Number(tariff.basePeriodRate) / 100;
    const overdueRate = Number(tariff.overdueRate) / 100;

    const baseInterest = principal * baseRate;

    const dueDate = new Date(pledge.dueDate);
    const isOverdue = currentDate > dueDate;

    let overdueInterest = 0;
    let daysOverdue = 0;

    if (isOverdue) {
      const diffTime = currentDate.getTime() - dueDate.getTime();
      daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      overdueInterest = principal * overdueRate * daysOverdue;
    }

    return {
      baseInterest,
      overdueInterest,
      totalRedemptionAmount: principal + baseInterest + overdueInterest,
      daysOverdue,
      isOverdue,
    };
  }
}
