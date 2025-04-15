// This file contains only type definitions for MongoDB
// It's safe to import in client components

// ObjectId type definition
export type ObjectId = {
  toString(): string
  equals(otherId: ObjectId): boolean
  getTimestamp(): Date
}

// Document type definition
export type Document = {
  _id?: ObjectId | string
  [key: string]: any
}

// Collection type definition
export type Collection<T = Document> = {
  // Define only the types, not the implementation
}

// Database type definition
export type Database = {
  // Define only the types, not the implementation
}

// Safe ObjectId validation without importing mongodb
export const isValidObjectId = (id: string | null | undefined): boolean => {
  if (!id) return false
  // Regular expression to check for a valid 24 character hex string
  const objectIdPattern = /^[0-9a-fA-F]{24}$/
  return objectIdPattern.test(id)
}

// Safe ObjectId string conversion
export const objectIdToString = (id: any): string => {
  if (!id) return ""
  if (typeof id === "string") return id
  if (typeof id === "object" && id !== null && typeof id.toString === "function") {
    return id.toString()
  }
  return ""
}
