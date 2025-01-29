import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { join } from 'node:path'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle('Marketplace')
    .setDescription('Marketplace api using NestJS')
    .setVersion('1.0')
    // .addApiKey(
    //   {
    //     type: 'apiKey',
    //     in: 'cookie',
    //     name: 'access_token', // nome do cookie que você usa para o JWT
    //     description: 'JWT token stored in cookie',
    //   },
    //   'jwt_auth', // chave de identificação para referência
    // )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('doc', app, document)

  // Configure static file serving
  app.useStaticAssets(join(__dirname, '..', '..', '..', 'tmp'), {
    prefix: '/tmp/',
  })

  await app.listen(process.env.PORT ?? 3333)
}

bootstrap()
