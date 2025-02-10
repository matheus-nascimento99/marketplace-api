import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { ProductFactory } from 'test/factories/make-product'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { JwtService } from '@nestjs/jwt'
import { SellerFactory } from 'test/factories/make-seller'
import request from 'supertest'
import { ProductImageFactory } from 'test/factories/make-product-image'
import { CategoryFactory } from 'test/factories/make-category'

describe('Get product (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let productFactory: ProductFactory
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        ProductFactory,
        AttachmentFactory,
        SellerFactory,
        ProductImageFactory,
        AttachmentFactory,
        CategoryFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)

    productFactory = moduleRef.get(ProductFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    await app.init()
  })

  test('/products/:product_id (GET)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const category = await categoryFactory.makePrismaCategory({})

    const product = await productFactory.makePrismaProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    await request(app.getHttpServer())
      .get(`/products/${product.id.toString()}`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})
      .expect(200)
  })
})
