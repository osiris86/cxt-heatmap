import { Inject, Injectable } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { InfluxService } from './services/influx.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ID_MAP_FILE } from './helpers/Constants';
import { readFileSync } from 'fs';

@Injectable()
export class MqttController {
  private idMap = {};
  constructor(private readonly influxService: InfluxService) {}

  onApplicationBootstrap() {
    this.idMap = JSON.parse(readFileSync(ID_MAP_FILE).toString());
  }

  @OnEvent('idMap.changed')
  private onIdMapChanged(newIdMap: any) {
    console.log('MqttController: idMap changed');
    this.idMap = newIdMap;
  }

  @MessagePattern('cxt/temperature')
  handleTemperaturUpdate(@Payload() data: any) {
    console.log(data);
    if (!this.idMap) {
      return;
    }
    const place = this.idMap[data.id];
    if (place) {
      this.influxService.writeTemperatureData(place, data.temp);
    }
  }
}
