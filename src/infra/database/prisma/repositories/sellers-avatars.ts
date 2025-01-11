import { SellersAvatarsRepository } from '@/domain/marketplace/sellers/application/repositories/sellers-avatars'
import { SellerAvatar } from '@/domain/marketplace/sellers/enterprise/seller-avatar'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

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
}
