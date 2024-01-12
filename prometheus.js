import client from 'prom-client'
import { InfluxDB } from '@influxdata/influxdb-client'
import fs from 'fs'

export const preparePrometheus = (app) => {
  const influxDB = new InfluxDB({
    url: 'http://localhost:8086',
    token:
      'i3WqaWAoGtY6M2lEk_7c1kipx_Qk0eTIDX3hF1VDOc6mOZjEgTHog3vV5d-OBEdOLv4CRRvXohDvEuEhQjWpeA=='
  })

  const register = new client.Registry()

  const metrics = registerMetrics(register)

  // Add your custom metric to the registry
  // Create a route to increase counter
  app.get('/increase', (req, res) => {
    customCounter.inc()
    userCounter.inc()
    res.send('test')
  })
  // Create a route to expose metrics
  app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType)
    const queryApi = influxDB.getQueryApi('cxt')
    const fluxQuery =
      'from(bucket: "cxt") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature") |> group(columns: ["place"]) |> last()'
    const myQuery = async () => {
      for await (const { values, tableMeta } of queryApi.iterateRows(
        fluxQuery
      )) {
        const o = tableMeta.toObject(values)
        if (o.place) {
          metrics[o.place].set(o._value)
          console.log('setting metric')
        }
      }
      console.log('Here')
      res.send(await register.metrics())
    }

    /** Execute a query and receive line table metadata and rows. */
    myQuery()
  })
}

const registerMetrics = (register) => {
  const idMap = JSON.parse(fs.readFileSync('./idMap.json'))
  const metrics = {}
  for (const [key, value] of Object.entries(idMap)) {
    if (!metrics[value]) {
      const temperatureMeasurement = new client.Gauge({
        name: value,
        help: 'Temperature at Place ' + value
      })
      metrics[value] = temperatureMeasurement
      register.registerMetric(temperatureMeasurement)
    }
  }

  return metrics
}
