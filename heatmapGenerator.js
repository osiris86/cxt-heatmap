import { TemperatureMap } from './temperatureMap.js'
import { createCanvas, Image } from 'canvas'
import { saalplanMap } from './saalplanMap.js'
import fs from 'fs'

const bestuhlungsplan = './bestuhlungsplan_cxt25.png'

export class HeatmapGenerator {
  targetFile = ''
  influxService
  constructor(targetFile, influxService) {
    this.influxService = influxService
    this.targetFile = targetFile
    this.createHeatmap()
  }

  async createHeatmap() {
    const currentTemperatures = await this.influxService.getLatestSeatData()
    const temperaturePoints = []

    for (const [key, value] of Object.entries(currentTemperatures)) {
      const seatLocation = saalplanMap[key]
      const x = seatLocation.x
      const y = seatLocation.y
      const v = value.value
      temperaturePoints.push({ x: x, y: y, value: v })
    }

    const canvas = createCanvas(1903, 1124)
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const drw = new TemperatureMap(ctx)
    img.onload = () => {
      drw.setPoints(temperaturePoints, 1903, 1124)
      drw.drawFull(false, () => {
        drw.drawPoints(async () => {
          const img2 = new Image()
          img2.onload = () => {
            const combinedCanvas = createCanvas(1903, 1124)
            const combinedCtx = combinedCanvas.getContext('2d')
            combinedCtx.drawImage(img, 0, 0)
            combinedCtx.drawImage(img2, 0, 0)

            const out = fs.createWriteStream('./temp.png')
            const stream = combinedCanvas.createPNGStream()
            stream.pipe(out)
            out.on('finish', () => {
              fs.copyFileSync('./temp.png', this.targetFile)
              fs.rmSync('./temp.png')
              setTimeout(() => {
                this.createHeatmap()
              }, 5000)
            })
          }
          img2.src = canvas.toDataURL()
        })
      })
    }
    img.src = bestuhlungsplan
  }
}
