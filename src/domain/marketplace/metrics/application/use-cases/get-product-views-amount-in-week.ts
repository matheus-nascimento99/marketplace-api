import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { ProductsRepository } from '@/domain/marketplace/products/application/repositories/products'
import { Injectable } from '@nestjs/common'

export type GetProductViewsAmountInWeekUseCaseRequest = {
  productId: string
}

export type GetProductViewsAmountInWeekUseCaseResponse = Either<
  ResourceNotFoundError,
  { amount: number }
>

@Injectable()
export class GetProductViewsAmountInWeekUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    productId,
  }: GetProductViewsAmountInWeekUseCaseRequest): Promise<GetProductViewsAmountInWeekUseCaseResponse> {
    const product = await this.productsRepository.findById(
      new UniqueEntityId(productId),
    )

    if (!product) {
      return left(new ResourceNotFoundError('Product', 'ID', productId))
    }

    const viewsAmount = await this.viewsRepository.countByProductIdInWeek(
      product.id,
    )

    return right({
      amount: viewsAmount,
    })
  }
}
