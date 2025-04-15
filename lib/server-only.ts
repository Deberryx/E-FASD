// This marker ensures the module is only used on the server
export const serverOnly = Symbol("SERVER_ONLY")

// Throw an error if this module is imported on the client side
if (typeof window !== "undefined") {
  throw new Error(
    "This module can only be used on the server side. " +
      "Please move your MongoDB operations to server components, API routes, or Server Actions.",
  )
}
