import { InMemorySellersRepository } from 'test/in-memory-repositories/sellers'
import { AuthenticateSellerUseCase } from './authenticate-seller'
import { FakeHasher } from 'test/hash/fake-hasher'
import { makeSeller } from 'test/factories/make-seller'
import { FakeCryptographer } from 'test/cryptography/fake-cryptographer'
import { DEFAULT_PASSWORD } from '@/utils/default-password'
import { faker } from '@faker-js/faker'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials'
import { InMemorySellersAvatarsRepository } from 'test/in-memory-repositories/sellers-avatars'
import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository
let fakeCryptographer: FakeCryptographer
let fakeHasher: FakeHasher

let sut: AuthenticateSellerUseCase

describe('Authenticate seller use case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersAvatarsRepository = new InMemorySellersAvatarsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemorySellersAvatarsRepository,
      inMemoryAttachmentsRepository,
    )
    fakeHasher = new FakeHasher()
    fakeCryptographer = new FakeCryptographer()

    sut = new AuthenticateSellerUseCase(
      inMemorySellersRepository,
      fakeHasher,
      fakeCryptographer,
    )
  })

  it('should be able to authenticate seller', async () => {
    const seller = makeSeller({
      password: await fakeHasher.hash(DEFAULT_PASSWORD),
    })
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      email: seller.email,
      password: DEFAULT_PASSWORD,
    })

    expect(result.isRight()).toEqual(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should not be able to authenticate seller with wrong email', async () => {
    const seller = makeSeller({
      password: await fakeHasher.hash(DEFAULT_PASSWORD),
    })
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      email: faker.internet.email(),
      password: DEFAULT_PASSWORD,
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate seller with wrong password', async () => {
    const seller = makeSeller({
      password: await fakeHasher.hash(DEFAULT_PASSWORD),
    })
    inMemorySellersRepository.create(seller)

    const result = await sut.execute({
      email: seller.email,
      password: 'invalid-password',
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
