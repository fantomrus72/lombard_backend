import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pledge, PledgeStatus } from './entities/pledge.entity';
import { PledgeItem } from './entities/pledge-item.entity';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import {
  TariffNotFoundException,
  ClientNotFoundException,
  CategoryNotFoundException,
  DuplicateClientException,
  PledgeNotFoundException,
} from '../../common/exceptions';
import { Tariff } from '../tariffs/entities/tariff.entity';
import { Client } from '../clients/entities/client.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class PledgesService {
  constructor(
    @InjectRepository(Pledge)
    private pledgeRepo: Repository<Pledge>,
    @InjectRepository(PledgeItem)
    private pledgeItemRepo: Repository<PledgeItem>,
    @InjectRepository(Tariff)
    private tariffRepo: Repository<Tariff>,
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  /**
   * Создание нового залога
   */
  async createPledge(createPledgeDto: CreatePledgeDto): Promise<Pledge> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tariff = await this.tariffRepo.findOne({
        where: { id: createPledgeDto.tariffId },
      });

      if (!tariff) {
        throw new TariffNotFoundException(createPledgeDto.tariffId);
      }

      let client: Client;

      if (createPledgeDto.clientId) {
        const existingClient = await this.clientRepo.findOne({
          where: { id: createPledgeDto.clientId },
        });

        if (!existingClient) {
          throw new ClientNotFoundException(createPledgeDto.clientId);
        }

        client = existingClient;
      } else if (createPledgeDto.client) {
        const existingClient = await this.clientRepo.findOne({
          where: { passportData: createPledgeDto.client.passportData },
        });

        if (existingClient) {
          throw new DuplicateClientException(
            createPledgeDto.client.passportData,
          );
        }

        client = await this.clientRepo.save({
          fullName: createPledgeDto.client.fullName,
          phone: createPledgeDto.client.phone,
          passportData: createPledgeDto.client.passportData,
        });
      } else {
        throw new Error('Не указан клиент');
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + tariff.basePeriodDays);

      const pledge = this.pledgeRepo.create({
        tariffId: tariff.id,
        clientId: client.id,
        dueDate,
        totalAmount: 0,
        status: PledgeStatus.ACTIVE,
      });

      await queryRunner.manager.save(pledge);

      let totalAmount = 0;

      for (const itemDto of createPledgeDto.items) {
        const category = await this.categoryRepo.findOne({
          where: { id: itemDto.categoryId },
        });
        if (!category) {
          throw new CategoryNotFoundException(itemDto.categoryId);
        }

        const item = this.pledgeItemRepo.create({
          pledgeId: pledge.id,
          categoryId: category.id,
          name: itemDto.name,
          characteristics: itemDto.characteristics,
          estimatedValue: itemDto.estimatedValue,
        });

        await queryRunner.manager.save(item);
        totalAmount += Number(itemDto.estimatedValue);
      }

      pledge.totalAmount = totalAmount;

      await queryRunner.manager.save(pledge);

      await queryRunner.commitTransaction();

      return this.findOne(pledge.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Получить активные залоги клиента
   */
  async getActivePledgesByClient(clientId: string): Promise<Pledge[]> {
    return this.pledgeRepo.find({
      where: {
        clientId,
        status: PledgeStatus.ACTIVE,
      },
      relations: {
        tariff: true,
        items: {
          category: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Получить залог по ID
   */
  async findOne(id: string): Promise<Pledge> {
    const pledge = await this.pledgeRepo.findOne({
      where: { id },
      relations: {
        tariff: true,
        client: true,
        items: {
          category: true,
        },
      },
    });

    if (!pledge) {
      throw new PledgeNotFoundException(id);
    }

    return pledge;
  }
}
