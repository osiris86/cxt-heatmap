import mqtt from 'mqtt'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import 'dotenv/config'
import fs from 'fs'

const idMapFile = './idMap.json'

export class MqttHandler {
  idMap
  influxDB = new InfluxDB({
    url: process.env.INFLUX_URL,
    token: process.env.INFLUX_TOKEN
  })

  constructor() {
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
    const writeApi = this.influxDB.getWriteApi('cxt', 'cxt')

    const point = new Point('temperature')
      .tag('place', place)
      .floatField('value', data.temp)
    writeApi.writePoint(point)
    writeApi.close()
  }
}
