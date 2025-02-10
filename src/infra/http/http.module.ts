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
import { FetchCategoriesController } from './controllers/categories/fetch-categories.controller'
import { FetchCategoriesUseCase } from '@/domain/marketplace/products/application/use-cases/fetch-categories'
import { SignOutSellerController } from './controllers/sessions/sign-out.controller'
import { CreateProductController } from './controllers/products/create-product.controller'
import { CreateProductUseCase } from '@/domain/marketplace/products/application/use-cases/create-product'
import { EditProductController } from './controllers/products/edit-product.controller'
import { EditProductUseCase } from '@/domain/marketplace/products/application/use-cases/edit-product'
import { GetProductController } from './controllers/products/get-product.controller'
import { GetProductUseCase } from '@/domain/marketplace/products/application/use-cases/get-product'
import { FetchProductsController } from './controllers/products/fetch-products.controller'
import { FetchProductsUseCase } from '@/domain/marketplace/products/application/use-cases/fetch-products'
import { FetchProductsFromSellerController } from './controllers/products/fetch-products-from-seller.controller'
import { FetchProductsFromSellerUseCase } from '@/domain/marketplace/products/application/use-cases/fetch-products-from-seller'

@Module({
  imports: [HashModule, DatabaseModule, CryptographyModule, StorageModule],
  controllers: [
    FetchProductsFromSellerController,
    CreateSellerController,
    EditSellerController,
    AuthenticateSellerController,
    SaveAttachmentsController,
    FetchCategoriesController,
    SignOutSellerController,
    CreateProductController,
    EditProductController,
    GetProductController,
    FetchProductsController,
    FetchCategoriesController,
  ],
  providers: [
    CreateSellerUseCase,
    EditSellerUseCase,
    AuthenticateSellerUseCase,
    SaveAttachmentsUseCase,
    FetchCategoriesUseCase,
    CreateProductUseCase,
    EditProductUseCase,
    GetProductUseCase,
    FetchProductsFromSellerUseCase,
    FetchProductsUseCase,
    FetchCategoriesUseCase,
  ],
})
export class HttpModule {}
