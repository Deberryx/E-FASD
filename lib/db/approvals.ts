"use server"

import { ObjectId } from "mongodb"
import clientPromise from "../mongodb-server"
import type { Approval } from "../models"
import { generateApprovalId } from "../utils"

// Get MongoDB client and database
const getCollection = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  return db.collection<Approval>("approvals")
}

// Get all approvals
export async function getAllApprovals() {
  const collection = await getCollection()
  return collection.find({}).sort({ timestamp: -1 }).toArray()
}

// Get approval by ID
export async function getApprovalById(id: string) {
  const collection = await getCollection()
  return collection.findOne({ _id: new ObjectId(id) })
}

// Get approvals by request ID
export async function getApprovalsByRequestId(requestId: string) {
  const collection = await getCollection()
  return collection.find({ request_id: requestId }).sort({ timestamp: 1 }).toArray()
}

// Get approvals by approver ID
export async function getApprovalsByApproverId(approverId: string) {
  const collection = await getCollection()
  return collection
    .find({ approver_id: new ObjectId(approverId) })
    .sort({ timestamp: -1 })
    .toArray()
}

// Create new approval
export async function createApproval(approvalData: Omit<Approval, "_id" | "approval_id">) {
  const collection = await getCollection()

  const approval_id = await generateApprovalId()

  const newApproval: Approval = {
    ...approvalData,
    approval_id,
  }

  const result = await collection.insertOne(newApproval)
  return { ...newApproval, _id: result.insertedId }
}

// Update approval
export async function updateApproval(id: string, approvalData: Partial<Approval>) {
  const collection = await getCollection()

  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: approvalData })

  return result.modifiedCount > 0
}

// Delete approval
export async function deleteApproval(id: string) {
  const collection = await getCollection()
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

// Get latest approval for a request
export async function getLatestApprovalForRequest(requestId: string) {
  const collection = await getCollection()
  const approvals = await collection.find({ request_id: requestId }).sort({ timestamp: -1 }).limit(1).toArray()

  return approvals.length > 0 ? approvals[0] : null
}

// Get pending approvals for a user based on their role
export async function getPendingApprovalsForUser(userId: string, role: string, department: string) {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  const requestsCollection = db.collection("requests")

  // Different queries based on role
  let query = {}

  if (role === "Supervisor") {
    // Supervisors see pending requests from their department
    query = {
      department,
      status: "pending",
    }
  } else if (role === "Head of Department") {
    // Heads of Department see requests that have been approved by Supervisors
    // This would require a more complex query joining with approvals
    // For simplicity, we'll just show department requests with pending status
    query = {
      department,
      status: "pending",
    }
  } else if (role === "Finance User Group") {
    // Finance sees requests approved by Heads of Department
    // Again, this would require a more complex query
    query = {
      status: "pending",
    }
  }

  return requestsCollection.find(query).sort({ date: 1 }).toArray()
}
