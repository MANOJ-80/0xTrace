import { MongoClient, Db } from "mongodb";

// Allow a separate database for tests/local runs without touching production data.
const DB_NAME = process.env.MONGODB_DB || "0xtrace";

/**
 * The connection is created on first use rather than at module load.
 *
 * Building the app imports every route module. Throwing here at import time
 * made `next build` fail in CI, where no database is available. Validation now
 * happens when a request actually needs the database.
 */
let cachedClientPromise: Promise<MongoClient> | null = null;

function connectionString(): string {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  return value;
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    // Preserve the client across HMR reloads in development.
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = new MongoClient(connectionString()).connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  if (!cachedClientPromise) {
    cachedClientPromise = new MongoClient(connectionString()).connect();
  }
  return cachedClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}

export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}
