import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  View,
  ViewProps,
} from '@/domain/marketplace/products/enterprise/entities/view'

export const makeView = (
  overrides: Partial<ViewProps>,
  id?: UniqueEntityId,
) => {
  return View.create(
    {
      productId: new UniqueEntityId(),
      viewerId: new UniqueEntityId(),
      ...overrides,
    },
    id,
  )
}
