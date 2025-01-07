import { Entity } from 'src/core/entities/entity'
import { UniqueEntityId } from 'src/core/value-objects/unique-entity-id'

export type SellerAttachmentProps = {
  sellerId: UniqueEntityId
  attachmentId: UniqueEntityId
}

export class SellerAttachment extends Entity<SellerAttachmentProps> {
  get sellerId() {
    return this.props.sellerId
  }

  set sellerId(value: UniqueEntityId) {
    this.props.sellerId = value
  }

  get attachmentId() {
    return this.props.attachmentId
  }

  set attachmentId(value: UniqueEntityId) {
    this.props.attachmentId = value
  }

  static create(props: SellerAttachmentProps, id?: UniqueEntityId) {
    const sellerAttachment = new SellerAttachment(props, id)

    return sellerAttachment
  }
}
