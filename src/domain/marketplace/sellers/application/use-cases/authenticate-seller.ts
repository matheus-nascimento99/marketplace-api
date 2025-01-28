import { Either, left, right } from '@/core/either'
import { SellersRepository } from '../repositories/sellers'
import { Injectable } from '@nestjs/common'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials'
import { HashComparer } from '@/core/hash/hash-comparer'
import { Cryptographer } from '@/core/cryptography/cryptographer'

export type AuthenticateSellerUseCaseRequest = {
  email: string
  password: string
}

export type AuthenticateSellerUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string
  }
>

@Injectable()
export class AuthenticateSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private hashComparer: HashComparer,
    private cryptographer: Cryptographer,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSellerUseCaseRequest): Promise<AuthenticateSellerUseCaseResponse> {
    const sellerByEmail = await this.sellersRepository.findByEmail(email)

    if (!sellerByEmail) return left(new InvalidCredentialsError())

    const isPasswordEquals = await this.hashComparer.compare(
      password,
      sellerByEmail.password,
    )

    if (!isPasswordEquals) return left(new InvalidCredentialsError())

    const accessToken = await this.cryptographer.encrypt({
      sub: sellerByEmail.id.toString(),
    })

    return right({ accessToken })
  }
}
