import { TemperatureMap } from './temperatureMap.js'
import { createCanvas } from 'canvas'
import sharp from 'sharp'
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
    setInterval(() => {
      this.createHeatmap()
    }, 5000)
  }

  async createHeatmap() {
    const currentTemperatures = await this.influxService.getLatestSeatData()
    const temperaturePoints = []

    for (const [key, value] of Object.entries(currentTemperatures)) {
      const seatLocation = saalplanMap[key]
      const x = seatLocation.x
      const y = seatLocation.y
      const v = value
      temperaturePoints.push({ x: x, y: y, value: v })
    }

    const canvas = createCanvas(1903, 1124)
    const ctx = canvas.getContext('2d')
    const drw = new TemperatureMap(ctx)
    drw.setPoints(temperaturePoints, 1903, 1124)
    drw.drawFull(false, () => {
      drw.drawPoints(async () => {
        await sharp(bestuhlungsplan)
          .composite([{ input: canvas.toBuffer(), gravity: 'center' }])
          .toFile('./temp.png')

        fs.copyFileSync('./temp.png', this.targetFile)
        fs.rmSync('./temp.png')
      })
    })
  }
}
