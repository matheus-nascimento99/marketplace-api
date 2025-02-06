import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductsImagesRepository } from '@/domain/marketplace/products/application/repositories/products-images'
import { ProductImage } from '@/domain/marketplace/products/enterprise/entities/product-image'

export class InMemoryProductsImagesRepository
  implements ProductsImagesRepository
{
  public items: ProductImage[] = []

  async findManyByProductId(
    productId: UniqueEntityId,
  ): Promise<ProductImage[]> {
    const productImages = this.items.filter((item) =>
      item.productId.equals(productId),
    )

    return productImages
  }
}
