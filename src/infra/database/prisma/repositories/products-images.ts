import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductsImagesRepository } from '@/domain/marketplace/products/application/repositories/products-images'
import { ProductImage } from '@/domain/marketplace/products/enterprise/entities/product-image'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'
import { PrismaProductsImagesMapper } from '../mappers/products-images'

@Injectable()
export class PrismaProductsImagesRepository
  implements ProductsImagesRepository
{
  constructor(private prisma: PrismaService) {}

  async createMany(productImages: ProductImage[]): Promise<void> {
    const requests = productImages.map((productImage) => {
      return async () => {
        await this.prisma.attachment.update({
          where: { id: productImage.imageId.toString() },
          data: {
            productId: productImage.productId.toString(),
          },
        })
      }
    })

    await Promise.all(requests.map((fn) => fn()))
  }

  async findManyByProductId(
    productId: UniqueEntityId,
  ): Promise<ProductImage[]> {
    const productImages = await this.prisma.attachment.findMany({
      where: { productId: productId.toString() },
    })

    return productImages.map((productImage) =>
      PrismaProductsImagesMapper.toDomain(productImage),
    )
  }

  async deleteMany(productImagesIds: UniqueEntityId[]): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        id: {
          in: productImagesIds.map((productImagesId) =>
            productImagesId.toString(),
          ),
        },
      },
    })
  }
}
