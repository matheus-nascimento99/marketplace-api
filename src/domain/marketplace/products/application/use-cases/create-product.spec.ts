import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { CreateProductUseCase } from './create-product'
import { faker } from '@faker-js/faker'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { makeSeller } from 'test/factories/make-seller'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { makeCategory } from 'test/factories/make-category'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: CreateProductUseCase

describe('Create product use case', () => {
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

    sut = new CreateProductUseCase(
      inMemoryProductsRepository,
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryAttachmentsRepository,
    )
  })

  it('should be able to create product', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      title: faker.lorem.sentence(),
      categoryId: category.id.toString(),
      description: faker.lorem.sentence(),
      priceInCents: faker.number.int(),
      attachmentsIds: [],
    })

    expect(result.isRight()).toEqual(true)
    expect(inMemoryProductsRepository.items).toHaveLength(1)
  })

  it('should not be able to create product by a non-existent seller', async () => {
    const result = await sut.execute({
      sellerId: faker.string.uuid(),
      title: faker.lorem.sentence(),
      categoryId: faker.string.uuid(),
      description: faker.lorem.sentence(),
      priceInCents: faker.number.int(),
      attachmentsIds: [],
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create product with a non-existent category', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      title: faker.lorem.sentence(),
      categoryId: faker.string.uuid(),
      description: faker.lorem.sentence(),
      priceInCents: faker.number.int(),
      attachmentsIds: [],
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
