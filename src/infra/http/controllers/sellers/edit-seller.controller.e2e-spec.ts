import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { SellerFactory } from 'test/factories/make-seller'
import { AttachmentFactory } from 'test/factories/make-attachment'
import * as path from 'path'
import * as fs from 'fs/promises'
import { JwtService } from '@nestjs/jwt'

describe('Edit seller (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let sellerFactory: SellerFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    jwt = moduleRef.get(JwtService)

    sellerFactory = moduleRef.get(SellerFactory)

    await app.init()
  })

  afterEach(async () => {
    const folderPath = './tmp/test'
    const attachments = await fs.readdir(folderPath)

    for (const attachment of attachments) {
      const filePath = path.join(folderPath, attachment)
      const stats = await fs.stat(filePath)

      if (stats.isFile()) {
        await fs.unlink(filePath)
      }
    }
  })

  test('/sellers (PUT)', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/attachments')
      .attach('files', './test/storage/sample-upload.jpg')

    const avatar = body.attachments[0]

    const seller = await sellerFactory.makePrismaSeller({})

    const accessToken = await jwt.signAsync({ sub: seller.id.toString() })

    await request(app.getHttpServer())
      .put(`/sellers`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '11999999999',
        avatarId: avatar.id,
      })
      .expect(200)

    const sellerEditted = await prisma.user.findUnique({
      where: { id: seller.id.toString() },
    })

    expect(sellerEditted).not.toBeNull()
    expect(sellerEditted).toEqual(
      expect.objectContaining({
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '11999999999',
      }),
    )

    const sellerAvatar = await prisma.attachment.findUnique({
      where: { id: avatar.id.toString() },
    })

    expect(sellerAvatar).not.toBeNull()
    expect(sellerAvatar?.userId).toEqual(seller.id.toString())

    await request(app.getHttpServer())
      .put(`/sellers`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '11999999999',
        avatarId: avatar.id,
      })
      .expect(200)

    const attachments = await prisma.attachment.findMany({})

    expect(attachments).toHaveLength(1)

    const { body: anotherBody } = await request(app.getHttpServer())
      .post('/attachments')
      .attach('files', './test/storage/sample-upload.jpg')

    const anotherAvatar = anotherBody.attachments[0]

    await request(app.getHttpServer())
      .put(`/sellers`)
      .set('Cookie', [`auth=${accessToken}`])
      .send({
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '11999999999',
        avatarId: anotherAvatar.id,
      })
      .expect(200)

    const newAttachments = await prisma.attachment.findMany({})

    expect(newAttachments).toHaveLength(1)

    expect(newAttachments).toEqual([
      expect.objectContaining({
        id: anotherAvatar.id,
      }),
    ])
  })
})
