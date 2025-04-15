import type { ObjectId } from "mongodb"

// Approval flow types
export type ApprovalFlowType = "imprest_request" | "imprest_recap" | "petty_cash"

// Approval step status
export type ApprovalStepStatus = "pending" | "approved" | "rejected" | "skipped"

// Approval step roles
export type ApproverRole =
  | "requester"
  | "head_of_department"
  | "head_admin_hr"
  | "grc_manager"
  | "accounts_officer"
  | "finance_head"
  | "finance_auto"
  | "disbursement_verification"

// Approval step definition
export interface ApprovalStep {
  id: string
  name: string
  role: ApproverRole
  description: string
  order: number
}

// Approval flow definition
export interface ApprovalFlow {
  type: ApprovalFlowType
  name: string
  description: string
  steps: ApprovalStep[]
}

// Approval step instance (for a specific request)
export interface ApprovalStepInstance {
  step_id: string
  status: ApprovalStepStatus
  approver_id?: ObjectId
  approver_name?: string
  approved_at?: Date
  notes?: string
}

// Approval flow instance (for a specific request)
export interface ApprovalFlowInstance {
  _id?: ObjectId
  flow_id: ApprovalFlowType
  request_id: string
  current_step: number
  steps: ApprovalStepInstance[]
  created_at: Date
  updated_at: Date
  completed_at?: Date
  is_completed: boolean
}

// System configuration for auto-approval
export interface SystemConfig {
  _id?: ObjectId
  key: string
  value: any
  description: string
  updated_at: Date
  updated_by: ObjectId
}

// Disbursement verification
export interface DisbursementVerification {
  _id?: ObjectId
  request_id: string
  verification_code: string
  sent_at: Date
  verified_at?: Date
  verified_by?: ObjectId
  delegate_name?: string
  delegate_badge?: string
  delegate_email?: string
  delegate_phone?: string
  is_verified: boolean
}
