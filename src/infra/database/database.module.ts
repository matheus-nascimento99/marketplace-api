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

@Module({
  providers: [
    PrismaService,
    PrismaSellersAvatarsRepository,
    { provide: SellersRepository, useClass: PrismaSellersRepository },
    { provide: AttachmentsRepository, useClass: PrismaAttachmentsRepository },
    {
      provide: SellersAvatarsRepository,
      useClass: PrismaSellersAvatarsRepository,
    },
    { provide: CategoriesRepository, useClass: PrismaCategoriesRepository },
  ],
  exports: [
    PrismaService,
    SellersRepository,
    AttachmentsRepository,
    SellersAvatarsRepository,
    CategoriesRepository,
  ],
})
export class DatabaseModule {}
