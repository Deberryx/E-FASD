"use server"

import { serverOnly } from "./server-only"
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "./db/users"
import {
  getAllRequests,
  getRequestById,
  getRequestByRequestId,
  createRequest,
  updateRequest,
  deleteRequest,
  updateRequestStatus,
} from "./db/requests"
import { getAllApprovals, getApprovalById, getApprovalsByRequestId, createApproval } from "./db/approvals"
import { getAllRecaps, getRecapById, getRecapsByRequestId, createRecap } from "./db/recaps"

// This ensures this module is only used on the server
console.log(serverOnly)

// User data services
export { getAllUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser, updateUserStatus }

// Request data services
export {
  getAllRequests,
  getRequestById,
  getRequestByRequestId,
  createRequest,
  updateRequest,
  deleteRequest,
  updateRequestStatus,
}

// Approval data services
export { getAllApprovals, getApprovalById, getApprovalsByRequestId, createApproval }

// Recap data services
export { getAllRecaps, getRecapById, getRecapsByRequestId, createRecap }

// Add more data services as needed
