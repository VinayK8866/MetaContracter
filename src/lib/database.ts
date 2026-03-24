import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

const globalForPrisma = global as unknown as { 
	prisma?: PrismaClient;
	db?: any;
}

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

// Add a log for debugging first run
console.log('[DATABASE] Initializing with BetterSqlite3 at:', dbPath);

const db = globalForPrisma.db || new Database(dbPath)
const adapter = new PrismaBetterSqlite3(db)

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({ adapter } as any)

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
	globalForPrisma.db = db
}
