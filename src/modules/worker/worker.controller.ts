import { Controller } from '@nestjs/common';
import { HeatmapService } from '../../services/heatmap.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiscordService } from 'src/services/discord.service';
import { InfluxService } from 'src/services/influx.service';
import { saalplanMap } from 'src/helpers/saalplanMap';
import { SeatData } from 'src/models/seat-data';

@Controller()
export class WorkerController {
  currentlyOffline = new Set<String>();

  constructor(
    private readonly influxService: InfluxService,
    private readonly heatmapService: HeatmapService,
    private readonly discordService: DiscordService,
  ) {}

  async onApplicationBootstrap() {
    await this.updateHeatmap();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateHeatmap() {
    const currentTemperatures = await this.influxService.getLatestSeatData();

    console.log(currentTemperatures);

    this.heatmapService.createHeatmap(currentTemperatures);

    for (const seatData of Object.values(currentTemperatures)) {
      if (
        new Date(seatData.timestamp).getTime() <
        Date.now() - 15 * 60 * 1000
      ) {
        if (!this.currentlyOffline.has(seatData.seat)) {
          this.currentlyOffline.add(seatData.seat);
          this.discordService.sendOfflineNotification(seatData.seat);
        }
      } else {
        if (this.currentlyOffline.has(seatData.seat)) {
          this.discordService.sendOnlineNotification(seatData.seat);
        }
        this.currentlyOffline.delete(seatData.seat);
      }
    }
  }
}
