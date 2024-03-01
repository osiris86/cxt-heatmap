import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusService } from './services/prometheus.service';
import { InfluxService } from './services/influx.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HeatmapService } from './services/heatmap.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, PrometheusService, InfluxService, HeatmapService],
})
export class AppModule {}
