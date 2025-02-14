import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FetchCategoriesUseCase } from '@/domain/marketplace/products/application/use-cases/fetch-categories'
import { CategoriesPresenter } from '../../presenters/categories'

@ApiTags('Categories')
@Controller('/categories')
export class FetchCategoriesController {
  constructor(private fetchCategoriesUseCase: FetchCategoriesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Fetch categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories successfully found',
    schema: {
      properties: {
        categories: {
          type: 'array',
          description: 'Array of categories',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: "Categories's unique identifier",
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: {
                type: 'string',
                description: "Categories's title",
                example: 'House and Bath',
              },
              slug: {
                type: 'string',
                description: "Categories's slug",
                example: 'house-and-bath',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle() {
    const result = await this.fetchCategoriesUseCase.execute()

    if (result.isLeft()) {
      throw new InternalServerErrorException(
        'Erro ao listar categorias, tente novamente mais tarde!',
      )
    }

    return {
      categories: result.value.categories.map((category) =>
        CategoriesPresenter.toHTTP(category),
      ),
    }
  }
}
