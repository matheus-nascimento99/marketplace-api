import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { FetchCategoriesUseCase } from './fetch-categories'
import { makeCategory } from 'test/factories/make-category'

let inMemoryCategoriesRepository: InMemoryCategoriesRepository

let sut: FetchCategoriesUseCase

describe('Fetch categories use case', () => {
  beforeEach(() => {
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    sut = new FetchCategoriesUseCase(inMemoryCategoriesRepository)
  })

  it('should be able to fetch categories', async () => {
    inMemoryCategoriesRepository.items.push(
      makeCategory({}),
      makeCategory({}),
      makeCategory({}),
    )
    const result = await sut.execute()

    expect(result.isRight()).toEqual(true)
    expect(inMemoryCategoriesRepository.items).toHaveLength(3)
  })
})
