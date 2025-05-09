import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { GetSoldProductsAmountInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-sold-products-amount-in-month'

import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('Metrics')
@ApiSecurity('auth')
@Controller('/sellers/metrics/products/sold')
export class GetSoldProductsAmountInMonthController {
  constructor(
    private getSoldProductsAmountInMonthUseCase: GetSoldProductsAmountInMonthUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get sold products amount in month' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sold products amount in month successfully found',
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
    description: 'Invalid input data, or seller not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.getSoldProductsAmountInMonthUseCase.execute({
      sellerId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao selecionar os produtos vendidos no último mês, tente novamente mais tarde!',
          )
      }
    }

    return result.value
  }
}
