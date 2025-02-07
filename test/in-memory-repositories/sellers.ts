import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { InMemorySellersAvatarsRepository } from './sellers-avatars'
import { Seller } from '@/domain/marketplace/sellers/enterprise/entities/seller'
import { SellerWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-with-details'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { InMemoryAttachmentsRepository } from './attachments'
import { SellerAvatarWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-avatar-with-details'

export class InMemorySellersRepository implements SellersRepository {
  constructor(
    private inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository,
    private inMemoryAttachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  public items: Seller[] = []

  async create(seller: Seller): Promise<SellerWithDetails> {
    this.items.push(seller)

    if (seller.avatar) {
      await this.inMemorySellersAvatarsRepository.create(seller.avatar)
    }

    const sellerWithDetails = await this.findByIdWithDetails(seller.id)

    if (!sellerWithDetails) {
      throw new Error('Seller with details not found')
    }

    return sellerWithDetails
  }

  async findById(sellerId: UniqueEntityId): Promise<Seller | null> {
    const seller = this.items.find((item) => item.id.equals(sellerId))

    if (!seller) {
      return null
    }

    return seller
  }

  async findByIdWithDetails(
    sellerId: UniqueEntityId,
  ): Promise<SellerWithDetails | null> {
    const seller = this.items.find((item) => item.id.equals(sellerId))

    if (!seller) {
      return null
    }

    const sellerAvatar =
      await this.inMemorySellersAvatarsRepository.findBySellerId(seller.id)

    let sellerAttachment: Attachment | null = null

    if (sellerAvatar) {
      sellerAttachment =
        this.inMemoryAttachmentsRepository.items.find((item) =>
          item.id.equals(sellerAvatar.avatarId),
        ) || null

      if (!sellerAttachment) {
        throw new Error('Attachment in seller avatar not found')
      }
    }

    return SellerWithDetails.create({
      sellerId: seller.id,
      name: seller.name,
      email: seller.email,
      createdAt: seller.createdAt,
      password: seller.password,
      phone: seller.phone,
      updatedAt: seller.updatedAt,
      avatar:
        sellerAvatar && sellerAttachment
          ? SellerAvatarWithDetails.create({
              avatar: Attachment.create(
                { key: sellerAttachment.key },
                sellerAttachment.id,
              ),
              createdAt: sellerAvatar?.createdAt,
            })
          : null,
    })
  }

  async findByEmail(sellerEmail: string): Promise<Seller | null> {
    const seller = this.items.find((item) => item.email === sellerEmail)

    if (!seller) {
      return null
    }

    return seller
  }

  async findByPhone(sellerPhone: Raw): Promise<Seller | null> {
    const seller = this.items.find((item) => item.phone.equals(sellerPhone))

    if (!seller) {
      return null
    }

    return seller
  }

  async save(
    sellerId: UniqueEntityId,
    seller: Seller,
  ): Promise<SellerWithDetails> {
    const sellerIndex = this.items.findIndex((item) => item.id.equals(sellerId))

    this.items[sellerIndex] = seller

    if (seller.avatar) {
      await this.inMemorySellersAvatarsRepository.create(seller.avatar)
    }

    const sellerWithDetails = await this.findByIdWithDetails(seller.id)

    if (!sellerWithDetails) {
      throw new Error('Seller with details not found')
    }

    return sellerWithDetails
  }
}
