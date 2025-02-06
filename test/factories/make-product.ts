import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  Product,
  ProductProps,
} from '@/domain/marketplace/products/enterprise/entities/product'
import { faker } from '@faker-js/faker'

export const makeProduct = (
  overrides: Partial<ProductProps>,
  id?: UniqueEntityId,
) => {
  return Product.create(
    {
      sellerId: new UniqueEntityId(),
      title: faker.lorem.sentence(),
      categoryId: new UniqueEntityId(),
      description: faker.lorem.sentence(),
      priceInCents: faker.number.int(),
      ...overrides,
    },
    id,
  )
}
