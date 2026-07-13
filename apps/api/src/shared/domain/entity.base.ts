/**
 * Base class for domain entities — identity-based equality.
 */
export abstract class Entity<TProps> {
  protected readonly _id: string;
  protected readonly props: TProps;

  protected constructor(props: TProps, id: string) {
    this.props = props;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  equals(other?: Entity<TProps>): boolean {
    if (other === undefined || other === null) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._id === other._id;
  }
}
