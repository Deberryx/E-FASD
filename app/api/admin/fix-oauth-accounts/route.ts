import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb-server"

export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ecash_system")

    // Get all users
    const users = await db.collection("users").find({}).toArray()

    // Get all accounts
    const accounts = await db.collection("accounts").find({}).toArray()

    const results = {
      fixedUsers: 0,
      removedOrphanedAccounts: 0,
      details: [],
    }

    // Fix users with missing external_accounts
    for (const user of users) {
      // Find accounts for this user
      const userAccounts = accounts.filter((account) => account.userId === user._id.toString())

      let updated = false
      if (userAccounts.length > 0 && (!user.external_accounts || user.external_accounts.length === 0)) {
        // User has accounts but no external_accounts
        const external_accounts = userAccounts.map((account) => ({
          provider: account.provider,
          provider_id: account.providerAccountId,
          connected_at: new Date(),
        }))

        // Update user with external_accounts
        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              external_accounts,
              auth_type: user.auth_type || "external",
              updated_at: new Date(),
            },
          },
        )

        results.fixedUsers++
        results.details.push({
          user: user.email,
          action: "Added external_accounts",
          count: external_accounts.length,
        })

        updated = true
      }

      // If user has externalId field, migrate it to external_accounts
      if (
        user.externalId &&
        (!user.external_accounts || !user.external_accounts.some((acc) => acc.provider_id === user.externalId))
      ) {
        const external_account = {
          provider: "azure-ad",
          provider_id: user.externalId,
          connected_at: new Date(),
        }

        const update = {
          $push: { external_accounts: external_account },
          $set: { updated_at: new Date() },
        }

        // If no external_accounts yet, initialize the array
        if (!user.external_accounts || user.external_accounts.length === 0) {
          update.$set.external_accounts = [external_account]
          update.$set.auth_type = user.auth_type || "external"
        }

        // Update user
        await db.collection("users").updateOne({ _id: user._id }, update)

        results.fixedUsers++
        results.details.push({
          user: user.email,
          action: "Migrated externalId to external_accounts",
          externalId: user.externalId,
        })

        updated = true
      }

      // Remove externalId field to prevent future issues
      if (user.externalId) {
        await db.collection("users").updateOne({ _id: user._id }, { $unset: { externalId: "" } })
      }
    }

    // Remove orphaned accounts (accounts without a valid user)
    for (const account of accounts) {
      const user = users.find((u) => u._id.toString() === account.userId)
      if (!user) {
        // This is an orphaned account, delete it
        await db.collection("accounts").deleteOne({ _id: account._id })
        results.removedOrphanedAccounts++
        results.details.push({
          action: "Removed orphaned account",
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        })
      }
    }

    // Drop the problematic index if it exists
    const indexes = await db.collection("users").indexes()
    const externalIdIndex = indexes.find((idx) => idx.name === "externalId_1" || (idx.key && idx.key.externalId === 1))

    if (externalIdIndex) {
      await db.collection("users").dropIndex("externalId_1")
      results.details.push({
        action: "Dropped externalId_1 index",
      })
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${results.fixedUsers} users and removed ${results.removedOrphanedAccounts} orphaned accounts`,
      results,
    })
  } catch (error) {
    console.error("Error fixing OAuth accounts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
