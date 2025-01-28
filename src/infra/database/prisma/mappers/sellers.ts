import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Seller } from '@/domain/marketplace/sellers/enterprise/seller'
import { Prisma, User as PrismaSeller } from '@prisma/client'

export class PrismaSellersMapper {
  static toDomain(raw: PrismaSeller): Seller {
    return Seller.create(
      {
        name: raw.name,
        email: raw.email,
        phone: Raw.create(raw.phone),
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(seller: Seller): Prisma.UserUncheckedCreateInput {
    return {
      id: seller.id.toString(),
      name: seller.name,
      email: seller.email,
      phone: seller.phone.value,
      password: seller.password,
      role: 'SELLER',
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
    }
  }
}
