import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  View,
  ViewProps,
} from '@/domain/marketplace/products/enterprise/entities/view'
import { PrismaViewsMapper } from '@/infra/database/prisma/mappers/views'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

export const makeView = (
  overrides: Partial<ViewProps>,
  id?: UniqueEntityId,
) => {
  return View.create(
    {
      productId: new UniqueEntityId(),
      viewerId: new UniqueEntityId(),
      ...overrides,
    },
    id,
  )
}

@Injectable()
export class ViewFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaView(override: Partial<ViewProps> = {}) {
    const view = makeView({
      ...override,
    })

    const data = PrismaViewsMapper.toPrisma(view)

    await this.prisma.view.create({
      data,
    })

    return view
  }
}
