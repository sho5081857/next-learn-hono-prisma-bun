import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'

const __filename = join(process.cwd(), 'src', 'database', 'config.ts')
const __dirname = dirname(__filename)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const databaseUrl = `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PUBLISHED_PORT}/${process.env.DB_DATABASE}`


export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

async function executeSqlScript() {
  const sqlFilePath = join(__dirname, '../../_tools/first.sql')
  const sql = readFileSync(sqlFilePath, 'utf-8')
  const statements = sql
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0)

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement)
    } catch (e) {
      console.error('Failed to execute SQL statement:', statement, e)
      throw e
    }
  }
}
