import { Controller } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiscordService } from 'src/services/discord.service';
import { InfluxService } from 'src/services/influx.service';
import { saalplanMap } from 'src/helpers/saalplanMap';
import { CxtHeatmapDrawer } from 'cxt-heatmap-drawer';
import { CANVAS_FILE, TARGET_FILE } from 'src/helpers/Constants';

@Controller()
export class WorkerController {
  currentlyOffline = new Set<String>();

  private readonly heatmapDrawer = new CxtHeatmapDrawer();

  constructor(
    private readonly influxService: InfluxService,
    private readonly discordService: DiscordService,
  ) {}

  async onApplicationBootstrap() {
    await this.updateHeatmap();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateHeatmap() {
    const currentTemperatures = await this.influxService.getLatestSeatData();

    const temperatures = Object.values(currentTemperatures);

    await this.heatmapDrawer.drawHeatmapFile(
      temperatures,
      saalplanMap,
      CANVAS_FILE,
      TARGET_FILE,
    );

    for (const seatData of temperatures) {
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
