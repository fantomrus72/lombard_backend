import { PartialType } from '@nestjs/mapped-types';
import { CreatePledgeDto } from './create-pledge.dto';

export class UpdatePledgeDto extends PartialType(CreatePledgeDto) {}
