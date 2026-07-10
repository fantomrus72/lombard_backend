import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(entity: string, id: string) {
    super(`"${entity}" с ID "${id}" не найден`, 'NOT_FOUND', { entity, id });
  }
}

export class TariffNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('Тариф', id);
  }
}

export class ClientNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('Клиент', id);
  }
}

export class PledgeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('Залог', id);
  }
}

export class CategoryNotFoundException extends NotFoundException {
  constructor(id: string) {
    super('Категория', id);
  }
}
