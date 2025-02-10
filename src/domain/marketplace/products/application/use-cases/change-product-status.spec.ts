import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { faker } from '@faker-js/faker'
import { makeProduct } from 'test/factories/make-product'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { makeSeller } from 'test/factories/make-seller'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { makeCategory } from 'test/factories/make-category'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { ChangeProductStatusUseCase } from './change-product-status'
import { CancelSoldProductError } from './errors/cancel-sold-product'
import { SellCancelledProductError } from './errors/sell-cancelled-product'
import { UpdateAnotherSellerProductError } from './errors/update-another-seller-product'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: ChangeProductStatusUseCase

describe('Change product status use case', () => {
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

    sut = new ChangeProductStatusUseCase(
      inMemoryProductsRepository,
      inMemorySellersRepository,
    )
  })

  it('should be able to change product status', async () => {
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
      status: 'cancelled',
      productId: product.id.toString(),
      sellerId: seller.id.toString(),
    })

    expect(result.isRight()).toEqual(true)
    expect(inMemoryProductsRepository.items[0].status).toEqual('cancelled')
  })

  it('should not be able to change product status by a non-existent seller', async () => {
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
      status: 'cancelled',
      productId: product.id.toString(),
      sellerId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to change product status by a non-existent product', async () => {
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
      status: 'cancelled',
      productId: faker.string.uuid(),
      sellerId: seller.id.toString(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to change product status that belogs to another seller', async () => {
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

    const anotherProduct = makeProduct({
      sellerId: anotherSeller.id,
      categoryId: category.id,
    })
    inMemoryProductsRepository.create(anotherProduct)

    const result = await sut.execute({
      status: 'cancelled',
      productId: anotherProduct.id.toString(),
      sellerId: seller.id.toString(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(UpdateAnotherSellerProductError)
  })

  it('should not be able to cancel sold products', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
      status: 'sold',
    })
    inMemoryProductsRepository.create(product)

    const result = await sut.execute({
      status: 'cancelled',
      productId: product.id.toString(),
      sellerId: seller.id.toString(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(CancelSoldProductError)
  })

  it('should not be able to sell cancelled products', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const product = makeProduct({
      sellerId: seller.id,
      categoryId: category.id,
      status: 'cancelled',
    })
    inMemoryProductsRepository.create(product)

    const result = await sut.execute({
      status: 'sold',
      productId: product.id.toString(),
      sellerId: seller.id.toString(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(SellCancelledProductError)
  })
})
