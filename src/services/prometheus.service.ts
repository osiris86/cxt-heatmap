import { Gauge, Registry, register } from 'prom-client';
import { Injectable } from '@nestjs/common';
import { InfluxService } from 'src/services/influx.service';
import { ID_MAP_FILE } from 'src/helpers/Constants';
import { readFileSync } from 'fs';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PrometheusService {
  private readonly registry: Registry;

  private idMap = new Map<string, string>();
  private metrics = {};

  constructor(private readonly influxService: InfluxService) {
    this.registry = new Registry();
  }

  onApplicationBootstrap() {
    this.idMap = JSON.parse(readFileSync(ID_MAP_FILE).toString());
    this.registerMetrics();
  }

  @OnEvent('idMap.changed')
  private onIdMapChanged(newIdMap: any) {
    console.log('PrometheusService: idMap changed');
    this.idMap = newIdMap;
    this.registerMetrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  async queryData(): Promise<string> {
    const seatData = await this.influxService.getLatestSeatData();
    for (const [key, value] of Object.entries(seatData)) {
      this.metrics[key].set(value.value);
    }

    return await this.registry.metrics();
  }

  private registerMetrics() {
    register.clear();
    this.registry.clear();
    this.metrics = {};
    for (const [key, value] of Object.entries(this.idMap)) {
      const temperatureMeasurement = new Gauge({
        name: value,
        help: 'Temperature at Place ' + value,
      });
      this.metrics[value] = temperatureMeasurement;
      this.registry.registerMetric(temperatureMeasurement);
    }
  }
}
