import { Optional } from '@/core/@types/optional'
import { Entity } from 'src/core/entities/entity'
import { UniqueEntityId } from 'src/core/value-objects/unique-entity-id'

export type SellerAvatarProps = {
  sellerId: UniqueEntityId
  avatarId: UniqueEntityId
  createdAt: Date
}

export class SellerAvatar extends Entity<SellerAvatarProps> {
  get sellerId() {
    return this.props.sellerId
  }

  set sellerId(value: UniqueEntityId) {
    this.props.sellerId = value
  }

  get avatarId() {
    return this.props.avatarId
  }

  set avatarId(value: UniqueEntityId) {
    this.props.avatarId = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<SellerAvatarProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const sellerAvatar = new SellerAvatar(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id,
    )

    return sellerAvatar
  }
}
