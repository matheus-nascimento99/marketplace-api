import { Category } from '../entities/category'
import { ProductImageWithDetails } from './product-image-with-details'
import { ValueObject } from '@/core/value-objects/value-object'
import { ProductStatus } from '@prisma/client'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Raw } from '@/core/value-objects/raw'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'

export type ProductWithDetailsProps = {
  productId: UniqueEntityId
  title: string
  seller: {
    sellerId: UniqueEntityId
    name: string
    phone: Raw
    email: string
    avatar?: Attachment | null
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
    return this.productId
  }

  get title() {
    return this.title
  }

  get seller() {
    return this.seller
  }

  get category() {
    return this.category
  }

  get description() {
    return this.description
  }

  get priceInCents() {
    return this.priceInCents
  }

  get status() {
    return this.status
  }

  get images() {
    return this.images
  }

  get createdAt() {
    return this.createdAt
  }

  static create(props: ProductWithDetailsProps) {
    const product = new ProductWithDetails(props)

    return product
  }
}
