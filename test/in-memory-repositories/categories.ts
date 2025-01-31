import { CategoriesRepository } from '@/domain/marketplace/products/application/repositories/categories'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items: Category[] = []

  async findMany(): Promise<Category[]> {
    return this.items
  }
}
