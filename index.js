import { TemperatureMap } from './temperatureMap.js'
import { createCanvas } from 'canvas'
import sharp from 'sharp'
import { saalplanMap } from './saalplanMap.js'

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

const temperaturePoints = []

for (const [key, value] of Object.entries(currentTemperatures)) {
  const seatLocation = saalplanMap[key]
  const x = seatLocation.x
  const y = seatLocation.y
  const v = value
  temperaturePoints.push({ x: x, y: y, value: v })
}

console.log(temperaturePoints)

const canvas = createCanvas(1903, 1124)
const ctx = canvas.getContext('2d')
const drw = new TemperatureMap(ctx)
drw.setPoints(temperaturePoints, 1903, 1124)
drw.drawFull(false, function () {
  drw.drawPoints(function () {
    sharp('./bestuhlungsplan_cxt25.png')
      .composite([{ input: canvas.toBuffer(), gravity: 'center' }])
      .toFile('./finished.png')
  })
})
