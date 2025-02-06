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

  async findManyBetweenIds(
    attachmentIds: UniqueEntityId[],
  ): Promise<{ attachments: Attachment[]; notFoundIds: string[] }> {
    const notFoundIds: string[] = []

    const attachments = attachmentIds
      .filter((attachmentId) => {
        const isAttachmentBetweenIds = this.items.some((item) =>
          item.id.equals(attachmentId),
        )

        if (isAttachmentBetweenIds) {
          return true
        }

        notFoundIds.push(attachmentId.toString())

        return false
      })
      .map((attachmentId) => {
        const attachmentIndex = this.items.findIndex((item) =>
          item.id.equals(attachmentId),
        )

        return this.items[attachmentIndex]
      })

    return { attachments, notFoundIds }
  }

  async delete(attachmentId: UniqueEntityId): Promise<void> {
    const attachmentIndex = this.items.findIndex((item) =>
      item.id.equals(attachmentId),
    )

    this.items.splice(attachmentIndex, 1)
  }
}
