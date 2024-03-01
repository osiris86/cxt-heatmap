import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusService } from './services/prometheus.service';
import { HeatmapService } from './services/heatmap.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createReadStream } from 'fs';

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

  @Get('/')
  getHeatmap(@Res() res: Response) {
    const file = createReadStream('./heatmap.png');
    res.setHeader('Content-Type', 'image/png');
    file.pipe(res as unknown as NodeJS.WritableStream);
  }
}
