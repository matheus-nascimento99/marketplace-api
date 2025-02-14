import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { GetViewsAmountInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-views-amount-in-month'

import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Metrics')
@Controller('/sellers/metrics/views')
export class GetViewsAmountInMonthController {
  constructor(
    private getViewsAmountInMonthUseCase: GetViewsAmountInMonthUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get views amount in month' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ' views amount in month successfully found',
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
    const result = await this.getViewsAmountInMonthUseCase.execute({
      sellerId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao selecionar as visualizações no último mês, tente novamente mais tarde!',
          )
      }
    }

    return result.value
  }
}
