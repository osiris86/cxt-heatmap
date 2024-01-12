import { createHeatmap } from './heatmapGenerator.js'

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

createHeatmap(currentTemperatures)
