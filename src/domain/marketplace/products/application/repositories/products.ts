import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Product } from '../../enterprise/entities/product'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'
import {
  PaginationParamsRequest,
  PaginationParamsResponse,
} from '@/core/@types/pagination-params'
import { FilterParams } from '@/core/@types/filter-params'
import { FetchProductsFilterParams } from '../use-cases/fetch-products'
import { FetchProductsFromSellerFilterParams } from '../use-cases/fetch-products-from-seller'

export abstract class ProductsRepository {
  abstract create(product: Product): Promise<ProductWithDetails>

  abstract findMany(
    paginationParams: PaginationParamsRequest,
    filterParams: FilterParams<FetchProductsFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>>

  abstract findManyBySellerId(
    sellerId: UniqueEntityId,
    paginationParams: PaginationParamsRequest,
    filterParams: FilterParams<FetchProductsFromSellerFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>>

  abstract findById(productId: UniqueEntityId): Promise<Product | null>

  abstract findByIdWithDetails(
    productId: UniqueEntityId,
  ): Promise<ProductWithDetails | null>

  abstract countSoldBySellerIdInMonth(sellerId: UniqueEntityId): Promise<number>

  abstract countAvailableBySellerIdInMonth(
    sellerId: UniqueEntityId,
  ): Promise<number>

  abstract save(
    productId: UniqueEntityId,
    product: Product,
  ): Promise<ProductWithDetails>
}
