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

let fixedCount = 0

// Check and fix each file for imports from utils.ts
files.forEach((file) => {
  // Skip server-only files
  if (file.includes("server-only") || file.includes("mongodb-server")) {
    return
  }

  let content = fs.readFileSync(file, "utf8")
  const originalContent = content

  // Replace imports from @/lib/utils with @/lib/client-utils
  if (content.includes("from '@/lib/utils'") || content.includes('from "@/lib/utils"')) {
    content = content.replace(/from ['"]@\/lib\/utils['"]/g, 'from "@/lib/client-utils"')

    // Add 'use client' directive if it's not already there and it's a component file
    if (!content.includes("'use client'") && (file.endsWith(".tsx") || file.includes("/components/"))) {
      content = "'use client'\n\n" + content
    }

    // Write the updated content back to the file
    fs.writeFileSync(file, content, "utf8")
    fixedCount++
    console.log(`Fixed imports in ${file}`)
  }
})

console.log(`Fixed ${fixedCount} files.`)
