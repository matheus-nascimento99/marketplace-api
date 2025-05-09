import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SellerFactory } from 'test/factories/make-seller'
import { DEFAULT_PASSWORD } from '@/utils/default-password'

describe('Authenticate seller (e2e)', () => {
  let app: INestApplication
  let sellerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    sellerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  test('/sellers/sessions (POST)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const result = await request(app.getHttpServer())
      .post('/sellers/sessions')
      .send({
        email: seller.email,
        password: DEFAULT_PASSWORD,
      })

    expect(result.headers).toEqual(
      expect.objectContaining({
        'set-cookie': [expect.stringContaining('auth=')],
      }),
    )
  })
})
