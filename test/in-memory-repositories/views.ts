import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { View } from '@/domain/marketplace/products/enterprise/entities/view'
import { ViewWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/view-with-details'
import { InMemoryProductsRepository } from './products'
import { InMemorySellersRepository } from './sellers'
import { isBefore, isEqual, startOfDay, subDays } from 'date-fns'

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
  ): Promise<ViewWithDetails | null> {
    const view = this.items.find(
      (item) =>
        item.viewerId.equals(viewerId) && item.productId.equals(productId),
    )

    if (!view) {
      return null
    }

    const viewWithDetails = await this.findByIdWithDetails(view.id)

    if (!viewWithDetails) {
      throw new Error('View with details not found')
    }

    return viewWithDetails
  }

  async countBySellerIdInMonth(sellerId: UniqueEntityId): Promise<number> {
    const now = new Date()

    const monthAgo = startOfDay(subDays(now, 30))

    const views: ViewWithDetails[] = []

    for (const item of this.items) {
      const viewWithDetails = await this.findByIdWithDetails(item.id)

      if (viewWithDetails) {
        views.push(viewWithDetails)
      }
    }

    const viewsBySellerId = views.filter(
      (view) =>
        view.product.seller.sellerId.equals(sellerId) &&
        !isBefore(view.createdAt, monthAgo),
    )

    const count = viewsBySellerId.length

    return count
  }

  async countByProductIdInWeek(productId: UniqueEntityId): Promise<number> {
    const now = new Date()

    const weekAgo = startOfDay(subDays(now, 7))

    const views: ViewWithDetails[] = []

    for (const item of this.items) {
      const viewWithDetails = await this.findByIdWithDetails(item.id)

      if (viewWithDetails) {
        views.push(viewWithDetails)
      }
    }

    const viewsBySellerId = views.filter(
      (view) =>
        view.product.productId.equals(productId) &&
        !isBefore(view.createdAt, weekAgo),
    )

    const count = viewsBySellerId.length

    return count
  }

  async countBySellerIdPerDayInMonth(
    sellerId: UniqueEntityId,
  ): Promise<{ date: Date; amount: number }[]> {
    const now = new Date()

    const monthAgo = startOfDay(subDays(now, 30))

    const views: ViewWithDetails[] = []

    for (const item of this.items) {
      const viewWithDetails = await this.findByIdWithDetails(item.id)

      if (viewWithDetails) {
        views.push(viewWithDetails)
      }
    }

    const viewsSorteredAndFiltered = views
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .filter(
        (view) =>
          view.product.seller.sellerId.equals(sellerId) &&
          !isBefore(view.createdAt, monthAgo),
      )

    const viewsPerDay: { date: Date; amount: number }[] = Array.from({
      length: 31,
    }).map((_, index) => {
      const date = startOfDay(subDays(now, index))

      const views = viewsSorteredAndFiltered.filter((viewSorteredAndFiltered) =>
        isEqual(startOfDay(viewSorteredAndFiltered.createdAt), date),
      )

      return { date, amount: views.length }
    })

    return viewsPerDay
  }
}
