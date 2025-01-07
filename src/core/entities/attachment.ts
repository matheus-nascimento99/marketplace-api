import { UniqueEntityId } from '../value-objects/unique-entity-id'
import { Entity } from './entity'

export type AttachmentProps = {
  key: string
}

export class Attachment extends Entity<AttachmentProps> {
  get key() {
    return this.props.key
  }

  set key(value: string) {
    this.props.key = value
  }

  static create(props: AttachmentProps, id?: UniqueEntityId) {
    const attachment = new Attachment(props, id)

    return attachment
  }
}
