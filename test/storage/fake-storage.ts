import { randomUUID } from 'crypto'

import { UploadParamsRequest, UploadParamsResponse } from '@/core/@types/file'
import { StorageDownloader } from '@/core/storage/storage-downloader'
import { StorageUploader } from '@/core/storage/storage-uploader'

export class FakeStorage implements StorageUploader, StorageDownloader {
  public files: UploadParamsResponse['uploads'] = []

  async upload({
    uploads,
  }: UploadParamsRequest): Promise<UploadParamsResponse> {
    const newUploads: typeof this.files = uploads.map((upload) => ({
      key: this.createHash(upload.filename),
    }))

    this.files.push(...newUploads)

    return { uploads: newUploads }
  }

  async download(keys: string[]): Promise<void> {
    const filesFiltered = this.files.filter(
      (file) => !keys.some((key) => key === file.key),
    )

    this.files = filesFiltered
  }

  createHash(filename: string) {
    const filenameHashed = `${randomUUID()}-${new Date().getTime()}-${filename}`

    return filenameHashed
  }
}
