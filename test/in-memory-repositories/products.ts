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
import { SellerAvatarWithDetails } from '@/domain/marketplace/sellers/enterprise/value-objects/seller-avatar-with-details'
import {
  PaginationParamsRequest,
  PaginationParamsResponse,
} from '@/core/@types/pagination-params'
import { FilterParams } from '@/core/@types/filter-params'
import { FetchProductsFilterParams } from '@/domain/marketplace/products/application/use-cases/fetch-products'
import { isBefore, startOfDay, subDays } from 'date-fns'

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

  async findMany(
    { page, limit }: PaginationParamsRequest,
    { search, status }: FilterParams<FetchProductsFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>> {
    let products: ProductWithDetails[] = []

    for (const item of this.items) {
      const productWithDetails = await this.findByIdWithDetails(item.id)

      if (productWithDetails) {
        products.push(productWithDetails)
      }
    }

    products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (search) {
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search),
      )
    }

    if (status) {
      products = products.filter((product) => product.status === status)
    }

    const total = products.length

    products = products.slice((page - 1) * limit, page * limit)

    const pages = Math.ceil(total / limit)

    const next =
      Math.ceil(((page + 1) * limit) / limit) <= pages
        ? Math.ceil(((page + 1) * page) / page)
        : null

    const prev =
      Math.ceil((page * page) / page) - 1 === 0
        ? null
        : Math.ceil((page * page) / page) - 1

    return {
      items: products,
      next,
      prev,
      total,
    }
  }

  async findManyBySellerId(
    sellerId: UniqueEntityId,
    { page, limit }: PaginationParamsRequest,
    { search, status }: FilterParams<FetchProductsFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>> {
    let products: ProductWithDetails[] = []

    for (const item of this.items) {
      const productWithDetails = await this.findByIdWithDetails(item.id)

      if (productWithDetails) {
        products.push(productWithDetails)
      }
    }

    products
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter((item) => item.seller.sellerId.equals(sellerId))

    if (search) {
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search),
      )
    }

    if (status) {
      products = products.filter((product) => product.status === status)
    }

    const total = products.length

    products = products.slice((page - 1) * limit, page * limit)

    const pages = Math.ceil(total / limit)

    const next =
      Math.ceil(((page + 1) * limit) / limit) <= pages
        ? Math.ceil(((page + 1) * page) / page)
        : null

    const prev =
      Math.ceil((page * page) / page) - 1 === 0
        ? null
        : Math.ceil((page * page) / page) - 1

    return {
      items: products,
      next,
      prev,
      total,
    }
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

  async countSoldBySellerIdInMonth(sellerId: UniqueEntityId): Promise<number> {
    const now = new Date()
    const monthAgo = startOfDay(subDays(now, 30))

    const products = this.items.filter(
      (item) =>
        item.sellerId.equals(sellerId) &&
        item.status === 'sold' &&
        !isBefore(item.createdAt, monthAgo),
    )

    const count = products.length

    return count
  }

  async countAvailableBySellerIdInMonth(
    sellerId: UniqueEntityId,
  ): Promise<number> {
    const now = new Date()
    const monthAgo = startOfDay(subDays(now, 30))

    const products = this.items.filter(
      (item) =>
        item.sellerId.equals(sellerId) &&
        item.status === 'available' &&
        !isBefore(item.createdAt, monthAgo),
    )

    const count = products.length

    return count
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
