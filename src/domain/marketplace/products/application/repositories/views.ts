import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { View } from '../../enterprise/entities/view'
import { ViewWithDetails } from '../../enterprise/value-objects/view-with-details'

export abstract class ViewsRepository {
  abstract create(view: View): Promise<ViewWithDetails>

  abstract findByIdWithDetails(
    viewId: UniqueEntityId,
  ): Promise<ViewWithDetails | null>

  abstract findByViewerIdAndProductId(
    viewerId: UniqueEntityId,
    productId: UniqueEntityId,
  ): Promise<View | null>
}
