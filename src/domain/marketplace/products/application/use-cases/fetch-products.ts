import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ProductsRepository } from '../repositories/products'
import {
  PaginationParamsRequest,
  PaginationParamsResponse,
} from '@/core/@types/pagination-params'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'
import { FilterParams } from '@/core/@types/filter-params'
import { ProductStatus } from '../../enterprise/entities/product'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'

export type FetchProductsFilterParams = {
  search: string
  status: ProductStatus
  initialPrice: number
  finalPrice: number
  categoryId: string
}

type FetchProductsUseCaseRequest = {
  userId: string
  filterParams: FilterParams<FetchProductsFilterParams>
  paginationParams: PaginationParamsRequest
}

export type FetchProductsUseCaseResponse = Either<
  null,
  PaginationParamsResponse<ProductWithDetails>
>

@Injectable()
export class FetchProductsUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    userId,
    filterParams,
    paginationParams,
  }: FetchProductsUseCaseRequest): Promise<FetchProductsUseCaseResponse> {
    const { items, next, prev, total } = await this.productsRepository.findMany(
      new UniqueEntityId(userId),
      paginationParams,
      filterParams,
    )

    return right({
      items,
      next,
      prev,
      total,
    })
  }
}
