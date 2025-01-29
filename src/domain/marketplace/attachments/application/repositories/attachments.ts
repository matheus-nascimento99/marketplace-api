import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '../../enterprise/entities/attachment'

export abstract class AttachmentsRepository {
  abstract createMany(attachments: Attachment[]): Promise<void>
  abstract findById(attachmentId: UniqueEntityId): Promise<Attachment | null>
}
