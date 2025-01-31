import { Category } from '@/domain/marketplace/products/enterprise/entities/category'

export class CategoriesPresenter {
  static toHTTP(category: Category) {
    return {
      id: category.id.toString(),
      title: category.title,
      slug: category.slug.value,
    }
  }
}
