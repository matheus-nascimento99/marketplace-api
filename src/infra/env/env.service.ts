import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Env } from './env'

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(env: T) {
    return this.configService.get(env, { infer: true })
  }
}
