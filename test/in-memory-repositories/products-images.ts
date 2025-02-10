import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductsImagesRepository } from '@/domain/marketplace/products/application/repositories/products-images'
import { ProductImage } from '@/domain/marketplace/products/enterprise/entities/product-image'

export class InMemoryProductsImagesRepository
  implements ProductsImagesRepository
{
  public items: ProductImage[] = []

  async createMany(productImages: ProductImage[]): Promise<void> {
    this.items.push(...productImages)
  }

  async findManyByProductId(
    productId: UniqueEntityId,
  ): Promise<ProductImage[]> {
    const productImages = this.items.filter((item) =>
      item.productId.equals(productId),
    )

    return productImages
  }

  async deleteMany(productImagesIds: UniqueEntityId[]): Promise<void> {
    const productImagesFiltered = this.items.filter(
      (item) =>
        !productImagesIds.some((productImagesId) =>
          productImagesId.equals(item.id),
        ),
    )

    this.items = productImagesFiltered
  }
}
