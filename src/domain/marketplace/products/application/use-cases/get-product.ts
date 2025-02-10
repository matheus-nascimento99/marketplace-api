import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ProductsRepository } from '../repositories/products'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'

export type GetProductUseCaseRequest = {
  productId: string
}

export type GetProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: ProductWithDetails
  }
>

@Injectable()
export class GetProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    productId,
  }: GetProductUseCaseRequest): Promise<GetProductUseCaseResponse> {
    const product = await this.productsRepository.findByIdWithDetails(
      new UniqueEntityId(productId),
    )

    if (!product) {
      return left(new ResourceNotFoundError('Product', 'ID', productId))
    }

    return right({ product })
  }
}
