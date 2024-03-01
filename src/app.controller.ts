import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrometheusService } from './services/prometheus.service';
import { HeatmapService } from './services/heatmap.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller()
export class AppController {
  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly heatmapService: HeatmapService,
  ) {}

  async onApplicationBootstrap() {
    await this.updateHeatmap();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  updateHeatmap() {
    this.heatmapService.createHeatmap();
  }

  @Get('/metrics')
  getPrometheusMetrics(): Promise<string> {
    return this.prometheusService.queryData();
  }
}
