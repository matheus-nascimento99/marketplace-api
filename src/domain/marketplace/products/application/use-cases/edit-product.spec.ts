import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { EditProductUseCase } from './edit-product'
import { faker } from '@faker-js/faker'
import { makeProduct } from 'test/factories/make-product'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { makeSeller } from 'test/factories/make-seller'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { makeCategory } from 'test/factories/make-category'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { InMemoryProductsImagesRepository } from 'test/in-memory-repositories/products-images'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeProductImage } from 'test/factories/make-product-image'

let inMemoryProductsImagesRepository: InMemoryProductsImagesRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: EditProductUseCase

describe('Edit product use case', () => {
  beforeEach(() => {
    inMemoryProductsImagesRepository = new InMemoryProductsImagesRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()
    inMemorySellersAvatarsRepository = new InMemorySellersAvatarsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemorySellersAvatarsRepository,
    )
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new EditProductUseCase(
      inMemoryProductsRepository,
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryAttachmentsRepository,
      inMemoryProductsImagesRepository,
    )
  })

  it('should be able to edit product', async () => {
    const product = makeProduct({})
    inMemoryProductsRepository.create(product)

    const firstAttachment = makeAttachment({})
    inMemoryAttachmentsRepository.items.push(firstAttachment)

    const secondAttachment = makeAttachment({})
    inMemoryAttachmentsRepository.items.push(secondAttachment)

    inMemoryProductsImagesRepository.items.push(
      makeProductImage({ imageId: firstAttachment.id, productId: product.id }),
      makeProductImage({ imageId: secondAttachment.id, productId: product.id }),
    )

    const thirdAttachment = makeAttachment({})
    inMemoryAttachmentsRepository.items.push(thirdAttachment)

    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const result = await sut.execute({
      productId: product.id.toString(),
      sellerId: seller.id.toString(),
      title: faker.lorem.sentence(),
      categoryId: category.id.toString(),
      description: faker.lorem.sentence(),
      priceInCents: faker.number.int(),
      attachmentsIds: [
        firstAttachment.id.toString(),
        thirdAttachment.id.toString(),
      ],
    })

    expect(result.isRight()).toEqual(true)
    expect(inMemoryProductsRepository.items[0].images.getNewItems()).toEqual([
      expect.objectContaining({
        props: expect.objectContaining({ imageId: thirdAttachment.id }),
      }),
    ])
    expect(
      inMemoryProductsRepository.items[0].images.getRemovedItems(),
    ).toEqual([
      expect.objectContaining({
        props: expect.objectContaining({ imageId: secondAttachment.id }),
      }),
    ])
  })

  it('should not be able to edit product by a non-existent seller', async () => {
    const product = makeProduct({})
    inMemoryProductsRepository.create(product)

    const result = await sut.execute({
      productId: product.id.toString(),
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

  it('should not be able to edit product with a non-existent category', async () => {
    const product = makeProduct({})
    inMemoryProductsRepository.create(product)

    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      productId: product.id.toString(),
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
