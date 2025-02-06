import { Optional } from '@/core/@types/optional'
import { Entity } from 'src/core/entities/entity'
import { UniqueEntityId } from 'src/core/value-objects/unique-entity-id'

export type ProductImageProps = {
  productId: UniqueEntityId
  imageId: UniqueEntityId
  createdAt: Date
}

export class ProductImage extends Entity<ProductImageProps> {
  get productId() {
    return this.props.productId
  }

  set productId(value: UniqueEntityId) {
    this.props.productId = value
  }

  get imageId() {
    return this.props.imageId
  }

  set imageId(value: UniqueEntityId) {
    this.props.imageId = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ProductImageProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const productImage = new ProductImage(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id,
    )

    return productImage
  }
}
