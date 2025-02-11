import { ViewWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/view-with-details'
import { generateAttachmentUrl } from '@/utils/generate-attachment-url'

export class ViewsPresenter {
  static toHTTP(view: ViewWithDetails) {
    return {
      product: {
        id: view.product.productId.toString(),
        title: view.product.title,
        description: view.product.description,
        priceInCents: view.product.priceInCents,
        status: view.product.status,
        owner: {
          id: view.product.seller.sellerId.toString(),
          name: view.product.seller.name,
          phone: view.product.seller.phone.value,
          email: view.product.seller.email,
          avatar: view.product.seller.avatar
            ? {
                id: view.product.seller.avatar.avatar.id,
                url: generateAttachmentUrl(
                  view.product.seller.avatar.avatar.key,
                ),
              }
            : null,
        },
        category: {
          id: view.product.category.id.toString(),
          title: view.product.category.title,
          slug: view.product.category.slug.value,
        },
        attachments: view.product.images.map((image) => ({
          id: image.image.id.toString(),
          url: generateAttachmentUrl(image.image.key),
        })),
      },
      viewer: {
        id: view.viewer.sellerId.toString(),
        name: view.viewer.name,
        phone: view.viewer.phone.value,
        email: view.viewer.email,
        avatar: view.viewer.avatar
          ? {
              id: view.viewer.avatar.avatar.id.toString(),
              url: generateAttachmentUrl(view.viewer.avatar.avatar.key),
            }
          : null,
      },
    }
  }
}
