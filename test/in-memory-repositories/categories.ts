import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { CategoriesRepository } from '@/domain/marketplace/products/application/repositories/categories'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items: Category[] = []

  async findById(categoryId: UniqueEntityId): Promise<Category | null> {
    const category = this.items.find((item) => item.id.equals(categoryId))

    if (!category) {
      return null
    }

    return category
  }

  async findMany(): Promise<Category[]> {
    return this.items
  }
}
