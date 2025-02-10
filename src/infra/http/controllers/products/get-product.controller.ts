import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { GetProductUseCase } from '@/domain/marketplace/products/application/use-cases/get-product'

import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ProductsPresenter } from '../../presenters/products'

@ApiTags('Products')
@Controller('/products/:product_id')
export class GetProductController {
  constructor(private getProductUseCase: GetProductUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product' })
  @ApiParam({
    name: 'product_id',
    required: true,
    description: 'ID of the product to get',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product successfully geted',
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
                  description: 'Seller ID',
                  example: '123e4567-e89b-12d3-a456-426614174001',
                },
                name: {
                  type: 'string',
                  description: 'Seller name',
                  example: 'John Doe',
                },
                phone: {
                  type: 'string',
                  description: 'Seller phone number',
                  example: '+5511999999999',
                },
                email: {
                  type: 'string',
                  description: 'Seller email',
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
    description: 'Invalid input data, or product not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(@Param('product_id') productId: string) {
    const result = await this.getProductUseCase.execute({
      productId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao selecionar produto, tente novamente mais tarde!',
          )
      }
    }

    return {
      product: ProductsPresenter.toHTTP(result.value.product),
    }
  }
}
