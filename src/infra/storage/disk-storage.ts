import { UploadParamsRequest, UploadParamsResponse } from '@/core/@types/file'
import { StorageDownloader } from '@/core/storage/storage-downloader'
import { StorageUploader } from '@/core/storage/storage-uploader'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { unlink } from 'fs/promises'
import { EnvService } from '../env/env.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DiskStorage implements StorageUploader, StorageDownloader {
  private isTest: boolean
  constructor(
    private env: EnvService,
    private readonly basePath: string,
  ) {
    this.isTest = this.env.get('NODE_ENV') === 'test'
  }

  async upload({
    uploads,
  }: UploadParamsRequest): Promise<UploadParamsResponse> {
    const uploadsKeys: string[] = []

    uploads.forEach((upload) => {
      const uniqueFileName = this.createHash(upload.filename)

      uploadsKeys.push(uniqueFileName)

      const temp = this.isTest
        ? path.join(this.basePath, 'tmp', 'test')
        : path.join(this.basePath, 'tmp')

      if (!fs.existsSync(temp)) {
        fs.mkdirSync(temp, { recursive: true })
      }

      const tempPath = this.isTest
        ? path.join(this.basePath, 'tmp', 'test', uniqueFileName)
        : path.join(this.basePath, 'tmp', uniqueFileName)

      fs.writeFileSync(tempPath, upload.body)
    })

    return {
      uploads: uploadsKeys.map((uploadKey) => ({ key: uploadKey })),
    }
  }

  async download(keys: string[]): Promise<void> {
    const unlinkFiles = keys.map((key) => {
      const tempPath = this.isTest
        ? path.join(this.basePath, 'tmp', 'test', key)
        : path.join(this.basePath, 'tmp', key)

      return async () => {
        await unlink(tempPath)
      }
    })

    await Promise.all(unlinkFiles.map((fn) => fn()))
  }

  createHash(filename: string) {
    const filenameHashed = `${randomUUID()}-${new Date().getTime()}-${filename}`

    return filenameHashed
  }
}
