import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'src', 'Dashboard.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Replace the escaped backticks that node wrote into the file
content = content.replace(/className=\{\\\`mt-1 w-2 h-2 rounded-full shadow-lg \\\$\{/g, "className={`mt-1 w-2 h-2 rounded-full shadow-lg ${");
content = content.replace(/\\`\}/g, "`}");

fs.writeFileSync(filePath, content);
console.log('Fixed final literal escape in Dashboard.tsx');