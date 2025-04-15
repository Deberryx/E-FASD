import { serverOnly } from "./server-only"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ObjectId } from "mongodb"

// This ensures this module is only used on the server
console.log(serverOnly)

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

export const generateApprovalId = async () => {
  return "APP-" + Math.random().toString(36).substring(2, 15).toUpperCase()
}

export const generateLogId = async () => {
  return "LOG-" + Math.random().toString(36).substring(2, 15).toUpperCase()
}

export const generateErrorId = async () => {
  return "ERR-" + Math.random().toString(36).substring(2, 15).toUpperCase()
}

export const generateRecapId = async () => {
  return "REC-" + Math.random().toString(36).substring(2, 15).toUpperCase()
}

export const generateRequestId = async () => {
  return "REQ-" + Math.random().toString(36).substring(2, 15).toUpperCase()
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

// Add this utility function to validate ObjectId
export const isValidObjectId = (id: string): boolean => {
  try {
    new ObjectId(id)
    return true
  } catch (error) {
    return false
  }
}
