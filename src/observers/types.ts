export type ObserverEntry = MutationRecord | IntersectionObserverEntry | ResizeObserverEntry;

export type ObserverCallback<T extends ObserverEntry> = (entry: T) => void;

export interface ObserverController {
  observe(element: Element): void;
  unobserve(element: Element): void;
  disconnect(): void;
  takeRecords?(): ObserverEntry[];
  isObserving(element: Element): boolean;
  getObservedCount(): number;
}
