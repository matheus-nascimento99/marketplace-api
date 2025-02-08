import { Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'

@ApiTags('Sessions')
@Controller('/sign-out')
export class SignOutSellerController {
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out new seller' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully sign out',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal error',
  })
  async handle(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', { path: '/' }) // Caminho onde o cookie está disponível
  }
}
