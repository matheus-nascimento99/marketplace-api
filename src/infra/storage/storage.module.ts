import { StorageUploader } from '@/core/storage/storage-uploader'
import { Module } from '@nestjs/common'
import { DiskStorage } from './disk-storage'
import { EnvModule } from '../env/env.module'
import { StorageDownloader } from '@/core/storage/storage-downloader'

@Module({
  imports: [EnvModule],
  providers: [
    { provide: StorageUploader, useClass: DiskStorage },
    { provide: StorageDownloader, useClass: DiskStorage },
  ],
  exports: [StorageUploader, StorageDownloader],
})
export class StorageModule {}
