import { redirect } from "next/navigation"
import { DbInit } from "./db-init"

export default async function Home() {
  // Initialize the database
  await DbInit()

  // Redirect to login page
  redirect("/login")
}
