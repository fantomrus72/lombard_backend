import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsPhoneNumber,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    description: 'Полное имя клиента',
    example: 'Петров Петр Петрович',
    minLength: 2,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 255)
  fullName: string;

  @ApiProperty({
    description: 'Номер телефона',
    example: '+7 (916) 555-44-33',
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({
    description: 'Паспортные данные (уникальный идентификатор)',
    example: '4520 789012',
    minLength: 4,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 50)
  passportData: string;
}

export class SearchClientsDto {
  @ApiPropertyOptional({
    description: 'Поисковый запрос (по имени, телефону или паспорту)',
    example: 'Иван',
  })
  @IsOptional()
  @IsString()
  query?: string;
}
