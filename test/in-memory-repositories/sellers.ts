import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { Seller } from '@/domain/marketplace/sellers/enterprise/seller'

export class InMemorySellersRepository implements SellersRepository {
  public items: Seller[] = []

  async create(seller: Seller): Promise<void> {
    this.items.push(seller)
  }

  async findById(sellerId: UniqueEntityId): Promise<Seller | null> {
    const seller = this.items.find((item) => item.id.equals(sellerId))

    if (!seller) {
      return null
    }

    return seller
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

  async save(sellerId: UniqueEntityId, seller: Seller): Promise<void> {
    const sellerIndex = this.items.findIndex((item) => item.id.equals(sellerId))

    this.items[sellerIndex] = seller
  }
}
