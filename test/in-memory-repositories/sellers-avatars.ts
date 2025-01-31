import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellersAvatarsRepository } from '@/domain/marketplace/sellers/application/repositories/sellers-avatars'
import { SellerAvatar } from '@/domain/marketplace/sellers/enterprise/seller-avatar'

export class InMemorySellersAvatarsRepository
  implements SellersAvatarsRepository
{
  public items: SellerAvatar[] = []

  async create(sellerAvatar: SellerAvatar): Promise<void> {
    this.items.push(sellerAvatar)
  }

  async findBySellerId(sellerId: UniqueEntityId): Promise<SellerAvatar | null> {
    const sellerAvatar = this.items.find((item) =>
      item.sellerId.equals(sellerId),
    )

    if (!sellerAvatar) {
      return null
    }

    return sellerAvatar
  }

  async deleteByAvatarId(avatarId: UniqueEntityId): Promise<void> {
    const sellerAvatarIndex = this.items.findIndex((item) =>
      item.avatarId.equals(avatarId),
    )

    this.items.splice(sellerAvatarIndex, 1)
  }
}
