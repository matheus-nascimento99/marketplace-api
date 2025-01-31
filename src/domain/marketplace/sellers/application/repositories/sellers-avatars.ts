import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellerAvatar } from '../../enterprise/seller-avatar'

export abstract class SellersAvatarsRepository {
  abstract create(sellerAvatar: SellerAvatar): Promise<void>
  abstract findBySellerId(
    sellerId: UniqueEntityId,
  ): Promise<SellerAvatar | null>

  abstract deleteByAvatarId(avatarId: UniqueEntityId): Promise<void>
}
