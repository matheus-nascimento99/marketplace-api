import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

  async createMany(attachments: Attachment[]): Promise<void> {
    this.items.push(...attachments)
  }

  async findById(attachmentId: UniqueEntityId): Promise<Attachment | null> {
    const attachment = this.items.find((item) => item.id.equals(attachmentId))

    if (!attachment) {
      return null
    }

    return attachment
  }
}
