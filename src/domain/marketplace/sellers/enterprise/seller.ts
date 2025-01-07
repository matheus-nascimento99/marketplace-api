import { AggregateRoot } from 'src/core/entities/aggregate-root'
import { SellerAttachment } from './seller-attachment'
import { Optional } from 'src/core/@types/optional'
import { UniqueEntityId } from 'src/core/value-objects/unique-entity-id'

export type SellerProps = {
  name: string
  phone: string
  email: string
  avatar?: SellerAttachment | null
  createdAt: Date
  updatedAt?: Date | null
}

export class Seller extends AggregateRoot<SellerProps> {
  get name() {
    return this.props.name
  }

  set name(value: string) {
    this.props.name = value
    this.touch()
  }

  get phone() {
    return this.props.phone
  }

  set phone(value: string) {
    this.props.phone = value
    this.touch()
  }

  get email() {
    return this.props.email
  }

  set email(value: string) {
    this.props.email = value
    this.touch()
  }

  get avatar() {
    return this.props.avatar
  }

  set avatar(value: SellerAttachment | null | undefined) {
    this.props.avatar = value
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<SellerProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const seller = new Seller(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return seller
  }
}
