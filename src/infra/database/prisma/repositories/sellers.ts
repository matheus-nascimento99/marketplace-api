import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { Seller } from '@/domain/marketplace/sellers/enterprise/seller'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaSellersMapper } from '../mappers/sellers'
import { PrismaSellersAvatarsRepository } from './sellers-avatars'

@Injectable()
export class PrismaSellersRepository implements SellersRepository {
  constructor(
    private prisma: PrismaService,
    private prismaSellersAvatarsRepository: PrismaSellersAvatarsRepository,
  ) {}

  async create(seller: Seller): Promise<void> {
    const data = PrismaSellersMapper.toPrisma(seller)

    await this.prisma.user.create({
      data,
    })

    if (!seller.avatar) return

    await this.prismaSellersAvatarsRepository.create(seller.avatar)
  }

  async findById(sellerId: UniqueEntityId): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId.toString() },
    })

    if (!seller) {
      return null
    }

    return PrismaSellersMapper.toDomain(seller)
  }

  async findByEmail(sellerEmail: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findFirst({
      where: { email: { equals: sellerEmail, mode: 'insensitive' } },
    })

    if (!seller) {
      return null
    }

    return PrismaSellersMapper.toDomain(seller)
  }

  async findByPhone(sellerPhone: Raw): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: { phone: sellerPhone.value },
    })

    if (!seller) {
      return null
    }

    return PrismaSellersMapper.toDomain(seller)
  }

  async save(sellerId: UniqueEntityId, seller: Seller): Promise<void> {
    const data = PrismaSellersMapper.toPrisma(seller)

    await this.prisma.user.update({
      where: { id: sellerId.toString() },
      data,
    })
  }
}
