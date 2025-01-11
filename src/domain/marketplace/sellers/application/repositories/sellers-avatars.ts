import { SellerAvatar } from '../../enterprise/seller-avatar'

export abstract class SellersAvatarsRepository {
  abstract create(sellerAvatar: SellerAvatar): Promise<void>
}
