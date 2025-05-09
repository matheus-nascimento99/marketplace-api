import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { JwtService } from '@nestjs/jwt'
import { SellerFactory } from 'test/factories/make-seller'
import request from 'supertest'
import { CategoryFactory } from 'test/factories/make-category'
import { subDays } from 'date-fns'
import { ViewFactory } from 'test/factories/make-view'
import { ProductFactory } from 'test/factories/make-product'

describe('Get product views amount in week (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let viewFactory: ViewFactory
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory
  let productFactory: ProductFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        ViewFactory,
        AttachmentFactory,
        SellerFactory,
        AttachmentFactory,
        CategoryFactory,
        ProductFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)

    viewFactory = moduleRef.get(ViewFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    productFactory = moduleRef.get(ProductFactory)

    await app.init()
  })

  test('/products/:product_id/metrics/views (GET)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const category = await categoryFactory.makePrismaCategory({})

    const product = await productFactory.makePrismaProduct({
      categoryId: category.id,
      sellerId: seller.id,
    })

    const requests = Array.from({ length: 8 }).map((_, index) => {
      return async () => {
        const now = new Date()
        const daysAmountToSub = index
        const createdAt = subDays(now, daysAmountToSub)

        const anotherSeller = await sellerFactory.makePrismaSeller({})

        await viewFactory.makePrismaView({
          viewerId: anotherSeller.id,
          productId: product.id,
          createdAt,
        })
      }
    })

    await Promise.all(requests.map((fn) => fn()))

    const result = await request(app.getHttpServer())
      .get(`/products/${product.id.toString()}/metrics/views`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body).toEqual({
      amount: 8,
    })
  })
})
