import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { JwtService } from '@nestjs/jwt'
import { SellerFactory } from 'test/factories/make-seller'
import request from 'supertest'
import { CategoryFactory } from 'test/factories/make-category'
import { startOfDay, subDays } from 'date-fns'
import { ViewFactory } from 'test/factories/make-view'
import { ProductFactory } from 'test/factories/make-product'

describe('Fetch views amount per day in month (e2e)', () => {
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

  test('/sellers/metrics/views/days (GET)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const category = await categoryFactory.makePrismaCategory({})

    const product = await productFactory.makePrismaProduct({
      categoryId: category.id,
      sellerId: seller.id,
    })

    const now = new Date()
    const requests = Array.from({ length: 2 }).map((_, index) => {
      return async () => {
        const daysAmountToSub = index
        const createdAt = subDays(now, daysAmountToSub)

        const firstSeller = await sellerFactory.makePrismaSeller({})

        await viewFactory.makePrismaView({
          viewerId: firstSeller.id,
          productId: product.id,
          createdAt,
        })

        const secondSeller = await sellerFactory.makePrismaSeller({})

        await viewFactory.makePrismaView({
          viewerId: secondSeller.id,
          productId: product.id,
          createdAt,
        })
      }
    })

    await Promise.all(requests.map((fn) => fn()))

    const result = await request(app.getHttpServer())
      .get(`/sellers/metrics/views/days`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body).toEqual({
      viewsPerDay: expect.arrayContaining([
        { date: startOfDay(now).toISOString(), amount: 2 },
        { date: startOfDay(subDays(now, 1)).toISOString(), amount: 2 },
      ]),
    })
  })
})
