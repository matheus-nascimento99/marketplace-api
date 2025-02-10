import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  Product,
  ProductProps,
} from '@/domain/marketplace/products/enterprise/entities/product'
import { PrismaProductsMapper } from '@/infra/database/prisma/mappers/products'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

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
      priceInCents: faker.number.int({ max: 10000 }),
      ...overrides,
    },
    id,
  )
}

@Injectable()
export class ProductFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaProduct(override: Partial<ProductProps> = {}) {
    const product = makeProduct({
      ...override,
    })

    const data = PrismaProductsMapper.toPrisma(product)

    await this.prisma.product.create({
      data,
    })

    return product
  }
}
