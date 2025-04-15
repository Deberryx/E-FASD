const fs = require("fs")
const path = require("path")

// Function to recursively search for files
function findFiles(dir, extension) {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findFiles(filePath, extension))
    } else if (path.extname(file) === extension) {
      results.push(filePath)
    }
  })

  return results
}

// Find all TypeScript and TypeScript React files
const files = [
  ...findFiles("./components", ".tsx"),
  ...findFiles("./components", ".ts"),
  ...findFiles("./app", ".tsx"),
  ...findFiles("./app", ".ts"),
]

// Check each file for MongoDB imports
files.forEach((file) => {
  // Skip server-only files
  if (file.includes("server-only") || file.includes("mongodb-server")) {
    return
  }

  const content = fs.readFileSync(file, "utf8")

  // Check for 'use client' directive
  const isClientComponent = content.includes("'use client'") || content.includes('"use client"')

  // If it's a client component, check for MongoDB imports
  if (isClientComponent) {
    if (
      content.includes("from 'mongodb'") ||
      content.includes('from "mongodb"') ||
      content.includes("import { ObjectId }") ||
      content.includes("import { ObjectId }")
    ) {
      console.log(`WARNING: Client component ${file} imports MongoDB!`)
    }
  }
})

console.log("MongoDB import check completed")
