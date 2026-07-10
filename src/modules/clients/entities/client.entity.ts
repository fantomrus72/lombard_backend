import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Pledge } from '../../pledges/entities/pledge.entity';

@Entity('clients')
export class Client {
  @ApiProperty({ description: 'Уникальный идентификатор клиента' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Полное имя клиента',
    example: 'Иванов Иван Иванович',
  })
  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @ApiProperty({ description: 'Номер телефона', example: '+7 (999) 123-45-67' })
  @Column({ length: 20 })
  phone: string;

  @ApiProperty({ description: 'Паспортные данные', example: '4510 123456' })
  @Column({ name: 'passport_data', length: 50, unique: true })
  passportData: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Pledge, (pledge) => pledge.client)
  pledges: Pledge[];
}
