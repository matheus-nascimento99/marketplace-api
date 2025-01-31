import { CreateSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/create-seller'
import { Module } from '@nestjs/common'
import { CreateSellerController } from './controllers/sellers/create-seller.controller'
import { HashModule } from '../hash/hash.module'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { AuthenticateSellerController } from './controllers/sellers/authenticate-seller.controller'
import { AuthenticateSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/authenticate-seller'
import { SaveAttachmentsController } from './controllers/attachments/save-attachments.controller'
import { SaveAttachmentsUseCase } from '@/domain/marketplace/attachments/application/use-cases/save-attachments'
import { StorageModule } from '../storage/storage.module'
import { EditSellerController } from './controllers/sellers/edit-seller.controller'
import { EditSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/edit-seller'

@Module({
  imports: [HashModule, DatabaseModule, CryptographyModule, StorageModule],
  controllers: [
    CreateSellerController,
    EditSellerController,
    AuthenticateSellerController,
    SaveAttachmentsController,
  ],
  providers: [
    CreateSellerUseCase,
    EditSellerUseCase,
    AuthenticateSellerUseCase,
    SaveAttachmentsUseCase,
  ],
})
export class HttpModule {}
