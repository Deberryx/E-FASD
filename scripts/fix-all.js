const { execSync } = require("child_process")

console.log("Running fix-utils-imports.js...")
execSync("node scripts/fix-utils-imports.js", { stdio: "inherit" })

console.log("Running check-mongodb-imports.js...")
execSync("node scripts/check-mongodb-imports.js", { stdio: "inherit" })

console.log("All fixes completed!")
