import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Pledge } from '../../pledges/entities/pledge.entity';

@Entity('tariffs')
export class Tariff {
  @ApiProperty({ description: 'Уникальный идентификатор тарифа' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Название тарифа',
    example: 'Техника 5 дней 2,158%',
  })
  @Column({ name: 'name', length: 255 })
  name: string;

  @ApiProperty({ description: 'Количество дней основного периода', example: 5 })
  @Column({ name: 'base_period_days', type: 'int' })
  basePeriodDays: number;

  @ApiProperty({
    description: 'Ставка за основной период (в процентах)',
    example: 2.158,
  })
  @Column({
    name: 'base_period_rate',
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  basePeriodRate: number;

  @ApiProperty({ description: 'Количество дней просрочки', example: 30 })
  @Column({ name: 'overdue_period_days', type: 'int' })
  overduePeriodDays: number;

  @ApiProperty({
    description: 'Ставка за просрочку (в процентах за день)',
    example: 0.5,
  })
  @Column({ name: 'overdue_rate', type: 'decimal', precision: 10, scale: 4 })
  overdueRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Pledge, (pledge) => pledge.tariff)
  pledges: Pledge[];
}
