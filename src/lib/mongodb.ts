import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const mongoOptions = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 5000,
};

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) return null;
  try {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, mongoOptions);
      global._mongoClientPromise = client.connect().catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return await global._mongoClientPromise;
  } catch (err) {
    global._mongoClientPromise = undefined;
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  try {
    const client = await getMongoClient();
    if (!client) return null;
    return client.db('rifant');
  } catch {
    return null;
  }
}

export default getMongoClient;
