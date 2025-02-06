import { CategoriesRepository } from '@/domain/marketplace/products/application/repositories/categories'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaCategoriesMapper } from '../mappers/categories'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private prisma: PrismaService) {}
  async findById(categoryId: UniqueEntityId): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId.toString() },
    })

    if (!category) {
      return null
    }

    return PrismaCategoriesMapper.toDomain(category)
  }

  async findMany(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany()

    return categories.map((category) =>
      PrismaCategoriesMapper.toDomain(category),
    )
  }
}
