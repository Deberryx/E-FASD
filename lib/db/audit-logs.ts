"use server"

import { ObjectId } from "mongodb"
import clientPromise from "../mongodb-server"
import type { AuditLog } from "../models"
import { generateLogId } from "../utils"

// Get MongoDB client and database
const getCollection = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  return db.collection<AuditLog>("audit_logs")
}

// Get all audit logs
export async function getAllAuditLogs() {
  const collection = await getCollection()
  return collection.find({}).sort({ timestamp: -1 }).toArray()
}

// Get audit log by ID
export async function getAuditLogById(id: string) {
  const collection = await getCollection()
  return collection.findOne({ _id: new ObjectId(id) })
}

// Get audit logs by user ID
export async function getAuditLogsByUserId(userId: string) {
  const collection = await getCollection()
  return collection
    .find({ user_id: new ObjectId(userId) })
    .sort({ timestamp: -1 })
    .toArray()
}

// Get audit logs by action type
export async function getAuditLogsByActionType(actionType: string) {
  const collection = await getCollection()
  return collection.find({ action_type: actionType }).sort({ timestamp: -1 }).toArray()
}

// Get audit logs by target ID
export async function getAuditLogsByTargetId(targetId: string) {
  const collection = await getCollection()
  return collection.find({ target_id: targetId }).sort({ timestamp: -1 }).toArray()
}

// Create new audit log
export async function createAuditLog(logData: Omit<AuditLog, "_id" | "log_id">) {
  const collection = await getCollection()

  const log_id = await generateLogId()

  const newLog: AuditLog = {
    ...logData,
    log_id,
  }

  const result = await collection.insertOne(newLog)
  return { ...newLog, _id: result.insertedId }
}

// Ensure the createAuditLog function is properly storing logs

// Check if there are any issues with the createAuditLog function
// Make sure it's properly formatting the data before storing it

// Get audit logs by date range
export async function getAuditLogsByDateRange(startDate: Date, endDate: Date) {
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

// Get recent audit logs (last n logs)
export async function getRecentAuditLogs(limit = 100) {
  const collection = await getCollection()
  return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray()
}
