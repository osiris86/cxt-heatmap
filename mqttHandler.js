import mqtt from 'mqtt'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { idMap } from './idMap.js'

export const startMqttHandler = () => {
  const influxDB = new InfluxDB({
    url: 'http://localhost:8086',
    token:
      'i3WqaWAoGtY6M2lEk_7c1kipx_Qk0eTIDX3hF1VDOc6mOZjEgTHog3vV5d-OBEdOLv4CRRvXohDvEuEhQjWpeA=='
  })

  const client = mqtt.connect('mqtt://broker.hivemq.com')
  client.on('message', (topic, message) => {
    const data = JSON.parse(message)
    console.log(data)
    const place = idMap[data.id]
    console.log(idMap)
    console.log(place)
    const writeApi = influxDB.getWriteApi('cxt', 'cxt')

    const point = new Point('temperature')
      .tag('place', place)
      .floatField('value', data.temp)
    writeApi.writePoint(point)
    writeApi.close()
  })
  client.on('connect', () => {
    client.subscribe('cxtTest')
  })
  client.on('error', (error) => {
    console.error(error)
  })
}
