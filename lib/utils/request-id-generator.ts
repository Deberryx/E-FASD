"use server"

import clientPromise from "@/lib/mongodb-server"

/**
 * Generates a unique request ID in the format GHC-YYYY-MM-SEQ
 * where SEQ is a 3-digit sequence number that resets monthly
 */
export async function generateRequestId(): Promise<string> {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")

  // Get current date components
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, "0")

  // Find or create sequence document for current year-month
  const sequenceCollection = db.collection("request_sequences")

  // Use findOneAndUpdate with upsert to atomically increment the sequence
  const result = await sequenceCollection.findOneAndUpdate(
    { year, month },
    { $inc: { current_seq: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      // If the document doesn't exist, initialize current_seq to 1
      upsert: true,
    },
  )

  // Format the sequence number with leading zeros
  const sequence = result.value?.current_seq || 1
  const formattedSeq = sequence.toString().padStart(3, "0")

  // Construct the request ID
  const requestId = `GHC-${year}-${month}-${formattedSeq}`

  return requestId
}

/**
 * Validates if a string matches the GHC-YYYY-MM-SEQ format
 */
export async function isValidRequestId(requestId: string): Promise<boolean> {
  const regex = /^GHC-\d{4}-\d{2}-\d{3}$/
  return regex.test(requestId)
}

/**
 * Extracts date components from a request ID
 */
export async function extractDateFromRequestId(requestId: string): Promise<{ year: number; month: number } | null> {
  if (!(await isValidRequestId(requestId))) {
    return null
  }

  const parts = requestId.split("-")
  return {
    year: Number.parseInt(parts[1], 10),
    month: Number.parseInt(parts[2], 10),
  }
}
