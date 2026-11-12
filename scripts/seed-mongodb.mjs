/**
 * Seed script: uploads canonical JSON dataset to MongoDB Atlas.
 * Run: node scripts/seed-mongodb.mjs
 */
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: Set MONGODB_URI env var first.");
  process.exit(1);
}

const DB_NAME = "0xtrace";
const dataPath = resolve(__dirname, "..", "data", "canonical", "interview_experiences_v1.3.json");

async function seed() {
  console.log("Reading canonical dataset...");
  const raw = readFileSync(dataPath, "utf-8");
  const dataset = JSON.parse(raw);
  const experiences = dataset.experiences || [];
  const metadata = dataset.dataset_metadata || {};

  console.log(`Found ${experiences.length} experiences.`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("Connected to MongoDB Atlas.");

  const db = client.db(DB_NAME);

  // Drop existing collections to do a clean seed
  const collections = await db.listCollections().toArray();
  const collNames = collections.map((c) => c.name);

  if (collNames.includes("experiences")) {
    await db.collection("experiences").drop();
    console.log("Dropped existing 'experiences' collection.");
  }
  if (collNames.includes("metadata")) {
    await db.collection("metadata").drop();
    console.log("Dropped existing 'metadata' collection.");
  }

  // Insert metadata
  await db.collection("metadata").insertOne({ _id: "dataset_metadata", ...metadata });
  console.log("Inserted dataset metadata.");

  // Insert experiences
  const result = await db.collection("experiences").insertMany(experiences);
  console.log(`Inserted ${result.insertedCount} experiences.`);

  // Create indexes
  await db.collection("experiences").createIndex({ id: 1 }, { unique: true });
  await db.collection("experiences").createIndex({ "company.name": 1 });
  await db.collection("experiences").createIndex({ "company.normalized_name": 1 });
  await db.collection("experiences").createIndex({ "outcome.status": 1 });
  await db.collection("experiences").createIndex({ "job.role": 1 });
  await db.collection("experiences").createIndex({ created_at: -1 });
  await db.collection("experiences").createIndex({ "author.email": 1 });
  await db.collection("experiences").createIndex({ "company.name": 1, "candidate.name": 1 });
  await db.collection("activity_log").createIndex({ created_at: -1 });
  await db.collection("activity_log").createIndex({ action: 1, created_at: -1 });
  await db.collection("experiences").createIndex({
    "company.name": "text",
    "candidate.name": "text",
    "job.role": "text",
    raw_text: "text",
  });
  console.log("Created indexes.");

  await client.close();
  console.log("\n✅ Seed complete! Your data is now in MongoDB Atlas.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
