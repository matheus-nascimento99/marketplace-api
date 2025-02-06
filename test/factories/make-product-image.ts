import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  ProductImage,
  ProductImageProps,
} from '@/domain/marketplace/products/enterprise/entities/product-image'

export const makeProductImage = (
  overrides: Partial<ProductImageProps>,
  id?: UniqueEntityId,
) => {
  return ProductImage.create(
    {
      imageId: new UniqueEntityId(),
      productId: new UniqueEntityId(),
      ...overrides,
    },
    id,
  )
}
