import { HeatmapGenerator } from './heatmapGenerator.js'
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import { PrometheusHandler } from './prometheusHandler.js'
import { MqttHandler } from './mqttHandler.js'
import { InfluxService } from './influxService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const targetFile = './finished.png'

new MqttHandler(InfluxService.getInstance())

const app = express()
const port = 3000

new PrometheusHandler(app, InfluxService.getInstance())

app.get('/', (req, res) => {
  res.sendFile(targetFile, { root: __dirname })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

new HeatmapGenerator(targetFile, InfluxService.getInstance())
