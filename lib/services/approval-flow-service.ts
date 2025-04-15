"use server"

import { ObjectId } from "mongodb"
import clientPromise from "../mongodb-server"
import type { ApprovalFlowInstance, ApprovalFlowType, ApprovalStepInstance } from "../models/approval-flow"
import { getApprovalFlow } from "../config/approval-flows"
import { createAuditLog } from "../db/audit-logs"
import { createErrorLog } from "../db/error-logs"
import { getUserById } from "../db/users"
import { getRequestById, updateRequestStatus } from "../db/requests"
import { sendApprovalNotification, sendRecapReminderNotification } from "../notification"
import { generateVerificationCode } from "../utils"

// Get MongoDB collections
const getCollections = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || "ecash_system")
  return {
    approvalFlows: db.collection<ApprovalFlowInstance>("approval_flows"),
    systemConfig: db.collection("system_config"),
    disbursementVerifications: db.collection("disbursement_verifications"),
  }
}

// Check if auto-approval is enabled
export async function isAutoApprovalEnabled(): Promise<boolean> {
  try {
    const { systemConfig } = await getCollections()
    const config = await systemConfig.findOne({ key: "autoApprovalEnabled" })
    return config?.value === true
  } catch (error) {
    console.error("Error checking auto-approval setting:", error)
    // Default to true if there's an error
    return true
  }
}

// Set auto-approval enabled/disabled
export async function setAutoApprovalEnabled(enabled: boolean, userId: string): Promise<boolean> {
  try {
    const { systemConfig } = await getCollections()
    const result = await systemConfig.updateOne(
      { key: "autoApprovalEnabled" },
      {
        $set: {
          value: enabled,
          updated_at: new Date(),
          updated_by: new ObjectId(userId),
        },
      },
      { upsert: true },
    )

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(userId),
      user_details: {
        name: "System Admin", // This should be fetched from user data
        badge_number: "ADMIN",
        role: "Admin",
      },
      action_type: "update",
      timestamp: new Date(),
      description: `${enabled ? "Enabled" : "Disabled"} auto-approval for Finance steps`,
      target_id: "system_config",
      target_type: "system",
    })

    return result.modifiedCount > 0 || result.upsertedCount > 0
  } catch (error) {
    console.error("Error setting auto-approval:", error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "System Config Error",
      message: `Error setting auto-approval: ${error.message}`,
      stack_trace: error.stack,
    })
    return false
  }
}

// Initialize approval flow for a request
export async function initializeApprovalFlow(
  requestId: string,
  flowType: ApprovalFlowType,
  userId: string,
): Promise<ApprovalFlowInstance | null> {
  try {
    const { approvalFlows } = await getCollections()

    // Get the flow definition
    const flowDefinition = getApprovalFlow(flowType)

    // Create step instances
    const stepInstances: ApprovalStepInstance[] = flowDefinition.steps.map((step) => ({
      step_id: step.id,
      status: step.order === 1 ? "approved" : "pending", // First step (requester) is auto-approved
      approver_id: step.order === 1 ? new ObjectId(userId) : undefined,
      approver_name: step.order === 1 ? "Requester" : undefined,
      approved_at: step.order === 1 ? new Date() : undefined,
    }))

    // Create flow instance
    const flowInstance: Omit<ApprovalFlowInstance, "_id"> = {
      flow_id: flowType,
      request_id: requestId,
      current_step: 2, // Start at step 2 (HOD approval)
      steps: stepInstances,
      created_at: new Date(),
      updated_at: new Date(),
      is_completed: false,
    }

    // Insert into database
    const result = await approvalFlows.insertOne(flowInstance)

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(userId),
      user_details: {
        name: "Requester", // This should be fetched from user data
        badge_number: "REQ",
        role: "User",
      },
      action_type: "create",
      timestamp: new Date(),
      description: `Initialized ${flowDefinition.name} for request ${requestId}`,
      target_id: requestId,
      target_type: "request",
    })

    // Update request status to "pending" (for HOD approval)
    await updateRequestStatus(requestId, "pending")

    return { ...flowInstance, _id: result.insertedId }
  } catch (error) {
    console.error(`Error initializing approval flow for request ${requestId}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Approval Flow Error",
      message: `Error initializing approval flow: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "initializeApprovalFlow",
        url: `/api/approval-flows`,
      },
    })
    return null
  }
}

// Get approval flow for a request
export async function getApprovalFlowByRequestId(requestId: string): Promise<ApprovalFlowInstance | null> {
  try {
    const { approvalFlows } = await getCollections()
    return await approvalFlows.findOne({ request_id: requestId })
  } catch (error) {
    console.error(`Error getting approval flow for request ${requestId}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Approval Flow Error",
      message: `Error getting approval flow: ${error.message}`,
      stack_trace: error.stack,
    })
    return null
  }
}

// Check if user can approve current step
export async function canUserApproveStep(
  flowInstance: ApprovalFlowInstance,
  userId: string,
  userRole: string,
  userDepartment: string,
): Promise<boolean> {
  try {
    // Get the flow definition
    const flowDefinition = getApprovalFlow(flowInstance.flow_id)

    // Get the current step
    const currentStepIndex = flowInstance.current_step - 1
    if (currentStepIndex < 0 || currentStepIndex >= flowDefinition.steps.length) {
      return false
    }

    const currentStep = flowDefinition.steps[currentStepIndex]

    // Check if the step is already approved or rejected
    const stepInstance = flowInstance.steps.find((s) => s.step_id === currentStep.id)
    if (stepInstance?.status === "approved" || stepInstance?.status === "rejected") {
      return false
    }

    // Check role-based permissions
    switch (currentStep.role) {
      case "head_of_department":
        // Get the request to check department
        const request = await getRequestById(flowInstance.request_id)
        return userRole === "Head of Department" && request?.department === userDepartment

      case "head_admin_hr":
        return userRole === "Head of Admin & HR"

      case "grc_manager":
        return userRole === "GRC Manager"

      case "accounts_officer":
        return userRole === "Accounts Officer"

      case "finance_head":
        return userRole === "Head of Finance" || userRole === "Admin"

      case "finance_auto":
        // This is handled by the auto-approval mechanism
        return false

      case "disbursement_verification":
        // This is handled by the verification code mechanism
        return (
          userRole === "Disburser" ||
          userRole === "Finance User Group" ||
          userRole === "Head of Finance" ||
          userRole === "Admin"
        )

      default:
        return false
    }
  } catch (error) {
    console.error(`Error checking if user can approve step:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Approval Flow Error",
      message: `Error checking if user can approve step: ${error.message}`,
      stack_trace: error.stack,
    })
    return false
  }
}

// Approve a step in the approval flow
export async function approveStep(requestId: string, userId: string, notes?: string): Promise<boolean> {
  try {
    const { approvalFlows } = await getCollections()

    // Get the flow instance
    const flowInstance = await getApprovalFlowByRequestId(requestId)
    if (!flowInstance) {
      throw new Error(`Approval flow not found for request ${requestId}`)
    }

    // Get the user
    const user = await getUserById(userId)
    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    // Check if user can approve
    const canApprove = await canUserApproveStep(flowInstance, userId, user.role, user.department)

    if (!canApprove) {
      throw new Error(`User ${userId} cannot approve the current step`)
    }

    // Get the flow definition
    const flowDefinition = getApprovalFlow(flowInstance.flow_id)

    // Get the current step
    const currentStepIndex = flowInstance.current_step - 1
    const currentStep = flowDefinition.steps[currentStepIndex]

    // Update the step status
    const updatedSteps = [...flowInstance.steps]
    const stepIndex = updatedSteps.findIndex((s) => s.step_id === currentStep.id)

    if (stepIndex >= 0) {
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: "approved",
        approver_id: new ObjectId(userId),
        approver_name: user.name,
        approved_at: new Date(),
        notes: notes,
      }
    }

    // Determine next step
    const nextStepIndex = currentStepIndex + 1
    const isLastStep = nextStepIndex >= flowDefinition.steps.length

    // Update the flow instance
    const updateData: Partial<ApprovalFlowInstance> = {
      steps: updatedSteps,
      updated_at: new Date(),
    }

    if (!isLastStep) {
      updateData.current_step = flowInstance.current_step + 1

      // Check if next step is auto-approval
      const nextStep = flowDefinition.steps[nextStepIndex]
      if (nextStep.role === "finance_auto") {
        // Check if auto-approval is enabled
        const autoApprovalEnabled = await isAutoApprovalEnabled()

        if (autoApprovalEnabled) {
          // Auto-approve the step
          const autoStepIndex = updatedSteps.findIndex((s) => s.step_id === nextStep.id)

          if (autoStepIndex >= 0) {
            updatedSteps[autoStepIndex] = {
              ...updatedSteps[autoStepIndex],
              status: "approved",
              approver_id: new ObjectId(userId), // Use the same user for audit purposes
              approver_name: "Auto-Approval System",
              approved_at: new Date(),
              notes: "Automatically approved by the system",
            }
          }

          // Move to the next step
          updateData.current_step = flowInstance.current_step + 2

          // Check if this was the last step
          if (nextStepIndex + 1 >= flowDefinition.steps.length) {
            updateData.is_completed = true
            updateData.completed_at = new Date()
          }
        }
      }
    } else {
      // This was the last step
      updateData.is_completed = true
      updateData.completed_at = new Date()
    }

    // Update the database
    const result = await approvalFlows.updateOne({ _id: flowInstance._id }, { $set: updateData })

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(userId),
      user_details: {
        name: user.name,
        badge_number: user.badge_number,
        role: user.role,
      },
      action_type: "approve",
      timestamp: new Date(),
      description: `Approved ${currentStep.name} step for request ${requestId}`,
      target_id: requestId,
      target_type: "request",
    })

    // Update request status
    let newStatus: "pending" | "approved" | "rejected" | "recap_needed" = "pending"

    if (updateData.is_completed) {
      // If this is an imprest request, mark it as needing a recap
      if (flowInstance.flow_id === "imprest_request") {
        newStatus = "recap_needed"

        // Send recap notification
        await sendRecapReminderNotification(requestId, userId, 5) // 5 days reminder
      } else {
        newStatus = "approved"
      }
    }

    await updateRequestStatus(requestId, newStatus)

    // Send notification
    await sendApprovalNotification(
      requestId,
      userId,
      newStatus,
      `${currentStep.name} step was approved${notes ? `: ${notes}` : ""}`,
    )

    // Special handling for specific steps
    if (currentStep.id === "checked_by_accounts" && flowInstance.flow_id === "imprest_recap") {
      // Schedule a 5-day reminder if no action is taken
      setTimeout(
        async () => {
          // Check if the flow has progressed
          const updatedFlow = await getApprovalFlowByRequestId(requestId)
          if (updatedFlow && updatedFlow.current_step === flowInstance.current_step + 1) {
            // Send reminder
            await sendRecapReminderNotification(requestId, userId, 0) // 0 days left
          }
        },
        5 * 24 * 60 * 60 * 1000,
      ) // 5 days in milliseconds
    }

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error approving step for request ${requestId}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Approval Flow Error",
      message: `Error approving step: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "approveStep",
        url: `/api/approval-flows/${requestId}/approve`,
      },
    })
    return false
  }
}

// Reject a step in the approval flow
export async function rejectStep(requestId: string, userId: string, notes: string): Promise<boolean> {
  try {
    const { approvalFlows } = await getCollections()

    // Get the flow instance
    const flowInstance = await getApprovalFlowByRequestId(requestId)
    if (!flowInstance) {
      throw new Error(`Approval flow not found for request ${requestId}`)
    }

    // Get the user
    const user = await getUserById(userId)
    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    // Check if user can approve (same permissions apply for rejection)
    const canApprove = await canUserApproveStep(flowInstance, userId, user.role, user.department)

    if (!canApprove) {
      throw new Error(`User ${userId} cannot reject the current step`)
    }

    // Get the flow definition
    const flowDefinition = getApprovalFlow(flowInstance.flow_id)

    // Get the current step
    const currentStepIndex = flowInstance.current_step - 1
    const currentStep = flowDefinition.steps[currentStepIndex]

    // Update the step status
    const updatedSteps = [...flowInstance.steps]
    const stepIndex = updatedSteps.findIndex((s) => s.step_id === currentStep.id)

    if (stepIndex >= 0) {
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: "rejected",
        approver_id: new ObjectId(userId),
        approver_name: user.name,
        approved_at: new Date(),
        notes: notes,
      }
    }

    // Update the flow instance
    const result = await approvalFlows.updateOne(
      { _id: flowInstance._id },
      {
        $set: {
          steps: updatedSteps,
          updated_at: new Date(),
          is_completed: true,
          completed_at: new Date(),
        },
      },
    )

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(userId),
      user_details: {
        name: user.name,
        badge_number: user.badge_number,
        role: user.role,
      },
      action_type: "reject",
      timestamp: new Date(),
      description: `Rejected ${currentStep.name} step for request ${requestId}: ${notes}`,
      target_id: requestId,
      target_type: "request",
    })

    // Update request status
    await updateRequestStatus(requestId, "rejected")

    // Send notification
    await sendApprovalNotification(requestId, userId, "rejected", `${currentStep.name} step was rejected: ${notes}`)

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error rejecting step for request ${requestId}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Approval Flow Error",
      message: `Error rejecting step: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "rejectStep",
        url: `/api/approval-flows/${requestId}/reject`,
      },
    })
    return false
  }
}

// Generate and send disbursement verification code
export async function generateDisbursementVerificationCode(requestId: string, userId: string): Promise<string | null> {
  try {
    const { disbursementVerifications } = await getCollections()

    // Generate a 6-digit verification code
    const verificationCode = generateVerificationCode(6)

    // Create verification record
    const verificationRecord = {
      request_id: requestId,
      verification_code: verificationCode,
      sent_at: new Date(),
      is_verified: false,
    }

    // Insert into database
    await disbursementVerifications.insertOne(verificationRecord)

    // Send the code to the Disbursement Group email
    // This would be implemented in the notification service

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(userId),
      user_details: {
        name: "System",
        badge_number: "SYS",
        role: "System",
      },
      action_type: "create",
      timestamp: new Date(),
      description: `Generated disbursement verification code for request ${requestId}`,
      target_id: requestId,
      target_type: "request",
    })

    return verificationCode
  } catch (error) {
    console.error(`Error generating disbursement verification code for request ${requestId}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Verification Error",
      message: `Error generating disbursement verification code: ${error.message}`,
      stack_trace: error.stack,
    })
    return null
  }
}

// Verify disbursement code
export async function verifyDisbursementCode(
  requestId: string,
  code: string,
  userId: string,
  delegateInfo?: {
    name: string
    badge: string
    email: string
    phone: string
  },
): Promise<boolean> {
  try {
    const { disbursementVerifications, approvalFlows } = await getCollections()

    // Find the verification record
    const verificationRecord = await disbursementVerifications.findOne({
      request_id: requestId,
      verification_code: code,
      is_verified: false,
    })

    if (!verificationRecord) {
      throw new Error(`Invalid verification code for request ${requestId}`)
    }

    // Update the verification record
    const updateData: any = {
      verified_at: new Date(),
      verified_by: new ObjectId(userId),
      is_verified: true,
    }

    // Add delegate info if provided
    if (delegateInfo) {
      updateData.delegate_name = delegateInfo.name
      updateData.delegate_badge = delegateInfo.badge
      updateData.delegate_email = delegateInfo.email
      updateData.delegate_phone = delegateInfo.phone
    }

    await disbursementVerifications.updateOne({ _id: verificationRecord._id }, { $set: updateData })

    // Get the flow instance
    const flowInstance = await getApprovalFlowByRequestId(requestId)
    if (!flowInstance) {
      throw new Error(`Approval flow not found for request ${requestId}`)
    }

    // Get the flow definition
    const flowDefinition = getApprovalFlow(flowInstance.flow_id)

    // Find the disbursement verification step
    const verificationStep = flowDefinition.steps.find((s) => s.role === "disbursement_verification")
    if (!verificationStep) {
      throw new Error(`Disbursement verification step not found for flow ${flowInstance.flow_id}`)
    }

    // Update the step status
    const updatedSteps = [...flowInstance.steps]
    const stepIndex = updatedSteps.findIndex((s) => s.step_id === verificationStep.id)

    if (stepIndex >= 0) {
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: "approved",
        approver_id: new ObjectId(userId),
        approver_name: delegateInfo ? `Delegate: ${delegateInfo.name}` : "Requester",
        approved_at: new Date(),
        notes: delegateInfo
          ? `Verified by delegate: ${delegateInfo.name} (${delegateInfo.badge})`
          : "Verified by requester",
      }
    }

    // Update the flow instance
    await approvalFlows.updateOne(
      { _id: flowInstance._id },
      {
        $set: {
          steps: updatedSteps,
          updated_at: new Date(),
          is_completed: true,
          completed_at: new Date(),
        },
      },
    )

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(userId),
      user_details: {
        name: delegateInfo ? delegateInfo.name : "Requester",
        badge_number: delegateInfo ? delegateInfo.badge : "REQ",
        role: "User",
      },
      action_type: "verify",
      timestamp: new Date(),
      description: delegateInfo
        ? `Disbursement verified by delegate ${delegateInfo.name} for request ${requestId}`
        : `Disbursement verified by requester for request ${requestId}`,
      target_id: requestId,
      target_type: "request",
    })

    // Update request status
    await updateRequestStatus(requestId, "approved")

    return true
  } catch (error) {
    console.error(`Error verifying disbursement code for request ${requestId}:`, error)
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Verification Error",
      message: `Error verifying disbursement code: ${error.message}`,
      stack_trace: error.stack,
    })
    return false
  }
}

// Calculate recap amount (refund or reimbursement)
export async function calculateRecapAmount(
  requestId: string,
  recapAmount: number,
  originalAmount: number,
): Promise<{ netAmount: number; recapType: "refund" | "reimbursement" }> {
  const netAmount = recapAmount - originalAmount

  // If netAmount is negative, it's a refund to requester
  // If netAmount is positive, it's a reimbursement to organization
  const recapType = netAmount < 0 ? "refund" : "reimbursement"

  return { netAmount, recapType }
}
