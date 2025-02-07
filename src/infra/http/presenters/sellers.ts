import { SellerWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-with-details'
import { generateAttachmentUrl } from '@/utils/generate-attachment-url'

export class SellersPresenter {
  static toHTTP(seller: SellerWithDetails) {
    return {
      id: seller.sellerId.toString(),
      name: seller.name,
      phone: seller.phone.value,
      email: seller.email,
      avatar: seller.avatar
        ? {
            id: seller.avatar.avatar.id.toString(),
            url: generateAttachmentUrl(seller.avatar.avatar.key),
          }
        : null,
    }
  }
}
