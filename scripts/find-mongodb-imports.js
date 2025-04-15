const fs = require("fs")
const path = require("path")

// List of problematic imports
const problematicImports = [
  "mongodb",
  "mongoose",
  "bson",
  "@napi-rs/snappy",
  "kerberos",
  "mongodb-client-encryption",
  "snappy",
]

// Function to check if a file is a client component
function isClientComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Check for "use client" directive
    if (content.includes("'use client'") || content.includes('"use client"')) {
      return true
    }

    // Check if it's in a client directory
    if (filePath.includes("/components/") && !filePath.includes("/server/")) {
      return true
    }

    return false
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return false
  }
}

// Function to check if a file imports problematic modules
function hasProblematicImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    for (const importName of problematicImports) {
      const importRegex = new RegExp(`(import|require).*['"]${importName}.*['"]`, "g")
      if (importRegex.test(content)) {
        return importName
      }
    }

    return null
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return null
  }
}

// Function to recursively scan directory
function scanDirectory(dir) {
  const issues = []

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !filePath.includes("node_modules") && !filePath.includes(".next")) {
      issues.push(...scanDirectory(filePath))
    } else if (
      stat.isFile() &&
      (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".js") || filePath.endsWith(".jsx"))
    ) {
      if (isClientComponent(filePath)) {
        const problematicImport = hasProblematicImports(filePath)
        if (problematicImport) {
          issues.push({ file: filePath, import: problematicImport })
        }
      }
    }
  }

  return issues
}

// Main function
function main() {
  console.log("Scanning for problematic imports in client components...")

  const issues = scanDirectory(".")

  if (issues.length === 0) {
    console.log("No issues found!")
  } else {
    console.log(`Found ${issues.length} issues:`)

    for (const issue of issues) {
      console.log(`- ${issue.file} imports ${issue.import}`)
    }

    console.log("\nPlease fix these issues by:")
    console.log("1. Moving MongoDB operations to server components or API routes")
    console.log("2. Using the mongodb-types.ts file for type definitions in client components")
    console.log('3. Adding "use server" directive to files that use MongoDB')
  }
}

main()
