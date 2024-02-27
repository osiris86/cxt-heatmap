import { Gauge, Registry } from 'prom-client';
import { Injectable } from '@nestjs/common';
import { InfluxService } from 'src/services/influx.service';

@Injectable()
export class PrometheusService {
  private readonly registry: Registry;

  private readonly metrics = {};

  constructor(private readonly influxService: InfluxService) {
    this.registry = new Registry();
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

  registerMetrics(idMap: Map<string, string>) {
    for (const [key, value] of Object.entries(idMap)) {
      if (!this.metrics[value]) {
        const temperatureMeasurement = new Gauge({
          name: value,
          help: 'Temperature at Place ' + value,
        });
        this.metrics[value] = temperatureMeasurement;
        this.registry.registerMetric(temperatureMeasurement);
      }
    }
  }
}
