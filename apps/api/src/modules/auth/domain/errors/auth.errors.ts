import { DomainException } from '../../../../shared/domain/domain-exception.base';

export class InvalidEmailError extends DomainException {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = 422;

  constructor(value: string) {
    super(`"${value}" is not a valid email address.`);
  }
}

export class WeakPasswordError extends DomainException {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = 422;

  constructor() {
    super('Password must be at least 8 characters long.');
  }
}

export class EmailAlreadyInUseError extends DomainException {
  readonly code = 'EMAIL_IN_USE';
  readonly httpStatus = 409;

  constructor() {
    super('An account with this email already exists.');
  }
}

export class InvalidCredentialsError extends DomainException {
  readonly code = 'INVALID_CREDENTIALS';
  readonly httpStatus = 401;

  constructor() {
    super('Invalid email or password.');
  }
}

export class InvalidRefreshTokenError extends DomainException {
  readonly code = 'INVALID_TOKEN';
  readonly httpStatus = 401;

  constructor() {
    super('Refresh token is invalid or expired.');
  }
}

export class AccountNotActiveError extends DomainException {
  readonly code = 'ACCOUNT_NOT_ACTIVE';
  readonly httpStatus = 403;

  constructor() {
    super('This account is not active.');
  }
}
