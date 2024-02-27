import { InfluxDB, Point } from '@influxdata/influxdb-client'

export class InfluxService {
  static instance = new InfluxService()
  static getInstance() {
    return this.instance
  }

  influxDB = new InfluxDB({
    url: process.env.INFLUX_URL,
    token: process.env.INFLUX_TOKEN
  })

  constructor() {}

  async getLatestSeatData() {
    const queryApi = this.influxDB.getQueryApi('cxt')
    const fluxQuery =
      'from(bucket: "cxt") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature") |> group(columns: ["place"]) |> last()'

    const seatData = {}
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const o = tableMeta.toObject(values)
      if (o.place) {
        seatData[o.place] = {
          value: o._value,
          timestamp: o._time
        }
      }
    }

    return seatData
  }

  writeTemperatureData(place, temp) {
    const writeApi = this.influxDB.getWriteApi('cxt', 'cxt')

    const point = new Point('temperature')
      .tag('place', place)
      .floatField('value', temp)
    writeApi.writePoint(point)
    writeApi.close()
  }
}
