"use server"

import { ObjectId } from "mongodb"
import clientPromise from "../mongodb-server"
import type { Recap } from "../models"
import { generateRecapId } from "../utils"

// Get MongoDB client and database
const getCollection = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  return db.collection<Recap>("recaps")
}

// Get all recaps
export async function getAllRecaps() {
  const collection = await getCollection()
  return collection.find({}).sort({ date: -1 }).toArray()
}

// Get recap by ID
export async function getRecapById(id: string) {
  const collection = await getCollection()
  return collection.findOne({ _id: new ObjectId(id) })
}

// Get recap by recap_id
export async function getRecapByRecapId(recap_id: string) {
  const collection = await getCollection()
  return collection.findOne({ recap_id })
}

// Get recaps by request ID
export async function getRecapsByRequestId(requestId: string) {
  const collection = await getCollection()
  return collection.find({ request_id: requestId }).sort({ date: -1 }).toArray()
}

// Get recaps by user ID
export async function getRecapsByUserId(userId: string) {
  const collection = await getCollection()
  return collection
    .find({ user_id: new ObjectId(userId) })
    .sort({ date: -1 })
    .toArray()
}

// Create new recap
export async function createRecap(recapData: Omit<Recap, "_id" | "recap_id" | "created_at" | "updated_at">) {
  const collection = await getCollection()

  const now = new Date()
  const recap_id = await generateRecapId()

  const newRecap: Recap = {
    ...recapData,
    recap_id,
    created_at: now,
    updated_at: now,
  }

  const result = await collection.insertOne(newRecap)
  return { ...newRecap, _id: result.insertedId }
}

// Update recap
export async function updateRecap(id: string, recapData: Partial<Recap>) {
  const collection = await getCollection()

  const updateData = {
    ...recapData,
    updated_at: new Date(),
  }

  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

  return result.modifiedCount > 0
}

// Update recap status
export async function updateRecapStatus(id: string, status: "submitted" | "approved" | "rejected") {
  const collection = await getCollection()

  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { status, updated_at: new Date() } })

  return result.modifiedCount > 0
}

// Delete recap
export async function deleteRecap(id: string) {
  const collection = await getCollection()
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

// Get pending recaps
export async function getPendingRecaps() {
  const collection = await getCollection()
  return collection.find({ status: "submitted" }).sort({ date: 1 }).toArray()
}

// Check if a recap exists for a request
export async function hasRecapForRequest(requestId: string) {
  const collection = await getCollection()
  const count = await collection.countDocuments({ request_id: requestId })
  return count > 0
}
