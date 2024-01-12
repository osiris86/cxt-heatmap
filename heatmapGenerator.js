import { TemperatureMap } from './temperatureMap.js'
import { createCanvas } from 'canvas'
import sharp from 'sharp'
import { saalplanMap } from './saalplanMap.js'
import fs from 'fs'

export const createHeatmap = (currentTemperatures) => {
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
  drw.drawFull(false, function () {
    drw.drawPoints(function () {
      sharp('./bestuhlungsplan_cxt25.png')
        .composite([{ input: canvas.toBuffer(), gravity: 'center' }])
        .toFile('./temp.png', (err, info) => {
          if (!err) {
            fs.copyFile('./temp.png', './finished.png', (err) => {
              if (err) throw err
            })
          }
        })
    })
  })
}
