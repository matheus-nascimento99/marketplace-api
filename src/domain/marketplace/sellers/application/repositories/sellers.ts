import { Raw } from '@/core/value-objects/raw'
import { Seller } from '../../enterprise/seller'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'

export abstract class SellersRepository {
  abstract create(seller: Seller): Promise<void>
  abstract findById(sellerId: UniqueEntityId): Promise<Seller | null>
  abstract findByEmail(sellerEmail: string): Promise<Seller | null>
  abstract findByPhone(sellerPhone: Raw): Promise<Seller | null>
  abstract save(sellerId: UniqueEntityId, seller: Seller): Promise<void>
}
