import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductsRepository } from '@/domain/marketplace/products/application/repositories/products'
import { Product } from '@/domain/marketplace/products/enterprise/entities/product'
import { ProductWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-with-details'
import { InMemoryCategoriesRepository } from './categories'
import { InMemorySellersRepository } from './sellers'
import { InMemoryAttachmentsRepository } from './attachments'
import { InMemorySellersAvatarsRepository } from './sellers-avatars'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'
import { ProductImageWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-image-with-details'

export class InMemoryProductsRepository implements ProductsRepository {
  constructor(
    private inMemoryCategoriesRepository: InMemoryCategoriesRepository,
    private inMemorySellersRepository: InMemorySellersRepository,
    private inMemorySellersAvatarsRepository: InMemorySellersAvatarsRepository,
    private inMemoryAttachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  public items: Product[] = []

  async create(product: Product): Promise<ProductWithDetails> {
    this.items.push(product)

    const productWithDetails = await this.findByIdWithDetails(product.id)

    if (!productWithDetails) {
      throw new Error('Product with details not found')
    }

    return productWithDetails
  }

  async findById(productId: UniqueEntityId): Promise<Product | null> {
    const product = this.items.find((item) => item.id.equals(productId))

    if (!product) {
      return null
    }

    return product
  }

  async findByIdWithDetails(
    productId: UniqueEntityId,
  ): Promise<ProductWithDetails | null> {
    const product = this.items.find((item) => item.id.equals(productId))

    if (!product) {
      return null
    }

    const category = this.inMemoryCategoriesRepository.items.find((category) =>
      category.id.equals(product.categoryId),
    )

    if (!category) {
      throw new Error('Category not found')
    }

    const seller = this.inMemorySellersRepository.items.find((seller) =>
      seller.id.equals(product.sellerId),
    )

    if (!seller) {
      throw new Error('Seller not found')
    }

    const sellerAvatar = this.inMemorySellersAvatarsRepository.items.find(
      (sellerAvatar) => sellerAvatar.sellerId.equals(product.sellerId),
    )

    let sellerAttachment: Attachment | null = null

    if (sellerAvatar) {
      sellerAttachment =
        this.inMemoryAttachmentsRepository.items.find((item) =>
          item.id.equals(sellerAvatar.avatarId),
        ) || null
    }

    return ProductWithDetails.create({
      productId: product.id,
      createdAt: product.createdAt,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      title: product.title,
      category: Category.create(
        { title: category.title, slug: category.slug },
        category.id,
      ),
      seller: {
        sellerId: seller.id,
        email: seller.email,
        name: seller.name,
        phone: seller.phone,
        avatar: sellerAttachment
          ? Attachment.create(
              {
                key: sellerAttachment.key,
              },
              sellerAttachment.id,
            )
          : null,
      },
      images: product.images.currentItems.map((productImage) => {
        const image = this.inMemoryAttachmentsRepository.items.find((item) =>
          item.id.equals(productImage.imageId),
        )

        if (!image) {
          throw new Error('Product image not found')
        }

        return ProductImageWithDetails.create({
          image,
          createdAt: productImage.createdAt,
        })
      }),
    })
  }

  async save(
    productId: UniqueEntityId,
    product: Product,
  ): Promise<ProductWithDetails> {
    const productIndex = this.items.findIndex((item) =>
      item.id.equals(productId),
    )

    this.items[productIndex] = product

    const productWithDetails = await this.findByIdWithDetails(product.id)

    if (!productWithDetails) {
      throw new Error('Product with details not found')
    }

    return productWithDetails
  }
}
