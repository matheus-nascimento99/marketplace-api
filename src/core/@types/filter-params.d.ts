export type FilterParams<T> = {
  [K in keyof T]?: T[K]
}
