import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "src", "Dashboard.tsx");

let content = fs.readFileSync(filePath, "utf8");

// The issue keeps happening because I'm writing the file with the Node script which is adding extra backslashes.
// Let's replace the problematic line with a clean string concatenation that avoids template literals entirely.

const lines = content.split("\n");
lines[80] =
  "                <YAxis stroke=\"#64748b\" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => (value / 1000) + 'k'} />";
content = lines.join("\n");

fs.writeFileSync(filePath, content);
console.log("Fixed line 81 without using template literals");
