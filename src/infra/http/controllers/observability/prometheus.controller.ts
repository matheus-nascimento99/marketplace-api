import { Public } from '@/auth/public'
import { PrometheusService } from '@/infra/observability/prometheus.service'
import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('observability')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  @Public()
  async getMetrics(@Res() res: Response) {
    const metrics = await this.prometheusService.getMetrics()
    res.setHeader('Content-Type', 'text/plain')
    res.send(metrics)
  }
}
