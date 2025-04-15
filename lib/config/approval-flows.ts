import type { ApprovalFlow, ApprovalFlowType } from "../models/approval-flow"

// Imprest Request Flow
export const imprestRequestFlow: ApprovalFlow = {
  type: "imprest_request",
  name: "Imprest Request Flow",
  description: "Approval flow for imprest requests",
  steps: [
    {
      id: "prepared_by",
      name: "Prepared by",
      role: "requester",
      description: "Request submitted by requester",
      order: 1,
    },
    {
      id: "authorised_by_hod",
      name: "Authorised by",
      role: "head_of_department",
      description: "Authorised by Head of Department",
      order: 2,
    },
    {
      id: "approved_by_admin_hr",
      name: "Approved by",
      role: "head_admin_hr",
      description: "Approved by Head, Administrative & HR",
      order: 3,
    },
    {
      id: "reviewed_by_grc",
      name: "Reviewed by",
      role: "grc_manager",
      description: "Reviewed by Governance, Risk & Compliance Manager",
      order: 4,
    },
    {
      id: "approved_by_finance",
      name: "Approved by",
      role: "finance_auto",
      description: "Automatically approved by Finance (configurable)",
      order: 5,
    },
  ],
}

// Imprest Recap Flow
export const imprestRecapFlow: ApprovalFlow = {
  type: "imprest_recap",
  name: "Imprest Recap Flow",
  description: "Approval flow for imprest recaps",
  steps: [
    {
      id: "prepared_by",
      name: "Prepared by",
      role: "requester",
      description: "Recap submitted by requester",
      order: 1,
    },
    {
      id: "authorised_by_hod",
      name: "Authorised by",
      role: "head_of_department",
      description: "Authorised by Head of Department",
      order: 2,
    },
    {
      id: "approved_by_admin_hr",
      name: "Approved by",
      role: "head_admin_hr",
      description: "Approved by Head, Administrative & HR",
      order: 3,
    },
    {
      id: "checked_by_accounts",
      name: "Checked by",
      role: "accounts_officer",
      description: "Checked by Accounts Officer",
      order: 4,
    },
    {
      id: "reviewed_by_grc",
      name: "Reviewed by",
      role: "grc_manager",
      description: "Reviewed by Governance, Risk & Compliance Manager",
      order: 5,
    },
    {
      id: "approved_by_finance",
      name: "Approved by",
      role: "finance_auto",
      description: "Automatically approved by Finance (configurable)",
      order: 6,
    },
    {
      id: "auto_calc",
      name: "Auto-Calculation",
      role: "finance_auto",
      description: "Automatic calculation of refund or reimbursement",
      order: 7,
    },
  ],
}

// Petty Cash Flow
export const pettyCashFlow: ApprovalFlow = {
  type: "petty_cash",
  name: "Petty Cash Flow",
  description: "Approval flow for petty cash requests (≤ 500 GHS)",
  steps: [
    {
      id: "prepared_by",
      name: "Prepared by",
      role: "requester",
      description: "Request submitted by requester",
      order: 1,
    },
    {
      id: "authorised_by_hod",
      name: "Authorised by",
      role: "head_of_department",
      description: "Authorised by Head of Department",
      order: 2,
    },
    {
      id: "approved_by_admin_hr",
      name: "Approved by",
      role: "head_admin_hr",
      description: "Approved by Head, Administrative & HR",
      order: 3,
    },
    {
      id: "checked_by_grc",
      name: "Checked by",
      role: "grc_manager",
      description: "Checked by Governance, Risk & Compliance Manager",
      order: 4,
    },
    {
      id: "approved_by_finance",
      name: "Approved by",
      role: "finance_head",
      description: "Approved by Head of Finance Department",
      order: 5,
    },
    {
      id: "received_by",
      name: "Received by",
      role: "disbursement_verification",
      description: "Verified by requester with disbursement code",
      order: 6,
    },
  ],
}

// Get approval flow by type
export function getApprovalFlow(type: ApprovalFlowType): ApprovalFlow {
  switch (type) {
    case "imprest_request":
      return imprestRequestFlow
    case "imprest_recap":
      return imprestRecapFlow
    case "petty_cash":
      return pettyCashFlow
    default:
      throw new Error(`Unknown approval flow type: ${type}`)
  }
}

// Get all approval flows
export function getAllApprovalFlows(): ApprovalFlow[] {
  return [imprestRequestFlow, imprestRecapFlow, pettyCashFlow]
}
