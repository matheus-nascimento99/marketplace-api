// prometheus.service.ts
import { Injectable } from '@nestjs/common'
import * as client from 'prom-client'

@Injectable()
export class PrometheusService {
  public readonly httpRequestCounter: client.Counter<string>
  public readonly httpRequestDuration: client.Histogram<string>
  private readonly register: client.Registry

  constructor() {
    this.register = new client.Registry()
    this.register.setDefaultLabels({ app: 'nestjs-prometheus' })
    client.collectDefaultMetrics({ register: this.register })

    this.httpRequestCounter = new client.Counter({
      name: 'http_requests_total',
      help: 'Total de requisições HTTP',
      labelNames: ['method', 'handler'],
      registers: [this.register],
    })

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duração das requisições HTTP em segundos',
      labelNames: ['method', 'handler'],
      buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
      registers: [this.register],
    })
  }

  getMetrics(): Promise<string> {
    return this.register.metrics()
  }
}
