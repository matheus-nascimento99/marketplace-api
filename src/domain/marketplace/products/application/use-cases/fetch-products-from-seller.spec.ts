import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { FetchProductsFromSellerUseCase } from './fetch-products-from-seller'
import { makeProduct } from 'test/factories/make-product'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'
import { PaginationParamsResponse } from '@/core/@types/pagination-params'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'
import { faker } from '@faker-js/faker'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: FetchProductsFromSellerUseCase

describe('Fetch products from seller use case', () => {
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

    sut = new FetchProductsFromSellerUseCase(
      inMemoryProductsRepository,
      inMemorySellersRepository,
    )
  })

  it('should be able to fetch products from seller from more recent to older', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const anotherSeller = makeSeller({})
    inMemorySellersRepository.create(anotherSeller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    inMemoryProductsRepository.items.push(
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        createdAt: new Date(2025, 2, 10),
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        createdAt: new Date(2025, 2, 12),
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        createdAt: new Date(2025, 2, 9),
      }),
      makeProduct({
        sellerId: anotherSeller.id,
        categoryId: category.id,
      }),
    )

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      filterParams: {},
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(
      (result.value as PaginationParamsResponse<ProductWithDetails>).items,
    ).toHaveLength(3)
    expect(
      (result.value as PaginationParamsResponse<ProductWithDetails>).items,
    ).toEqual([
      {
        props: expect.objectContaining({
          createdAt: new Date(2025, 2, 12),
        }),
      },
      {
        props: expect.objectContaining({
          createdAt: new Date(2025, 2, 10),
        }),
      },
      {
        props: expect.objectContaining({
          createdAt: new Date(2025, 2, 9),
        }),
      },
    ])
  })

  it('should be able to fetch products from seller filtering by title', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    inMemoryProductsRepository.items.push(
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Test Title',
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Title Test',
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
    )

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      filterParams: { search: 'title' },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(
      (result.value as PaginationParamsResponse<ProductWithDetails>).items,
    ).toHaveLength(2)
  })

  it('should be able to fetch products from seller filtering by description', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    inMemoryProductsRepository.items.push(
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        description: 'Test Description',
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        description: 'Description Test',
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
    )

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      filterParams: { search: 'description' },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(
      (result.value as PaginationParamsResponse<ProductWithDetails>).items,
    ).toHaveLength(2)
  })

  it('should be able to fetch products from seller filtering by status', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    inMemoryProductsRepository.items.push(
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        status: 'cancelled',
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        status: 'cancelled',
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
    )

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      filterParams: { status: 'cancelled' },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(
      (result.value as PaginationParamsResponse<ProductWithDetails>).items,
    ).toHaveLength(2)
  })

  it('should be able to fetch products from seller paginated', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    inMemoryProductsRepository.items.push(
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
    )

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      filterParams: {},
      paginationParams: { page: 2, limit: 2 },
    })

    expect(result.isRight()).toEqual(true)
    expect(
      (result.value as PaginationParamsResponse<ProductWithDetails>).items,
    ).toHaveLength(1)
  })

  it('should not be able to fetch products from a non-existent seller', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    inMemoryProductsRepository.items.push(
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
      }),
    )

    const result = await sut.execute({
      sellerId: faker.string.uuid(),
      filterParams: {},
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
