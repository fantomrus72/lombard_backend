import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    example: 'Смартфон',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    description: 'JSON-схема характеристик для товаров этой категории',
    example: {
      type: 'object',
      properties: {
        model: {
          type: 'string',
          title: 'Модель',
        },
        memory: {
          type: 'string',
          title: 'Объём памяти',
          enum: ['64GB', '128GB', '256GB'],
        },
        screenCondition: {
          type: 'string',
          title: 'Состояние экрана',
          enum: ['Без царапин', 'С царапинами'],
        },
      },
      required: ['model'],
    },
  })
  @IsObject()
  characteristicsSchema: Record<string, any>;
}
