import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Slug } from '../value-objects/slug'
import { Optional } from '@/core/@types/optional'

export type CategoryProps = {
  title: string
  slug: Slug
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

  static create(props: Optional<CategoryProps, 'slug'>, id?: UniqueEntityId) {
    return new Category(
      { ...props, slug: props.slug ?? Slug.createFromText(props.title) },
      id,
    )
  }
}
