import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Seller } from '@/domain/marketplace/sellers/enterprise/seller'
import { generateAttachmentUrl } from '@/utils/generate-attachment-url'

export class SellersPresenter {
  static toHTTP(seller: Seller, avatar: Attachment | null) {
    return {
      id: seller.id.toString(),
      name: seller.name,
      phone: seller.phone.value,
      email: seller.email,
      avatar: avatar
        ? {
            id: avatar.id.toString(),
            url: generateAttachmentUrl(avatar.key),
          }
        : null,
    }
  }
}
