import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pledge } from '../pledges/entities/pledge.entity';
import { RedemptionsController } from './redemptions.controller';
import { RedemptionsService } from './redemptions.service';
import { InterestCalculatorService } from './services/interest-calculator.service';
import { TariffsModule } from '../tariffs/tariffs.module';
import { PledgesModule } from '../pledges/pledges.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pledge]), TariffsModule, PledgesModule],
  controllers: [RedemptionsController],
  providers: [RedemptionsService, InterestCalculatorService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
