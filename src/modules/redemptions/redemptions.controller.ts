import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RedemptionsService } from './redemptions.service';
import { RedeemPledgeDto } from './dto/redeem-pledge.dto';
import { Pledge } from '../pledges/entities/pledge.entity';

@ApiTags('Выкуп')
@Controller('api/redemptions')
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post(':pledgeId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Выкуп залога' })
  @ApiParam({ name: 'pledgeId', description: 'ID залога' })
  @ApiBody({ type: RedeemPledgeDto })
  @ApiResponse({ status: 201, description: 'Залог выкуплен', type: Pledge })
  @ApiResponse({ status: 400, description: 'Залог уже выкуплен' })
  @ApiResponse({ status: 404, description: 'Залог не найден' })
  async redeem(
    @Param('pledgeId') pledgeId: string,
    @Body() redeemDto: RedeemPledgeDto,
  ): Promise<Pledge> {
    return this.redemptionsService.redeemPledge(pledgeId, redeemDto);
  }

  @Get(':pledgeId/preview')
  @ApiOperation({ summary: 'Предпросмотр суммы выкупа' })
  @ApiParam({ name: 'pledgeId', description: 'ID залога' })
  @ApiResponse({ status: 200, description: 'Расчет суммы выкупа' })
  @ApiResponse({ status: 404, description: 'Залог не найден' })
  async preview(@Param('pledgeId') pledgeId: string): Promise<any> {
    return this.redemptionsService.previewRedemption(pledgeId);
  }
}
