import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SellerFactory } from 'test/factories/make-seller'
import { JwtService } from '@nestjs/jwt'
import { CategoryFactory } from 'test/factories/make-category'
import { ProductFactory } from 'test/factories/make-product'
import request from 'supertest'
import { Category } from '@/domain/marketplace/products/enterprise/entities/category'

describe('Fetch products (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory
  let productFactory: ProductFactory
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

    category = await categoryFactory.makePrismaCategory({})

    await app.init()
  })

  test('/products (GET)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})
    const anotherSeller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const anotherCategory = await categoryFactory.makePrismaCategory({})

    const [firstProduct, secondProduct, thirdProduct] = await Promise.all([
      productFactory.makePrismaProduct({
        sellerId: anotherSeller.id,
        categoryId: category.id,
        title: 'Title test 1',
        description: 'Description test 1',
        status: 'cancelled',
        priceInCents: 1000,
        createdAt: new Date(2025, 2, 10),
      }),
      productFactory.makePrismaProduct({
        sellerId: anotherSeller.id,
        categoryId: category.id,
        title: 'Title test 2',
        description: 'Description test 2',
        status: 'cancelled',
        priceInCents: 2000,
        createdAt: new Date(2025, 2, 12),
      }),
      productFactory.makePrismaProduct({
        sellerId: anotherSeller.id,
        categoryId: anotherCategory.id,
        priceInCents: 3000,
        createdAt: new Date(2025, 2, 9),
      }),
    ])

    const result = await request(app.getHttpServer())
      .get(`/products`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toEqual([
      expect.objectContaining({ id: secondProduct.id.toString() }),
      expect.objectContaining({ id: firstProduct.id.toString() }),
      expect.objectContaining({ id: thirdProduct.id.toString() }),
    ])
  })

  test('/products (GET) [PAGINATED]', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .get(`/products?page=2&limit=2`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(1)
  })

  test('/products (GET) [FILTERED BY SEARCH]', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const firstResult = await request(app.getHttpServer())
      .get(`/products?search=Title`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(firstResult.body.products).toHaveLength(2)

    const secondResult = await request(app.getHttpServer())
      .get(`/products?search=Description`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(secondResult.body.products).toHaveLength(2)
  })

  test('/products (GET) [FILTERED BY STATUS]', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .get(`/products?status=cancelled`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(2)
  })
  test('/products (GET) [FILTERED BY PRICE]', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const firstResult = await request(app.getHttpServer())
      .get(`/products?initial_price=1000&final_price=2000`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(firstResult.body.products).toHaveLength(2)

    const secondResult = await request(app.getHttpServer())
      .get(`/products?final_price=2000`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(secondResult.body.products).toHaveLength(2)
  })
  test('/products (GET) [FILTERED BY CATEGORY]', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .get(`/products?category_id=${category.id.toString()}`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.body.products).toHaveLength(2)
  })
})
