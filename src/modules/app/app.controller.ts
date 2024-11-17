import { Controller, Get } from '@nestjs/common';
import { PrometheusService } from '../../services/prometheus.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InfluxService } from 'src/services/influx.service';
import { DiscordService } from 'src/services/discord.service';
import { WeatherService } from 'src/services/weather.service';

@Controller()
export class AppController {
  private currentlyOffline = new Set<String>();

  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly influxService: InfluxService,
    private readonly discordService: DiscordService,
    private readonly weatherService: WeatherService,
  ) {}

  @Get('/metrics')
  getPrometheusMetrics(): Promise<string> {
    return this.prometheusService.queryData();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateHeatmap() {
    const currentTemperatures = await this.influxService.getLatestSeatData();

    const temperatures = Object.values(currentTemperatures);

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

  @Cron(CronExpression.EVERY_5_MINUTES)
  async logOutsideTemperature() {
    const outsideData = await this.weatherService.getTemperatureData();
    await this.influxService.writeTemperatureData(
      'Outside',
      outsideData.temperature,
    );
  }
}
