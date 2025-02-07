import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  SellerAvatar,
  SellerAvatarProps,
} from '@/domain/marketplace/sellers/enterprise/entities/seller-avatar'

import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

export const makeSellerAvatar = (
  overrides: Partial<SellerAvatarProps>,
  id?: UniqueEntityId,
) => {
  return SellerAvatar.create(
    {
      avatarId: new UniqueEntityId(),
      sellerId: new UniqueEntityId(),
      ...overrides,
    },
    id,
  )
}

@Injectable()
export class SellerAvatarFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaSellerAvatar(override: Partial<SellerAvatarProps> = {}) {
    const seller = makeSellerAvatar({
      ...override,
    })

    await this.prisma.attachment.update({
      where: { id: seller.avatarId.toString() },
      data: {
        userId: seller.sellerId.toString(),
      },
    })

    return seller
  }
}
