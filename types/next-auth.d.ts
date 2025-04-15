import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      department?: string
      badge_number?: string
      status?: string
      isNewUser?: boolean
      auth_type?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    department?: string
    badge_number?: string
    status?: string
    isNewUser?: boolean
    auth_type?: string
    providerId?: string
    provider?: string
  }
}
