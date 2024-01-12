import mqtt from 'mqtt'

export const startMqttHandler = () => {
  const client = mqtt.connect('mqtt://broker.hivemq.com')
  client.on('message', (topic, message) => {
    const data = JSON.parse(message)
    console.log(data)
  })
  client.on('connect', () => {
    client.subscribe('cxtTest')
  })
  client.on('error', (error) => {
    console.error(error)
  })
}
