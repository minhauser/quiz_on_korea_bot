import { ValueObject } from '../../../../shared/domain/value-object.base';
import { InvalidEmailError } from '../errors/auth.errors';

interface EmailProps {
  value: string;
}

/**
 * Normalized, validated email address. Trims and lowercases on creation so the
 * value is canonical everywhere downstream (lookup, uniqueness, login).
 */
export class Email extends ValueObject<EmailProps> {
  private static readonly REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (!Email.REGEX.test(value)) {
      throw new InvalidEmailError(raw);
    }
    return new Email({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
