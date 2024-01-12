import { createHeatmap } from './heatmapGenerator.js'
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const currentTemperatures = {
  A18: 25,
  Entertainment3: 20,
  D3: 28,
  D19: 27,
  H1: 35,
  J3: 34,
  J19: 33,
  K2: 34,
  L17: 33,
  M4: 28,
  N18: 26,
  P5: 18,
  P17: 26,
  Helpdesk8: 22,
  S12: 39,
  T20: 17
}
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.sendFile('./finished.png', { root: __dirname })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

createHeatmap(currentTemperatures)
setInterval(() => {
  createHeatmap(currentTemperatures)
}, 5000)
