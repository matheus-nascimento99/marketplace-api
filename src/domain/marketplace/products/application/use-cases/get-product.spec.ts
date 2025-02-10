import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { GetProductUseCase } from './get-product'
import { makeProduct } from 'test/factories/make-product'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { makeSeller } from 'test/factories/make-seller'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { makeCategory } from 'test/factories/make-category'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { faker } from '@faker-js/faker'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: GetProductUseCase

describe('Get product use case', () => {
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

    sut = new GetProductUseCase(inMemoryProductsRepository)
  })

  it('should be able to get product', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })
    inMemoryProductsRepository.create(product)

    const result = await sut.execute({
      productId: product.id.toString(),
    })

    expect(result.isRight()).toEqual(true)
  })

  it('should not be able to get a non-existent product', async () => {
    const result = await sut.execute({
      productId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
