import { Hono } from 'hono'
import router from './adapter/router/router'

const app = new Hono()

app.post('/register', (c) => {
  return c.text('Register')
})

app.post('/login', (c) => {
  return c.text('Login')
})

app.get('/users/:id', (c) => {
  return c.text('Users')
})

const invoice = new Hono()

invoice.post('', (c) => {
  return c.text('Invoices')
})

invoice.get('/latest', (c) => {
  return c.text('Latest Invoice')
})

invoice.get('/:id', (c) => {
  return c.text('Invoice')
})

app.route('/invoices', invoice)

app.route('', router)

export default app
