import { StorageUploader } from '@/core/storage/storage-uploader'
import { StorageDownloader } from '@/core/storage/storage-downloader'
import { Module } from '@nestjs/common'
import { DiskStorage } from './disk-storage'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: StorageUploader,
      useFactory: (envService: EnvService) => {
        return new DiskStorage(envService, process.cwd())
      },
      inject: [EnvService],
    },
    {
      provide: StorageDownloader,
      useFactory: (envService: EnvService) => {
        return new DiskStorage(envService, process.cwd())
      },
      inject: [EnvService],
    },
  ],
  exports: [StorageUploader, StorageDownloader],
})
export class StorageModule {}
