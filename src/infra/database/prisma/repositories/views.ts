import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { View } from '@/domain/marketplace/products/enterprise/entities/view'
import { ViewWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/view-with-details'
import { PrismaService } from '../prisma.service'
import { PrismaViewsMapper } from '../mappers/views'
import { BadRequestException, Injectable } from '@nestjs/common'

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
}
