"use client"

import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Settings, ShieldAlert } from "lucide-react"

interface UserNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    id?: string
    role?: string
    department?: string
    badge_number?: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  const isAdmin = user.role === "Admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || "/placeholder.svg?height=32&width=32"} alt={user.name || "User"} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          {isAdmin && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Badge: {user.badge_number}</DropdownMenuItem>
          <DropdownMenuItem>Department: {user.department}</DropdownMenuItem>
          <DropdownMenuItem>
            Role: {user.role}
            {isAdmin && <span className="ml-2 text-amber-500 font-bold">★</span>}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {isAdmin && (
          <DropdownMenuItem
            asChild
            className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-medium"
          >
            <Link href="/admin">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
