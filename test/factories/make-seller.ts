import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import {
  Seller,
  SellerProps,
} from '@/domain/marketplace/sellers/enterprise/entities/seller'
import { PrismaSellersMapper } from '@/infra/database/prisma/mappers/sellers'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { DEFAULT_PASSWORD } from '@/utils/default-password'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'

export const makeSeller = (
  overrides: Partial<SellerProps>,
  id?: UniqueEntityId,
) => {
  return Seller.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phone: Raw.createFromText(faker.phone.number()),
      ...overrides,
    },
    id,
  )
}

@Injectable()
export class SellerFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaSeller(override: Partial<SellerProps> = {}) {
    const seller = makeSeller({
      ...override,
      password: await hash(override.password ?? DEFAULT_PASSWORD, 8),
    })

    const data = PrismaSellersMapper.toPrisma(seller)

    await this.prisma.user.create({
      data,
    })

    return seller
  }
}
