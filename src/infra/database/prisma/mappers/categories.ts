import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'
import { Slug } from '@/domain/marketplace/products/enterprise/value-objects/slug'
import { Prisma, Category as PrismaCategory } from '@prisma/client'

export class PrismaCategoriesMapper {
  static toDomain(raw: PrismaCategory): Category {
    return Category.create(
      {
        title: raw.title,
        slug: Slug.create(raw.slug),
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(category: Category): Prisma.CategoryUncheckedCreateInput {
    return {
      id: category.id.toString(),
      title: category.title,
      slug: category.slug.value,
      createdAt: category.createdAt,
    }
  }
}
