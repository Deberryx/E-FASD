"use server"

import clientPromise from "../mongodb-server"

/**
 * Initialize database indexes and collections with proper validation
 * This should be called during application startup
 */
export async function initializeDatabase() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ecash_system")

    // Create collections with validation schemas
    await db
      .createCollection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "badge_number", "department", "role", "status", "auth_type"],
            properties: {
              name: { bsonType: "string" },
              email: { bsonType: "string" },
              badge_number: { bsonType: "string" },
              department: { bsonType: "string" },
              role: { bsonType: "string" },
              status: { bsonType: "string", enum: ["active", "locked", "pending"] },
              auth_type: { bsonType: "string", enum: ["local", "external", "hybrid"] },
              created_at: { bsonType: "date" },
              updated_at: { bsonType: "date" },
            },
          },
        },
      })
      .catch((err) => {
        // Collection might already exist
        if (err.code !== 48) throw err
      })

    // Create indexes for users collection
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ badge_number: 1 }, { unique: true })
    await db.collection("users").createIndex({ role: 1 })
    await db.collection("users").createIndex({ department: 1 })
    await db.collection("users").createIndex({ auth_type: 1 })

    // Create a compound sparse index for external accounts
    await db.collection("users").createIndex(
      { "external_accounts.provider": 1, "external_accounts.provider_id": 1 },
      {
        unique: true,
        sparse: true, // This makes the index ignore documents where the fields don't exist
      },
    )

    // Create indexes for other collections...
    // [existing code for other collections]

    console.log("Database indexes initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Function to migrate existing users from externalId to external_accounts
export async function migrateExternalIds() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ecash_system")

    // Find all users with externalId
    const users = await db
      .collection("users")
      .find({ externalId: { $exists: true } })
      .toArray()

    console.log(`Found ${users.length} users with externalId to migrate`)

    let migratedCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        // Skip null externalIds
        if (user.externalId === null) {
          // Update auth_type for local users
          await db.collection("users").updateOne(
            { _id: user._id },
            {
              $set: {
                auth_type: "local",
                updated_at: new Date(),
              },
            },
          )
          migratedCount++
          continue
        }

        // For users with externalId, create external_accounts array
        const provider = "azure-ad" // Default to Azure AD as the provider
        const providerId = user.externalId

        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              auth_type: "external",
              external_accounts: [
                {
                  provider,
                  provider_id: providerId,
                  connected_at: user.updated_at || new Date(),
                },
              ],
              updated_at: new Date(),
            },
          },
        )
        migratedCount++
      } catch (err) {
        console.error(`Error migrating user ${user._id}:`, err)
        errorCount++
      }
    }

    // Update local users without externalId
    const localUsers = await db
      .collection("users")
      .updateMany({ externalId: { $exists: false } }, { $set: { auth_type: "local", updated_at: new Date() } })

    console.log(
      `Migration complete: ${migratedCount} users migrated, ${errorCount} errors, ${localUsers.modifiedCount} local users updated`,
    )

    // Check if all users have auth_type
    const unmigrated = await db.collection("users").countDocuments({ auth_type: { $exists: false } })
    if (unmigrated > 0) {
      console.warn(`Warning: ${unmigrated} users still don't have auth_type`)
    } else {
      console.log("All users have been migrated successfully")
    }

    return {
      migrated: migratedCount,
      errors: errorCount,
      localUsers: localUsers.modifiedCount,
      unmigrated,
    }
  } catch (error) {
    console.error("Error during migration:", error)
    throw error
  }
}
