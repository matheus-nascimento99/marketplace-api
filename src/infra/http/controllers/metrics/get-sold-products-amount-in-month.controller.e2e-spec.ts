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
import { subDays } from 'date-fns'

describe('Get sold products amount in month (e2e)', () => {
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

  test('/sellers/metrics/products/sold (GET)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const category = await categoryFactory.makePrismaCategory({})

    const requests = Array.from({ length: 31 }).map((_, index) => {
      return async () => {
        const now = new Date()
        const daysAmountToSub = index
        const createdAt = subDays(now, daysAmountToSub)

        await productFactory.makePrismaProduct({
          sellerId: seller.id,
          categoryId: category.id,
          status: 'sold',
          createdAt,
        })
      }
    })

    await Promise.all(requests.map((fn) => fn()))

    const result = await request(app.getHttpServer())
      .get(`/sellers/metrics/products/sold`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body).toEqual({
      amount: 31,
    })
  })
})
