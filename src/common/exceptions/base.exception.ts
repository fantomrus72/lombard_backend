import { HttpStatus } from '@nestjs/common';

export interface IExceptionResponse {
  statusCode: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export abstract class BaseException extends Error {
  public readonly statusCode: HttpStatus;
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: HttpStatus,
    code: string = 'ERROR',
    details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): IExceptionResponse {
    const response: IExceptionResponse = {
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
    };

    if (this.details) {
      response.details = this.details;
    }

    return response;
  }
}
