const fs = require("fs")
const path = require("path")

// Directory containing UI components
const uiDir = path.join(__dirname, "../components/ui")

// Function to update imports in a file
function updateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Replace imports from utils to client-utils
    const updatedContent = content.replace(
      /import\s+\{\s*(?:cn(?:,\s*[\w\s{}]*)?)\s*\}\s+from\s+["']@\/lib\/utils["']/g,
      'import { cn } from "@/lib/client-utils"',
    )

    // Write the updated content back to the file
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, "utf8")
      console.log(`Updated imports in ${filePath}`)
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error)
  }
}

// Process all TypeScript/TSX files in the UI directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      processDirectory(filePath)
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      updateImports(filePath)
    }
  }
}

// Start processing
processDirectory(uiDir)
console.log("Import update complete!")
