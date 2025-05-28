import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { PrometheusService } from './prometheus.service'

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly prometheus: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const method = req.method
    const handler = context.getHandler().name

    // inicia o timer do histograma
    const endTimer = this.prometheus.httpRequestDuration.startTimer({
      method,
      handler,
    })

    return next.handle().pipe(
      tap(() => {
        // incrementa contador
        this.prometheus.httpRequestCounter.inc({ method, handler })
        // finaliza timer
        endTimer()
      }),
    )
  }
}
