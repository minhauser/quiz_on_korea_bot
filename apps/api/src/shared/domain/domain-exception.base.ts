/**
 * Base class for domain-level errors. The global exception filter maps these
 * to the standard API error envelope using `code` + `httpStatus`.
 */
export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
