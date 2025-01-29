export abstract class StorageDownloader {
  abstract download(keys: string[]): Promise<void>
}
