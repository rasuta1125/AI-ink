import { serve } from '@hono/node-server'
import app from './src/index.tsx'

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
})