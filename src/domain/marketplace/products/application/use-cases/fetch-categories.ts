import { Either, right } from '@/core/either'
import { Category } from '../../enterprise/entities/category'
import { Injectable } from '@nestjs/common'
import { CategoriesRepository } from '../repositories/categories'

export type FetchCategoriesUseCaseResponse = Either<
  null,
  {
    categories: Category[]
  }
>

@Injectable()
export class FetchCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<FetchCategoriesUseCaseResponse> {
    const categories = await this.categoriesRepository.findMany()

    return right({
      categories,
    })
  }
}
