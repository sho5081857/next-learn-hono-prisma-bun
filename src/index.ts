import { Hono } from 'hono'
import { router } from './adapter/router/router'

const app = new Hono()

app.route('', router)

// export const handler = handle(app)

export default app 
