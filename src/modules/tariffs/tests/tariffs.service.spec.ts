import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TariffsService } from '../tariffs.service';
import { Tariff } from '../entities/tariff.entity';
import { TariffNotFoundException } from '../../../common/exceptions';

describe('TariffsService', () => {
  let service: TariffsService;
  let repository: Repository<Tariff>;

  const mockTariff = {
    id: 'tariff-1',
    name: 'Техника 5 дней 2,158%',
    basePeriodDays: 5,
    basePeriodRate: 2.158,
    overduePeriodDays: 30,
    overdueRate: 0.5,
    createdAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TariffsService,
        {
          provide: getRepositoryToken(Tariff),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TariffsService>(TariffsService);
    repository = module.get<Repository<Tariff>>(getRepositoryToken(Tariff));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tariff', async () => {
      const createTariffDto = {
        name: 'Новый тариф',
        basePeriodDays: 10,
        basePeriodRate: 3.5,
        overduePeriodDays: 30,
        overdueRate: 0.7,
      };

      mockRepository.create.mockReturnValue(mockTariff);
      mockRepository.save.mockResolvedValue(mockTariff);

      const result = await service.create(createTariffDto);

      expect(result).toEqual(mockTariff);
      expect(mockRepository.create).toHaveBeenCalledWith(createTariffDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tariffs', async () => {
      const tariffs = [mockTariff];
      mockRepository.find.mockResolvedValue(tariffs);

      const result = await service.findAll();

      expect(result).toEqual(tariffs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return tariff by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTariff);

      const result = await service.findOne('tariff-1');

      expect(result).toEqual(mockTariff);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tariff-1' },
      });
    });

    it('should throw TariffNotFoundException if tariff not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        TariffNotFoundException,
      );
    });
  });
});
