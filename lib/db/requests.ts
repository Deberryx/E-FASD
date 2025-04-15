"use server"

import { ObjectId } from "mongodb"
import clientPromise from "../mongodb-server"
import type { Request } from "../models"
// Import the request ID generator
import { generateRequestId, isValidObjectId } from "../utils"

// Get MongoDB client and database
const getCollection = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  return db.collection<Request>("requests")
}

// Get all requests
export async function getAllRequests() {
  const collection = await getCollection()
  return collection.find({}).sort({ date: -1 }).toArray()
}

// Get request by ID
export async function getRequestById(id: string) {
  try {
    const collection = await getCollection()

    // Check if id is a valid ObjectId
    if (!isValidObjectId(id)) {
      return null
    }

    return await collection.findOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error(`Error fetching request by ID ${id}:`, error)
    throw error
  }
}

// Get request by request_id
export async function getRequestByRequestId(request_id: string) {
  try {
    const collection = await getCollection()
    return await collection.findOne({ request_id })
  } catch (error) {
    console.error(`Error fetching request by request_id ${request_id}:`, error)
    throw error
  }
}

// Get requests by user ID
export async function getRequestsByUserId(userId: string) {
  const collection = await getCollection()
  return collection
    .find({ user_id: new ObjectId(userId) })
    .sort({ date: -1 })
    .toArray()
}

// Get requests by department
export async function getRequestsByDepartment(department: string) {
  const collection = await getCollection()
  return collection.find({ department }).sort({ date: -1 }).toArray()
}

// Get requests by status
export async function getRequestsByStatus(status: string) {
  const collection = await getCollection()
  return collection.find({ status }).sort({ date: -1 }).toArray()
}

// Get requests by type
export async function getRequestsByType(type: "Petty Cash" | "Requisition") {
  const collection = await getCollection()
  return collection.find({ type_of_request: type }).sort({ date: -1 }).toArray()
}

// Update the createRequest function to use the new generator
export async function createRequest(requestData: Omit<Request, "_id" | "request_id" | "created_at" | "updated_at">) {
  const collection = await getCollection()

  const now = new Date()
  const request_id = await generateRequestId()

  const newRequest: Request = {
    ...requestData,
    request_id,
    created_at: now,
    updated_at: now,
  }

  const result = await collection.insertOne(newRequest)
  return { ...newRequest, _id: result.insertedId }
}

// Update request
export async function updateRequest(id: string, requestData: Partial<Request>) {
  const collection = await getCollection()

  const updateData = {
    ...requestData,
    updated_at: new Date(),
  }

  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

  return result.modifiedCount > 0
}

// Update request status
export async function updateRequestStatus(id: string, status: "pending" | "approved" | "rejected" | "recap_needed") {
  const collection = await getCollection()

  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { status, updated_at: new Date() } })

  return result.modifiedCount > 0
}

// Delete request
export async function deleteRequest(id: string) {
  const collection = await getCollection()
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

// Get requests needing approval by department
export async function getRequestsNeedingApprovalByDepartment(department: string) {
  const collection = await getCollection()
  return collection
    .find({
      department,
      status: "pending",
    })
    .sort({ date: 1 })
    .toArray()
}

// Get requests needing recap
export async function getRequestsNeedingRecap(userId: string) {
  const collection = await getCollection()
  return collection
    .find({
      user_id: new ObjectId(userId),
      status: "recap_needed",
    })
    .sort({ date: 1 })
    .toArray()
}

// Get requests by date range
export async function getRequestsByDateRange(startDate: Date, endDate: Date) {
  const collection = await getCollection()
  return collection
    .find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
    .sort({ date: -1 })
    .toArray()
}
