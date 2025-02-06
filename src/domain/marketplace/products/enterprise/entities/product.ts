import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductImageList } from '../watched-lists/product-image-list'
import { Optional } from '@/core/@types/optional'

export type ProductStatus = 'available' | 'cancelled' | 'sold'

export type ProductProps = {
  title: string
  sellerId: UniqueEntityId
  categoryId: UniqueEntityId
  description: string
  priceInCents: number
  status: ProductStatus
  images: ProductImageList
  createdAt: Date
}

export class Product extends Entity<ProductProps> {
  get title() {
    return this.props.title
  }

  set title(value: string) {
    this.props.title = value
  }

  get sellerId() {
    return this.props.sellerId
  }

  get categoryId() {
    return this.props.categoryId
  }

  set categoryId(value: UniqueEntityId) {
    this.props.categoryId = value
  }

  get description() {
    return this.props.description
  }

  set description(value: string) {
    this.props.description = value
  }

  get priceInCents() {
    return this.props.priceInCents
  }

  set priceInCents(value: number) {
    this.props.priceInCents = value
  }

  get status() {
    return this.props.status
  }

  set status(value: ProductStatus) {
    this.props.status = value
  }

  get images() {
    return this.props.images
  }

  set images(value: ProductImageList) {
    this.props.images = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ProductProps, 'images' | 'createdAt' | 'status'>,
    id?: UniqueEntityId,
  ) {
    const product = new Product(
      {
        ...props,
        images: props.images ?? new ProductImageList(),
        status: props.status ?? 'available',
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return product
  }
}
