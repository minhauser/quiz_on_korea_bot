/**
 * Base class for value objects — structural (by-value) equality, immutable.
 */
export abstract class ValueObject<TProps> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  equals(other?: ValueObject<TProps>): boolean {
    if (other === undefined || other === null) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
