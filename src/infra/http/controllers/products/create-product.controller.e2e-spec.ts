import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CategoryFactory } from 'test/factories/make-category'
import { faker } from '@faker-js/faker'
import { JwtService } from '@nestjs/jwt'
import { SellerFactory } from 'test/factories/make-seller'

describe('Create product (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let prisma: PrismaService
  let attachmentFactory: AttachmentFactory
  let categoryFactory: CategoryFactory
  let sellerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AttachmentFactory, CategoryFactory, SellerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)

    prisma = moduleRef.get(PrismaService)

    attachmentFactory = moduleRef.get(AttachmentFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  test('/products (POST)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const attachment = await attachmentFactory.makePrismaAttachment({})

    const category = await categoryFactory.makePrismaCategory({})

    const result = await request(app.getHttpServer())
      .post('/products')
      .set('Cookie', [`access_token=${accessToken}`])
      .send({
        title: faker.lorem.sentence(),
        categoryId: category.id.toString(),
        description: faker.lorem.sentence(),
        priceInCents: faker.number.int({ max: 10000 }),
        attachmentsIds: [attachment.id.toString()],
      })

    expect(result.statusCode).toEqual(201)

    const product = result.body.product

    const productAttachments = await prisma.attachment.findMany({
      where: { productId: product.id },
    })

    expect(productAttachments).toHaveLength(1)
  })
})
