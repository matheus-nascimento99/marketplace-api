import { Category } from '../entities/category'
import { ProductImageWithDetails } from './product-image-with-details'
import { ValueObject } from '@/core/value-objects/value-object'
import { ProductStatus } from '@prisma/client'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Raw } from '@/core/value-objects/raw'
import { SellerAvatarWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-avatar-with-details'

export type ProductWithDetailsProps = {
  productId: UniqueEntityId
  title: string
  seller: {
    sellerId: UniqueEntityId
    name: string
    phone: Raw
    email: string
    avatar?: SellerAvatarWithDetails | null
  }
  category: Category
  description: string
  priceInCents: number
  status: ProductStatus
  images: ProductImageWithDetails[]
  createdAt: Date
}

export class ProductWithDetails extends ValueObject<ProductWithDetailsProps> {
  get productId() {
    return this.props.productId
  }

  get title() {
    return this.props.title
  }

  get seller() {
    return this.props.seller
  }

  get category() {
    return this.props.category
  }

  get description() {
    return this.props.description
  }

  get priceInCents() {
    return this.props.priceInCents
  }

  get status() {
    return this.props.status
  }

  get images() {
    return this.props.images
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: ProductWithDetailsProps) {
    const product = new ProductWithDetails(props)

    return product
  }
}
