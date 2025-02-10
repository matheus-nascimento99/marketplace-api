import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ProductsRepository } from '../repositories/products'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { CategoriesRepository } from '../repositories/categories'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { ProductsImagesRepository } from '../repositories/products-images'
import { ProductImageList } from '../../enterprise/watched-lists/product-image-list'
import { ProductImage } from '../../enterprise/entities/product-image'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'
import { UpdateAnotherSellerProductError } from './errors/update-another-seller-product'
import { UpdateSoldProductError } from './errors/update-sold-product'

export type EditProductUseCaseRequest = {
  productId: string
  sellerId: string
  title: string
  categoryId: string
  description: string
  priceInCents: number
  attachmentsIds: string[]
}

export type EditProductUseCaseResponse = Either<
  | ResourceNotFoundError
  | UpdateAnotherSellerProductError
  | UpdateSoldProductError,
  {
    product: ProductWithDetails
  }
>

@Injectable()
export class EditProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
    private categoriesRepository: CategoriesRepository,
    private attachmentsRepository: AttachmentsRepository,
    private productsImagesRepository: ProductsImagesRepository,
  ) {}

  async execute({
    productId,
    sellerId,
    title,
    categoryId,
    description,
    priceInCents,
    attachmentsIds,
  }: EditProductUseCaseRequest): Promise<EditProductUseCaseResponse> {
    const product = await this.productsRepository.findById(
      new UniqueEntityId(productId),
    )

    if (!product) {
      return left(new ResourceNotFoundError('Product', 'ID', productId))
    }

    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    if (!product.sellerId.equals(seller.id)) {
      return left(new UpdateAnotherSellerProductError())
    }

    if (product.status === 'sold') {
      return left(new UpdateSoldProductError())
    }

    const category = await this.categoriesRepository.findById(
      new UniqueEntityId(categoryId),
    )

    if (!category) {
      return left(new ResourceNotFoundError('Category', 'ID', categoryId))
    }

    const uniqueAttachmentsIds = attachmentsIds.map(
      (attachmentId) => new UniqueEntityId(attachmentId),
    )

    const { attachments, notFoundIds } =
      await this.attachmentsRepository.findManyBetweenIds(uniqueAttachmentsIds)

    if (attachments.length > 0) {
      const currentProductImages =
        await this.productsImagesRepository.findManyByProductId(product.id)

      const productImagesList = new ProductImageList(currentProductImages)

      const newProductImages = attachments.map((attachment) => {
        const productImage = currentProductImages.find((currentProductImage) =>
          currentProductImage.imageId.equals(attachment.id),
        )

        return ProductImage.create(
          {
            imageId: attachment.id,
            productId: product.id,
          },
          productImage?.id,
        )
      })

      productImagesList.update(newProductImages)

      product.images = productImagesList
    }

    if (notFoundIds.length > 0) {
      return left(new ResourceNotFoundError('Attachments', 'IDs', notFoundIds))
    }

    product.title = title
    product.categoryId = new UniqueEntityId(categoryId)
    product.description = description
    product.priceInCents = priceInCents

    const productWithDetails = await this.productsRepository.save(
      product.id,
      product,
    )

    return right({ product: productWithDetails })
  }
}
