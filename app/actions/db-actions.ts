"use server"

import { serverOnly } from "@/lib/server-only"
import { revalidatePath } from "next/cache"
import { getAllUsers, getUserById, createUser } from "@/lib/db/users"
import { getAllRequests, getRequestById } from "@/lib/db/requests"
import { createErrorLog } from "@/lib/db/error-logs"

// This ensures this module is only used on the server
console.log(serverOnly)

// User actions
export async function fetchAllUsers() {
  try {
    return await getAllUsers()
  } catch (error: any) {
    console.error("Error fetching users:", error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error fetching users: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/actions/db-actions/fetchAllUsers",
      },
    })
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

export async function fetchUserById(id: string) {
  try {
    return await getUserById(id)
  } catch (error: any) {
    console.error(`Error fetching user ${id}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error fetching user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: `/actions/db-actions/fetchUserById/${id}`,
      },
    })
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

export async function createUserAction(userData: any) {
  try {
    const newUser = await createUser(userData)
    revalidatePath("/dashboard/users")
    return newUser
  } catch (error: any) {
    console.error("Error creating user:", error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error creating user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/actions/db-actions/createUserAction",
        body: userData,
      },
    })
    throw new Error(`Failed to create user: ${error.message}`)
  }
}

// Request actions
export async function fetchAllRequests() {
  try {
    return await getAllRequests()
  } catch (error: any) {
    console.error("Error fetching requests:", error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error fetching requests: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/actions/db-actions/fetchAllRequests",
      },
    })
    throw new Error(`Failed to fetch requests: ${error.message}`)
  }
}

export async function fetchRequestById(id: string) {
  try {
    return await getRequestById(id)
  } catch (error: any) {
    console.error(`Error fetching request ${id}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error fetching request: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: `/actions/db-actions/fetchRequestById/${id}`,
      },
    })
    throw new Error(`Failed to fetch request: ${error.message}`)
  }
}

// Add more server actions as needed
