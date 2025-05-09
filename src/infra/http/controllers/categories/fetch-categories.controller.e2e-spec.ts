import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { CategoryFactory } from 'test/factories/make-category'
import { SellerFactory } from 'test/factories/make-seller'
import { JwtService } from '@nestjs/jwt'

describe('Fetch categories (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let categoryFactory: CategoryFactory
  let sellerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CategoryFactory, SellerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)

    categoryFactory = moduleRef.get(CategoryFactory)
    sellerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  test('/categories (GET)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    await Promise.all([
      categoryFactory.makePrismaCategory({}),
      categoryFactory.makePrismaCategory({}),
      categoryFactory.makePrismaCategory({}),
    ])

    const result = await request(app.getHttpServer())
      .get('/categories')
      .set('Cookie', [`auth=${accessToken}`])
      .expect(200)

    expect(result.body.categories).toHaveLength(3)
  })
})
