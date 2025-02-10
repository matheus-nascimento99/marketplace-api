import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  SellerAvatar,
  SellerAvatarProps,
} from '@/domain/marketplace/sellers/enterprise/entities/seller-avatar'

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
