import client from 'prom-client'
import { InfluxDB } from '@influxdata/influxdb-client'
import fs from 'fs'
import 'dotenv/config'

const idMapFile = './idMap.json'

export class PrometheusHandler {
  influxDB = new InfluxDB({
    url: process.env.INFLUX_URL,
    token: process.env.INFLUX_TOKEN
  })

  register = new client.Registry()

  metrics = {}

  constructor(app) {
    this.registerMetrics()

    app.get('/metrics', async (req, res) => {
      res.setHeader('Content-Type', this.register.contentType)
      res.send(await this.queryData())
    })

    fs.watch(idMapFile, (event, filename) => {
      if (filename) {
        this.registerMetrics()
      }
    })
  }

  async queryData() {
    const queryApi = this.influxDB.getQueryApi('cxt')
    const fluxQuery =
      'from(bucket: "cxt") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature") |> group(columns: ["place"]) |> last()'
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const o = tableMeta.toObject(values)
      if (o.place) {
        this.metrics[o.place].set(o._value)
      }
    }

    return await this.register.metrics()
  }

  registerMetrics() {
    const idMap = JSON.parse(fs.readFileSync(idMapFile))
    for (const [key, value] of Object.entries(idMap)) {
      if (!this.metrics[value]) {
        const temperatureMeasurement = new client.Gauge({
          name: value,
          help: 'Temperature at Place ' + value
        })
        this.metrics[value] = temperatureMeasurement
        this.register.registerMetric(temperatureMeasurement)
      }
    }
  }
}
