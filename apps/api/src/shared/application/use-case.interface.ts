/**
 * Contract every application use case implements. Controllers call exactly one.
 */
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}
