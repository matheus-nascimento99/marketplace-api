import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { ProductsRepository } from '@/domain/marketplace/products/application/repositories/products'
import { Product } from '@/domain/marketplace/products/enterprise/entities/product'
import { ProductWithDetails } from '@/domain/marketplace/products/enterprise/value-objects/product-with-details'
import { PrismaService } from '../prisma.service'
import { PrismaProductsMapper } from '../mappers/products'
import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaProductsImagesRepository } from './products-images'
import { FilterParams } from '@/core/@types/filter-params'
import {
  PaginationParamsRequest,
  PaginationParamsResponse,
} from '@/core/@types/pagination-params'
import { FetchProductsFilterParams } from '@/domain/marketplace/products/application/use-cases/fetch-products'
import { Prisma } from '@prisma/client'

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(
    private prisma: PrismaService,
    private prismaProductsImagesRepository: PrismaProductsImagesRepository,
  ) {}

  async create(product: Product): Promise<ProductWithDetails> {
    const data = PrismaProductsMapper.toPrisma(product)

    await this.prisma.product.create({
      data,
    })

    const products = product.images.currentItems

    if (products.length > 0) {
      await this.prismaProductsImagesRepository.createMany(
        product.images.currentItems,
      )
    }

    const productWithDetails = await this.findByIdWithDetails(product.id)

    if (!productWithDetails) {
      throw new BadRequestException(
        'Produto com os detalhes não foi encontrado',
      )
    }

    return productWithDetails
  }

  async findMany(
    { page, limit }: PaginationParamsRequest,
    { search, status }: FilterParams<FetchProductsFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>> {
    const where: Prisma.ProductWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = { equals: status }
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          user: { include: { avatar: true } },
          attachments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      items: products.map((product) =>
        PrismaProductsMapper.toDomainWithDetails(product),
      ),
      total,
      prev: page > 1 ? page - 1 : null,
      next: page < totalPages ? page + 1 : null,
    }
  }

  async findManyBySellerId(
    sellerId: UniqueEntityId,
    { page, limit }: PaginationParamsRequest,
    { search, status }: FilterParams<FetchProductsFilterParams>,
  ): Promise<PaginationParamsResponse<ProductWithDetails>> {
    const where: Prisma.ProductWhereInput = {}

    where.userId = { equals: sellerId.toString() }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = { equals: status }
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          user: { include: { avatar: true } },
          attachments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      items: products.map((product) =>
        PrismaProductsMapper.toDomainWithDetails(product),
      ),
      total,
      prev: page > 1 ? page - 1 : null,
      next: page < totalPages ? page + 1 : null,
    }
  }

  async findById(productId: UniqueEntityId): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId.toString() },
    })

    if (!product) {
      return null
    }

    return PrismaProductsMapper.toDomain(product)
  }

  async findByIdWithDetails(
    productId: UniqueEntityId,
  ): Promise<ProductWithDetails | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId.toString() },
      include: {
        category: true,
        user: { include: { avatar: true } },
        attachments: true,
      },
    })

    if (!product) {
      return null
    }

    return PrismaProductsMapper.toDomainWithDetails(product)
  }

  async save(
    productId: UniqueEntityId,
    product: Product,
  ): Promise<ProductWithDetails> {
    const data = PrismaProductsMapper.toPrisma(product)

    await this.prisma.product.update({
      where: { id: productId.toString() },
      data,
    })

    const newProductsImages = product.images.getNewItems()

    if (newProductsImages.length > 0) {
      await this.prismaProductsImagesRepository.createMany(newProductsImages)
    }
    const removedProductsImages = product.images.getRemovedItems()

    if (removedProductsImages.length > 0) {
      await this.prismaProductsImagesRepository.deleteMany(
        removedProductsImages.map(
          (removedProductsImage) => removedProductsImage.imageId,
        ),
      )
    }

    const productWithDetails = await this.findByIdWithDetails(product.id)

    if (!productWithDetails) {
      throw new BadRequestException(
        'Produto com os detalhes não foi encontrado',
      )
    }

    return productWithDetails
  }
}
