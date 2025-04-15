import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb-server"
import { createErrorLog } from "@/lib/db/error-logs"

// POST /api/admin/repair-database - Repair database issues
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can repair the database
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ecash_system")
    const stats = {
      usersWithoutAuthTypeFixed: 0,
      duplicateEmailsFixed: 0,
      usersWithNullExternalIdFixed: 0,
      orphanedDocumentsRemoved: 0,
      indexesRepaired: 0,
      validationRulesUpdated: 0,
    }

    // 1. Fix indexes for external accounts
    try {
      // Drop the existing externalId index if it exists
      await db.collection("users").dropIndex("externalId_1")
      console.log("Dropped existing externalId index")
      stats.indexesRepaired++
    } catch (error) {
      // Index might not exist, which is fine
      console.log("No existing externalId index to drop")
    }

    // Create a compound sparse index for external accounts
    await db.collection("users").createIndex(
      { "external_accounts.provider": 1, "external_accounts.provider_id": 1 },
      {
        unique: true,
        sparse: true, // This makes the index ignore documents where the fields don't exist
      },
    )
    console.log("Created new sparse index for external accounts")
    stats.indexesRepaired++

    // 2. Fix users with missing auth_type
    const usersWithoutAuthType = await db
      .collection("users")
      .find({ auth_type: { $exists: false } })
      .toArray()

    console.log(`Found ${usersWithoutAuthType.length} users without auth_type`)
    stats.usersWithoutAuthTypeFixed = usersWithoutAuthType.length

    for (const user of usersWithoutAuthType) {
      // Determine auth_type based on existing fields
      let auth_type = "local" // Default to local

      if (user.externalId) {
        auth_type = "external"
      } else if (user.external_accounts && user.external_accounts.length > 0) {
        auth_type = user.password_hash ? "hybrid" : "external"
      }

      await db.collection("users").updateOne({ _id: user._id }, { $set: { auth_type, updated_at: new Date() } })
    }

    // 3. Fix users with null externalId
    const usersWithNullExternalId = await db.collection("users").find({ externalId: null }).toArray()

    console.log(`Found ${usersWithNullExternalId.length} users with null externalId`)
    stats.usersWithNullExternalIdFixed = usersWithNullExternalId.length

    for (const user of usersWithNullExternalId) {
      // Remove the null externalId field
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $unset: { externalId: "" },
          $set: { updated_at: new Date() },
        },
      )
    }

    // 4. Check for duplicate emails and fix them
    const duplicateEmails = await db
      .collection("users")
      .aggregate([
        { $group: { _id: "$email", count: { $sum: 1 }, ids: { $push: "$_id" } } },
        { $match: { count: { $gt: 1 } } },
      ])
      .toArray()

    console.log(`Found ${duplicateEmails.length} duplicate email addresses`)
    stats.duplicateEmailsFixed = duplicateEmails.length

    for (const duplicate of duplicateEmails) {
      const users = await db.collection("users").find({ email: duplicate._id }).sort({ created_at: 1 }).toArray()

      // Keep the oldest user, update the others
      for (let i = 1; i < users.length; i++) {
        const newEmail = `${users[i].email.split("@")[0]}+${i}@${users[i].email.split("@")[1]}`
        await db
          .collection("users")
          .updateOne({ _id: users[i]._id }, { $set: { email: newEmail, updated_at: new Date() } })
      }
    }

    // 5. Update validation rules for collections
    try {
      await db.command({
        collMod: "users",
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
        validationLevel: "moderate",
      })
      stats.validationRulesUpdated++
      console.log("Updated validation rules for users collection")
    } catch (error) {
      console.error("Error updating validation rules:", error)
    }

    // 6. Remove orphaned documents in related collections
    // This is just an example - adjust based on your actual data model
    const orphanedApprovals = await db.collection("approvals").deleteMany({
      user_id: { $nin: await db.collection("users").distinct("_id") },
    })

    stats.orphanedDocumentsRemoved += orphanedApprovals.deletedCount
    console.log(`Removed ${orphanedApprovals.deletedCount} orphaned approval documents`)

    return NextResponse.json({
      success: true,
      message: "Database repair completed successfully",
      stats,
    })
  } catch (error: any) {
    console.error("Error repairing database:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Database Repair Error",
      message: `Error repairing database: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/admin/repair-database",
      },
    })

    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}
