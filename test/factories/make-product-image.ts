import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  ProductImage,
  ProductImageProps,
} from '@/domain/marketplace/products/enterprise/entities/product-image'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

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

@Injectable()
export class ProductImageFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaProductImage(override: Partial<ProductImageProps> = {}) {
    const product = makeProductImage({
      ...override,
    })

    await this.prisma.attachment.update({
      where: { id: product.imageId.toString() },
      data: {
        productId: product.productId.toString(),
      },
    })

    return product
  }
}
