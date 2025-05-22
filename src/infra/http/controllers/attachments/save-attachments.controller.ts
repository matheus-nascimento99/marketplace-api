import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Public } from '@/auth/public'
import { SaveAttachmentsUseCase } from '@/domain/marketplace/attachments/application/use-cases/save-attachments'
import { FilesInterceptor } from '@nestjs/platform-express'
import { InvalidAttachmentSizeError } from '@/domain/marketplace/attachments/application/use-cases/errors/invalid-attachment-size'
import { InvalidAttachmentTypeError } from '@/domain/marketplace/attachments/application/use-cases/errors/invalid-attachment-type'
import { generateAttachmentUrl } from '@/utils/generate-attachment-url'

@ApiTags('Attachments')
@Controller('/attachments')
export class SaveAttachmentsController {
  constructor(private saveAttachmentsUseCase: SaveAttachmentsUseCase) {}

  @Post()
  @Public()
  @UseInterceptors(FilesInterceptor('files'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save new attachments' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Array of image files (JPG, PNG, JPEG). Max 5MB per file.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attachments successfully saved',
    schema: {
      properties: {
        attachments: {
          type: 'array',
          items: {
            type: 'object',
            description: 'Array of attachments',
            properties: {
              id: {
                type: 'string',
                description: "Attachments's unique identifier",
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              url: {
                type: 'string',
                description: "Attachments's url",
                example: 'http://localhost:3000/attachment-url.png',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid mimetype, or size gratter than acceptable',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    const result = await this.saveAttachmentsUseCase.execute({
      attachments: files.map((file) => ({
        body: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      })),
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case InvalidAttachmentSizeError:
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao cadastrar imagens, tente novamente mais tarde!',
          )
      }
    }

    return {
      attachments: result.value.attachments.map((attachment) => ({
        id: attachment.id.toString(),
        url: generateAttachmentUrl(attachment.key),
      })),
    }
  }
}
