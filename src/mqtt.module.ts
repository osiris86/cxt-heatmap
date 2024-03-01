import { Module } from '@nestjs/common';
import { InfluxService } from './services/influx.service';
import { MqttController } from './mqtt.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [MqttController],
  providers: [InfluxService],
})
export class MqttModule {}
