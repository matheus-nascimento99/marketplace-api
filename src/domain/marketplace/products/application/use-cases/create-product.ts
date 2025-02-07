import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Product } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { CategoriesRepository } from '../repositories/categories'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { ProductImage } from '../../enterprise/entities/product-image'
import { ProductImageList } from '../../enterprise/watched-lists/product-image-list'
import { ProductWithDetails } from '../../enterprise/value-objects/product-with-details'

export type CreateProductUseCaseRequest = {
  sellerId: string
  title: string
  categoryId: string
  description: string
  priceInCents: number
  attachmentsIds: string[]
}

export type CreateProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: ProductWithDetails
  }
>

@Injectable()
export class CreateProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
    private categoriesRepository: CategoriesRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async execute({
    sellerId,
    title,
    categoryId,
    description,
    priceInCents,
    attachmentsIds,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    const category = await this.categoriesRepository.findById(
      new UniqueEntityId(categoryId),
    )

    if (!category) {
      return left(new ResourceNotFoundError('Category', 'ID', categoryId))
    }

    const uniqueAttachmentsIds = attachmentsIds.map(
      (attachmentsId) => new UniqueEntityId(attachmentsId),
    )

    const { attachments, notFoundIds } =
      await this.attachmentsRepository.findManyBetweenIds(uniqueAttachmentsIds)

    if (notFoundIds.length > 0) {
      return left(new ResourceNotFoundError('Attachments', 'IDs', notFoundIds))
    }

    const product = Product.create({
      sellerId: new UniqueEntityId(sellerId),
      title,
      categoryId: new UniqueEntityId(categoryId),
      description,
      priceInCents,
    })

    if (attachments.length > 0) {
      const productImages = attachments.map((attachment) => {
        return ProductImage.create({
          imageId: attachment.id,
          productId: product.id,
        })
      })

      const productImagesList = new ProductImageList(productImages)

      product.images = productImagesList
    }

    const productWithDetails = await this.productsRepository.create(product)

    return right({ product: productWithDetails })
  }
}
