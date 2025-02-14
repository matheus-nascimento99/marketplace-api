import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { View } from '@/domain/marketplace/products/enterprise/entities/view'
import { ViewWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/view-with-details'
import { PrismaService } from '../prisma.service'
import { PrismaViewsMapper } from '../mappers/views'
import { BadRequestException, Injectable } from '@nestjs/common'
import { startOfDay, subDays } from 'date-fns'

@Injectable()
export class PrismaViewsRepository implements ViewsRepository {
  constructor(private prisma: PrismaService) {}

  async create(view: View): Promise<ViewWithDetails> {
    const data = PrismaViewsMapper.toPrisma(view)

    await this.prisma.view.create({
      data,
    })

    const viewWithDetails = await this.findByIdWithDetails(view.id)

    if (!viewWithDetails) {
      throw new BadRequestException(
        'Visualização com os detalhes não foi encontrada',
      )
    }

    return viewWithDetails
  }

  async findByIdWithDetails(
    viewId: UniqueEntityId,
  ): Promise<ViewWithDetails | null> {
    const view = await this.prisma.view.findUnique({
      where: { id: viewId.toString() },
      include: {
        product: {
          include: {
            category: true,
            attachments: true,
            user: {
              include: {
                avatar: true,
              },
            },
          },
        },
        user: {
          include: {
            avatar: true,
          },
        },
      },
    })

    if (!view) {
      return null
    }

    return PrismaViewsMapper.toDomainWithDetails(view)
  }

  async findByViewerIdAndProductId(
    viewerId: UniqueEntityId,
    productId: UniqueEntityId,
  ): Promise<View | null> {
    const view = await this.prisma.view.findUnique({
      where: {
        userId_productId: {
          userId: viewerId.toString(),
          productId: productId.toString(),
        },
      },
    })

    if (!view) {
      return null
    }

    return PrismaViewsMapper.toDomain(view)
  }

  async countBySellerIdInMonth(sellerId: UniqueEntityId): Promise<number> {
    const now = new Date()
    const monthAgo = startOfDay(subDays(now, 30))

    const countViews = await this.prisma.view.count({
      where: {
        product: {
          userId: sellerId.toString(),
        },
        createdAt: { not: { lt: monthAgo } },
      },
    })

    return countViews
  }

  async countByProductIdInWeek(productId: UniqueEntityId): Promise<number> {
    const now = new Date()
    const weekAgo = startOfDay(subDays(now, 7))

    const countViews = await this.prisma.view.count({
      where: {
        productId: productId.toString(),
        createdAt: { not: { lt: weekAgo } },
      },
    })

    return countViews
  }

  async countBySellerIdPerDayInMonth(
    sellerId: UniqueEntityId,
  ): Promise<{ date: Date; amount: number }[]> {
    const now = new Date()
    const monthAgo = startOfDay(subDays(now, 30))

    // Busca todas as visualizações do vendedor no último mês
    const views = await this.prisma.view.groupBy({
      by: ['createdAt'],
      where: {
        product: {
          user: {
            id: sellerId.toString(),
          },
        },
        createdAt: {
          gte: monthAgo,
          lte: now,
        },
      },
      _count: {
        id: true,
      },
    })

    // Cria um array com todos os dias do último mês
    const viewsPerDay: { date: Date; amount: number }[] = Array.from({
      length: 31,
    }).map((_, index) => {
      const date = startOfDay(subDays(now, index))

      // Encontra a contagem para este dia específico
      const dayCount = views.find(
        (view) => startOfDay(view.createdAt).getTime() === date.getTime(),
      )

      return {
        date,
        amount: dayCount?._count?.id ?? 0,
      }
    })

    return viewsPerDay
  }
}
