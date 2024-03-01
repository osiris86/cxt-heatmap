import { Inject, Injectable } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { InfluxService } from './services/influx.service';

@Injectable()
export class MqttController {
  constructor(private readonly influxService: InfluxService) {}

  @MessagePattern('cxt/temperature')
  handleTemperaturUpdate(@Payload() data: any) {
    console.log(data);
    /*if (!this.idMap) {
      return;
    }
    const place = this.idMap[data.id];
    if (place) {
      this.influxService.writeTemperatureData(place, data.temp);
    }*/
  }
}
