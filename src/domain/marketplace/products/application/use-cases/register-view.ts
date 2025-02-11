import { Either, left, right } from '@/core/either'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { ProductsRepository } from '../repositories/products'
import { ViewsRepository } from '../repositories/views'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { ViewWithDetails } from '../../enterprise/value-objects/view-with-details'
import { ViewOwnProductError } from './errors/view-own-product'
import { DuplicateViewError } from './errors/duplicate-view'
import { View } from '../../enterprise/entities/view'
import { Injectable } from '@nestjs/common'

export type RegisterViewUseCaseRequest = {
  viewerId: string
  productId: string
}

export type RegisterViewUseCaseResponse = Either<
  ResourceNotFoundError | ViewOwnProductError | DuplicateViewError,
  {
    view: ViewWithDetails
  }
>

@Injectable()
export class RegisterViewUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    viewerId,
    productId,
  }: RegisterViewUseCaseRequest): Promise<RegisterViewUseCaseResponse> {
    const product = await this.productsRepository.findById(
      new UniqueEntityId(productId),
    )

    if (!product) {
      return left(new ResourceNotFoundError('Product', 'ID', productId))
    }

    const viewer = await this.sellersRepository.findById(
      new UniqueEntityId(viewerId),
    )

    if (!viewer) {
      return left(new ResourceNotFoundError('Viewer', 'ID', viewerId))
    }

    if (viewer.id.equals(product.sellerId)) {
      return left(new ViewOwnProductError())
    }

    const viewByViewerAndProduct =
      await this.viewsRepository.findByViewerIdAndProductId(
        viewer.id,
        product.id,
      )

    if (viewByViewerAndProduct) {
      return left(new DuplicateViewError())
    }

    const view = View.create({ productId: product.id, viewerId: viewer.id })

    const viewWithDetails = await this.viewsRepository.create(view)

    return right({
      view: viewWithDetails,
    })
  }
}
