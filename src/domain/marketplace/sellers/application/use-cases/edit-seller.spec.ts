import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { EditSellerUseCase } from './edit-seller'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { FakeStorage } from 'test/storage/fake-storage'
import { makeSeller } from 'test/factories/make-seller'
import { faker } from '@faker-js/faker'
import { makeAttachment } from 'test/factories/make-attachment'
import { SellerWithEmailAlreadyExists } from './errors/seller-with-email-already-exists'
import { SellerWithPhoneAlreadyExists } from './errors/seller-with-phone-already-exists'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let fakeStorage: FakeStorage

let sut: EditSellerUseCase

describe('Edit seller use case', () => {
  beforeEach(() => {
    inMemorySellersAvatarsRepository = new InMemorySellersAvatarsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemorySellersAvatarsRepository,
      inMemoryAttachmentsRepository,
    )
    fakeStorage = new FakeStorage()

    sut = new EditSellerUseCase(
      inMemorySellersRepository,
      inMemoryAttachmentsRepository,
      inMemorySellersAvatarsRepository,
      fakeStorage,
    )
  })

  it('should be able to edit seller', async () => {
    const avatar = makeAttachment({})
    inMemoryAttachmentsRepository.items.push(avatar)

    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      avatarId: avatar.id.toString(),
    })

    expect(result.isRight()).toEqual(true)
  })

  it('should not be able to edit seller with email from another', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const anotherSeller = makeSeller({})
    inMemorySellersRepository.create(anotherSeller)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: faker.person.fullName(),
      email: anotherSeller.email,
      phone: faker.phone.number(),
      avatarId: null,
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(SellerWithEmailAlreadyExists)
  })

  it('should not be able to edit seller with phone from another', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const anotherSeller = makeSeller({})
    inMemorySellersRepository.create(anotherSeller)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: anotherSeller.phone.value,
      avatarId: null,
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(SellerWithPhoneAlreadyExists)
  })

  it('should not be able to edit seller with a non existent avatar', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const anotherSeller = makeSeller({})
    inMemorySellersRepository.create(anotherSeller)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      avatarId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
