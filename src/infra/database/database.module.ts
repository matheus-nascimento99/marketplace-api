import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { SellersRepository } from '@/domain/marketplace/sellers/application/repositories/sellers'
import { PrismaSellersRepository } from './prisma/repositories/sellers'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { PrismaAttachmentsRepository } from './prisma/repositories/attachments'
import { PrismaSellersAvatarsRepository } from './prisma/repositories/sellers-avatars'

@Module({
  providers: [
    PrismaService,
    PrismaSellersAvatarsRepository,
    { provide: SellersRepository, useClass: PrismaSellersRepository },
    { provide: AttachmentsRepository, useClass: PrismaAttachmentsRepository },
  ],
  exports: [PrismaService, SellersRepository, AttachmentsRepository],
})
export class DatabaseModule {}
