import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { RegisterViewUseCase } from './register-view'
import { InMemoryViewsRepository } from 'test/in-memory-repositories/views'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'
import { makeProduct } from 'test/factories/make-product'
import { faker } from '@faker-js/faker'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { ViewOwnProductError } from './errors/view-own-product'
import { makeView } from 'test/factories/make-view'
import { DuplicateViewError } from './errors/duplicate-view'

let inMemoryViewsRepository: InMemoryViewsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: RegisterViewUseCase

describe('Register view use case', () => {
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

    sut = new RegisterViewUseCase(
      inMemorySellersRepository,
      inMemoryProductsRepository,
      inMemoryViewsRepository,
    )
  })

  it('should be able to register a product view', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    inMemoryProductsRepository.create(product)

    const anotherSeller = makeSeller({})
    inMemorySellersRepository.create(anotherSeller)

    const result = await sut.execute({
      productId: product.id.toString(),
      viewerId: anotherSeller.id.toString(),
    })

    expect(result.isRight()).toEqual(true)
    expect(inMemoryViewsRepository.items).toHaveLength(1)
  })

  it('should not be able to register a product view with a non-existent seller', async () => {
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
      viewerId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to register a product view with a non-existent product', async () => {
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
      productId: faker.string.uuid(),
      viewerId: seller.id.toString(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to register a product view with owner product', async () => {
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
      viewerId: seller.id.toString(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ViewOwnProductError)
  })

  it('should not be able to register a product view by same seller more than once', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    inMemoryProductsRepository.create(product)

    const anotherSeller = makeSeller({})
    inMemorySellersRepository.create(anotherSeller)

    const view = makeView({ productId: product.id, viewerId: anotherSeller.id })
    inMemoryViewsRepository.create(view)

    const result = await sut.execute({
      productId: product.id.toString(),
      viewerId: anotherSeller.id.toString(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(DuplicateViewError)
  })
})
