import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellerAvatar } from '@/domain/marketplace/sellers/enterprise/entities/seller-avatar'
import { Attachment as PrismaAttachment } from '@prisma/client'

export class PrismaSellersAvatarsMapper {
  static toDomain(raw: PrismaAttachment): SellerAvatar {
    return SellerAvatar.create({
      avatarId: new UniqueEntityId(raw.id),
      sellerId: new UniqueEntityId(raw.userId as string),
    })
  }
}
