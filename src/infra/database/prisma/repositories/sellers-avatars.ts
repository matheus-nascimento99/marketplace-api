import { SellersAvatarsRepository } from '@/domain/marketplace/sellers/application/repositories/sellers-avatars'
import { SellerAvatar } from '@/domain/marketplace/sellers/enterprise/seller-avatar'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { PrismaSellersAvatarsMapper } from '../mappers/sellers-avatars'

@Injectable()
export class PrismaSellersAvatarsRepository
  implements SellersAvatarsRepository
{
  constructor(private prisma: PrismaService) {}

  async create(sellerAvatar: SellerAvatar): Promise<void> {
    await this.prisma.attachment.update({
      where: { id: sellerAvatar.avatarId.toString() },
      data: {
        userId: sellerAvatar.sellerId.toString(),
      },
    })
  }

  async findBySellerId(sellerId: UniqueEntityId): Promise<SellerAvatar | null> {
    const sellerAvatar = await this.prisma.attachment.findUnique({
      where: { userId: sellerId.toString() },
    })

    if (!sellerAvatar) {
      return null
    }

    return PrismaSellersAvatarsMapper.toDomain(sellerAvatar)
  }

  async deleteByAvatarId(avatarId: UniqueEntityId): Promise<void> {
    await this.prisma.attachment.delete({
      where: { id: avatarId.toString() },
    })
  }
}
