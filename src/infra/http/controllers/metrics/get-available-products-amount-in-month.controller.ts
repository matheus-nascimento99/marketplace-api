import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { GetAvailableProductsAmountInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-available-products-amount-in-month'

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
@Controller('/sellers/metrics/products/available')
export class GetAvailableProductsAmountInMonthController {
  constructor(
    private getAvailableProductsAmountInMonthUseCase: GetAvailableProductsAmountInMonthUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get available products amount in month' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available products amount in month successfully found',
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
    const result = await this.getAvailableProductsAmountInMonthUseCase.execute({
      sellerId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao selecionar os produtos disponíveis no último mês, tente novamente mais tarde!',
          )
      }
    }

    return result.value
  }
}
