import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TariffsService } from './tariffs.service';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { Tariff } from './entities/tariff.entity';

@ApiTags('Тарифы')
@Controller('api/tariffs')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание тарифа' })
  @ApiResponse({ status: 201, description: 'Тариф создан', type: Tariff })
  async create(@Body() createTariffDto: CreateTariffDto): Promise<Tariff> {
    return this.tariffsService.create(createTariffDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все тарифы' })
  @ApiResponse({ status: 200, description: 'Список тарифов', type: [Tariff] })
  async findAll(): Promise<Tariff[]> {
    return this.tariffsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тариф по ID' })
  @ApiResponse({
    status: 200,
    description: 'Информация о тарифе',
    type: Tariff,
  })
  @ApiResponse({ status: 404, description: 'Тариф не найден' })
  async findOne(@Param('id') id: string): Promise<Tariff> {
    return this.tariffsService.findOne(id);
  }
}
