"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createUser, updateUser, deleteUser, updateUserStatus } from "@/lib/db/users"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { ObjectId } from "mongodb"

// Create a new user
export async function createUserAction(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    // Only Admin can create users
    if (session.user.role !== "Admin") {
      throw new Error("You do not have permission to create users")
    }

    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const badge_number = formData.get("badge_number") as string
    const department = formData.get("department") as string
    const role = formData.get("role") as string

    // Validate required fields
    if (!name || !email || !badge_number || !department || !role) {
      throw new Error("Missing required fields")
    }

    // Create the user
    const newUser = await createUser({
      name,
      email,
      badge_number,
      department,
      role: role as any,
      status: "active",
    })

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "create",
      timestamp: new Date(),
      description: `Created new user: ${name} (${email})`,
      target_id: newUser._id?.toString(),
      target_type: "user",
    })

    // Revalidate the users page
    revalidatePath("/dashboard/users")

    return { success: true, userId: newUser._id?.toString() }
  } catch (error: any) {
    console.error("Error creating user:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error creating user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/actions/users",
      },
    })

    return { success: false, error: error.message }
  }
}

// Update a user
export async function updateUserAction(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    // Only Admin can update users
    if (session.user.role !== "Admin") {
      throw new Error("You do not have permission to update users")
    }

    // Extract form data
    const userId = formData.get("user_id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const badge_number = formData.get("badge_number") as string
    const department = formData.get("department") as string
    const role = formData.get("role") as string

    // Validate required fields
    if (!userId || !name || !email || !badge_number || !department || !role) {
      throw new Error("Missing required fields")
    }

    // Update the user
    const success = await updateUser(userId, {
      name,
      email,
      badge_number,
      department,
      role: role as any,
      updated_at: new Date(),
    })

    if (!success) {
      throw new Error("User not found or could not be updated")
    }

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "update",
      timestamp: new Date(),
      description: `Updated user: ${name} (${email})`,
      target_id: userId,
      target_type: "user",
    })

    // Revalidate the users page
    revalidatePath("/dashboard/users")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating user:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error updating user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "PUT",
        url: "/actions/users",
      },
    })

    return { success: false, error: error.message }
  }
}

// Update user status (lock/unlock)
export async function updateUserStatusAction(userId: string, status: "active" | "locked") {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    // Only Admin can update user status
    if (session.user.role !== "Admin") {
      throw new Error("You do not have permission to update user status")
    }

    // Update the user status
    const success = await updateUserStatus(userId, status)

    if (!success) {
      throw new Error("User not found or could not be updated")
    }

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "update",
      timestamp: new Date(),
      description: `Updated user status to ${status}: ${userId}`,
      target_id: userId,
      target_type: "user",
    })

    // Revalidate the users page
    revalidatePath("/dashboard/users")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating user status:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error updating user status: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "PATCH",
        url: `/actions/users/${userId}/status`,
      },
    })

    return { success: false, error: error.message }
  }
}

// Delete a user
export async function deleteUserAction(userId: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    // Only Admin can delete users
    if (session.user.role !== "Admin") {
      throw new Error("You do not have permission to delete users")
    }

    // Delete the user
    const success = await deleteUser(userId)

    if (!success) {
      throw new Error("User not found or could not be deleted")
    }

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "delete",
      timestamp: new Date(),
      description: `Deleted user: ${userId}`,
      target_id: userId,
      target_type: "user",
    })

    // Revalidate the users page
    revalidatePath("/dashboard/users")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error deleting user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "DELETE",
        url: `/actions/users/${userId}`,
      },
    })

    return { success: false, error: error.message }
  }
}
