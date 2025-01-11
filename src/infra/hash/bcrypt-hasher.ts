import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcryptjs'

import { HashComparer } from '@/core/hash/hash-comparer'
import { HashCreator } from '@/core/hash/hash-creator'

@Injectable()
export class BcryptHasher implements HashCreator, HashComparer {
  private NUMBER_SALT_ROUNDS = 8

  async hash(plain: string): Promise<string> {
    const plainHashed = await hash(plain, this.NUMBER_SALT_ROUNDS)
    return plainHashed
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const isEqual = await compare(plain, hash)
    return isEqual
  }
}
