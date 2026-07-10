import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffsModule } from './modules/tariffs/tariffs.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PledgesModule } from './modules/pledges/pledges.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { Tariff } from './modules/tariffs/entities/tariff.entity';
import { Client } from './modules/clients/entities/client.entity';
import { Category } from './modules/categories/entities/category.entity';
import { Pledge } from './modules/pledges/entities/pledge.entity';
import { PledgeItem } from './modules/pledges/entities/pledge-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'postgres'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'pioneer_user'),
        password: configService.get('DATABASE_PASSWORD', 'pioneer_password'),
        database: configService.get('DATABASE_NAME', 'lombard_pioneer'),
        entities: [Tariff, Client, Category, Pledge, PledgeItem],
        synchronize: true,
        logging: true,
        dropSchema: false,
      }),
      inject: [ConfigService],
    }),
    TariffsModule,
    ClientsModule,
    CategoriesModule,
    PledgesModule,
    RedemptionsModule,
  ],
})
export class AppModule {}
