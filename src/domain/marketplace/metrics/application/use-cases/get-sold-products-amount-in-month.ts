import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductsRepository } from '@/domain/marketplace/products/application/repositories/products'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { Injectable } from '@nestjs/common'

export type GetSoldProductsAmountInMonthUseCaseRequest = {
  sellerId: string
}

export type GetSoldProductsAmountInMonthUseCaseResponse = Either<
  ResourceNotFoundError,
  { amount: number }
>

@Injectable()
export class GetSoldProductsAmountInMonthUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    sellerId,
  }: GetSoldProductsAmountInMonthUseCaseRequest): Promise<GetSoldProductsAmountInMonthUseCaseResponse> {
    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    const soldProductsAmount =
      await this.productsRepository.countSoldBySellerIdInMonth(seller.id)

    return right({
      amount: soldProductsAmount,
    })
  }
}
