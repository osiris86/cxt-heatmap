import mqtt from 'mqtt'
import 'dotenv/config'
import fs from 'fs'

export class MqttHandler {
  idMap

  influxService

  constructor(influxService) {
    this.influxService = influxService

    const client = mqtt.connect(process.env.MQTT_URL, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD
    })
    client.on('message', this.handleTemperaturUpdate.bind(this))
    client.on('connect', () => {
      console.log('MQTT connected')
      client.subscribe('cxtTest')
    })
    client.on('error', (error) => {
      console.error('Failed to connect to MQTT', error)
    })
  }

  handleTemperaturUpdate(topic, message) {
    if (!this.idMap) {
      return
    }
    const data = JSON.parse(message)
    const place = this.idMap[data.id]
    if (place) {
      this.influxService.writeTemperatureData(place, data.temp)
    }
  }

  setIdMap(idMap) {
    this.idMap = idMap
  }
}
