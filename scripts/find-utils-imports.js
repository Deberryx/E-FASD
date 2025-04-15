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

// Check each file for imports from utils.ts
files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8")
  if (content.includes("from '@/lib/utils'") || content.includes('from "@/lib/utils"')) {
    console.log(`File ${file} imports from @/lib/utils`)
  }
})

console.log("Search completed")
