import { Optional } from '@/core/@types/optional'
import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'

export type ViewProps = {
  viewerId: UniqueEntityId
  productId: UniqueEntityId
  createdAt: Date
}

export class View extends Entity<ViewProps> {
  get viewerId() {
    return this.props.viewerId
  }

  get productId() {
    return this.props.productId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<ViewProps, 'createdAt'>, id?: UniqueEntityId) {
    const view = new View(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return view
  }
}
