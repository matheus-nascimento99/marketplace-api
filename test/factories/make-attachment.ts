import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  Attachment,
  AttachmentProps,
} from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { PrismaAttachmentsMapper } from '@/infra/database/prisma/mappers/attachments'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export const makeAttachment = (
  overrides: Partial<AttachmentProps>,
  id?: UniqueEntityId,
) => {
  return Attachment.create(
    {
      key:
        faker.string.uuid() +
        faker.helpers.arrayElement(['.png', '.jpg', '.jpeg']),
      ...overrides,
    },
    id,
  )
}

@Injectable()
export class AttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAttachment(override: Partial<AttachmentProps> = {}) {
    const attachment = makeAttachment({
      ...override,
    })

    const data = PrismaAttachmentsMapper.toPrisma(attachment)

    await this.prisma.attachment.create({
      data,
    })

    return attachment
  }
}
