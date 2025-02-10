import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { GetSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/get-seller'

import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SellersPresenter } from '../../presenters/sellers'
import { CurrentUser } from '@/auth/current-user'
import { UserPayload } from '@/auth/jwt.strategy'

@ApiTags('Sellers')
@Controller('/sellers/me')
export class GetSellerController {
  constructor(private getSellerUseCase: GetSellerUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get seller' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Seller successfully found',
    schema: {
      properties: {
        seller: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: "Seller's unique identifier",
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: "Seller's full name",
              example: 'John Smith',
            },
            phone: {
              type: 'string',
              description: "Seller's phone number",
              example: '11999999999',
            },
            email: {
              type: 'string',
              description: "Seller's email address",
              example: 'john.smith@example.com',
            },
            avatar: {
              type: 'object',
              nullable: true,
              properties: {
                id: {
                  type: 'string',
                  description: "Avatar's unique identifier",
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                url: {
                  type: 'string',
                  description: "Avatar's URL",
                  example:
                    'https://example.com/attachments/avatars/123e4567-e89b-12d3-a456-426614174000',
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
    description: 'Invalid input data, or seller not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.getSellerUseCase.execute({
      sellerId: user.sub,
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
      seller: SellersPresenter.toHTTP(result.value.seller),
    }
  }
}
