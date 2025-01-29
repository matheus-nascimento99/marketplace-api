import { UploadParamsRequest, UploadParamsResponse } from '../@types/file'

export abstract class StorageUploader {
  abstract upload(
    uploadParams: UploadParamsRequest,
  ): Promise<UploadParamsResponse>
}
