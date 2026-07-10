import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pledge, PledgeStatus } from '../pledges/entities/pledge.entity';
import { InterestCalculatorService } from './services/interest-calculator.service';
import { RedeemPledgeDto } from './dto/redeem-pledge.dto';
import {
  PledgeNotFoundException,
  PledgeAlreadyRedeemedException,
} from '../../common/exceptions';

@Injectable()
export class RedemptionsService {
  constructor(
    @InjectRepository(Pledge)
    private pledgeRepo: Repository<Pledge>,
    private interestCalculator: InterestCalculatorService,
    private dataSource: DataSource,
  ) {}

  /**
   * Выкуп залога
   */
  async redeemPledge(
    pledgeId: string,
    redeemDto: RedeemPledgeDto,
  ): Promise<Pledge> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Блокируем запись для предотвращения race condition
      const pledge = await queryRunner.manager
        .createQueryBuilder(Pledge, 'pledge')
        .setLock('pessimistic_write')
        .where('pledge.id = :id', { id: pledgeId })
        .andWhere('pledge.status = :status', { status: PledgeStatus.ACTIVE })
        .leftJoinAndSelect('pledge.tariff', 'tariff')
        .getOne();

      if (!pledge) {
        throw new PledgeAlreadyRedeemedException(pledgeId);
      }

      const currentDate = redeemDto.redeemDate
        ? new Date(redeemDto.redeemDate)
        : new Date();

      const calculation = this.interestCalculator.calculateRedemption(
        pledge,
        currentDate,
      );

      pledge.status = PledgeStatus.REDEEMED;
      pledge.redeemedAt = currentDate;
      pledge.redemptionAmount = calculation.totalRedemptionAmount;

      await queryRunner.manager.save(pledge);
      await queryRunner.commitTransaction();

      return pledge;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Предпросмотр суммы выкупа (без изменения статуса)
   */
  async previewRedemption(pledgeId: string): Promise<any> {
    const pledge = await this.pledgeRepo.findOne({
      where: { id: pledgeId, status: PledgeStatus.ACTIVE },
      relations: {
        tariff: true,
      },
    });

    if (!pledge) {
      throw new PledgeNotFoundException(pledgeId);
    }

    const calculation = this.interestCalculator.calculateRedemption(pledge);

    return {
      pledgeId: pledge.id,
      totalAmount: Number(pledge.totalAmount),
      dueDate: pledge.dueDate,
      ...calculation,
    };
  }
}
