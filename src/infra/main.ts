import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as path from 'path'
import { MetricsInterceptor } from './observability/metrics.interceptor'
import { PrometheusService } from './observability/prometheus.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  // Configure CORS
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true)
    },
    credentials: true,
  })

  app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle('Marketplace')
    .setDescription('Marketplace api using NestJS')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth', // nome do cookie que você usa para o JWT
        description: 'JWT token stored in cookie',
      },
      'auth', // chave de identificação para referência
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('doc', app, document)

  // Configure static file serving
  const tmpPath =
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '..', 'tmp')
      : path.join(process.cwd(), 'tmp')

  app.useStaticAssets(tmpPath, {
    prefix: '/tmp/',
  })

  const prometheus = app.get(PrometheusService)

  app.useGlobalInterceptors(new MetricsInterceptor(prometheus))

  await app.listen(process.env.PORT ?? 3333)
}

bootstrap()
