import client from 'prom-client'
import { InfluxDB } from '@influxdata/influxdb-client'
import fs from 'fs'

const idMapFile = './idMap.json'

export class PrometheusHandler {
  influxDB = new InfluxDB({
    url: 'http://localhost:8086',
    token:
      'i3WqaWAoGtY6M2lEk_7c1kipx_Qk0eTIDX3hF1VDOc6mOZjEgTHog3vV5d-OBEdOLv4CRRvXohDvEuEhQjWpeA=='
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
        console.log('setting metric')
      }
    }

    return await this.register.metrics()
  }

  registerMetrics() {
    console.log('Registering Metrics')
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
