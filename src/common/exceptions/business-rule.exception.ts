import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BusinessRuleException extends BaseException {
  constructor(
    message: string,
    code: string = 'BUSINESS_RULE_VIOLATION',
    details?: Record<string, any>,
  ) {
    super(message, HttpStatus.CONFLICT, code, details);
  }
}

export class PledgeAlreadyRedeemedException extends BusinessRuleException {
  constructor(pledgeId: string) {
    super(`Залог "${pledgeId}" уже выкуплен`, 'PLEDGE_ALREADY_REDEEMED', {
      pledgeId,
    });
  }
}

export class DuplicateClientException extends BusinessRuleException {
  constructor(passportData: string) {
    super(
      `Клиент с паспортными данными "${passportData}" уже существует`,
      'DUPLICATE_CLIENT',
      { passportData },
    );
  }
}
