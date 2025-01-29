export interface UploadParamsRequest {
  uploads: { filename: string; mimeType: string; body: Buffer }[]
}

export interface UploadParamsResponse {
  uploads: { key: string }[]
}
