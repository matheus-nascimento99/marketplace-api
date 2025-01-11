import { CreateSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/create-seller'
import { Module } from '@nestjs/common'
import { CreateSellerController } from './controllers/sellers/create-seller.controller'
import { HashModule } from '../hash/hash.module'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [HashModule, DatabaseModule],
  controllers: [CreateSellerController],
  providers: [CreateSellerUseCase],
})
export class HttpModule {}
