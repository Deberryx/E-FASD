import nodemailer from "nodemailer"
import { getUserById } from "./db/users"
import { getRequestByRequestId } from "./db/requests"
import { formatCurrency, formatDate } from "./utils"

// Initialize email transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
}

// Send email notification
export async function sendEmailNotification(to: string, subject: string, html: string) {
  const transporter = getTransporter()

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return info
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

// Send request submission notification
export async function sendRequestSubmissionNotification(requestId: string, userId: string) {
  const user = await getUserById(userId)
  const request = await getRequestByRequestId(requestId)

  if (!user || !request) {
    throw new Error("User or request not found")
  }

  const subject = `E-Cash Request System: New ${request.type_of_request} Request Submitted`

  const html = `
    <h1>New Request Submitted</h1>
    <p>Hello ${user.name},</p>
    <p>Your ${request.type_of_request} request has been submitted successfully.</p>
    <p><strong>Request ID:</strong> ${request.request_id}</p>
    <p><strong>Amount:</strong> ${formatCurrency(request.amount)}</p>
    <p><strong>Date:</strong> ${formatDate(request.date)}</p>
    <p>You will be notified when your request is approved or rejected.</p>
    <p>Thank you for using the E-Cash Request System.</p>
  `

  return sendEmailNotification(user.email, subject, html)
}

// Send approval notification
export async function sendApprovalNotification(
  requestId: string,
  userId: string,
  status: "approved" | "rejected" | "recap_needed",
  comments?: string,
) {
  const user = await getUserById(userId)
  const request = await getRequestByRequestId(requestId)

  if (!user || !request) {
    throw new Error("User or request not found")
  }

  let subject = ""
  let statusText = ""

  if (status === "approved") {
    subject = `E-Cash Request System: Your Request ${request.request_id} Has Been Approved`
    statusText = "approved"
  } else if (status === "rejected") {
    subject = `E-Cash Request System: Your Request ${request.request_id} Has Been Rejected`
    statusText = "rejected"
  } else if (status === "recap_needed") {
    subject = `E-Cash Request System: Your Request ${request.request_id} Requires a Recap`
    statusText = "approved but requires a recap"
  }

  const html = `
    <h1>Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h1>
    <p>Hello ${user.name},</p>
    <p>Your ${request.type_of_request} request (${request.request_id}) has been ${statusText}.</p>
    <p><strong>Request ID:</strong> ${request.request_id}</p>
    <p><strong>Amount:</strong> ${formatCurrency(request.amount)}</p>
    <p><strong>Date:</strong> ${formatDate(request.date)}</p>
    ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ""}
    ${status === "recap_needed" ? `<p><strong>Important:</strong> Please submit a recap within 5 days.</p>` : ""}
    <p>Thank you for using the E-Cash Request System.</p>
  `

  return sendEmailNotification(user.email, subject, html)
}

// Send recap reminder notification
export async function sendRecapReminderNotification(requestId: string, userId: string, daysLeft: number) {
  const user = await getUserById(userId)
  const request = await getRequestByRequestId(requestId)

  if (!user || !request) {
    throw new Error("User or request not found")
  }

  const subject = `E-Cash Request System: Recap Reminder for Request ${request.request_id}`

  const html = `
    <h1>Recap Reminder</h1>
    <p>Hello ${user.name},</p>
    <p>This is a reminder that you need to submit a recap for your ${request.type_of_request} request (${request.request_id}).</p>
    <p><strong>Request ID:</strong> ${request.request_id}</p>
    <p><strong>Amount:</strong> ${formatCurrency(request.amount)}</p>
    <p><strong>Days Left:</strong> ${daysLeft}</p>
    <p>Please log in to the E-Cash Request System and submit your recap as soon as possible.</p>
    <p>Thank you for using the E-Cash Request System.</p>
  `

  return sendEmailNotification(user.email, subject, html)
}

// Send recap submission notification
export async function sendRecapSubmissionNotification(requestId: string, userId: string, recapId: string) {
  const user = await getUserById(userId)
  const request = await getRequestByRequestId(requestId)

  if (!user || !request) {
    throw new Error("User or request not found")
  }

  const subject = `E-Cash Request System: Recap Submitted for Request ${request.request_id}`

  const html = `
    <h1>Recap Submitted</h1>
    <p>Hello ${user.name},</p>
    <p>Your recap for ${request.type_of_request} request (${request.request_id}) has been submitted successfully.</p>
    <p><strong>Request ID:</strong> ${request.request_id}</p>
    <p><strong>Recap ID:</strong> ${recapId}</p>
    <p>Thank you for using the E-Cash Request System.</p>
  `

  return sendEmailNotification(user.email, subject, html)
}
