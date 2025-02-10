import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductImage } from '../../enterprise/entities/product-image'

export abstract class ProductsImagesRepository {
  abstract createMany(productImages: ProductImage[]): Promise<void>
  abstract findManyByProductId(
    productId: UniqueEntityId,
  ): Promise<ProductImage[]>

  abstract deleteMany(productImagesIds: UniqueEntityId[]): Promise<void>
}
