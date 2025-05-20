import { InvalidCredentialsError } from '@/core/errors/invalid-credentials'
import { AuthenticateSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/authenticate-seller'
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation'
import { Public } from '@/auth/public'
import { Response } from 'express'

const authenticateSellerSchema = z.object({
  email: z
    .string({
      invalid_type_error:
        'Por favor, forneça o e-mail no formato correto(string)',
    })
    .email('Por favor, forneça um e-mail válido')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({
      invalid_type_error:
        'Por favor, forneça a senha no formato correto(string)',
    })
    .min(1, 'Por favor, forneça a senha'),
})

type AuthenticateSellerSchema = z.infer<typeof authenticateSellerSchema>

@ApiTags('Sessions')
@Controller('/sellers/sessions')
export class AuthenticateSellerController {
  constructor(private authenticateSellerUseCase: AuthenticateSellerUseCase) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Authenticate new seller' })
  @ApiBody({
    description: 'Seller authentication data',
    examples: {
      seller: {
        summary: 'Example of seller authentication',
        description: 'Required information to authenticate a new seller',
        value: {
          email: 'john.smith@example.com',
          password: 'password123@',
        },
      },
    },
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          description: "Seller's email address",
          format: 'email',
          example: 'john.smith@example.com',
        },
        password: {
          type: 'string',
          description: "Seller's password",
          format: 'password',
          example: 'password123@',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Seller successfully authenticated',
    schema: {
      properties: {
        accessToken: {
          type: 'string',
          description: "Seller's access token",
          example: 'ey933872jkfsdj43920s35f...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User by email/password not found, or invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(
    @Body(new ZodValidationPipe(authenticateSellerSchema))
    body: AuthenticateSellerSchema,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authenticateSellerUseCase.execute(body)

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException({
            message: error.message,
            must_logout: false,
          })
        default:
          throw new InternalServerErrorException(
            'Erro ao logar, tente novamente mais tarde!',
          )
      }
    }

    response.cookie('auth', result.value.accessToken, {
      httpOnly: true, // Previne acesso via JavaScript no cliente
      secure: process.env.NODE_ENV === 'production', // true em produção, false em desenvolvimento
      sameSite: 'strict', // Protege contra ataques CSRF
      maxAge: 24 * 60 * 60 * 1000, // Duração em millisegundos (exemplo: 24 horas)
      path: '/', // Caminho onde o cookie está disponível
    })

    return {
      accessToken: result.value.accessToken,
    }
  }
}
