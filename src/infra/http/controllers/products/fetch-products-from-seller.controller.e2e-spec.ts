import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SellerFactory } from 'test/factories/make-seller'
import { JwtService } from '@nestjs/jwt'
import { CategoryFactory } from 'test/factories/make-category'
import { ProductFactory } from 'test/factories/make-product'
import request from 'supertest'
import { Seller } from '@/domain/marketplace/sellers/enterprise/entities/seller'

describe('Fetch products (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory
  let productFactory: ProductFactory
  let seller: Seller

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, CategoryFactory, ProductFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)

    sellerFactory = moduleRef.get(SellerFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    productFactory = moduleRef.get(ProductFactory)

    seller = await sellerFactory.makePrismaSeller({})

    await app.init()
  })

  test('/products/me (GET)', async () => {
    const anotherSeller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const category = await categoryFactory.makePrismaCategory({})

    const [firstProduct, secondProduct, thirdProduct] = await Promise.all([
      productFactory.makePrismaProduct({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Title test 1',
        description: 'Description test 1',
        status: 'cancelled',
        createdAt: new Date(2025, 2, 10),
      }),
      productFactory.makePrismaProduct({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Title test 2',
        description: 'Description test 2',
        status: 'cancelled',
        createdAt: new Date(2025, 2, 12),
      }),
      productFactory.makePrismaProduct({
        sellerId: seller.id,
        categoryId: category.id,
        createdAt: new Date(2025, 2, 9),
      }),
      productFactory.makePrismaProduct({
        sellerId: anotherSeller.id,
        categoryId: category.id,
      }),
    ])

    const result = await request(app.getHttpServer())
      .get(`/products/me`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})

    expect(result.body.products).toEqual([
      expect.objectContaining({ id: secondProduct.id.toString() }),
      expect.objectContaining({ id: firstProduct.id.toString() }),
      expect.objectContaining({ id: thirdProduct.id.toString() }),
    ])
  })

  test('/products/me (GET) [PAGINATED]', async () => {
    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .get(`/products/me?page=2&limit=2`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(1)
  })

  test('/products/me (GET) [FILTERED BY SEARCH]', async () => {
    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const firstResult = await request(app.getHttpServer())
      .get(`/products/me?search=Title`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})
      .expect(200)

    expect(firstResult.body.products).toHaveLength(2)

    const secondResult = await request(app.getHttpServer())
      .get(`/products/me?search=Description`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})
      .expect(200)

    expect(secondResult.body.products).toHaveLength(2)
  })

  test('/products/me (GET) [FILTERED BY STATUS]', async () => {
    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .get(`/products/me?status=cancelled`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(2)
  })
})
