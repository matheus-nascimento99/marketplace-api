import { AggregateRoot } from 'src/core/entities/aggregate-root'
import { Optional } from 'src/core/@types/optional'
import { UniqueEntityId } from 'src/core/value-objects/unique-entity-id'
import { SellerAvatar } from './seller-avatar'
import { Raw } from '@/core/value-objects/raw'

export type SellerProps = {
  name: string
  phone: Raw
  email: string
  avatar?: SellerAvatar | null
  password: string
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

  set phone(value: Raw) {
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

  set avatar(value: SellerAvatar | null | undefined) {
    this.props.avatar = value
    this.touch()
  }

  get password() {
    return this.props.password
  }

  set password(value: string) {
    this.props.password = value
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
