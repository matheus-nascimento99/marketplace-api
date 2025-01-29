import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { CreateSellerUseCase } from './create-seller'
import { FakeHasher } from 'test/hash/fake-hasher'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { makeAttachment } from 'test/factories/make-attachment'
import { faker } from '@faker-js/faker'
import { makeSeller } from 'test/factories/make-seller'
import { SellerWithEmailAlreadyExists } from './errors/seller-with-email-already-exists'
import { SellerWithPhoneAlreadyExists } from './errors/seller-with-phone-already-exists'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeHasher: FakeHasher

let sut: CreateSellerUseCase

describe('Create seller use case', () => {
  beforeEach(() => {
    inMemorySellersRepository = new InMemorySellersRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    fakeHasher = new FakeHasher()

    sut = new CreateSellerUseCase(
      inMemorySellersRepository,
      inMemoryAttachmentsRepository,
      fakeHasher,
    )
  })

  it('should be able to create seller', async () => {
    const avatar = makeAttachment({})
    inMemoryAttachmentsRepository.items.push(avatar)

    const result = await sut.execute({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phone: faker.phone.number(),
      avatarId: avatar.id.toString(),
    })

    expect(result.isRight()).toEqual(true)
    expect(inMemorySellersRepository.items).toHaveLength(1)
  })

  it('should not be able to create seller with email from another', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      name: faker.person.fullName(),
      email: seller.email,
      password: faker.internet.password(),
      phone: faker.phone.number(),
      avatarId: null,
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(SellerWithEmailAlreadyExists)
  })

  it('should not be able to create seller with phone from another', async () => {
    const seller = makeSeller({})
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phone: seller.phone.value,
      avatarId: null,
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(SellerWithPhoneAlreadyExists)
  })

  it('should not be able to create seller with a non existent avatar', async () => {
    const result = await sut.execute({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phone: faker.phone.number(),
      avatarId: faker.string.uuid(),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
