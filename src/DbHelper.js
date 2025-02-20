import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_CONNECTION,
    MONGO_CLUSTER,
    MONGO_DB
} = process.env;
const connectionString = `${MONGO_CONNECTION}${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`;
const client = new MongoClient(connectionString);

let db = null;

export async function connectToMongoDB()
{
    if (!db) {
        await client.connect();
        db = client.db(MONGO_DB);
    }
    return db;
}

export async function closeMongoDB()
{
    if (client.topology && client.topology.isConnected()) {
        await client.close();
    }
    db = null;
}

export function getCollection(collectionName)
{
    if (!db) {
        throw new Error("Database connection is not established");
    }
    return db.collection(collectionName);
}