import { HeatmapGenerator } from './heatmapGenerator.js'
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import { PrometheusHandler } from './prometheusHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const targetFile = './finished.png'

//startMqttHandler()

const app = express()
const port = 3000

new PrometheusHandler(app)

app.get('/', (req, res) => {
  res.sendFile(targetFile, { root: __dirname })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

new HeatmapGenerator(targetFile)
