import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

const connectDB = async (MONGO_URI = process.env.MONGO_URI): Promise<Db> => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  if (db) {
    return db;
  }

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db();

  return db;
};

const getDb = (): Db => {
  if (!db) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  return db;
};

const getClient = (): MongoClient => {
  if (!client) {
    throw new Error("DB not connected. Call connectDB() first.");
  }

  return client;
};

const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

export { connectDB, getDb, getClient, closeDB };
