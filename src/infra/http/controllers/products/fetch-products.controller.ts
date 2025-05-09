import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'
import { z } from 'zod'

import { FetchProductsUseCase } from '@/domain/marketplace/products/application/use-cases/fetch-products'
import { ZodValidationPipe } from '../../pipes/zod-validation'
import { ProductsPresenter } from '../../presenters/products'

export const fetchProductsQuerySchema = z.object({
  limit: z.coerce.number().default(25),
  page: z.coerce.number().default(1),

  search: z
    .string({
      invalid_type_error:
        'Por favor, forneça o conteúdo da busca dos produtos no formato correto(string)',
    })
    .min(1, 'Por favor, forneça o conteúdo da busca dos produtos')
    .transform((value) => value.trim().toLowerCase())
    .optional(),
  status: z.enum(['available', 'cancelled', 'sold']).optional(),
})

export type FetchProductsQueryParams = z.infer<typeof fetchProductsQuerySchema>

@ApiTags('Products')
@ApiSecurity('auth')
@Controller('/products')
export class FetchProductsController {
  constructor(private fetchProductsUseCase: FetchProductsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch products',
    description: 'This endpoint list products.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 25)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Content to filter products by title or description',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description: 'Status to filter products (available, cancelled, or sold)',
  })
  @ApiResponse({
    status: 200,
    description: 'Products successfully found',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
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
          description: 'Array of products',
        },
        total: {
          type: 'number',
          description: 'Total number of items',
        },
        next: {
          type: 'number',
          description: 'Next page number',
          nullable: true,
        },
        prev: {
          type: 'number',
          description: 'Previous page number',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async handle(
    @Query(new ZodValidationPipe(fetchProductsQuerySchema))
    query: FetchProductsQueryParams,
  ) {
    const result = await this.fetchProductsUseCase.execute({
      filterParams: {
        search: query.search,
        status: query.status,
      },
      paginationParams: { page: query.page, limit: query.limit },
    })

    if (result.isLeft()) {
      throw new InternalServerErrorException(
        'Erro ao listar os produtos, tente novamente mais tarde!',
      )
    }

    return {
      ...result.value,
      products: result.value.items.map((item) =>
        ProductsPresenter.toHTTP(item),
      ),
    }
  }
}
