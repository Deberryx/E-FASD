import type { ObjectId } from "mongodb"

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
  group_membership?: string[]
  status: "active" | "locked"
  externalId?: string | null // Add this field for Azure AD or other external IDs
  created_at: Date
  updated_at: Date
}

// Request model
export interface Request {
  _id?: ObjectId
  request_id: string
  user_id: ObjectId
  badge_number: string
  type_of_request: "Petty Cash" | "Requisition"
  date: Date
  department: string
  amount: number
  purpose: string
  details?: string
  items?: RequestItem[]
  attachments?: Attachment[]
  status: "pending" | "approved" | "rejected" | "recap_needed"
  created_at: Date
  updated_at: Date
}

// Request Item model (for Requisition requests)
export interface RequestItem {
  description: string
  quantity: number
  unit_price: number
}

// Attachment model
export interface Attachment {
  name: string
  url: string
  content_type: string
  size: number
  uploaded_at: Date
}

// Approval model
export interface Approval {
  _id?: ObjectId
  approval_id: string
  request_id: string
  approver_id: ObjectId
  approver_details: {
    name: string
    badge_number: string
    department: string
    role: string
  }
  status: "approved" | "rejected" | "recap_needed"
  comments?: string
  timestamp: Date
}

// Recap model
export interface Recap {
  _id?: ObjectId
  recap_id: string
  request_id: string
  user_id: ObjectId
  badge_number: string
  user_details: {
    name: string
    department: string
  }
  date: Date
  actual_amount: number
  notes: string
  attachments?: Attachment[]
  status: "submitted" | "approved" | "rejected"
  created_at: Date
  updated_at: Date
}

// Audit Log model
export interface AuditLog {
  _id?: ObjectId
  log_id: string
  user_id: ObjectId
  user_details: {
    name: string
    badge_number: string
    role: string
  }
  action_type: "create" | "update" | "approve" | "reject" | "delete" | "login" | "logout"
  timestamp: Date
  description: string
  target_id?: string
  target_type?: "request" | "approval" | "recap" | "user"
  ip_address?: string
}

// Error Log model
export interface ErrorLog {
  _id?: ObjectId
  error_id: string
  timestamp: Date
  error_type: string
  message: string
  stack_trace?: string
  user_id?: ObjectId
  request_info?: {
    method: string
    url: string
    body?: any
  }
}
