import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { View } from '@/domain/marketplace/products/enterprise/entities/view'
import { ViewWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/view-with-details'
import { InMemoryProductsRepository } from './products'
import { InMemorySellersRepository } from './sellers'

export class InMemoryViewsRepository implements ViewsRepository {
  constructor(
    private inMemoryProductsRepository: InMemoryProductsRepository,
    private inMemorySellersRepository: InMemorySellersRepository,
  ) {}

  public items: View[] = []

  async create(view: View): Promise<ViewWithDetails> {
    this.items.push(view)

    const viewWithDetails = await this.findByIdWithDetails(view.id)

    if (!viewWithDetails) {
      throw new Error('View with details not found')
    }

    return viewWithDetails
  }

  async findByIdWithDetails(
    viewId: UniqueEntityId,
  ): Promise<ViewWithDetails | null> {
    const view = this.items.find((item) => item.id.equals(viewId))

    if (!view) {
      return null
    }

    const product = await this.inMemoryProductsRepository.findByIdWithDetails(
      view.productId,
    )

    if (!product) {
      throw new Error('Product with details not found')
    }

    const viewer = await this.inMemorySellersRepository.findByIdWithDetails(
      view.viewerId,
    )

    if (!viewer) {
      throw new Error('Viewer with details not found')
    }

    return ViewWithDetails.create({
      viewId: view.id,
      product,
      viewer,
      createdAt: view.createdAt,
    })
  }

  async findByViewerIdAndProductId(
    viewerId: UniqueEntityId,
    productId: UniqueEntityId,
  ): Promise<View | null> {
    const view = this.items.find(
      (item) =>
        item.viewerId.equals(viewerId) && item.productId.equals(productId),
    )

    if (!view) {
      return null
    }

    return view
  }
}
