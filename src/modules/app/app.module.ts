import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrometheusService } from '../../services/prometheus.service';
import { InfluxService } from '../../services/influx.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '../../services/config.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [PrometheusService, InfluxService, ConfigService],
})
export class AppModule {}
