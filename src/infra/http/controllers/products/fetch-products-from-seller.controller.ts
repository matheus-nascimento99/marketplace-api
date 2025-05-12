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

import { FetchProductsFromSellerUseCase } from '@/domain/marketplace/products/application/use-cases/fetch-products-from-seller'
import { ZodValidationPipe } from '../../pipes/zod-validation'
import { ProductsPresenter } from '../../presenters/products'
import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'

export const fetchProductsFromSellerQuerySchema = z
  .object({
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
    initial_price: z.coerce
      .number({
        invalid_type_error:
          'Por favor, forneça o preço inicial do produto no formato correto(number)',
      })
      .optional(),
    final_price: z.coerce
      .number({
        invalid_type_error:
          'Por favor, forneça o preço final do produto no formato correto(number)',
      })
      .optional(),
    category_id: z
      .string({
        invalid_type_error:
          'Por favor, forneça uma categoria no formato correto(string - UUID)',
      })
      .uuid('Por favor, forneça uma categoria válida')
      .optional(),
  })
  .refine(
    (data) =>
      (!data.initial_price && !data.final_price) ||
      (data.initial_price && data.final_price) ||
      data.final_price,
    {
      message: 'Por favor, informe o preço final',
      path: ['final_price'],
    },
  )

export type FetchProductsFromSellerQueryParams = z.infer<
  typeof fetchProductsFromSellerQuerySchema
>

@ApiTags('Products')
@ApiSecurity('auth')
@Controller('/products')
export class FetchProductsFromSellerController {
  constructor(
    private fetchProductsFromSellerUseCase: FetchProductsFromSellerUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Fetch products from seller',
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
  @ApiQuery({
    name: 'initial_price',
    required: false,
    type: 'string',
    description: 'Initial price to filter products',
  })
  @ApiQuery({
    name: 'final_price',
    required: false,
    type: 'string',
    description:
      'Final price to filter products (MANDATORY if initial_price provided)',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: 'string',
    description: 'Category id to filter products',
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
    description: 'Bad request - Invalid input data, or seller not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async handle(
    @Query(new ZodValidationPipe(fetchProductsFromSellerQuerySchema))
    query: FetchProductsFromSellerQueryParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.fetchProductsFromSellerUseCase.execute({
      sellerId: user.sub,
      filterParams: {
        search: query.search,
        status: query.status,
        categoryId: query.category_id,
        finalPrice: query.final_price,
        initialPrice: query.initial_price,
      },
      paginationParams: { page: query.page, limit: query.limit },
    })

    if (result.isLeft()) {
      throw new InternalServerErrorException(
        'Erro ao listar os produtos do vendedor, tente novamente mais tarde!',
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
