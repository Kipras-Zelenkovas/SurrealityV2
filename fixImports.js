import fs from "fs";
import path from "path";

const ignoredDirs = new Set(["node_modules", ".git", "dist", "build"]); // Add more if needed

function fixImports(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoredDirs.has(file)) {
                fixImports(fullPath); // Recursively process subdirectories
            }
        } else if (file.endsWith(".js")) {
            let content = fs.readFileSync(fullPath, "utf8");

            // Regex: Adds .js to relative imports that lack an extension
            content = content.replace(
                /from "(\..*?)(?<!\.js)";/g,
                'from "$1.js";'
            );

            fs.writeFileSync(fullPath, content);
            console.log(`✅ Fixed imports in: ${fullPath}`);
        }
    });
}

fixImports("./"); // Process the project root
console.log("🎉 All imports fixed!");
