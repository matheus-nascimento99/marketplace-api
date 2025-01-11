import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Prisma, Attachment as PrismaAttachment } from '@prisma/client'

export class PrismaAttachmentsMapper {
  static toDomain(raw: PrismaAttachment): Attachment {
    return Attachment.create(
      {
        key: raw.key,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    attachment: Attachment,
  ): Prisma.AttachmentUncheckedCreateInput {
    return {
      id: attachment.id.toString(),
      key: attachment.key,
    }
  }
}
