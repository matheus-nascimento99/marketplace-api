import { randomUUID } from 'crypto'

import { Cryptographer } from '@/core/cryptography/cryptographer'

export class FakeCryptographer implements Cryptographer {
  async encrypt(record: Record<string, unknown>): Promise<string> { //eslint-disable-line
    const token = randomUUID()

    return token
  }
}
