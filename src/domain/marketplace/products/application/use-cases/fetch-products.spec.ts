import { InMemoryProductsRepository } from 'test/in-memory-repositories/products'
import { FetchProductsUseCase } from './fetch-products'
import { makeProduct } from 'test/factories/make-product'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { InMemoryCategoriesRepository } from 'test/in-memory-repositories/categories'
import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository

let sut: FetchProductsUseCase

describe('Fetch products use case', () => {
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

    sut = new FetchProductsUseCase(inMemoryProductsRepository)
  })

  it('should be able to fetch products from more recent to older', async () => {
    const currentSeller = makeSeller({})
    inMemorySellersRepository.create(currentSeller)

    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

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
    )

    const result = await sut.execute({
      userId: currentSeller.id.toString(),
      filterParams: {},
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(result.value?.items).toHaveLength(3)
    expect(result.value?.items).toEqual([
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

  it('should be able to fetch products filtering by title', async () => {
    const currentSeller = makeSeller({})
    inMemorySellersRepository.create(currentSeller)

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
      userId: currentSeller.id.toString(),
      filterParams: { search: 'title' },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(result.value?.items).toHaveLength(2)
  })

  it('should be able to fetch products filtering by description', async () => {
    const currentSeller = makeSeller({})
    inMemorySellersRepository.create(currentSeller)

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
      userId: currentSeller.id.toString(),
      filterParams: { search: 'description' },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(result.value?.items).toHaveLength(2)
  })

  it('should be able to fetch products filtering by status', async () => {
    const currentSeller = makeSeller({})
    inMemorySellersRepository.create(currentSeller)

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
      userId: currentSeller.id.toString(),
      filterParams: { status: 'cancelled' },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(result.value?.items).toHaveLength(2)
  })

  it('should be able to fetch products filtering by price', async () => {
    const currentSeller = makeSeller({})
    inMemorySellersRepository.create(currentSeller)

    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    inMemoryProductsRepository.items.push(
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        priceInCents: 1000,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        priceInCents: 2000,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        priceInCents: 3000,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        priceInCents: 4000,
      }),
      makeProduct({
        sellerId: seller.id,
        categoryId: category.id,
        priceInCents: 5000,
      }),
    )

    const firstResult = await sut.execute({
      userId: currentSeller.id.toString(),
      filterParams: { initialPrice: 2000, finalPrice: 4000 },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(firstResult.isRight()).toEqual(true)
    expect(firstResult.value?.items).toHaveLength(3)

    const secondResult = await sut.execute({
      userId: currentSeller.id.toString(),
      filterParams: { finalPrice: 3000 },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(secondResult.isRight()).toEqual(true)
    expect(secondResult.value?.items).toHaveLength(3)
  })

  it('should be able to fetch products filtering by category', async () => {
    const currentSeller = makeSeller({})
    inMemorySellersRepository.create(currentSeller)

    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const category = makeCategory({})
    inMemoryCategoriesRepository.items.push(category)

    const anotherCategory = makeCategory({})
    inMemoryCategoriesRepository.items.push(anotherCategory)

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
        categoryId: anotherCategory.id,
      }),
    )

    const result = await sut.execute({
      userId: currentSeller.id.toString(),
      filterParams: { categoryId: category.id.toString() },
      paginationParams: { page: 1, limit: 3 },
    })

    expect(result.isRight()).toEqual(true)
    expect(result.value?.items).toHaveLength(2)
  })

  it('should be able to fetch products paginated', async () => {
    const currentSeller = makeSeller({})
    inMemorySellersRepository.create(currentSeller)

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
      userId: currentSeller.id.toString(),
      filterParams: {},
      paginationParams: { page: 2, limit: 2 },
    })

    expect(result.isRight()).toEqual(true)
    expect(result.value?.items).toHaveLength(1)
  })
})
