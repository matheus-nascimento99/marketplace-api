import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'
import { makeProduct } from 'test/factories/make-product'
import { subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { GetViewsAmountInMonthUseCase } from './get-views-amount-in-month'
import { InMemoryViewsRepository } from 'test/in-memory-repositories/views'
import { makeView } from 'test/factories/make-view'

let inMemoryViewsRepository: InMemoryViewsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: GetViewsAmountInMonthUseCase

describe('Get views amount in month use case', () => {
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

    sut = new GetViewsAmountInMonthUseCase(
      inMemorySellersRepository,
      inMemoryViewsRepository,
    )
  })

  it('should be able to count views by seller', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    inMemoryProductsRepository.create(product)

    Array.from({ length: 31 }).forEach((_, index) => {
      const now = new Date()
      const daysAmountToSub = index
      const createdAt = subDays(now, daysAmountToSub)

      const anotherSeller = makeSeller({})
      inMemorySellersRepository.create(anotherSeller)

      const view = makeView({
        viewerId: anotherSeller.id,
        productId: product.id,
        createdAt,
      })

      inMemoryViewsRepository.create(view)
    })

    const result = await sut.execute({
      sellerId: seller.id.toString(),
    })

    expect(result.value).toEqual({
      amount: 31,
    })
  })

  it('should not be able to count views by a non-existent seller', async () => {
    const result = await sut.execute({
      sellerId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
