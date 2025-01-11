import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Create seller (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let attachmentFactory: AttachmentFactory

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    attachmentFactory = moduleRef.get(AttachmentFactory)

    await app.init()
  })

  test('/sellers (POST)', async () => {
    const attachment = await attachmentFactory.makePrismaAttachment({})

    const result = await request(app.getHttpServer()).post('/sellers').send({
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '11999999999',
      password: 'password123@',
      passwordConfirmation: 'password123@',
      avatarId: attachment.id.toString(),
    })

    expect(result.statusCode).toEqual(201)

    const sellers = await prisma.user.findMany({})

    expect(sellers).toHaveLength(1)

    const sellerAttachment = await prisma.attachment.findUnique({
      where: { id: attachment.id.toString() },
    })

    expect(sellerAttachment).not.toBeNull()
    expect(sellerAttachment?.userId).toEqual(sellers[0].id)
  })
})
