import type { ObjectId } from "mongodb"

// External account type
export interface ExternalAccount {
  provider: string // Provider name (e.g., "azure-ad", "google")
  provider_id: string // ID from the provider
  metadata?: any // Additional provider-specific data
  connected_at: Date // When this account was connected
}

// User model
export interface User {
  _id?: ObjectId
  name: string
  email: string
  badge_number: string
  department: string
  role:
    | "User"
    | "Supervisor"
    | "Head of Department"
    | "Head of Admin & HR"
    | "Head of Finance"
    | "Finance User Group"
    | "Disburser"
    | "Accounts Officer"
    | "GRC Manager"
    | "Admin"

  // Authentication fields
  auth_type: "local" | "external" | "hybrid" // Type of authentication
  password_hash?: string // Hashed password (for local auth)

  // External identity fields
  external_accounts?: ExternalAccount[]

  // External ID field - must be unique and non-null
  externalId: string // Made non-optional

  group_membership?: string[]
  status: "active" | "locked" | "pending"
  created_at: Date
  updated_at: Date
  last_login_at?: Date
}
