import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SellerFactory } from 'test/factories/make-seller'
import { JwtService } from '@nestjs/jwt'
import request from 'supertest'

describe('Get seller (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let sellerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)

    sellerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  test('/sellers/me (GET)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    await request(app.getHttpServer())
      .get(`/sellers/me`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({})
      .expect(200)
  })
})
