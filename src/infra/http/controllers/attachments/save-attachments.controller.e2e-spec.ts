import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import fs from 'node:fs/promises'
import path from 'node:path'

describe('Save attachments (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  afterAll(async () => {
    const folderPath = './tmp/test'
    const files = await fs.readdir(folderPath)

    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const stats = await fs.stat(filePath)

      if (stats.isFile()) {
        await fs.unlink(filePath) // Exclui o arquivo
      }
    }
  })

  test('/attachments (POST)', async () => {
    const result = await request(app.getHttpServer())
      .post('/attachments')
      .attach('files', './test/storage/sample-upload.jpg')
      .expect(201)

    expect(result.body).toEqual({
      attachments: [{ id: expect.any(String), url: expect.any(String) }],
    })

    const attachments = await prisma.attachment.findMany({})

    expect(attachments).toHaveLength(1)
  })
})
