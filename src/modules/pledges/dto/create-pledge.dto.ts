import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateIf,
  Min,
  Max,
  Length,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Полное имя клиента',
    example: 'Иванов Иван Иванович',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  fullName: string;

  @ApiProperty({
    description: 'Номер телефона',
    example: '+7 (999) 123-45-67',
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({
    description: 'Паспортные данные',
    example: '4510 123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 50)
  passportData: string;
}

export class CreatePledgeItemDto {
  @ApiProperty({
    description: 'ID категории товара',
    example: '123e4567-e89b-12d3-a456-426614174010',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Название товара',
    example: 'iPhone 15 Pro Max',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    description: 'Характеристики товара',
    example: {
      model: 'iPhone 15 Pro Max',
      memory: '256GB',
      screenCondition: 'Без царапин',
    },
  })
  @IsObject()
  characteristics: Record<string, any>;

  @ApiProperty({
    description: 'Оценочная стоимость',
    example: 45000.0,
  })
  @IsNumber()
  @Min(0.01)
  @Max(99999999.99)
  estimatedValue: number;
}

export class CreatePledgeDto {
  @ApiProperty({
    description: 'ID тарифа',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  tariffId: string;

  @ApiPropertyOptional({
    description: 'ID существующего клиента',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @ValidateIf((o) => !o.client)
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Данные нового клиента',
    type: CreateClientDto,
  })
  @ValidateIf((o) => !o.clientId)
  @ValidateNested()
  @Type(() => CreateClientDto)
  @IsOptional()
  client?: CreateClientDto;

  @ApiProperty({
    description: 'Список товаров в залоге',
    type: [CreatePledgeItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePledgeItemDto)
  @IsNotEmpty()
  items: CreatePledgeItemDto[];
}
