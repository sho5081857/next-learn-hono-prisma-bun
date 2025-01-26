import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'
import { RevenueRepositoryImpl } from '../gateway/revenue'
import { RevenueUseCaseImpl } from '../../usecase/revenue'
import { RevenueHandler } from '../controller/handler/revenue'
import { prisma } from '../../database/config'
import { CustomerRepositoryImpl } from '../gateway/customer'
import { CustomerUseCaseImpl } from '../../usecase/customer'
import { CustomerHandler } from '../controller/handler/customer'
import { InvoiceRepositoryImpl } from '../gateway/invoice'
import { InvoiceUseCaseImpl } from '../../usecase/invoice'
import { InvoiceHandler } from '../controller/handler/invoice'
import { zValidator } from '@hono/zod-validator'

import {
  createInvoiceRequest,
  newCreateInvoiceRequest,
  newUpdateInvoiceRequest,
  updateInvoiceRequest,
} from '../controller/presenter/invoice/request/invoice-request'
import { UserRepositoryImpl } from '../gateway/user'
import { UserUseCaseImpl } from '../../usecase/user'
import { UserHandler } from '../controller/handler/user'
import {
  createUserRequest,
  loginRequest,
  newCreateUserRequest,
  newLoginRequest,
} from '../controller/presenter/user/request/user-request'

const JWT_SECRET = process.env.SECRET ?? 'secret'
const router = new Hono()

router.use('*', cors({ origin: ['http://example.com'] }))
router.use('*', logger())
router.use('*', timeout(2000))

router.get('/', (c) => c.html('<h1>Index Page</h1>'))
router.get('/health', (c) => c.json({ status: 'healthy' }))

const userRepository = new UserRepositoryImpl(prisma)
const userUseCase = new UserUseCaseImpl(userRepository)
const userHandler = new UserHandler(userUseCase)

const customerRepository = new CustomerRepositoryImpl(prisma)
const customerUseCase = new CustomerUseCaseImpl(customerRepository)
const customerHandler = new CustomerHandler(customerUseCase)

const invoiceRepository = new InvoiceRepositoryImpl(prisma)
const invoiceUseCase = new InvoiceUseCaseImpl(invoiceRepository)
const invoiceHandler = new InvoiceHandler(invoiceUseCase)

const revenueRepository = new RevenueRepositoryImpl(prisma)
const revenueUseCase = new RevenueUseCaseImpl(revenueRepository)
const revenueHandler = new RevenueHandler(revenueUseCase)

const api = router.basePath('/api/v1')

api.use(
  '/users/*',
  jwt({
    secret: JWT_SECRET,
  })
)
api.use(
  '/customers/*',
  jwt({
    secret: JWT_SECRET,
  })
)
api.use(
  '/revenues/*',
  jwt({
    secret: JWT_SECRET,
  })
)
api.use(
  '/invoices/*',
  jwt({
    secret: JWT_SECRET,
  })
)

api.post('/register', zValidator('json', createUserRequest), (c) => {
  const validated = c.req.valid('json')
  const createUser = newCreateUserRequest(validated)
  return userHandler.createUser(c, createUser)
})

api.post('/login', zValidator('json', loginRequest), (c) => {
  const validated = c.req.valid('json')
  const loginUser = newLoginRequest(validated)
  return userHandler.loginUser(c, loginUser)
})

const user = new Hono()
user.get('/:id', (c) => {
  return userHandler.getUserById(c)
})

const customer = new Hono()
customer.get('', (c) => {
  return customerHandler.getAllCustomerList(c)
})
customer.get('/filtered', (c) => {
  return customerHandler.getFilteredCustomerList(c)
})
customer.get('/count', (c) => {
  return customerHandler.getAllCustomerCount(c)
})

const invoice = new Hono()
invoice.get('/latest', (c) => {
  return invoiceHandler.getLatestInvoicesList(c)
})
invoice.get('/filtered', (c) => {
  return invoiceHandler.getFilteredInvoicesList(c)
})
invoice.get('/:id', (c) => {
  return invoiceHandler.getInvoiceById(c)
})
invoice.get('/status/count', (c) => {
  return invoiceHandler.getAllInvoicesStatusCount(c)
})
invoice.get('/count', (c) => {
  return invoiceHandler.getAllInvoicesCount(c)
})

invoice.post('', zValidator('json', createInvoiceRequest), (c) => {
  const validated = c.req.valid('json')
  const createInvoice = newCreateInvoiceRequest(validated)
  return invoiceHandler.createInvoice(c, createInvoice)
})

invoice.patch('/:id', zValidator('json', updateInvoiceRequest), (c) => {
  const validated = c.req.valid('json')
  const updateInvoice = newUpdateInvoiceRequest(validated)
  return invoiceHandler.updateInvoiceById(c, updateInvoice)
})
invoice.delete('/:id', (c) => {
  return invoiceHandler.deleteInvoiceById(c)
})

const revenue = new Hono()
revenue.get('', (c) => {
  return revenueHandler.getAllRevenueList(c)
})

api.route('/users', user)
api.route('/customers', customer)
api.route('/revenues', revenue)
api.route('/invoices', invoice)

export default router
