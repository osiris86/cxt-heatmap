import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { InfluxService } from '../../services/influx.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ID_MAP_FILE } from '../../helpers/Constants';
import { readFileSync } from 'fs';

@Injectable()
export class MqttController {
  private readonly logger = new Logger(MqttController.name);

  private idMap = {};
  constructor(private readonly influxService: InfluxService) {}

  onApplicationBootstrap() {
    this.idMap = JSON.parse(readFileSync(ID_MAP_FILE).toString());
  }

  @OnEvent('idMap.changed')
  private onIdMapChanged(newIdMap: any) {
    this.logger.log('idMap changed: ' + JSON.stringify(newIdMap));
    this.idMap = newIdMap;
  }

  @MessagePattern('cxt/temperature')
  handleTemperaturUpdate(@Payload() data: any) {
    this.logger.log('New sensor data: ' + JSON.stringify(data));
    if (!this.idMap) {
      return;
    }
    const place = this.idMap[data.id];
    if (place) {
      this.influxService.writeTemperatureData(place, data.temp);
    }
  }
}
