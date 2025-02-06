import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'
import { Product } from '@/domain/marketplace/products/enterprise/entities/product'
import { ProductImageWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-image-with-details'
import { ProductWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-with-details'
import { Slug } from '@/domain/marketplace/products/enterprise/value-objects/slug'
import {
  Prisma,
  Product as PrismaProduct,
  Category as PrismaCategory,
  User as PrismaUser,
  Attachment as PrismaAttachment,
} from '@prisma/client'

type PrismaProductsMapperParamsWithDetails = PrismaProduct & {
  category: PrismaCategory
  user: PrismaUser & {
    avatar: PrismaAttachment | null
  }
  attachments: PrismaAttachment[]
}

export class PrismaProductsMapper {
  static toDomain(raw: PrismaProduct): Product {
    return Product.create(
      {
        title: raw.title,
        categoryId: new UniqueEntityId(raw.categoryId),
        description: raw.description,
        priceInCents: raw.priceInCents,
        sellerId: new UniqueEntityId(raw.userId),
        createdAt: raw.createdAt,
        status: raw.status,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toDomainWithDetails(
    raw: PrismaProductsMapperParamsWithDetails,
  ): ProductWithDetails {
    return ProductWithDetails.create({
      productId: new UniqueEntityId(raw.id),
      category: Category.create(
        {
          title: raw.category.title,
          slug: Slug.create(raw.category.slug),
        },
        new UniqueEntityId(raw.category.id),
      ),
      seller: {
        sellerId: new UniqueEntityId(raw.user.id),
        name: raw.user.name,
        email: raw.user.email,
        phone: Raw.create(raw.user.phone),
        avatar: raw.user.avatar
          ? Attachment.create(
              { key: raw.user.avatar.key },
              new UniqueEntityId(raw.user.avatar.id),
            )
          : null,
      },
      createdAt: raw.createdAt,
      description: raw.description,
      images: raw.attachments.map((attachment) => {
        return ProductImageWithDetails.create({
          createdAt: attachment.createdAt,
          image: Attachment.create(
            { key: attachment.key },
            new UniqueEntityId(attachment.id),
          ),
        })
      }),
      priceInCents: raw.priceInCents,
      status: raw.status,
      title: raw.title,
    })
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id.toString(),
      categoryId: product.categoryId.toString(),
      description: product.description,
      priceInCents: product.priceInCents,
      title: product.title,
      userId: product.sellerId.toString(),
      status: product.status,
      createdAt: product.createdAt,
    }
  }
}
