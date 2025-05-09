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

describe('Change product status (e2e)', () => {
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

  test('/products/:product_id/:status (PATCH)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const category = await categoryFactory.makePrismaCategory({})

    const product = await productFactory.makePrismaProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    await request(app.getHttpServer())
      .patch(`/products/${product.id.toString()}/cancelled`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    const productEditted = await prisma.product.findUnique({
      where: { id: product.id.toString() },
    })

    expect(productEditted).not.toBeNull()
    expect(productEditted?.status).toEqual('cancelled')
  })
})
