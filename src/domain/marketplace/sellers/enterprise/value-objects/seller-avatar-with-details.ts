import { ValueObject } from '@/core/value-objects/value-object'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'

export type SellerAvatarWithDetailsProps = {
  avatar: Attachment
  createdAt: Date
}

export class SellerAvatarWithDetails extends ValueObject<SellerAvatarWithDetailsProps> {
  get avatar() {
    return this.props.avatar
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: SellerAvatarWithDetailsProps) {
    return new SellerAvatarWithDetails(props)
  }
}
