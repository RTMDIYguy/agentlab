import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'src', 'Dashboard.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// I can see the exact malformed string in your error log:
// <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value / 1000 + "k"} /> value / 1000 + 'k'}k`} />

const badRegex = /<YAxis[^>]+>.*?\/>/g;
const goodLine = '<YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value / 1000 + "k"} />';

// Let's replace that entire line by splitting it by newlines, fixing line 81, and joining it back
const lines = content.split('\n');
lines[80] = '                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />';
content = lines.join('\n');

fs.writeFileSync(filePath, content);
console.log('Fixed line 81 exactly by array index');