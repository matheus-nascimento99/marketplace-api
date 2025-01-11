import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaAttachmentsMapper } from '../mappers/attachments'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(attachment: Attachment): Promise<void> {
    const data = PrismaAttachmentsMapper.toPrisma(attachment)

    await this.prisma.attachment.create({
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
}
