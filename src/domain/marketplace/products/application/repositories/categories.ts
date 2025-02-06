import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Category } from '../../enterprise/entities/category'

export abstract class CategoriesRepository {
  abstract findById(categoryId: UniqueEntityId): Promise<Category | null>
  abstract findMany(): Promise<Category[]>
}
