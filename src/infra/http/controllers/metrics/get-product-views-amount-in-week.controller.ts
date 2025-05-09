import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { GetProductViewsAmountInWeekUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-product-views-amount-in-week'

import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('Metrics')
@ApiSecurity('auth')
@Controller('/products/:product_id/metrics/views')
export class GetProductViewsAmountInWeekController {
  constructor(
    private getProductViewsAmountInWeekUseCase: GetProductViewsAmountInWeekUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get views amount in week' })
  @ApiParam({
    name: 'product_id',
    required: true,
    description: 'ID of the product to get views in week',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get product views amount in week successfully found',
    schema: {
      properties: {
        amount: {
          type: 'number',
          description: 'Amount found',
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
    const result = await this.getProductViewsAmountInWeekUseCase.execute({
      productId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao selecionar as visualizações do produto na última semana, tente novamente mais tarde!',
          )
      }
    }

    return result.value
  }
}
