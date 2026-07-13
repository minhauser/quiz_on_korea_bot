/**
 * Marker interface for domain events. A dedicated event bus (shared
 * infrastructure) will dispatch these in a later sprint.
 */
export interface DomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}
