import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'

import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { EnvService } from '@/infra/env/env.service'

const userPayloadSchema = z.object({
  sub: z
    .string({ required_error: 'User ID is required' })
    .uuid('Invalid user ID format, must be a UUID'),
})

export type UserPayload = z.infer<typeof userPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly envService: EnvService,
    private prisma: PrismaService,
  ) {
    super(JwtStrategy.getStrategyOptions(envService))
  }

  private static getStrategyOptions(envService: EnvService) {
    const publicKey = envService.get('JWT_PUBLIC_KEY')
    return {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractJwtFromCookies,
      ]),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
      passReqToCallback: true,
    }
  }

  private static extractJwtFromCookies(req: Request): string | null {
    if (!req.headers.cookie) return null

    const cookies = req.headers.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .reduce(
        (acc, cookie) => {
          const [name, value] = cookie.split('=')
          acc[name] = value
          return acc
        },
        {} as Record<string, string>,
      )

    return cookies.auth || null
  }

  async validate(req: Request, payload: UserPayload) {
    this.handleJwtError(req)

    const tokenDecoded = this.validatePayload(payload)

    await this.validateUser(tokenDecoded.sub)

    return tokenDecoded
  }

  private handleJwtError(req: Request) {
    const jwtError = req.get('x-jwt-error')
    if (jwtError) {
      console.error(
        jwtError === 'jwt expired' ? 'expired token' : 'invalid token',
      )
      throw new UnauthorizedException({
        message: jwtError === 'jwt expired' ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN',
        statusCode: 401,
      })
    }
  }

  private validatePayload(payload: UserPayload) {
    const result = userPayloadSchema.safeParse(payload)
    if (!result.success) {
      console.error(
        'Token validation error',
        result.error.flatten().fieldErrors,
      )
      throw new UnauthorizedException({
        message: 'INVALID_TOKEN',
        statusCode: 401,
      })
    }
    return result.data
  }

  private async validateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      console.error('User from token not found')
      throw new UnauthorizedException({
        message: 'INVALID_TOKEN',
        statusCode: 401,
      })
    }
    return user
  }
}
