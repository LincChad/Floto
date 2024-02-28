import mongoose, { Mongoose } from "mongoose"

const MONGODB_URL = process.env.MONGODB_URL;

// In express apps, a mongo connection would only onnect once. 
// In Next.js, it gets called on every server action or API request as Next.js is serverless.
// Serverless functions are stateless, meaning they start-up to handle a request, then shut-down right after without maintaining a connection to DB.
// Each request is handled independently. Doing this without optimisation rusults in too many DB connections open for each action performed serverside.
// So we will be caching the connection to the DB as below.

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null }
}

export const connectToDatabase = async () => {
    if(cached.conn) return cached.conn

    if(!MONGODB_URL) {
        throw new Error("Please define the MONGODB_URL environment variable")
    }

    cached.promise = cached.promise || mongoose.connect(MONGODB_URL, {dbName: 'floto', bufferCommands: false})

    cached.conn = await cached.promise

    return cached.conn
}