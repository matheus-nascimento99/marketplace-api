import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Seller } from '../../enterprise/entities/seller'
import { SellerWithDetails } from '../../enterprise/value-objects/seller-with-details'

export abstract class SellersRepository {
  abstract create(seller: Seller): Promise<SellerWithDetails>
  abstract findById(sellerId: UniqueEntityId): Promise<Seller | null>
  abstract findByIdWithDetails(
    sellerId: UniqueEntityId,
  ): Promise<SellerWithDetails | null>

  abstract findByEmail(sellerEmail: string): Promise<Seller | null>
  abstract findByPhone(sellerPhone: Raw): Promise<Seller | null>
  abstract save(
    sellerId: UniqueEntityId,
    seller: Seller,
  ): Promise<SellerWithDetails>
}
