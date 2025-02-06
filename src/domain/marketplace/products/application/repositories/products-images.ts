import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductImage } from '../../enterprise/entities/product-image'

export abstract class ProductsImagesRepository {
  abstract findManyByProductId(
    productId: UniqueEntityId,
  ): Promise<ProductImage[]>
}
