import { Module } from '@nestjs/common'

import { Cryptographer } from '@/core/cryptography/cryptographer'

import { JwtCryptographer } from './jwt-cryptographer'

@Module({
  providers: [{ provide: Cryptographer, useClass: JwtCryptographer }],
  exports: [Cryptographer],
})
export class CryptographyModule {}
