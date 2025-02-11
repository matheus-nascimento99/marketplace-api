import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'
import { View } from '@/domain/marketplace/products/enterprise/entities/view'
import { ProductImageWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-image-with-details'
import { ProductWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-with-details'
import { Slug } from '@/domain/marketplace/products/enterprise/value-objects/slug'
import { ViewWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/view-with-details'
import { SellerAvatarWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-avatar-with-details'
import { SellerWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-with-details'
import {
  View as PrismaView,
  Product as PrismaProduct,
  Attachment as PrismaAttachment,
  User as PrismaSeller,
  Category as PrismaCategory,
  Prisma,
} from '@prisma/client'

export type PrismaViewsMapperWithDetailsParams = PrismaView & {
  product: PrismaProduct & {
    category: PrismaCategory
    user: PrismaSeller & {
      avatar: PrismaAttachment | null
    }
    attachments: PrismaAttachment[]
  }
  user: PrismaSeller & {
    avatar: PrismaAttachment | null
  }
}

export class PrismaViewsMapper {
  static toDomain(raw: PrismaView): View {
    return View.create(
      {
        productId: new UniqueEntityId(raw.productId),
        viewerId: new UniqueEntityId(raw.userId),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toDomainWithDetails(
    raw: PrismaViewsMapperWithDetailsParams,
  ): ViewWithDetails {
    return ViewWithDetails.create({
      viewId: new UniqueEntityId(raw.id),
      product: ProductWithDetails.create({
        productId: new UniqueEntityId(raw.id),
        category: Category.create(
          {
            title: raw.product.category.title,
            slug: Slug.create(raw.product.category.slug),
          },
          new UniqueEntityId(raw.product.category.id),
        ),
        seller: {
          sellerId: new UniqueEntityId(raw.user.id),
          name: raw.user.name,
          email: raw.user.email,
          phone: Raw.create(raw.user.phone),
          avatar: raw.user.avatar
            ? SellerAvatarWithDetails.create({
                avatar: Attachment.create(
                  { key: raw.user.avatar.key },
                  new UniqueEntityId(raw.user.avatar.id),
                ),
                createdAt: raw.user.createdAt,
              })
            : null,
        },
        createdAt: raw.createdAt,
        description: raw.product.description,
        images: raw.product.attachments.map((attachment) => {
          return ProductImageWithDetails.create({
            createdAt: attachment.createdAt,
            image: Attachment.create(
              { key: attachment.key },
              new UniqueEntityId(attachment.id),
            ),
          })
        }),
        priceInCents: raw.product.priceInCents,
        status: raw.product.status,
        title: raw.product.title,
      }),
      viewer: SellerWithDetails.create({
        sellerId: new UniqueEntityId(raw.user.id),
        name: raw.user.name,
        email: raw.user.email,
        phone: Raw.create(raw.user.phone),
        password: raw.user.password,
        createdAt: raw.user.createdAt,
        updatedAt: raw.user.updatedAt,
        avatar: raw.user.avatar
          ? SellerAvatarWithDetails.create({
              avatar: Attachment.create(
                { key: raw.user.avatar.key },
                new UniqueEntityId(raw.user.avatar.id),
              ),
              createdAt: raw.createdAt,
            })
          : null,
      }),
      createdAt: raw.createdAt,
    })
  }

  static toPrisma(view: View): Prisma.ViewUncheckedCreateInput {
    return {
      id: view.id.toString(),
      userId: view.viewerId.toString(),
      productId: view.productId.toString(),
      createdAt: view.createdAt,
    }
  }
}
