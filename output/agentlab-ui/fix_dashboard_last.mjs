import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'src', 'Dashboard.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// I finally see the very last literal escape issue hiding in the alert map
// className={`mt-1 w-2 h-2 rounded-full shadow-lg ${

content = content.replace(/className=\{\\\`mt-1/g, "className={`mt-1");
content = content.replace(/glow'\\n              \}\\\`\}/g, "glow'\n              }\`}");

fs.writeFileSync(filePath, content);
console.log('Fixed absolute final literal escape in Dashboard.tsx');