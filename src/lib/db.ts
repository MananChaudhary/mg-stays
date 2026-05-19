import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const REQUIRED_DELEGATES = [
  "property",
  "booking",
  "conversation",
  "message",
  "notification",
  "aIActivityLog",
  "cleaningAlert",
  "client",
  "platformIntegration",
] as const;

function isValidClient(client: unknown): client is PrismaClient {
  if (!client || typeof client !== "object") return false;
  const record = client as Record<string, { findMany?: unknown; count?: unknown; create?: unknown }>;
  return REQUIRED_DELEGATES.every((name) => {
    const delegate = record[name];
    return (
      !!delegate &&
      (typeof delegate.findMany === "function" ||
        typeof delegate.count === "function" ||
        typeof delegate.create === "function")
    );
  });
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Start PostgreSQL with: npx prisma dev"
    );
  }

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  if (!isValidClient(client)) {
    throw new Error(
      "Prisma Client failed to initialize. Run: npx prisma generate && rm -rf .next && npm run dev"
    );
  }

  return client;
}

function getPrismaClient(): PrismaClient {
  if (isValidClient(globalForPrisma.prisma)) {
    return globalForPrisma.prisma;
  }

  globalForPrisma.prisma = undefined;

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

/**
 * Proxy must pass the real PrismaClient as `receiver` for model getters.
 * Using the proxy as receiver breaks delegates (e.g. db.aiActivityLog.create → undefined).
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
