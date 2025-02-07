import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaSellersMapper } from '../mappers/sellers'
import { PrismaSellersAvatarsRepository } from './sellers-avatars'
import { Seller } from '@/domain/marketplace/sellers/enterprise/entities/seller'
import { SellerWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-with-details'

@Injectable()
export class PrismaSellersRepository implements SellersRepository {
  constructor(
    private prisma: PrismaService,
    private prismaSellersAvatarsRepository: PrismaSellersAvatarsRepository,
  ) {}

  async create(seller: Seller): Promise<SellerWithDetails> {
    const data = PrismaSellersMapper.toPrisma(seller)

    await this.prisma.user.create({
      data,
    })

    if (seller.avatar) {
      await this.prismaSellersAvatarsRepository.create(seller.avatar)
    }

    const sellerWithDetails = await this.findByIdWithDetails(seller.id)

    if (!sellerWithDetails) {
      throw new BadRequestException(
        'Vendedor com os detalhes não foi encontrado',
      )
    }

    return sellerWithDetails
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

  async findByIdWithDetails(
    sellerId: UniqueEntityId,
  ): Promise<SellerWithDetails | null> {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId.toString() },
      include: { avatar: true },
    })

    if (!seller) {
      return null
    }

    return PrismaSellersMapper.toDomainWithDetails(seller)
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

  async save(
    sellerId: UniqueEntityId,
    seller: Seller,
  ): Promise<SellerWithDetails> {
    const data = PrismaSellersMapper.toPrisma(seller)

    await this.prisma.user.update({
      where: { id: sellerId.toString() },
      data,
    })

    if (seller.avatar) {
      await this.prismaSellersAvatarsRepository.create(seller.avatar)
    }

    const sellerWithDetails = await this.findByIdWithDetails(seller.id)

    if (!sellerWithDetails) {
      throw new BadRequestException(
        'Vendedor com os detalhes não foi encontrado',
      )
    }

    return sellerWithDetails
  }
}
