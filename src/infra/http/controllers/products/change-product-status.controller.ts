import { ResourceNotFoundError } from '@/core/errors/resource-not-found'

import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'
import { ChangeProductStatusUseCase } from '@/domain/marketplace/products/application/use-cases/change-product-status'
import { ProductStatus } from '@/domain/marketplace/products/enterprise/entities/product'
import { UpdateAnotherSellerProductError } from '@/domain/marketplace/products/application/use-cases/errors/update-another-seller-product'
import { CancelSoldProductError } from '@/domain/marketplace/products/application/use-cases/errors/cancel-sold-product'
import { SellCancelledProductError } from '@/domain/marketplace/products/application/use-cases/errors/sell-cancelled-product'
import { ProductsPresenter } from '../../presenters/products'

@ApiTags('Products')
@Controller('/products/:product_id/:status')
export class ChangeProductStatusController {
  constructor(private changeProductStatusUseCase: ChangeProductStatusUseCase) {}

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change product status' })
  @ApiParam({
    name: 'product_id',
    required: true,
    description: 'ID of the product to change status',
    schema: { type: 'string' },
  })
  @ApiParam({
    name: 'status',
    required: true,
    description: 'Product status to change (available, cancelled, sold)',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product successfully updated',
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
    description: 'Invalid input data, product, or seller not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Product belongs to another seller, already sold to cancel, or already cancelled to sell',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('product_id') productId: string,
    @Param('status') status: ProductStatus,
  ) {
    const result = await this.changeProductStatusUseCase.execute({
      productId,
      sellerId: user.sub,
      status,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        case UpdateAnotherSellerProductError:
        case CancelSoldProductError:
        case SellCancelledProductError:
          throw new ForbiddenException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao alterar o status do produto, tente novamente mais tarde!',
          )
      }
    }

    return {
      product: ProductsPresenter.toHTTP(result.value.product),
    }
  }
}
