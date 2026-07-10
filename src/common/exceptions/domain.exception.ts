import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export abstract class DomainException extends BaseException {
  constructor(
    message: string,
    code: string = 'DOMAIN_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, details);
  }
}
