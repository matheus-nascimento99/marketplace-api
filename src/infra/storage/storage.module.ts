import { StorageUploader } from '@/core/storage/storage-uploader'
import { Module } from '@nestjs/common'
import { DiskStorage } from './disk-storage'
import { EnvModule } from '../env/env.module'

@Module({
  imports: [EnvModule],
  providers: [{ provide: StorageUploader, useClass: DiskStorage }],
  exports: [StorageUploader],
})
export class StorageModule {}
