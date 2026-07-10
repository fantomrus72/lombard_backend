import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tariff } from './entities/tariff.entity';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { TariffNotFoundException } from '../../common/exceptions';

@Injectable()
export class TariffsService {
  constructor(
    @InjectRepository(Tariff)
    private tariffRepo: Repository<Tariff>,
  ) {}

  /**
   * Создание нового тарифа
   */
  async create(createTariffDto: CreateTariffDto): Promise<Tariff> {
    const tariff = this.tariffRepo.create({
      name: createTariffDto.name,
      basePeriodDays: createTariffDto.basePeriodDays,
      basePeriodRate: createTariffDto.basePeriodRate,
      overduePeriodDays: createTariffDto.overduePeriodDays,
      overdueRate: createTariffDto.overdueRate,
    });

    return this.tariffRepo.save(tariff);
  }

  /**
   * Получить все тарифы
   */
  async findAll(): Promise<Tariff[]> {
    return this.tariffRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Получить тариф по ID
   */
  async findOne(id: string): Promise<Tariff> {
    const tariff = await this.tariffRepo.findOne({
      where: { id },
    });

    if (!tariff) {
      throw new TariffNotFoundException(id);
    }

    return tariff;
  }
}
