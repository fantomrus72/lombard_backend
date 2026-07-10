import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import {
  ClientNotFoundException,
  DuplicateClientException,
} from '../../common/exceptions';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
  ) {}

  /**
   * Создание нового клиента
   */
  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existingClient = await this.clientRepo.findOne({
      where: { passportData: createClientDto.passportData },
      withDeleted: true,
    });

    if (existingClient) {
      if (existingClient.deletedAt) {
        await this.clientRepo.restore(existingClient.id);

        existingClient.fullName = createClientDto.fullName;

        existingClient.phone = createClientDto.phone;

        return this.clientRepo.save(existingClient);
      }
      throw new DuplicateClientException(createClientDto.passportData);
    }

    const client = this.clientRepo.create({
      fullName: createClientDto.fullName,
      phone: createClientDto.phone,
      passportData: createClientDto.passportData,
    });

    return this.clientRepo.save(client);
  }

  /**
   * Поиск клиентов по запросу
   */
  async search(query?: string): Promise<Client[]> {
    if (!query) {
      return this.clientRepo.find({
        order: {
          createdAt: 'DESC',
        },
        take: 50,
      });
    }

    // Поиск по имени, телефону или паспорту
    return this.clientRepo.find({
      where: [
        { fullName: ILike(`%${query}%`) },
        { phone: ILike(`%${query}%`) },
        { passportData: ILike(`%${query}%`) },
      ],
      order: {
        createdAt: 'DESC',
      },
      take: 50,
    });
  }

  /**
   * Получить клиента по ID
   */
  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: {
        pledges: true,
      },
    });

    if (!client) {
      throw new ClientNotFoundException(id);
    }

    return client;
  }
}
