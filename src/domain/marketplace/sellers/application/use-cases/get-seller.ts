import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { SellersRepository } from '../repositories/sellers'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { SellerWithDetails } from '../../enterprise/value-objects/seller-with-details'

export type GetSellerUseCaseRequest = {
  sellerId: string
}

export type GetSellerUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    seller: SellerWithDetails
  }
>

@Injectable()
export class GetSellerUseCase {
  constructor(private sellersRepository: SellersRepository) {}

  async execute({
    sellerId,
  }: GetSellerUseCaseRequest): Promise<GetSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findByIdWithDetails(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    return right({ seller })
  }
}
