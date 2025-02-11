import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { EditProductUseCase } from '@/domain/marketplace/products/application/use-cases/edit-product'

import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Put,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation'
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ProductsPresenter } from '../../presenters/products'
import { UpdateSoldProductError } from '@/domain/marketplace/products/application/use-cases/errors/update-sold-product'
import { UpdateAnotherSellerProductError } from '@/domain/marketplace/products/application/use-cases/errors/update-another-seller-product'
import { capitalize } from '@/utils/capitalize'
import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'

const editProductSchema = z.object({
  title: z
    .string({
      invalid_type_error:
        'Por favor, forneça o titulo do produto no formato correto(string)',
    })
    .min(1, 'Por favor, forneça o titulo do produto')
    .transform((value) => capitalize(value)),
  categoryId: z
    .string({
      invalid_type_error:
        'Por favor, forneça uma categoria no formato correto(string - UUID)',
    })
    .uuid('Por favor, forneça uma categoria válida'),
  description: z
    .string({
      invalid_type_error:
        'Por favor, forneça a descrição do produto no formato correto(string)',
    })
    .min(1, 'Por favor, forneça a descrição do produto'),
  priceInCents: z.number({
    invalid_type_error:
      'Por favor, forneça o valor do produto no formato correto(number)',
  }),
  attachmentsIds: z
    .array(
      z
        .string({
          invalid_type_error:
            'Por favor, forneça os IDs das imagens no formato correto(string - UUID)',
        })
        .uuid('Por favor, forneça os IDs das imagens válidos'),
    )
    .min(1, 'Por favor, forneça no mínimo 1 imagem do produto'),
})

type EditProductSchema = z.infer<typeof editProductSchema>

@ApiTags('Products')
@Controller('/products/:product_id')
export class EditProductController {
  constructor(private editProductUseCase: EditProductUseCase) {}

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit product' })
  @ApiParam({
    name: 'product_id',
    required: true,
    description: 'ID of the product to edit',
    schema: { type: 'string' },
  })
  @ApiBody({
    description: 'Edit product data',
    examples: {
      product: {
        summary: 'Example of product edition',
        description: 'Required information to edit a product',
        value: {
          title: 'Smartphone Galaxy S21',
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Smartphone Samsung Galaxy S21 128GB 5G',
          priceInCents: 399900,
          attachmentsIds: [
            '123e4567-e89b-12d3-a456-426614174001',
            '123e4567-e89b-12d3-a456-426614174002',
          ],
        },
      },
    },
    schema: {
      type: 'object',
      required: [
        'title',
        'categoryId',
        'description',
        'priceInCents',
        'attachmentsIds',
      ],
      properties: {
        title: {
          type: 'string',
          description: 'Product title',
          example: 'Smartphone Galaxy S21',
          minLength: 1,
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
          description: 'Category ID (UUID format)',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        description: {
          type: 'string',
          description: 'Product description',
          example: 'Smartphone Samsung Galaxy S21 128GB 5G',
          minLength: 1,
        },
        priceInCents: {
          type: 'number',
          description: 'Product price in cents',
          example: 399900,
        },
        attachmentsIds: {
          type: 'array',
          description: 'Array of attachment IDs (images)',
          minItems: 1,
          items: {
            type: 'string',
            format: 'uuid',
            description: 'Attachment ID (UUID format)',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product successfully edited',
    schema: {
      properties: {
        product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Product ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              description: 'Product title',
              example: 'Smartphone Galaxy S21',
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'Smartphone Samsung Galaxy S21 128GB 5G',
            },
            priceInCents: {
              type: 'number',
              description: 'Product price in cents',
              example: 399900,
            },
            status: {
              type: 'string',
              description: 'Product status',
              example: 'ACTIVE',
            },
            owner: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Owner ID',
                  example: '123e4567-e89b-12d3-a456-426614174001',
                },
                name: {
                  type: 'string',
                  description: 'Owner name',
                  example: 'John Doe',
                },
                phone: {
                  type: 'string',
                  description: 'Owner phone number',
                  example: '+5511999999999',
                },
                email: {
                  type: 'string',
                  description: 'Owner email',
                  example: 'john.doe@example.com',
                },
                avatar: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: {
                      type: 'string',
                      description: 'Avatar image ID',
                      example: '123e4567-e89b-12d3-a456-426614174002',
                    },
                    url: {
                      type: 'string',
                      description: 'Avatar image URL',
                      example: 'https://example.com/attachments/avatar.jpg',
                    },
                  },
                },
              },
            },
            category: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Category ID',
                  example: '123e4567-e89b-12d3-a456-426614174003',
                },
                title: {
                  type: 'string',
                  description: 'Category title',
                  example: 'Electronics',
                },
                slug: {
                  type: 'string',
                  description: 'Category URL slug',
                  example: 'electronics',
                },
              },
            },
            attachments: {
              type: 'array',
              description: 'Product images',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Image ID',
                    example: '123e4567-e89b-12d3-a456-426614174004',
                  },
                  url: {
                    type: 'string',
                    description: 'Image URL',
                    example: 'https://example.com/attachments/product.jpg',
                  },
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
    description:
      'Invalid input data, product, seller, category, or attachments not found, or product already sold',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Product belongs to another seller',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(
    @Body(new ZodValidationPipe(editProductSchema)) body: EditProductSchema,
    @CurrentUser() user: UserPayload,
    @Param('product_id') productId: string,
  ) {
    const result = await this.editProductUseCase.execute({
      productId,
      sellerId: user.sub,
      ...body,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        case UpdateAnotherSellerProductError:
        case UpdateSoldProductError:
          throw new ForbiddenException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao editar produto, tente novamente mais tarde!',
          )
      }
    }

    return {
      product: ProductsPresenter.toHTTP(result.value.product),
    }
  }
}
