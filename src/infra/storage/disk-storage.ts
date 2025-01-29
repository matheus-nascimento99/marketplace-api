import { UploadParamsRequest, UploadParamsResponse } from '@/core/@types/file'
import { StorageDownloader } from '@/core/storage/storage-downloader'
import { StorageUploader } from '@/core/storage/storage-uploader'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { unlink } from 'node:fs/promises'
import { EnvService } from '../env/env.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DiskStorage implements StorageUploader, StorageDownloader {
  constructor(private env: EnvService) {}

  async upload({
    uploads,
  }: UploadParamsRequest): Promise<UploadParamsResponse> {
    const uploadsKeys: string[] = []

    uploads.forEach((upload) => {
      const uniqueFileName = this.createHash(upload.filename)

      uploadsKeys.push(uniqueFileName)

      const tempPath =
        this.env.get('NODE_ENV') === 'test'
          ? path.resolve(
              __dirname,
              '..',
              '..',
              '..',
              'tmp',
              'test',
              uniqueFileName,
            )
          : path.resolve(__dirname, '..', '..', '..', 'tmp', uniqueFileName)

      fs.writeFileSync(tempPath, upload.body)
    })

    return {
      uploads: uploadsKeys.map((uploadKey) => ({ key: uploadKey })),
    }
  }

  async download(keys: string[]): Promise<void> {
    const unlinkFiles = keys.map((key) => {
      const tempPath =
        this.env.get('NODE_ENV') === 'test'
          ? path.resolve(__dirname, '..', '..', '..', 'tmp', 'test', key)
          : path.resolve(__dirname, '..', '..', '..', 'tmp', key)

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
