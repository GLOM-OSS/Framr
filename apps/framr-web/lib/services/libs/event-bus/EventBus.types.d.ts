
export interface EventBusPayload<T> {
  data: T;
  status: Status;
}

interface EventBusHandler<T> {
  (payload: EventBusPayload<T>): void;
}
