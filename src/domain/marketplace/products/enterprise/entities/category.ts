import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Slug } from '../value-objects/slug'
import { Optional } from '@/core/@types/optional'

export type CategoryProps = {
  title: string
  slug: Slug
  createdAt: Date
}

export class Category extends Entity<CategoryProps> {
  get title() {
    return this.props.title
  }

  set title(value: string) {
    this.props.title = value
  }

  get slug() {
    return this.props.slug
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<CategoryProps, 'slug' | 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new Category(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
