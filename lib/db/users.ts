"use server"

import { serverOnly } from "@/lib/server-only"
import { ObjectId } from "mongodb"
import clientPromise from "../mongodb-server"
import type { User, ExternalAccount } from "../models/user"

// This ensures this module is only used on the server
console.log(serverOnly)

// Get MongoDB client and database
const getCollection = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  return db.collection<User>("users")
}

// Get all users
export async function getAllUsers() {
  try {
    const collection = await getCollection()
    return await collection.find({}).sort({ name: 1 }).toArray()
  } catch (error) {
    console.error("Error fetching all users:", error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

// Get user by ID
export async function getUserById(id: string) {
  try {
    const collection = await getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error(`Error fetching user by ID ${id}:`, error)
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const collection = await getCollection()
    return await collection.findOne({ email })
  } catch (error) {
    console.error(`Error fetching user by email ${email}:`, error)
    throw new Error(`Failed to fetch user by email: ${error.message}`)
  }
}

// Get user by external provider account
export async function getUserByExternalAccount(provider: string, providerId: string) {
  try {
    const collection = await getCollection()
    return await collection.findOne({
      "external_accounts.provider": provider,
      "external_accounts.provider_id": providerId,
    })
  } catch (error) {
    console.error(`Error fetching user by external account ${provider}:${providerId}:`, error)
    throw new Error(`Failed to fetch user by external account: ${error.message}`)
  }
}

// Get user by badge number
export async function getUserByBadge(badge_number: string) {
  try {
    const collection = await getCollection()
    return await collection.findOne({ badge_number })
  } catch (error) {
    console.error(`Error fetching user by badge ${badge_number}:`, error)
    throw new Error(`Failed to fetch user by badge: ${error.message}`)
  }
}

// Create new user
export async function createUser(userData: Omit<User, "_id" | "created_at" | "updated_at">) {
  try {
    const collection = await getCollection()

    // Check if user with email already exists
    const existingUserByEmail = await getUserByEmail(userData.email)
    if (existingUserByEmail) {
      throw new Error("User with this email already exists")
    }

    // Check if user with badge number already exists (if badge number is provided)
    if (userData.badge_number) {
      const existingBadge = await getUserByBadge(userData.badge_number)
      if (existingBadge) {
        throw new Error("User with this badge number already exists")
      }
    }

    // Check if external account already exists
    if (userData.external_accounts && userData.external_accounts.length > 0) {
      for (const account of userData.external_accounts) {
        const existingAccount = await getUserByExternalAccount(account.provider, account.provider_id)
        if (existingAccount) {
          throw new Error(
            `External account ${account.provider}:${account.provider_id} is already linked to another user`,
          )
        }
      }
    }

    const now = new Date()
    const newUser: User = {
      ...userData,
      created_at: now,
      updated_at: now,
    }

    const result = await collection.insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Update user
export async function updateUser(id: string, userData: Partial<User>) {
  try {
    const collection = await getCollection()

    // If email is being updated, check if it's already in use
    if (userData.email) {
      const existingUser = await getUserByEmail(userData.email)
      if (existingUser && existingUser._id?.toString() !== id) {
        throw new Error("User with this email already exists")
      }
    }

    // If badge number is being updated, check if it's already in use
    if (userData.badge_number) {
      const existingBadge = await getUserByBadge(userData.badge_number)
      if (existingBadge && existingBadge._id?.toString() !== id) {
        throw new Error("User with this badge number already exists")
      }
    }

    // If adding external accounts, check if they're already linked
    if (userData.external_accounts) {
      for (const account of userData.external_accounts) {
        const existingAccount = await getUserByExternalAccount(account.provider, account.provider_id)
        if (existingAccount && existingAccount._id?.toString() !== id) {
          throw new Error(
            `External account ${account.provider}:${account.provider_id} is already linked to another user`,
          )
        }
      }
    }

    const updateData = {
      ...userData,
      updated_at: new Date(),
    }

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error updating user ${id}:`, error)
    throw error
  }
}

// Add external account to user
export async function addExternalAccount(id: string, account: ExternalAccount) {
  try {
    const collection = await getCollection()

    // Check if account already exists for another user
    const existingAccount = await getUserByExternalAccount(account.provider, account.provider_id)
    if (existingAccount && existingAccount._id?.toString() !== id) {
      throw new Error(`External account ${account.provider}:${account.provider_id} is already linked to another user`)
    }

    // Get current user to determine auth_type update
    const user = await getUserById(id)
    if (!user) {
      throw new Error("User not found")
    }

    // Determine new auth_type
    let auth_type = user.auth_type
    if (auth_type === "local") {
      auth_type = "hybrid"
    } else if (!auth_type) {
      auth_type = "external"
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { external_accounts: account },
        $set: {
          auth_type,
          updated_at: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error adding external account to user ${id}:`, error)
    throw error
  }
}

// Remove external account from user
export async function removeExternalAccount(id: string, provider: string, providerId: string) {
  try {
    const collection = await getCollection()

    // Get current user to determine auth_type update
    const user = await getUserById(id)
    if (!user) {
      throw new Error("User not found")
    }

    // Check if this is the only external account
    const hasMultipleExternalAccounts = user.external_accounts && user.external_accounts.length > 1

    // Determine new auth_type
    let auth_type = user.auth_type
    if (auth_type === "hybrid" && !hasMultipleExternalAccounts) {
      auth_type = "local"
    } else if (auth_type === "external" && !hasMultipleExternalAccounts) {
      // Cannot remove the only external account for an external-only user
      throw new Error("Cannot remove the only authentication method for this user")
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: {
          external_accounts: {
            provider: provider,
            provider_id: providerId,
          },
        },
        $set: {
          auth_type,
          updated_at: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error removing external account from user ${id}:`, error)
    throw error
  }
}

// Delete user
export async function deleteUser(id: string) {
  try {
    const collection = await getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error)
    throw error
  }
}

// Lock/unlock user
export async function updateUserStatus(id: string, status: "active" | "locked" | "pending") {
  try {
    const collection = await getCollection()
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { status, updated_at: new Date() } })
    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error updating user status ${id}:`, error)
    throw error
  }
}

// Get users by department
export async function getUsersByDepartment(department: string) {
  try {
    const collection = await getCollection()
    return await collection.find({ department }).sort({ name: 1 }).toArray()
  } catch (error) {
    console.error(`Error fetching users by department ${department}:`, error)
    throw error
  }
}

// Get users by role
export async function getUsersByRole(role: string) {
  try {
    const collection = await getCollection()
    return await collection.find({ role }).sort({ name: 1 }).toArray()
  } catch (error) {
    console.error(`Error fetching users by role ${role}:`, error)
    throw error
  }
}

// Get users by auth type
export async function getUsersByAuthType(authType: "local" | "external" | "hybrid") {
  try {
    const collection = await getCollection()
    return await collection.find({ auth_type: authType }).sort({ name: 1 }).toArray()
  } catch (error) {
    console.error(`Error fetching users by auth type ${authType}:`, error)
    throw error
  }
}
