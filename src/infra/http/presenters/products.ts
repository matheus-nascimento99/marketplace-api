import { ProductWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-with-details'
import { generateAttachmentUrl } from '@/utils/generate-attachment-url'

export class ProductsPresenter {
  static toHTTP(product: ProductWithDetails) {
    return {
      id: product.productId.toString(),
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner: {
        id: product.seller.sellerId.toString(),
        name: product.seller.name,
        phone: product.seller.phone.value,
        email: product.seller.email,
        avatar: product.seller.avatar
          ? {
              id: product.seller.avatar.avatar.id,
              url: generateAttachmentUrl(product.seller.avatar.avatar.key),
            }
          : null,
      },
      category: {
        id: product.category.id.toString(),
        title: product.category.title,
        slug: product.category.slug.value,
      },
      attachments: product.images.map((image) => ({
        id: image.image.id.toString(),
        url: generateAttachmentUrl(image.image.key),
      })),
    }
  }
}
