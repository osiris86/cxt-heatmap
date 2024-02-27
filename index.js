import { HeatmapGenerator } from './heatmapGenerator.js'
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import { PrometheusHandler } from './prometheusHandler.js'
import { MqttHandler } from './mqttHandler.js'
import { InfluxService } from './influxService.js'
import { ConfigService } from './configService.js'
import { HealthHandler } from './healthHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const targetFile = './finished.png'

const influxService = InfluxService.getInstance()
const mqttHandler = new MqttHandler(influxService)
const prometheusHandler = new PrometheusHandler(influxService)
const healthHandler = new HealthHandler(influxService)

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(targetFile, { root: __dirname })
})

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', prometheusHandler.getContentType())
  res.send(await prometheusHandler.queryData())
})

app.get('/health', async (req, res) => {
  res.send(await healthHandler.generateHealthData())
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

new HeatmapGenerator(targetFile, InfluxService.getInstance())

new ConfigService((idMap) => {
  prometheusHandler.registerMetrics(idMap)
  mqttHandler.setIdMap(idMap)
})
