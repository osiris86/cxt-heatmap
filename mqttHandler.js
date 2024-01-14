import mqtt from 'mqtt'
import 'dotenv/config'
import fs from 'fs'

const idMapFile = './idMap.json'

export class MqttHandler {
  idMap

  influxService

  constructor(influxService) {
    this.influxService = influxService
    this.idMap = JSON.parse(fs.readFileSync(idMapFile))

    const client = mqtt.connect(process.env.MQTT_URL)
    client.on('message', this.handleTemperaturUpdate.bind(this))
    client.on('connect', () => {
      console.log('MQTT connected')
      client.subscribe('cxtTest')
    })
    client.on('error', (error) => {
      console.error(error)
    })
  }

  handleTemperaturUpdate(topic, message) {
    const data = JSON.parse(message)
    const place = this.idMap[data.id]
    this.influxService.writeTemperatureData(place, data.temp)
  }
}
