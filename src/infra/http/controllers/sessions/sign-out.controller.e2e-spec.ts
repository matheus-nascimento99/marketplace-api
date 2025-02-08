import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SellerFactory } from 'test/factories/make-seller'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { JwtService } from '@nestjs/jwt'

describe('Sign out (e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let sellerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    jwt = moduleRef.get(JwtService)

    sellerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  test('/sign-out (POST)', async () => {
    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    const result = await request(app.getHttpServer())
      .post(`/sign-out`)
      .set('Cookie', [`access_token=${accessToken}`])
      .send({})
      .expect(200)

    expect(result.headers['set-cookie'][0]).toMatch(/access_token=;/)
  })
})
