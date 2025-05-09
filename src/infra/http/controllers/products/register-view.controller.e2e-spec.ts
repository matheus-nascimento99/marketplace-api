import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ProductFactory } from 'test/factories/make-product'
import { JwtService } from '@nestjs/jwt'
import { SellerFactory } from 'test/factories/make-seller'
import request from 'supertest'
import { CategoryFactory } from 'test/factories/make-category'

describe('Register view (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let productFactory: ProductFactory
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [ProductFactory, SellerFactory, CategoryFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    jwt = moduleRef.get(JwtService)

    productFactory = moduleRef.get(ProductFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    await app.init()
  })

  test('/products/:product_id/views (POST)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const category = await categoryFactory.makePrismaCategory({})

    const product = await productFactory.makePrismaProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    const anotherSeller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({
      sub: anotherSeller.id.toString(),
    })

    await request(app.getHttpServer())
      .post(`/products/${product.id.toString()}/views`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    const views = await prisma.view.findMany({})

    expect(views).toHaveLength(1)
  })
})
