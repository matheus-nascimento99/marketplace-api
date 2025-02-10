export type PaginationParamsRequest = {
  page: number
  limit: number
}

export type PaginationParamsResponse<Props> = {
  items: Props[]
  total: number
  prev: number | null
  next: number | null
}
