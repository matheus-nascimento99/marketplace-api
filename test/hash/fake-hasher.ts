import { HashComparer } from '@/core/hash/hash-comparer'
import { HashCreator } from '@/core/hash/hash-creator'

export class FakeHasher implements HashComparer, HashCreator {
  async hash(value: string): Promise<string> {
    const plainHashed = `${value}-hashed`

    return plainHashed
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const isEqual = `${plain}-hashed` === hash

    return isEqual
  }
}
