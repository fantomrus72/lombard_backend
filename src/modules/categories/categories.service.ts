import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryNotFoundException } from '../../common/exceptions';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  /**
   * Создание новой категории
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.validateSchema(createCategoryDto.characteristicsSchema);

    const category = this.categoryRepo.create({
      name: createCategoryDto.name,
      characteristicsSchema: createCategoryDto.characteristicsSchema,
    });

    return this.categoryRepo.save(category);
  }

  /**
   * Получить все категории
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Получить категорию по ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return category;
  }

  /**
   * Валидация JSON-схемы
   */
  private validateSchema(schema: Record<string, any>): void {
    if (!schema.type || schema.type !== 'object') {
      throw new Error('Schema must be an object type');
    }

    if (!schema.properties || typeof schema.properties !== 'object') {
      throw new Error('Schema must have properties');
    }

    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!schema.properties[field]) {
          throw new Error(`Required field "${field}" not found in properties`);
        }
      }
    }
  }
}
