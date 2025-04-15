"use server"

import { revalidatePath } from "next/cache"
import { createUser, getUserByEmail, updateUser } from "@/lib/db/users"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { v4 as uuidv4 } from "uuid"

interface OnboardingData {
  userId: string
  email: string
  name: string
  badge_number: string
  department: string
  provider?: string
  providerId?: string
}

// Helper function to determine the best externalId value
function determineExternalId(existingUser: any, providerId?: string): string {
  // Priority order for externalId:
  // 1. Use existing non-null externalId if present
  // 2. Use provider ID if available
  // 3. Use MongoDB _id as string if available
  // 4. Generate a new UUID as last resort

  // If user already has a non-null externalId, keep it
  if (existingUser?.externalId) {
    return existingUser.externalId
  }

  // If provider ID is available, use it
  if (providerId) {
    return `provider-${providerId}`
  }

  // If MongoDB _id is available, use it
  if (existingUser?._id) {
    return `mongodb-${existingUser._id.toString()}`
  }

  // As a last resort, generate a UUID
  return `generated-${uuidv4()}`
}

export async function completeUserOnboarding(data: OnboardingData) {
  try {
    // Check if user already exists by email
    const existingUser = await getUserByEmail(data.email)

    if (existingUser) {
      // Determine the appropriate externalId for this user
      const externalId = determineExternalId(existingUser, data.providerId)

      // Update existing user with new information
      const updates: any = {
        badge_number: data.badge_number,
        department: data.department,
        externalId: externalId, // Always set externalId
        updated_at: new Date(),
      }

      // Handle external account if provided
      if (data.provider && data.providerId) {
        // Check if this provider is already linked
        const hasProvider = existingUser.external_accounts?.some(
          (acc) => acc.provider === data.provider && acc.provider_id === data.providerId,
        )

        if (!hasProvider) {
          // Add the external account
          const externalAccount = {
            provider: data.provider,
            provider_id: data.providerId,
            connected_at: new Date(),
          }

          updates.external_accounts = existingUser.external_accounts
            ? [...existingUser.external_accounts, externalAccount]
            : [externalAccount]

          // Update auth_type based on existing type
          if (existingUser.auth_type === "local") {
            updates.auth_type = "hybrid"
          } else if (!existingUser.auth_type) {
            updates.auth_type = "external"
          }
        }
      }

      // If no auth_type is set, default to local
      if (!existingUser.auth_type && !updates.auth_type) {
        updates.auth_type = "local"
      }

      await updateUser(existingUser._id!.toString(), updates)

      // Log the action
      await createAuditLog({
        user_id: existingUser._id!,
        user_details: {
          name: existingUser.name,
          badge_number: data.badge_number,
          role: existingUser.role,
        },
        action_type: "update",
        timestamp: new Date(),
        description: `User onboarding completed: ${data.email}`,
        target_id: existingUser._id!.toString(),
        target_type: "user",
      })

      // Revalidate user-related paths
      revalidatePath("/dashboard")
      revalidatePath("/dashboard/users")

      return { success: true }
    } else {
      // For new users, determine the appropriate externalId
      const externalId = data.providerId ? `provider-${data.providerId}` : `new-${uuidv4()}`

      // Create new user with appropriate authentication type
      const auth_type = data.provider && data.providerId ? "external" : "local"

      // Prepare external accounts if provided
      const external_accounts =
        data.provider && data.providerId
          ? [
              {
                provider: data.provider,
                provider_id: data.providerId,
                connected_at: new Date(),
              },
            ]
          : undefined

      // Create new user with the determined externalId
      const newUser = await createUser({
        name: data.name,
        email: data.email,
        badge_number: data.badge_number,
        department: data.department,
        role: "User", // Default role for new users
        status: "active",
        auth_type,
        external_accounts,
        externalId, // Always provide a valid externalId
      })

      // Log the action
      await createAuditLog({
        user_id: newUser._id!,
        user_details: {
          name: newUser.name,
          badge_number: newUser.badge_number,
          role: newUser.role,
        },
        action_type: "create",
        timestamp: new Date(),
        description: `New user onboarded: ${data.email}`,
        target_id: newUser._id!.toString(),
        target_type: "user",
      })

      // Revalidate user-related paths
      revalidatePath("/dashboard")
      revalidatePath("/dashboard/users")

      return { success: true }
    }
  } catch (error: any) {
    console.error("Error during user onboarding:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Onboarding Error",
      message: `Error during user onboarding: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/actions/user-onboarding",
        body: data,
      },
    })

    return { success: false, error: error.message }
  }
}
