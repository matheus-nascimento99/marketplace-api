import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Seller } from '@/domain/marketplace/sellers/enterprise/entities/seller'
import { SellerAvatarWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-avatar-with-details'
import { SellerWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-with-details'
import {
  Prisma,
  User as PrismaSeller,
  Attachment as PrismaAttachment,
} from '@prisma/client'

type PrismaSellersMapperWithDetailsParams = PrismaSeller & {
  avatar: PrismaAttachment | null
}

export class PrismaSellersMapper {
  static toDomain(raw: PrismaSeller): Seller {
    return Seller.create(
      {
        name: raw.name,
        email: raw.email,
        phone: Raw.create(raw.phone),
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toDomainWithDetails(
    raw: PrismaSellersMapperWithDetailsParams,
  ): SellerWithDetails {
    return SellerWithDetails.create({
      sellerId: new UniqueEntityId(raw.id),
      name: raw.name,
      email: raw.email,
      phone: Raw.create(raw.phone),
      password: raw.password,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      avatar: raw.avatar
        ? SellerAvatarWithDetails.create({
            avatar: Attachment.create(
              { key: raw.avatar.key },
              new UniqueEntityId(raw.avatar.id),
            ),
            createdAt: raw.createdAt,
          })
        : null,
    })
  }

  static toPrisma(seller: Seller): Prisma.UserUncheckedCreateInput {
    return {
      id: seller.id.toString(),
      name: seller.name,
      email: seller.email,
      phone: seller.phone.value,
      password: seller.password,
      role: 'SELLER',
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
    }
  }
}
