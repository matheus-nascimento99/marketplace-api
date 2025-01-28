import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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

  await app.listen(process.env.PORT ?? 3333)
}

bootstrap()
