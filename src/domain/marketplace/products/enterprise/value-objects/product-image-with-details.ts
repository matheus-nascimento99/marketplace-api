import { ValueObject } from '@/core/value-objects/value-object'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'

export type ProductImageWithDetailsProps = {
  image: Attachment
  createdAt: Date
}

export class ProductImageWithDetails extends ValueObject<ProductImageWithDetailsProps> {
  get image() {
    return this.image
  }

  get createdAt() {
    return this.createdAt
  }

  static create(props: ProductImageWithDetailsProps) {
    const productImage = new ProductImageWithDetails(props)

    return productImage
  }
}
