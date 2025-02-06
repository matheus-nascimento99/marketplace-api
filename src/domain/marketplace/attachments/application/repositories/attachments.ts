import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '../../enterprise/entities/attachment'

export abstract class AttachmentsRepository {
  abstract createMany(attachments: Attachment[]): Promise<void>
  abstract findManyBetweenIds(
    attachmentIds: UniqueEntityId[],
  ): Promise<{ attachments: Attachment[]; notFoundIds: string[] }>

  abstract findById(attachmentId: UniqueEntityId): Promise<Attachment | null>
}
