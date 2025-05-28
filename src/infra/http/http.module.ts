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
import { GetSellerController } from './controllers/sellers/get-seller.controller'
import { GetSellerUseCase } from '@/domain/marketplace/sellers/application/use-cases/get-seller'
import { ChangeProductStatusController } from './controllers/products/change-product-status.controller'
import { ChangeProductStatusUseCase } from '@/domain/marketplace/products/application/use-cases/change-product-status'
import { RegisterViewController } from './controllers/products/register-view.controller'
import { RegisterViewUseCase } from '@/domain/marketplace/products/application/use-cases/register-view'
import { GetSoldProductsAmountInMonthController } from './controllers/metrics/get-sold-products-amount-in-month.controller'
import { GetSoldProductsAmountInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-sold-products-amount-in-month'
import { GetAvailableProductsAmountInMonthController } from './controllers/metrics/get-available-products-amount-in-month.controller'
import { GetAvailableProductsAmountInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-available-products-amount-in-month'
import { GetViewsAmountInMonthController } from './controllers/metrics/get-views-amount-in-month.controller'
import { GetViewsAmountInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-views-amount-in-month'
import { GetProductViewsAmountInWeekController } from './controllers/metrics/get-product-views-amount-in-week.controller'
import { GetProductViewsAmountInWeekUseCase } from '@/domain/marketplace/metrics/application/use-cases/get-product-views-amount-in-week'
import { FetchViewsAmountPerDayInMonthController } from './controllers/metrics/fetch-views-amount-per-day-in-month.controller'
import { FetchViewsAmountPerDayInMonthUseCase } from '@/domain/marketplace/metrics/application/use-cases/fetch-views-amount-per-day-in-month'
import { PrometheusController } from './controllers/observability/prometheus.controller'
import { PrometheusService } from '../observability/prometheus.service'

@Module({
  imports: [HashModule, DatabaseModule, CryptographyModule, StorageModule],
  controllers: [
    PrometheusController,
    FetchProductsFromSellerController,
    GetSellerController,
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
    ChangeProductStatusController,
    RegisterViewController,
    GetSoldProductsAmountInMonthController,
    GetAvailableProductsAmountInMonthController,
    GetViewsAmountInMonthController,
    GetProductViewsAmountInWeekController,
    FetchViewsAmountPerDayInMonthController,
  ],
  providers: [
    PrometheusService,
    CreateSellerUseCase,
    EditSellerUseCase,
    AuthenticateSellerUseCase,
    SaveAttachmentsUseCase,
    FetchCategoriesUseCase,
    CreateProductUseCase,
    EditProductUseCase,
    GetProductUseCase,
    FetchProductsUseCase,
    FetchCategoriesUseCase,
    FetchProductsFromSellerUseCase,
    GetSellerUseCase,
    ChangeProductStatusUseCase,
    RegisterViewUseCase,
    GetSoldProductsAmountInMonthUseCase,
    GetAvailableProductsAmountInMonthUseCase,
    GetViewsAmountInMonthUseCase,
    GetProductViewsAmountInWeekUseCase,
    FetchViewsAmountPerDayInMonthUseCase,
  ],
})
export class HttpModule {}
