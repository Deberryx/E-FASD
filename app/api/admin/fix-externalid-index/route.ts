import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb-server"

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Get all indexes on the users collection
    const indexes = await usersCollection.indexes()

    // Check if the problematic index exists
    const externalIdIndex = indexes.find(
      (index) => index.name === "externalId_1" || (index.key && Object.keys(index.key).includes("externalId")),
    )

    if (!externalIdIndex) {
      return NextResponse.json({ message: "The externalId index does not exist. No action needed." }, { status: 200 })
    }

    // Drop the problematic index
    await usersCollection.dropIndex("externalId_1")

    // Log the action
    await db.collection("audit_logs").insertOne({
      action: "DROP_INDEX",
      collection: "users",
      index: "externalId_1",
      user: session.user.email,
      timestamp: new Date(),
    })

    return NextResponse.json({ message: "Successfully dropped the externalId index" }, { status: 200 })
  } catch (error) {
    console.error("Error fixing externalId index:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
