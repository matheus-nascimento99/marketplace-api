import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { ProductStatus } from '../../enterprise/entities/product'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'
import { ProductsRepository } from '../repositories/products'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { UpdateAnotherSellerProductError } from './errors/update-another-seller-product'
import { CancelSoldProductError } from './errors/cancel-sold-product'
import { SellCancelledProductError } from './errors/sell-cancelled-product'

export type ChangeProductStatusUseCaseRequest = {
  sellerId: string
  productId: string
  status: ProductStatus
}

export type ChangeProductStatusUseCaseResponse = Either<
  | ResourceNotFoundError
  | UpdateAnotherSellerProductError
  | CancelSoldProductError
  | SellCancelledProductError,
  {
    product: ProductWithDetails
  }
>

@Injectable()
export class ChangeProductStatusUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
  ) {}

  async execute({
    productId,
    sellerId,
    status,
  }: ChangeProductStatusUseCaseRequest): Promise<ChangeProductStatusUseCaseResponse> {
    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    const product = await this.productsRepository.findById(
      new UniqueEntityId(productId),
    )

    if (!product) {
      return left(new ResourceNotFoundError('Product', 'ID', productId))
    }

    if (!product.sellerId.equals(seller.id)) {
      return left(new UpdateAnotherSellerProductError())
    }

    if (status === 'cancelled' && product.status === 'sold') {
      return left(new CancelSoldProductError())
    }

    if (status === 'sold' && product.status === 'cancelled') {
      return left(new SellCancelledProductError())
    }

    product.status = status

    const productWithDetails = await this.productsRepository.save(
      product.id,
      product,
    )

    return right({ product: productWithDetails })
  }
}
