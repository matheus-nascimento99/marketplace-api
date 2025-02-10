import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ProductsRepository } from '../repositories/products'
import {
  PaginationParamsRequest,
  PaginationParamsResponse,
} from '@/core/@types/pagination-params'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'
import { FilterParams } from '@/core/@types/filter-params'
import { ProductStatus } from '../../enterprise/entities/product'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'

export type FetchProductsFromSellerFilterParams = {
  search: string
  status: ProductStatus
}

type FetchProductsFromSellerUseCaseRequest = {
  sellerId: string
  filterParams: FilterParams<FetchProductsFromSellerFilterParams>
  paginationParams: PaginationParamsRequest
}

export type FetchProductsFromSellerUseCaseResponse = Either<
  ResourceNotFoundError,
  PaginationParamsResponse<ProductWithDetails>
>

@Injectable()
export class FetchProductsFromSellerUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
  ) {}

  async execute({
    sellerId,
    filterParams,
    paginationParams,
  }: FetchProductsFromSellerUseCaseRequest): Promise<FetchProductsFromSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    const { items, next, prev, total } =
      await this.productsRepository.findManyBySellerId(
        seller.id,
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
