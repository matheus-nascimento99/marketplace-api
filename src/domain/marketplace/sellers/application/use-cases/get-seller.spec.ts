import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { GetSellerUseCase } from './get-seller'
import { makeSeller } from 'test/factories/make-seller'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { faker } from '@faker-js/faker'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let inMemorySellersRepository: InMemorySellersRepository

let sut: GetSellerUseCase

describe('Get seller use case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersAvatarsRepository = new InMemorySellersAvatarsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemorySellersAvatarsRepository,
      inMemoryAttachmentsRepository,
    )

    sut = new GetSellerUseCase(inMemorySellersRepository)
  })

  it('should be able to get seller', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
    })

    expect(result.isRight()).toEqual(true)
  })

  it('should not be able to get a non-existent seller', async () => {
    const result = await sut.execute({
      sellerId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
