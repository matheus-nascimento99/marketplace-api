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
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'

describe('Fetch products (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory
  let productFactory: ProductFactory
  let seller: Seller
  let category: Category

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

    category = await categoryFactory.makePrismaCategory({})

    await app.init()
  })

  test('/products/me (GET)', async () => {
    const anotherSeller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const anotherCategory = await categoryFactory.makePrismaCategory({})

    const [firstProduct, secondProduct, thirdProduct] = await Promise.all([
      productFactory.makePrismaProduct({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Title test 1',
        description: 'Description test 1',
        status: 'cancelled',
        priceInCents: 1000,
        createdAt: new Date(2025, 2, 10),
      }),
      productFactory.makePrismaProduct({
        sellerId: seller.id,
        categoryId: category.id,
        title: 'Title test 2',
        description: 'Description test 2',
        status: 'cancelled',
        priceInCents: 2000,
        createdAt: new Date(2025, 2, 12),
      }),
      productFactory.makePrismaProduct({
        sellerId: seller.id,
        categoryId: category.id,
        priceInCents: 3000,
        createdAt: new Date(2025, 2, 9),
      }),
      productFactory.makePrismaProduct({
        sellerId: anotherSeller.id,
        priceInCents: 4000,
        categoryId: anotherCategory.id,
      }),
    ])

    const result = await request(app.getHttpServer())
      .get(`/products/me`)
      .set('Cookie', [`auth=${accessToken}`])
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
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(1)
  })

  test('/products/me (GET) [FILTERED BY SEARCH]', async () => {
    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const firstResult = await request(app.getHttpServer())
      .get(`/products/me?search=Title`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(firstResult.body.products).toHaveLength(2)

    const secondResult = await request(app.getHttpServer())
      .get(`/products/me?search=Description`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(secondResult.body.products).toHaveLength(2)
  })

  test('/products/me (GET) [FILTERED BY STATUS]', async () => {
    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .get(`/products/me?status=cancelled`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(2)
  })

  test('/products/me (GET) [FILTERED BY PRICE]', async () => {
    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const firstResult = await request(app.getHttpServer())
      .get(`/products/me?initial_price=1000&final_price=2000`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(firstResult.body.products).toHaveLength(2)

    const secondResult = await request(app.getHttpServer())
      .get(`/products/me?final_price=2000`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(secondResult.body.products).toHaveLength(2)
  })
  test('/products/me (GET) [FILTERED BY CATEGORY]', async () => {
    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .get(`/products/me?category_id=${category.id.toString()}`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(3)
  })
})
