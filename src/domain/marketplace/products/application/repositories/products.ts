import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Product } from '../../enterprise/entities/product'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'
import {
  PaginationParamsRequest,
  PaginationParamsResponse,
} from '@/core/@types/pagination-params'
import { FilterParams } from '@/core/@types/filter-params'
import { FetchProductsFilterParams } from '../use-cases/fetch-products'

export abstract class ProductsRepository {
  abstract create(product: Product): Promise<ProductWithDetails>
  abstract findMany(
    paginationParams: PaginationParamsRequest,
    filterParams: FilterParams<FetchProductsFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>>

  abstract findManyBySellerId(
    sellerId: UniqueEntityId,
    paginationParams: PaginationParamsRequest,
    filterParams: FilterParams<FetchProductsFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>>

  abstract findById(productId: UniqueEntityId): Promise<Product | null>
  abstract findByIdWithDetails(
    productId: UniqueEntityId,
  ): Promise<ProductWithDetails | null>

  abstract save(
    productId: UniqueEntityId,
    product: Product,
  ): Promise<ProductWithDetails>
}
