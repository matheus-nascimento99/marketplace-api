import { Raw } from '@/core/value-objects/raw'
import { ValueObject } from '@/core/value-objects/value-object'
import { SellerAvatarWithDetails } from './seller-avatar-with-details'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'

export type SellerWithDetailsProps = {
  sellerId: UniqueEntityId
  name: string
  phone: Raw
  email: string
  avatar?: SellerAvatarWithDetails | null
  password: string
  createdAt: Date
  updatedAt?: Date | null
}

export class SellerWithDetails extends ValueObject<SellerWithDetailsProps> {
  get sellerId() {
    return this.props.sellerId
  }

  get name() {
    return this.props.name
  }

  get phone() {
    return this.props.phone
  }

  get email() {
    return this.props.email
  }

  get avatar() {
    return this.props.avatar
  }

  get password() {
    return this.props.password
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: SellerWithDetailsProps) {
    return new SellerWithDetails(props)
  }
}
