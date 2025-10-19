import fs from "fs"
import path from "path"

const ignoredDirs = new Set(["node_modules", ".git", "build", ".next"]) // Add more if needed

function fixImports(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file)

        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoredDirs.has(file)) {
                fixImports(fullPath) // Recursively process subdirectories
            }
        } else if (file.endsWith(".js") || file.endsWith(".mjs") || file.endsWith(".ts") || file.endsWith(".tsx")) {
            let content = fs.readFileSync(fullPath, "utf8")
            const originalContent = content

            // 1. Fix import statements: import ... from "path"
            content = content.replace(/import\s+(?:[^"']*\s+from\s+)?["']([^"']+)["']/g, (match, importPath) => {
                if (importPath.startsWith(".") && !importPath.endsWith(".js") && !importPath.endsWith(".mjs") && !importPath.endsWith(".ts") && !importPath.endsWith(".tsx")) {
                    return match.replace(importPath, `${importPath}.js`)
                }
                return match
            })

            // 2. Fix export statements: export ... from "path"
            content = content.replace(/export\s+(?:[^"']*\s+from\s+)?["']([^"']+)["']/g, (match, exportPath) => {
                if (exportPath.startsWith(".") && !exportPath.endsWith(".js") && !exportPath.endsWith(".mjs") && !exportPath.endsWith(".ts") && !exportPath.endsWith(".tsx")) {
                    return match.replace(exportPath, `${exportPath}.js`)
                }
                return match
            })

            // 3. Fix dynamic imports: import("path")
            content = content.replace(/import\s*\(\s*["']([^"']+)["']\s*\)/g, (match, importPath) => {
                if (importPath.startsWith(".") && !importPath.endsWith(".js") && !importPath.endsWith(".mjs") && !importPath.endsWith(".ts") && !importPath.endsWith(".tsx")) {
                    return match.replace(importPath, `${importPath}.js`)
                }
                return match
            })

            // 4. Fix require statements: require("path")
            content = content.replace(/require\s*\(\s*["']([^"']+)["']\s*\)/g, (match, requirePath) => {
                if (requirePath.startsWith(".") && !requirePath.endsWith(".js") && !requirePath.endsWith(".mjs") && !requirePath.endsWith(".ts") && !requirePath.endsWith(".tsx")) {
                    return match.replace(requirePath, `${requirePath}.js`)
                }
                return match
            })

            // Only write if content changed
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content)
                console.log(`✅ Fixed imports in: ${fullPath}`)
            }
        }
    })
}

const target = process.argv[2] || "./dist"
fixImports(target) // Process the specified directory (defaults to ./dist)
console.log(`🎉 All imports fixed in: ${target}`)
