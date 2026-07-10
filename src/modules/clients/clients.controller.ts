import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, SearchClientsDto } from './dto/create-client.dto';
import { Client } from './entities/client.entity';

@ApiTags('Клиенты')
@Controller('api/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание клиента' })
  @ApiResponse({ status: 201, description: 'Клиент создан', type: Client })
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Поиск клиентов' })
  @ApiQuery({ name: 'query', required: false, description: 'Поисковый запрос' })
  @ApiResponse({ status: 200, description: 'Список клиентов', type: [Client] })
  async search(@Query() searchDto: SearchClientsDto): Promise<Client[]> {
    return this.clientsService.search(searchDto.query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить клиента по ID' })
  @ApiResponse({
    status: 200,
    description: 'Информация о клиенте',
    type: Client,
  })
  @ApiResponse({ status: 404, description: 'Клиент не найден' })
  async findOne(@Param('id') id: string): Promise<Client> {
    return this.clientsService.findOne(id);
  }
}
