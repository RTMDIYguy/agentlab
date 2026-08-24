import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "src", "Dashboard.tsx");

let content = fs.readFileSync(filePath, "utf8");

// Replace the escaped template literal with standard string concatenation
const lines = content.split("\n");
lines[107] =
  "                    <Cell key={'cell-' + index} fill={entry.color} />";
content = lines.join("\n");

fs.writeFileSync(filePath, content);
console.log("Fixed line 108 without using template literals");
