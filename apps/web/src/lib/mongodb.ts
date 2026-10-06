import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "0xtrace";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db(DB_NAME);
  return cachedDb;
}

export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}
