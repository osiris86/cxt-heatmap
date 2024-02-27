import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrometheusService } from './services/prometheus.service';

@Controller()
export class AppController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get('/metrics')
  getPrometheusMetrics(): Promise<string> {
    return this.prometheusService.queryData();
  }
}
