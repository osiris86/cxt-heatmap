import client from 'prom-client'

const register = new client.Registry()

// Create custom metrics
const customCounter = new client.Counter({
  name: 'my_custom_counter',
  help: 'Custom counter for my application'
})

// Create custom metrics
const userCounter = new client.Counter({
  name: 'my_user_counter',
  help: 'User counter for my application'
})

// Add your custom metric to the registry
register.registerMetric(customCounter)
register.registerMetric(userCounter)
// Create a route to increase counter
app.get('/increase', (req, res) => {
  customCounter.inc()
  userCounter.inc()
  res.send('test')
})
// Create a route to expose metrics
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType)
  res.send(await register.metrics())
})
