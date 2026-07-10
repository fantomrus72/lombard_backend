import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RedeemPledgeDto {
  @ApiPropertyOptional({
    description: 'Дата выкупа (если не указана, используется текущая)',
    example: '2026-07-10T15:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  redeemDate?: string;
}
