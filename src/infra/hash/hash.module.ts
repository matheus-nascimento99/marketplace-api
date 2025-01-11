import { Module } from '@nestjs/common'

import { HashComparer } from '@/core/hash/hash-comparer'
import { HashCreator } from '@/core/hash/hash-creator'

import { BcryptHasher } from './bcrypt-hasher'

@Module({
  providers: [
    { provide: HashCreator, useClass: BcryptHasher },
    { provide: HashComparer, useClass: BcryptHasher },
  ],
  exports: [HashCreator, HashComparer],
})
export class HashModule {}
