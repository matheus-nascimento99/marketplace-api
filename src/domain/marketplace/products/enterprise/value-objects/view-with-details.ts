import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ValueObject } from '@/core/value-objects/value-object'
import { ProductWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-with-details'
import { SellerWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-with-details'

export type ViewWithDetailsProps = {
  viewId: UniqueEntityId
  viewer: SellerWithDetails
  product: ProductWithDetails
  createdAt: Date
}

export class ViewWithDetails extends ValueObject<ViewWithDetailsProps> {
  get viewId() {
    return this.props.viewId
  }

  get viewer() {
    return this.props.viewer
  }

  get product() {
    return this.props.product
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: ViewWithDetailsProps) {
    return new ViewWithDetails(props)
  }
}
