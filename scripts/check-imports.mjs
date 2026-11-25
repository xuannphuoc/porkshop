import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const sourceFiles = [];
function collectFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      collectFiles(fullPath);
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      sourceFiles.push(fullPath);
    }
  }
}

collectFiles("src");
const brokenImports = [];
for (const filePath of sourceFiles) {
  const content = readFileSync(filePath, "utf8");
  const importPattern = /\bfrom\s+["'](\.[^"']+)["']/g;
  for (const match of content.matchAll(importPattern)) {
    const importPath = resolve(dirname(filePath), match[1]);
    const exists = [importPath, importPath + ".ts", importPath + ".tsx", importPath + ".js", join(importPath, "index.ts"), join(importPath, "index.tsx")].some(existsSync);
    if (exists === false) {
      brokenImports.push(filePath + ": " + match[1]);
    }
  }
}

if (brokenImports.length > 0) {
  console.error("Relative imports không tồn tại:");
  console.error(brokenImports.join("\n"));
  process.exitCode = 1;
} else {
  console.log("✓ Đã kiểm tra " + sourceFiles.length + " file TypeScript/TSX: tất cả relative imports đều có file đích.");
}
