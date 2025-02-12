import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'
import { makeProduct } from 'test/factories/make-product'
import { startOfDay, subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { InMemoryViewsRepository } from 'test/in-memory-repositories/views'
import { makeView } from 'test/factories/make-view'
import { FetchViewsAmountPerDayInMonthUseCase } from './fetch-views-amount-per-day-in-month'

let inMemoryViewsRepository: InMemoryViewsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: FetchViewsAmountPerDayInMonthUseCase

describe('Fetch views amount per day in month use case', () => {
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

    inMemoryViewsRepository = new InMemoryViewsRepository(
      inMemoryProductsRepository,
      inMemorySellersRepository,
    )

    sut = new FetchViewsAmountPerDayInMonthUseCase(
      inMemorySellersRepository,
      inMemoryViewsRepository,
    )
  })

  it('should be able to fetch views per day in month by seller', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    inMemoryProductsRepository.create(product)

    const now = new Date()
    Array.from({ length: 2 }).forEach((_, index) => {
      const daysAmountToSub = index
      const createdAt = subDays(now, daysAmountToSub)

      const firstSeller = makeSeller({})
      inMemorySellersRepository.create(firstSeller)

      const firstView = makeView({
        viewerId: firstSeller.id,
        productId: product.id,
        createdAt,
      })

      inMemoryViewsRepository.create(firstView)

      const secondSeller = makeSeller({})
      inMemorySellersRepository.create(secondSeller)

      const secondView = makeView({
        viewerId: secondSeller.id,
        productId: product.id,
        createdAt,
      })

      inMemoryViewsRepository.create(secondView)
    })

    const result = await sut.execute({
      sellerId: seller.id.toString(),
    })

    expect(result.value).toEqual({
      viewsPerDay: expect.arrayContaining([
        { date: startOfDay(now), amount: 2 },
        { date: startOfDay(subDays(now, 1)), amount: 2 },
      ]),
    })
  })

  it('should not be able to fetch views per day in month by a non-existent seller', async () => {
    const result = await sut.execute({
      sellerId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
