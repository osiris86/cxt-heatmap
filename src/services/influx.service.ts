import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeatData } from 'src/models/seat-data';

@Injectable()
export class InfluxService {
  private readonly influxDB;

  constructor(private readonly configService: ConfigService) {
    this.influxDB = new InfluxDB({
      url: configService.get('INFLUX_URL'),
      token: configService.get('INFLUX_TOKEN'),
    });
  }

  async getLatestSeatData(): Promise<Map<string, SeatData>> {
    const queryApi = this.influxDB.getQueryApi('cxt');
    const fluxQuery =
      'from(bucket: "cxt") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature") |> group(columns: ["place"]) |> last()';

    const seatData = new Map<string, SeatData>();
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const o = tableMeta.toObject(values);
      if (o.place) {
        seatData[o.place] = {
          seat: o.place,
          value: o._value,
          timestamp: o._time,
        };
      }
    }

    return seatData;
  }

  writeTemperatureData(place, temp) {
    const writeApi = this.influxDB.getWriteApi('cxt', 'cxt');

    const point = new Point('temperature')
      .tag('place', place)
      .floatField('value', temp);
    writeApi.writePoint(point);
    writeApi.close();
  }
}
