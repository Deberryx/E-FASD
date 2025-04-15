import { serverOnly } from "./server-only"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail, updateUser } from "./db/users"
import { ObjectId } from "mongodb"
import clientPromise from "./mongodb-server"

// This ensures this module is only used on the server
console.log(serverOnly)

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
    CredentialsProvider({
      name: "Test Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        // Only allow specific test credentials
        if (credentials?.email === "test@example.com" && credentials?.password === "password") {
          // Get the role from credentials
          const role = credentials.role || "User"

          // Create a test user with the specified role
          return {
            id: `test-${role.toLowerCase().replace(/\s+/g, "-")}-id`,
            name: `Test ${role}`,
            email: "test@example.com",
            role: role,
            department: role.includes("Finance") ? "Finance" : role.includes("Admin") ? "Administrative and HR" : "IT",
            badge_number: `${role.substring(0, 3).toUpperCase()}001`,
            status: "active",
            isNewUser: false,
            auth_type: "local",
          }
        }

        // Return null for invalid credentials
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add custom claims to the token
      if (user) {
        // For test users
        if (user.email === "test@example.com") {
          token.id = user.id
          token.role = user.role
          token.department = user.department
          token.badge_number = user.badge_number
          token.status = user.status
          token.isNewUser = false
          token.auth_type = user.auth_type || "local"
          return token
        }

        // For Azure AD users, fetch from database or mark as new
        try {
          // For Azure AD, use the Azure AD ID as provider_id
          const providerId = account?.provider === "azure-ad" ? account.providerAccountId : null

          const dbUser = await getUserByEmail(user.email!)

          if (dbUser) {
            // Existing user - update with latest info from Azure AD if needed
            token.id = dbUser._id?.toString()
            token.role = dbUser.role
            token.department = dbUser.department
            token.badge_number = dbUser.badge_number
            token.status = dbUser.status
            token.isNewUser = false
            token.auth_type = dbUser.auth_type || "local"

            // Update user's name and external account if needed
            const updates: any = {}
            if (dbUser.name !== user.name) {
              updates.name = user.name
            }

            // If this is an external provider and we have a providerId
            if (providerId && account?.provider) {
              // Check if this provider is already linked
              const hasProvider = dbUser.external_accounts?.some(
                (acc) => acc.provider === account.provider && acc.provider_id === providerId,
              )

              if (!hasProvider) {
                // Add the external account
                const externalAccount = {
                  provider: account.provider,
                  provider_id: providerId,
                  connected_at: new Date(),
                }

                updates.external_accounts = dbUser.external_accounts
                  ? [...dbUser.external_accounts, externalAccount]
                  : [externalAccount]

                // Update auth_type based on existing type
                if (dbUser.auth_type === "local") {
                  updates.auth_type = "hybrid"
                } else if (!dbUser.auth_type) {
                  updates.auth_type = "external"
                }
              }
            }

            if (Object.keys(updates).length > 0) {
              await updateUser(dbUser._id!.toString(), updates)
            }
          } else {
            // New user - needs onboarding
            token.id = new ObjectId().toString() // Generate a temporary ID
            token.name = user.name
            token.email = user.email
            token.role = "User" // Default role
            token.isNewUser = true // Mark as new user for onboarding
            token.auth_type = "external" // External authentication

            // Create a new user in the database with external account
            if (providerId && account?.provider) {
              const client = await clientPromise
              const db = client.db(process.env.MONGODB_DB || "ecash_system")

              const newUser = {
                _id: new ObjectId(token.id),
                name: user.name || "",
                email: user.email || "",
                badge_number: "", // Will be set during onboarding
                department: "", // Will be set during onboarding
                role: "User",
                auth_type: "external",
                external_accounts: [
                  {
                    provider: account.provider,
                    provider_id: providerId,
                    connected_at: new Date(),
                  },
                ],
                status: "pending", // Pending until onboarding is complete
                created_at: new Date(),
                updated_at: new Date(),
              }

              await db.collection("users").insertOne(newUser)
            }
          }
        } catch (error) {
          console.error("Error fetching user from database:", error)
          // If database error, still allow login but mark for onboarding
          token.isNewUser = true
          token.auth_type = "external"
          // For Azure AD, use the Azure AD ID as provider_id
          if (account?.provider === "azure-ad" && account.providerAccountId) {
            token.providerId = account.providerAccountId
            token.provider = account.provider
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add user info to the session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.department = token.department as string
        session.user.badge_number = token.badge_number as string
        session.user.status = token.status as string
        session.user.isNewUser = token.isNewUser as boolean
        session.user.auth_type = token.auth_type as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Always allow sign in, even for new users
      // We'll handle onboarding in the application
      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
