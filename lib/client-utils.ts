import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// Import types from our safe types file instead of MongoDB directly
import { isValidObjectId as checkObjectId } from "./mongodb-types"

// Safe client-side utilities only
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount)
}

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export const getNextApproverRole = (currentRole: string) => {
  switch (currentRole) {
    case "Supervisor":
      return "Head of Department"
    case "Head of Department":
      return "Finance User Group"
    default:
      return null
  }
}

export const validatePettyCashAmount = (amount: number) => {
  return amount <= 500
}

export const generateVerificationCode = (length: number): string => {
  let result = ""
  const characters = "0123456789"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

// Safe ObjectId validation without importing mongodb
export const isValidObjectId = (id: string): boolean => {
  return checkObjectId(id)
}
