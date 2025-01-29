import { InMemoryAttachmentsRepository } from 'test/in-memory-repositories/attachments'
import { SaveAttachmentsUseCase } from './save-attachments'
import { FakeStorage } from 'test/storage/fake-storage'
import { faker } from '@faker-js/faker'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'
import { InvalidAttachmentSizeError } from './errors/invalid-attachment-size'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeStorage: FakeStorage

let sut: SaveAttachmentsUseCase

describe('Save attachments use case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    fakeStorage = new FakeStorage()

    sut = new SaveAttachmentsUseCase(inMemoryAttachmentsRepository, fakeStorage)
  })

  it('should be able to save attachments', async () => {
    const result = await sut.execute({
      attachments: Array.from({ length: 2 }).map(() => ({
        body: Buffer.from(''),
        filename:
          faker.lorem.word() +
          faker.helpers.arrayElement(['.png', '.jpeg', '.jpg']),
        mimeType: faker.helpers.arrayElement([
          'image/png',
          'image/jpeg',
          'image/jpg',
        ]),
        size: 1000,
      })),
    })

    expect(result.isRight()).toEqual(true)
    expect(inMemoryAttachmentsRepository.items).toHaveLength(2)
    expect(fakeStorage.files).toHaveLength(2)
  })

  it('should not be able to save attachments if some has invalid mimetype', async () => {
    const result = await sut.execute({
      attachments: Array.from({ length: 2 }).map(() => ({
        body: Buffer.from(''),
        filename: faker.lorem.word() + '.csv',
        mimeType: 'text/csv',
        size: 1000,
      })),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })

  it('should not be able to save attachments if some has invalid size', async () => {
    const result = await sut.execute({
      attachments: Array.from({ length: 2 }).map(() => ({
        body: Buffer.from(''),
        filename:
          faker.lorem.word() +
          faker.helpers.arrayElement(['.png', '.jpeg', '.jpg']),
        mimeType: faker.helpers.arrayElement([
          'image/png',
          'image/jpeg',
          'image/jpg',
        ]),
        size: 10000000000,
      })),
    })

    expect(result.isLeft()).toEqual(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentSizeError)
  })
})
