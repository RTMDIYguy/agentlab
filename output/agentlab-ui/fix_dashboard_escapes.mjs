import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "src", "Dashboard.tsx");

let content = fs.readFileSync(filePath, "utf8");

// The issue here is the escaped backticks and dollar sign inside the TSX file.
// We need to change `cell-\${index}\` to just \`cell-\${index}\`
// Because Node.js fs.writeFileSync wrote the literal backslashes into the file.

content = content.replace(/\\`cell-\\\$\{index\}\\`/g, "\`cell-\${index}\`");

// Let's also do a blanket sweep for any other rogue literal backslashes escaping template literals
content = content.replace(/\\`/g, "\`");
content = content.replace(/\\\$/g, "$");

fs.writeFileSync(filePath, content);
console.log("Fixed literal escapes in Dashboard.tsx");
