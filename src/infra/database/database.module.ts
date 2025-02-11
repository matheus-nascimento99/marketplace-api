import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { PrismaSellersRepository } from './prisma/repositories/sellers'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { PrismaAttachmentsRepository } from './prisma/repositories/attachments'
import { PrismaSellersAvatarsRepository } from './prisma/repositories/sellers-avatars'
import { SellersAvatarsRepository } from '@/domain/marketplace/sellers/application/repositories/sellers-avatars'
import { CategoriesRepository } from '@/domain/marketplace/products/application/repositories/categories'
import { PrismaCategoriesRepository } from './prisma/repositories/categories'
import { ProductsRepository } from '@/domain/marketplace/products/application/repositories/products'
import { PrismaProductsRepository } from './prisma/repositories/products'
import { ProductsImagesRepository } from '@/domain/marketplace/products/application/repositories/products-images'
import { PrismaProductsImagesRepository } from './prisma/repositories/products-images'
import { ViewsRepository } from '@/domain/marketplace/products/application/repositories/views'
import { PrismaViewsRepository } from './prisma/repositories/views'

@Module({
  providers: [
    PrismaService,
    PrismaSellersAvatarsRepository,
    PrismaProductsImagesRepository,
    { provide: SellersRepository, useClass: PrismaSellersRepository },
    { provide: AttachmentsRepository, useClass: PrismaAttachmentsRepository },
    {
      provide: SellersAvatarsRepository,
      useClass: PrismaSellersAvatarsRepository,
    },
    { provide: CategoriesRepository, useClass: PrismaCategoriesRepository },
    { provide: ProductsRepository, useClass: PrismaProductsRepository },
    {
      provide: ProductsImagesRepository,
      useClass: PrismaProductsImagesRepository,
    },
    { provide: ViewsRepository, useClass: PrismaViewsRepository },
  ],
  exports: [
    PrismaService,
    SellersRepository,
    AttachmentsRepository,
    SellersAvatarsRepository,
    CategoriesRepository,
    ProductsRepository,
    ProductsImagesRepository,
    ViewsRepository,
  ],
})
export class DatabaseModule {}
