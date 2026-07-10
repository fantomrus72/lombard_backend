import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tariff } from '../../tariffs/entities/tariff.entity';
import { Client } from '../../clients/entities/client.entity';
import { PledgeItem } from './pledge-item.entity';

export enum PledgeStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
}

@Entity('pledges')
export class Pledge {
  @ApiProperty({ description: 'Уникальный идентификатор залога' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID тарифа' })
  @Column({ name: 'tariff_id', type: 'uuid' })
  tariffId: string;

  @ApiProperty({ description: 'ID клиента' })
  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ApiProperty({ description: 'Дата окончания основного периода' })
  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @ApiProperty({ description: 'Общая сумма залога', example: 45000.0 })
  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'Статус залога', enum: PledgeStatus })
  @Column({
    type: 'enum',
    enum: PledgeStatus,
    default: PledgeStatus.ACTIVE,
  })
  status: PledgeStatus;

  @ApiProperty({ description: 'Дата выкупа', nullable: true })
  @Column({ name: 'redeemed_at', type: 'timestamp', nullable: true })
  redeemedAt: Date | null;

  @ApiProperty({ description: 'Сумма выкупа', nullable: true })
  @Column({
    name: 'redemption_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  redemptionAmount: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Tariff, (tariff) => tariff.pledges)
  @JoinColumn({ name: 'tariff_id' })
  tariff: Tariff;

  @ManyToOne(() => Client, (client) => client.pledges)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => PledgeItem, (item) => item.pledge)
  items: PledgeItem[];
}
