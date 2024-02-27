import client from 'prom-client'
import fs from 'fs'
import 'dotenv/config'

const idMapFile = './idMap.json'

export class PrometheusHandler {
  register = new client.Registry()

  metrics = {}

  influxService

  constructor(influxService) {
    this.influxService = influxService
  }

  getContentType() {
    return this.register.contentType
  }

  async queryData() {
    const seatData = await this.influxService.getLatestSeatData()
    for (const [key, value] of Object.entries(seatData)) {
      this.metrics[key].set(value)
    }

    return await this.register.metrics()
  }

  registerMetrics(idMap) {
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
