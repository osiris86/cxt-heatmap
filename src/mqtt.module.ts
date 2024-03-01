import { Module } from '@nestjs/common';
import { InfluxService } from './services/influx.service';
import { MqttController } from './mqtt.controller';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from './services/config.service';

@Module({
  imports: [ConfigModule.forRoot(), EventEmitterModule.forRoot()],
  controllers: [MqttController],
  providers: [InfluxService, ConfigService],
})
export class MqttModule {}
