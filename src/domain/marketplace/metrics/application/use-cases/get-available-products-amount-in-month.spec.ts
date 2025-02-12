import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { GetAvailableProductsAmountInMonthUseCase } from './get-available-products-amount-in-month'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'
import { makeProduct } from 'test/factories/make-product'
import { subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: GetAvailableProductsAmountInMonthUseCase

describe('Get available products amount in month use case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()
    inMemorySellersAvatarsRepository = new InMemorySellersAvatarsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemorySellersAvatarsRepository,
      inMemoryAttachmentsRepository,
    )
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryCategoriesRepository,
      inMemorySellersRepository,
      inMemorySellersAvatarsRepository,
      inMemoryAttachmentsRepository,
    )

    sut = new GetAvailableProductsAmountInMonthUseCase(
      inMemorySellersRepository,
      inMemoryProductsRepository,
    )
  })

  it('should be able to count available products in month by seller', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    Array.from({ length: 31 }).forEach((_, index) => {
      const now = new Date()
      const daysAmountToSub = index
      const createdAt = subDays(now, daysAmountToSub)

      const product = makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        createdAt,
        status: 'available',
      })
      inMemoryProductsRepository.create(product)
    })

    const result = await sut.execute({
      sellerId: seller.id.toString(),
    })

    expect(result.value).toEqual({
      amount: 31,
    })
  })

  it('should not be able to count available products in month by a non-existent seller', async () => {
    const result = await sut.execute({
      sellerId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
