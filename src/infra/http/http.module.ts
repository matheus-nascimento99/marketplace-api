import { CreateSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/create-seller'
import { Module } from '@nestjs/common'
import { CreateSellerController } from './controllers/sellers/create-seller.controller'
import { HashModule } from '../hash/hash.module'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { AuthenticateSellerController } from './controllers/sellers/authenticate-seller.controller'
import { AuthenticateSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/authenticate-seller'

@Module({
  imports: [HashModule, DatabaseModule, CryptographyModule],
  controllers: [CreateSellerController, AuthenticateSellerController],
  providers: [CreateSellerUseCase, AuthenticateSellerUseCase],
})
export class HttpModule {}
