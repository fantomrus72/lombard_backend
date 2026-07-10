import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateTariffDto {
  @ApiProperty({
    description: 'Название тарифа',
    example: 'Техника 5 дней 2,158%',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    description: 'Количество дней основного периода',
    example: 5,
    minimum: 1,
    maximum: 365,
  })
  @IsNumber()
  @Min(1)
  @Max(365)
  basePeriodDays: number;

  @ApiProperty({
    description: 'Ставка за основной период (в процентах)',
    example: 2.158,
    minimum: 0.001,
    maximum: 100,
  })
  @IsNumber()
  @Min(0.001)
  @Max(100)
  basePeriodRate: number;

  @ApiProperty({
    description: 'Количество дней просрочки',
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsNumber()
  @Min(1)
  @Max(365)
  overduePeriodDays: number;

  @ApiProperty({
    description: 'Ставка за просрочку (в процентах за день)',
    example: 0.5,
    minimum: 0.001,
    maximum: 10,
  })
  @IsNumber()
  @Min(0.001)
  @Max(10)
  overdueRate: number;
}
