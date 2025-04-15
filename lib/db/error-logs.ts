"use server"

import { ObjectId } from "mongodb"
import clientPromise from "../mongodb-server"
import type { ErrorLog } from "../models"
import { generateErrorId } from "../utils"

// Get MongoDB client and database
const getCollection = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  return db.collection<ErrorLog>("error_logs")
}

// Get all error logs
export async function getAllErrorLogs() {
  const collection = await getCollection()
  return collection.find({}).sort({ timestamp: -1 }).toArray()
}

// Get error log by ID
export async function getErrorLogById(id: string) {
  const collection = await getCollection()
  return collection.findOne({ _id: new ObjectId(id) })
}

// Get error logs by error type
export async function getErrorLogsByType(errorType: string) {
  const collection = await getCollection()
  return collection.find({ error_type: errorType }).sort({ timestamp: -1 }).toArray()
}

// Get error logs by user ID
export async function getErrorLogsByUserId(userId: string) {
  const collection = await getCollection()
  return collection
    .find({ user_id: new ObjectId(userId) })
    .sort({ timestamp: -1 })
    .toArray()
}

// Create new error log
export async function createErrorLog(logData: Omit<ErrorLog, "_id" | "error_id">) {
  const collection = await getCollection()

  const error_id = await generateErrorId()

  const newLog: ErrorLog = {
    ...logData,
    error_id,
  }

  const result = await collection.insertOne(newLog)
  return { ...newLog, _id: result.insertedId }
}

// Get error logs by date range
export async function getErrorLogsByDateRange(startDate: Date, endDate: Date) {
  const collection = await getCollection()
  return collection
    .find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    })
    .sort({ timestamp: -1 })
    .toArray()
}

// Get recent error logs (last n logs)
export async function getRecentErrorLogs(limit = 100) {
  const collection = await getCollection()
  return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray()
}

// Add a specialized function for database errors
export async function logDatabaseError(operation: string, error: any, metadata?: any) {
  try {
    const errorLog: Omit<ErrorLog, "_id" | "error_id"> = {
      timestamp: new Date(),
      error_type: "Database Error",
      message: `Error during ${operation}: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "DATABASE",
        url: operation,
        body: metadata,
      },
      severity: error.code
        ? // Classify severity based on MongoDB error codes
          [11000, 11001].includes(error.code)
          ? "warning"
          : // Duplicate key errors
            [121, 211, 212].includes(error.code)
            ? "warning"
            : // Validation errors
              "critical" // All other errors
        : "critical",
    }

    return await createErrorLog(errorLog)
  } catch (logError) {
    // If we can't log to the database, log to console as a fallback
    console.error("Failed to log database error:", logError)
    console.error("Original error:", error)
    return null
  }
}
