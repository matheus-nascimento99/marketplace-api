import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { makeProduct } from 'test/factories/make-product'
import { makeCategory } from 'test/factories/make-category'
import { subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { InMemoryViewsRepository } from 'test/in-memory-repositories/views'
import { makeView } from 'test/factories/make-view'
import { GetProductViewsAmountInWeekUseCase } from './get-product-views-amount-in-week'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { makeSeller } from 'test/factories/make-seller'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'

let inMemoryViewsRepository: InMemoryViewsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let inMemorySellersRepository: InMemorySellersRepository

let sut: GetProductViewsAmountInWeekUseCase

describe('Get product views amount in week use case', () => {
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

    sut = new GetProductViewsAmountInWeekUseCase(
      inMemoryProductsRepository,
      inMemoryViewsRepository,
    )
  })

  it('should be able to count product views in week', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    inMemoryProductsRepository.create(product)

    Array.from({ length: 8 }).forEach((_, index) => {
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
      productId: product.id.toString(),
    })

    expect(result.value).toEqual({
      amount: 8,
    })
  })

  it('should not be able to count product views by a non-existent product', async () => {
    const result = await sut.execute({
      productId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
