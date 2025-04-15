import type React from "react"
import { cn } from "@/lib/client-utils" // Changed from @/lib/utils to @/lib/client-utils

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}

export { Skeleton }
