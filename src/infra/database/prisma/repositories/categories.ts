import { CategoriesRepository } from '@/domain/marketplace/products/application/repositories/categories'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaCategoriesMapper } from '../mappers/categories'

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany()

    return categories.map((category) =>
      PrismaCategoriesMapper.toDomain(category),
    )
  }
}
