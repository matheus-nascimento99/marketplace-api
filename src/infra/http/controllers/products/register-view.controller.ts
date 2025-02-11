import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { RegisterViewUseCase } from '@/domain/marketplace/products/application/use-cases/register-view'

import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ViewsPresenter } from '../../presenters/views'
import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'
import { ViewOwnProductError } from '@/domain/marketplace/products/application/use-cases/errors/view-own-product'
import { DuplicateViewError } from '@/domain/marketplace/products/application/use-cases/errors/duplicate-view'

@ApiTags('Views')
@Controller('/products/:product_id/views')
export class RegisterViewController {
  constructor(private registerViewUseCase: RegisterViewUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register view' })
  @ApiParam({
    name: 'product_id',
    required: true,
    description: 'ID of the product to register view',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'View successfully registered',
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
        viewer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: "Viewer's unique identifier",
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: "Viewer's full name",
              example: 'John Smith',
            },
            phone: {
              type: 'string',
              description: "Viewer's phone number",
              example: '11999999999',
            },
            email: {
              type: 'string',
              description: "Viewer's email address",
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
    description: 'Invalid input data, product, or viewer not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'View in own product, or duplicate view',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('product_id') productId: string,
  ) {
    const result = await this.registerViewUseCase.execute({
      productId,
      viewerId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        case ViewOwnProductError:
        case DuplicateViewError:
          throw new ForbiddenException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao registerar visualização ao produto, tente novamente mais tarde!',
          )
      }
    }

    return ViewsPresenter.toHTTP(result.value.view)
  }
}
