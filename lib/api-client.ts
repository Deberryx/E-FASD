"use client"

// A client-side API wrapper for fetching data
export async function fetchUsers() {
  const response = await fetch("/api/users")
  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }
  return response.json()
}

export async function fetchRequests() {
  const response = await fetch("/api/requests")
  if (!response.ok) {
    throw new Error("Failed to fetch requests")
  }
  return response.json()
}

export async function fetchRequest(id: string) {
  const response = await fetch(`/api/requests/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch request")
  }
  return response.json()
}

// Add more client-side data fetching functions as needed
