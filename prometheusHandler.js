import client from 'prom-client'
import fs from 'fs'
import 'dotenv/config'

const idMapFile = './idMap.json'

export class PrometheusHandler {
  register = new client.Registry()

  metrics = {}

  influxService

  constructor(app, influxService) {
    this.influxService = influxService
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
    const seatData = await this.influxService.getLatestSeatData()
    for (const [key, value] of Object.entries(seatData)) {
      this.metrics[key].set(value)
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
