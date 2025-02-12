import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { Injectable } from '@nestjs/common'

export type GetViewsAmountInMonthUseCaseRequest = {
  sellerId: string
}

export type GetViewsAmountInMonthUseCaseResponse = Either<
  ResourceNotFoundError,
  { amount: number }
>

@Injectable()
export class GetViewsAmountInMonthUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    sellerId,
  }: GetViewsAmountInMonthUseCaseRequest): Promise<GetViewsAmountInMonthUseCaseResponse> {
    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    const viewsAmount = await this.viewsRepository.countBySellerIdInMonth(
      seller.id,
    )

    return right({
      amount: viewsAmount,
    })
  }
}
