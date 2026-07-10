import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PledgeItem } from '../../pledges/entities/pledge-item.entity';

@Entity('item_categories')
export class Category {
  @ApiProperty({ description: 'Уникальный идентификатор категории' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Название категории', example: 'Смартфон' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'JSON-схема характеристик товара',
    example: {
      type: 'object',
      properties: {
        model: { type: 'string', title: 'Модель' },
        memory: {
          type: 'string',
          title: 'Объём памяти',
          enum: ['64GB', '128GB'],
        },
      },
      required: ['model'],
    },
  })
  @Column({ name: 'characteristics_schema', type: 'jsonb' })
  characteristicsSchema: Record<string, any>;

  @OneToMany(() => PledgeItem, (item) => item.category)
  items: PledgeItem[];
}
