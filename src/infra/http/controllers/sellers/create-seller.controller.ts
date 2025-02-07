import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { CreateSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/create-seller'
import { SellerWithEmailAlreadyExists } from '@/domain/marketplace/sellers/application/use-cases/errors/seller-with-email-already-exists'
import { SellerWithPhoneAlreadyExists } from '@/domain/marketplace/sellers/application/use-cases/errors/seller-with-phone-already-exists'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation'
import { harden } from '@/utils/harden'
import { capitalize } from '@/utils/capitalize'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SellersPresenter } from '../../presenters/sellers'
import { Public } from '@/auth/public'

const createSellerSchema = z
  .object({
    name: z
      .string({
        invalid_type_error:
          'Por favor, forneça o nome do vendedor no formato correto(string)',
      })
      .min(1, 'Por favor, forneça o nome do vendedor')
      .refine((value) => value.split(' ').length > 1, {
        message: 'Por favor, forneça o nome completo do vendedor',
      })
      .transform((value) => capitalize(value)),
    email: z
      .string({
        invalid_type_error:
          'Por favor, forneça o e-mail do vendedor no formato correto(string)',
      })
      .email('Por favor, forneça um e-mail válido do vendedor')
      .transform((value) => value.toLowerCase()),
    phone: z
      .string({
        invalid_type_error:
          'Por favor, forneça o telefone do vendedor no formato correto(string)',
        required_error: 'Por favor, forneça o telefone do vendedor',
      })
      .refine((value) => {
        const digits = value.replace(/\D/g, '')
        return digits.length >= 10 && digits.length <= 11
      }, 'Por favor, forneça um telefone válido do vendedor com 10 ou 11 dígitos')
      .transform((value) => harden(value)),
    password: z
      .string({
        invalid_type_error:
          'Por favor, forneça uma senha para o vendedor no formato correto(string)',
      })
      .min(
        8,
        'Por favor, forneça uma senha para o vendedor de no mínimo 8 caracteres',
      ),
    passwordConfirmation: z
      .string({
        invalid_type_error:
          'Por favor, forneça a confirmação de senha no formato correto(string)',
      })
      .min(
        8,
        'Por favor, forneça a confirmação de senha de no mínimo 8 caracteres',
      ),
    avatarId: z
      .string({
        invalid_type_error:
          'Por favor, forneça um avatar no formato correto(string - UUID)',
      })
      .uuid('Por favor, forneça um avatar válido')
      .nullable(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não são iguais',
    path: ['passwordConfirmation'],
  })

type CreateSellerSchema = z.infer<typeof createSellerSchema>

@ApiTags('Sellers')
@Controller('/sellers')
export class CreateSellerController {
  constructor(private createSellerUseCase: CreateSellerUseCase) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new seller' })
  @ApiBody({
    description: 'Seller registration data',
    examples: {
      seller: {
        summary: 'Example of seller creation',
        description: 'Required information to create a new seller',
        value: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '11999999999',
          password: 'password123@',
          passwordConfirmation: 'password123@',
          avatarId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
    schema: {
      type: 'object',
      required: ['name', 'email', 'phone', 'password', 'passwordConfirmation'],
      properties: {
        name: {
          type: 'string',
          description: "Seller's full name",
          minLength: 1,
          example: 'John Smith',
        },
        email: {
          type: 'string',
          description: "Seller's email address",
          format: 'email',
          example: 'john.smith@example.com',
        },
        phone: {
          type: 'string',
          description: "Seller's phone number",
          minLength: 10,
          maxLength: 11,
          example: '11999999999',
        },
        password: {
          type: 'string',
          description: "Seller's password",
          format: 'password',
          minLength: 8,
          example: 'password123@',
        },
        passwordConfirmation: {
          type: 'string',
          description: 'Password confirmation',
          format: 'password',
          minLength: 8,
          example: 'password123@',
        },
        avatarId: {
          type: 'string',
          description: "Seller's avatar ID (UUID)",
          format: 'uuid',
          nullable: true,
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Seller successfully created',
    schema: {
      properties: {
        seller: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: "Seller's unique identifier",
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: "Seller's full name",
              example: 'John Smith',
            },
            phone: {
              type: 'string',
              description: "Seller's phone number",
              example: '11999999999',
            },
            email: {
              type: 'string',
              description: "Seller's email address",
              example: 'john.smith@example.com',
            },
            avatar: {
              type: 'object',
              nullable: true,
              properties: {
                id: {
                  type: 'string',
                  description: "Avatar's unique identifier",
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                url: {
                  type: 'string',
                  description: "Avatar's URL",
                  example:
                    'https://example.com/attachments/avatars/123e4567-e89b-12d3-a456-426614174000',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data, or avatar not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'E-mail/phone already exists',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(
    @Body(new ZodValidationPipe(createSellerSchema)) body: CreateSellerSchema,
  ) {
    const result = await this.createSellerUseCase.execute(body)

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        case SellerWithEmailAlreadyExists:
        case SellerWithPhoneAlreadyExists:
          throw new ConflictException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao cadastrar vendedor, tente novamente mais tarde!',
          )
      }
    }

    return {
      seller: SellersPresenter.toHTTP(result.value.seller),
    }
  }
}
