import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Product } from '../../enterprise/entities/product'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'

export abstract class ProductsRepository {
  abstract create(product: Product): Promise<ProductWithDetails>
  abstract findById(productId: UniqueEntityId): Promise<Product | null>
  abstract findByIdWithDetails(
    productId: UniqueEntityId,
  ): Promise<ProductWithDetails | null>

  abstract save(
    productId: UniqueEntityId,
    product: Product,
  ): Promise<ProductWithDetails>
}
