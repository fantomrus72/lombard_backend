import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PledgesService } from './pledges.service';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { Pledge } from './entities/pledge.entity';

@ApiTags('Залоги')
@Controller('api/pledges')
export class PledgesController {
  constructor(private readonly pledgesService: PledgesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание нового залога' })
  @ApiBody({ type: CreatePledgeDto })
  @ApiResponse({ status: 201, description: 'Залог создан', type: Pledge })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({
    status: 404,
    description: 'Тариф, клиент или категория не найдены',
  })
  async create(@Body() createPledgeDto: CreatePledgeDto): Promise<Pledge> {
    return this.pledgesService.createPledge(createPledgeDto);
  }

  @Get('client/:clientId/active')
  @ApiOperation({ summary: 'Получить активные залоги клиента' })
  @ApiParam({ name: 'clientId', description: 'ID клиента' })
  @ApiResponse({
    status: 200,
    description: 'Список активных залогов',
    type: [Pledge],
  })
  async getActivePledges(
    @Param('clientId') clientId: string,
  ): Promise<Pledge[]> {
    return this.pledgesService.getActivePledgesByClient(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить залог по ID' })
  @ApiParam({ name: 'id', description: 'ID залога' })
  @ApiResponse({
    status: 200,
    description: 'Информация о залоге',
    type: Pledge,
  })
  @ApiResponse({ status: 404, description: 'Залог не найден' })
  async getOne(@Param('id') id: string): Promise<Pledge> {
    return this.pledgesService.findOne(id);
  }
}
