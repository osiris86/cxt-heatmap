import { Controller } from '@nestjs/common';
import { HeatmapService } from './services/heatmap.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller()
export class WorkerController {
  constructor(private readonly heatmapService: HeatmapService) {}

  async onApplicationBootstrap() {
    await this.updateHeatmap();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  updateHeatmap() {
    this.heatmapService.createHeatmap();
  }
}
