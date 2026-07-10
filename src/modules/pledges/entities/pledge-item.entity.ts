import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Pledge } from './pledge.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('pledge_items')
export class PledgeItem {
  @ApiProperty({ description: 'Уникальный идентификатор товара в залоге' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID залога' })
  @Column({ name: 'pledge_id', type: 'uuid' })
  pledgeId: string;

  @ApiProperty({ description: 'ID категории товара' })
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ApiProperty({ description: 'Название товара', example: 'iPhone 15 Pro Max' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Характеристики товара',
    example: {
      model: 'iPhone 15 Pro Max',
      memory: '256GB',
      screenCondition: 'Без царапин',
    },
  })
  @Column({ type: 'jsonb' })
  characteristics: Record<string, any>;

  @ApiProperty({ description: 'Оценочная стоимость', example: 45000.0 })
  @Column({ name: 'estimated_value', type: 'decimal', precision: 15, scale: 2 })
  estimatedValue: number;

  @ManyToOne(() => Pledge, (pledge) => pledge.items)
  @JoinColumn({ name: 'pledge_id' })
  pledge: Pledge;

  @ManyToOne(() => Category, (category) => category.items)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
