import { initializeDatabase } from "@/lib/db/init-db"

export async function DbInit() {
  try {
    // Initialize the database
    await initializeDatabase()
    console.log("Database initialization triggered")
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }

  // This component doesn't render anything
  return null
}
