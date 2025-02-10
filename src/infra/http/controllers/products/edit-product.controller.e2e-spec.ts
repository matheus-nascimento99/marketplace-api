import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ProductFactory } from 'test/factories/make-product'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { JwtService } from '@nestjs/jwt'
import { SellerFactory } from 'test/factories/make-seller'
import request from 'supertest'
import { ProductImageFactory } from 'test/factories/make-product-image'
import { CategoryFactory } from 'test/factories/make-category'

describe('Edit product (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let productFactory: ProductFactory
  let sellerFactory: SellerFactory
  let productImageFactory: ProductImageFactory
  let attachmentFactory: AttachmentFactory
  let categoryFactory: CategoryFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        ProductFactory,
        SellerFactory,
        ProductImageFactory,
        AttachmentFactory,
        CategoryFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    jwt = moduleRef.get(JwtService)

    productFactory = moduleRef.get(ProductFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    productImageFactory = moduleRef.get(ProductImageFactory)

    attachmentFactory = moduleRef.get(AttachmentFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    await app.init()
  })

  test('/products/:product_id (PUT)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const category = await categoryFactory.makePrismaCategory({})

    const attachments = await Promise.all([
      attachmentFactory.makePrismaAttachment({}),
      attachmentFactory.makePrismaAttachment({}),
    ])

    const product = await productFactory.makePrismaProduct({
      sellerId: seller.id,
      categoryId: category.id,
    })

    await Promise.all([
      productImageFactory.makePrismaProductImage({
        productId: product.id,
        imageId: attachments[0].id,
      }),
      productImageFactory.makePrismaProductImage({
        productId: product.id,
        imageId: attachments[1].id,
      }),
    ])

    const anotherCategory = await categoryFactory.makePrismaCategory({})

    const anotherProductImage = await attachmentFactory.makePrismaAttachment({})

    await request(app.getHttpServer())
      .put(`/products/${product.id.toString()}`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({
        title: 'Test title',
        categoryId: anotherCategory.id.toString(),
        description: 'Product description',
        priceInCents: 10000,
        attachmentsIds: [
          attachments[0].id.toString(),
          anotherProductImage.id.toString(),
        ],
      })
      .expect(200)

    const productEditted = await prisma.product.findUnique({
      where: { id: product.id.toString() },
    })

    expect(productEditted).not.toBeNull()
    expect(productEditted).toEqual(
      expect.objectContaining({
        title: 'Test Title',
        categoryId: anotherCategory.id.toString(),
        description: 'Product description',
        priceInCents: 10000,
      }),
    )

    const productImages = await prisma.attachment.findMany({
      where: { productId: product.id.toString() },
    })

    expect(productImages).toHaveLength(2)

    expect(productImages).toEqual([
      expect.objectContaining({ id: attachments[0].id.toString() }),
      expect.objectContaining({ id: anotherProductImage.id.toString() }),
    ])
  })
})
