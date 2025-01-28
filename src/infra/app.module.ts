import { Module } from '@nestjs/common'
import { HttpModule } from './http/http.module'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { PrismaService } from './database/prisma/prisma.service'
import { EnvModule } from './env/env.module'
import { AuthModule } from '@/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (obj) => envSchema.parse(obj),
    }),
    HttpModule,
    EnvModule,
    AuthModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
