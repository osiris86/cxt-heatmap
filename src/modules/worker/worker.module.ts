import { Module } from '@nestjs/common';
import { InfluxService } from '../../services/influx.service';
import { ConfigModule } from '@nestjs/config';
import { HeatmapService } from '../../services/heatmap.service';
import { WorkerController } from './worker.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscordService } from 'src/services/discord.service';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [WorkerController],
  providers: [InfluxService, HeatmapService, DiscordService],
})
export class WorkerModule {}
