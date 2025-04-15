import { serverOnly } from "./server-only"
import { MongoClient, ServerApiVersion, type Db } from "mongodb"

// This ensures this module is only used on the server
console.log(serverOnly)

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 50, // Maximum number of connections in the connection pool
  minPoolSize: 5, // Minimum number of connections in the connection pool
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Maximum number of connection retries
const MAX_RETRIES = 3

// Function to create a new client with retry logic
async function createClient(): Promise<MongoClient> {
  let retries = 0
  let lastError: Error | null = null

  while (retries < MAX_RETRIES) {
    try {
      const newClient = new MongoClient(uri, options)
      await newClient.connect()
      console.log("MongoDB connected successfully")
      return newClient
    } catch (error: any) {
      lastError = error
      retries++
      console.error(`MongoDB connection attempt ${retries} failed: ${error.message}`)

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${lastError?.message}`)
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = createClient()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = createClient()
}

// Export a module-scoped MongoClient promise
export default clientPromise

// Define and export the connectToDatabase function
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "agamalereq1")
    return { client, db }
  } catch (error) {
    console.error("Failed to connect to database:", error)
    throw new Error("Could not connect to database")
  }
}
