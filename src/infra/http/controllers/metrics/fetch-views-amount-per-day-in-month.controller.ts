import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { FetchViewsAmountPerDayInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/fetch-views-amount-per-day-in-month'

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
@Controller('/sellers/metrics/views/days')
export class FetchViewsAmountPerDayInMonthController {
  constructor(
    private fetchViewsAmountPerDayInMonthUseCase: FetchViewsAmountPerDayInMonthUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch views amount per day in month' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Views amount per day in month successfully found',
    schema: {
      properties: {
        viewsPerDay: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                format: 'date-time',
                description: 'Day for counting views',
              },
              amount: {
                type: 'number',
                description: 'Views amount in day',
              },
            },
          },
          description: 'Views per day amount array',
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
    const result = await this.fetchViewsAmountPerDayInMonthUseCase.execute({
      sellerId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new InternalServerErrorException(
            'Erro ao selecionar as visualizações por dia no último mês, tente novamente mais tarde!',
          )
      }
    }

    return result.value
  }
}
