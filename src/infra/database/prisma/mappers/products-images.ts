import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductImage } from '@/domain/marketplace/products/enterprise/entities/product-image'
import { Attachment as PrismaAttachment } from '@prisma/client'

export class PrismaProductsImagesMapper {
  static toDomain(raw: PrismaAttachment): ProductImage {
    return ProductImage.create({
      imageId: new UniqueEntityId(raw.id),
      productId: new UniqueEntityId(raw.userId as string),
    })
  }
}
