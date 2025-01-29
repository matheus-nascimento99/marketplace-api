import { Either, left, right } from '@/core/either'
import { InvalidAttachmentSizeError } from './errors/invalid-attachment-size'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'
import { Attachment } from '../../enterprise/entities/attachment'

import { StorageUploader } from '@/core/storage/storage-uploader'
import { AttachmentsRepository } from '../repositories/attachments'
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_IN_BYTES,
} from '@/core/storage/storage-file-size'
import { Injectable } from '@nestjs/common'

export type SaveAttachmentsUseCaseRequest = {
  attachments: {
    body: Buffer
    size: number
    mimeType: string
    filename: string
  }[]
}

export type SaveAttachmentsUseCaseResponse = Either<
  InvalidAttachmentSizeError | InvalidAttachmentTypeError,
  {
    attachments: Attachment[]
  }
>

@Injectable()
export class SaveAttachmentsUseCase {
  constructor(
    private attachmentsRepository: AttachmentsRepository,
    private storageUploader: StorageUploader,
  ) {}

  async execute({
    attachments,
  }: SaveAttachmentsUseCaseRequest): Promise<SaveAttachmentsUseCaseResponse> {
    const invalidsAttachmentsMimeTypes = attachments.filter(
      (attachment) => !/^image\/(jpeg|png|jpg)$/.test(attachment.mimeType),
    )

    const invalidsAttachmentsSizes = attachments.filter(
      (attachment) => attachment.size > MAX_FILE_SIZE_IN_BYTES,
    )

    if (invalidsAttachmentsMimeTypes.length > 0) {
      return left(
        new InvalidAttachmentTypeError(
          invalidsAttachmentsMimeTypes.map(
            (invalidAttachment) => invalidAttachment.filename,
          ),
        ),
      )
    }

    if (invalidsAttachmentsSizes.length > 0) {
      return left(
        new InvalidAttachmentSizeError(
          MAX_FILE_SIZE,
          invalidsAttachmentsSizes.map(
            (invalidAttachment) => invalidAttachment.filename,
          ),
        ),
      )
    }

    const { uploads: newUploads } = await this.storageUploader.upload({
      uploads: attachments,
    })

    const newAttachments = newUploads.map((newUpload) =>
      Attachment.create({ key: newUpload.key }),
    )

    await this.attachmentsRepository.createMany(newAttachments)

    return right({ attachments: newAttachments })
  }
}
