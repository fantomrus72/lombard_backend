import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pledge } from './entities/pledge.entity';
import { PledgeItem } from './entities/pledge-item.entity';
import { PledgesController } from './pledges.controller';
import { PledgesService } from './pledges.service';
import { TariffsModule } from '../tariffs/tariffs.module';
import { ClientsModule } from '../clients/clients.module';
import { CategoriesModule } from '../categories/categories.module';
import { Tariff } from '../tariffs/entities/tariff.entity';
import { Client } from '../clients/entities/client.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pledge, PledgeItem, Tariff, Client, Category]),
    TariffsModule,
    ClientsModule,
    CategoriesModule,
  ],
  controllers: [PledgesController],
  providers: [PledgesService],
  exports: [PledgesService],
})
export class PledgesModule {}
