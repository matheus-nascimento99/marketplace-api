import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaAttachmentsMapper } from '../mappers/attachments'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(attachments: Attachment[]): Promise<void> {
    const data = attachments.map((attachment) =>
      PrismaAttachmentsMapper.toPrisma(attachment),
    )

    await this.prisma.attachment.createMany({
      data,
    })
  }

  async findById(attachmentId: UniqueEntityId): Promise<Attachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId.toString() },
    })

    if (!attachment) {
      return null
    }

    return PrismaAttachmentsMapper.toDomain(attachment)
  }

  async findManyBetweenIds(
    attachmentIds: UniqueEntityId[],
  ): Promise<{ attachments: Attachment[]; notFoundIds: string[] }> {
    const originalIds = attachmentIds.map((id) => id.toString())

    const prismaAttachments = await this.prisma.attachment.findMany({
      where: {
        id: {
          in: originalIds,
        },
      },
    })

    const foundIds = prismaAttachments.map((attachment) => attachment.id)
    const notFoundIds = originalIds.filter(
      (originalId) => !foundIds.includes(originalId),
    )

    const attachments = prismaAttachments.map((attachment) =>
      PrismaAttachmentsMapper.toDomain(attachment),
    )

    return {
      attachments,
      notFoundIds,
    }
  }

  async findByUserId(userId: UniqueEntityId): Promise<Attachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { userId: userId.toString() },
    })

    if (!attachment) {
      return null
    }

    return PrismaAttachmentsMapper.toDomain(attachment)
  }
}
