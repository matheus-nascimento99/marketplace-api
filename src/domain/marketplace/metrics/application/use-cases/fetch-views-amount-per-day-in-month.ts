import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { Injectable } from '@nestjs/common'

export type FetchViewsAmountPerDayInMonthUseCaseRequest = {
  sellerId: string
}

export type FetchViewsAmountPerDayInMonthUseCaseResponse = Either<
  ResourceNotFoundError,
  { viewsPerDay: { date: Date; amount: number }[] }
>

@Injectable()
export class FetchViewsAmountPerDayInMonthUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    sellerId,
  }: FetchViewsAmountPerDayInMonthUseCaseRequest): Promise<FetchViewsAmountPerDayInMonthUseCaseResponse> {
    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    const viewsPerDay = await this.viewsRepository.countBySellerIdPerDayInMonth(
      seller.id,
    )

    return right({
      viewsPerDay,
    })
  }
}
