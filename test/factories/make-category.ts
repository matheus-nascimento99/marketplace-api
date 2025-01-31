import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  Category,
  CategoryProps,
} from '@/domain/marketplace/products/enterprise/entities/category'
import { Slug } from '@/domain/marketplace/products/enterprise/value-objects/slug'
import { PrismaCategoriesMapper } from '@/infra/database/prisma/mappers/categories'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export const makeCategory = (
  overrides: Partial<CategoryProps>,
  id?: UniqueEntityId,
) => {
  return Category.create(
    {
      title: faker.lorem.words(),
      slug: Slug.createFromText(faker.lorem.words()),
      ...overrides,
    },
    id,
  )
}

@Injectable()
export class CategoryFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCategory(override: Partial<CategoryProps> = {}) {
    const category = makeCategory({
      ...override,
    })

    const data = PrismaCategoriesMapper.toPrisma(category)

    await this.prisma.category.create({
      data,
    })

    return category
  }
}
