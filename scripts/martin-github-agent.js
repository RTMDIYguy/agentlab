import fs from 'fs';
import path from 'path';
import https from 'https';

// Load event payload and API Keys
const EVENT_PAYLOAD = process.env.GITHUB_EVENT_PATH ? JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) : null;
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const WORKSPACE = process.cwd();

console.log("Initializing Martin Cloud Agent...");
console.log(`Working directory: ${WORKSPACE}`);
// Filesystem wrapper utilities for the cloud model
function listFiles(dir = WORKSPACE, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.pnpm-store' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      listFiles(filePath, fileList);
    } else {
      fileList.push(path.relative(WORKSPACE, filePath));
    }
  }
  return fileList;
}

function safeReadFile(relativeFilePath) {
  const absolutePath = path.join(WORKSPACE, relativeFilePath);
  if (!fs.existsSync(absolutePath)) return `Error: File not found - ${relativeFilePath}`;
  return fs.readFileSync(absolutePath, 'utf8');
}

function safeWriteFile(relativeFilePath, content) {
  const absolutePath = path.join(WORKSPACE, relativeFilePath);
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');
  return `Successfully wrote to ${relativeFilePath}`;
}

function safeMoveFile(oldPath, newPath) {
  const absOld = path.join(WORKSPACE, oldPath);
  const absNew = path.join(WORKSPACE, newPath);
  const dir = path.dirname(absNew);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.renameSync(absOld, absNew);
  return `Moved ${oldPath} to ${newPath}`;
}

function safeDeleteFile(relativeFilePath) {
  const absolutePath = path.join(WORKSPACE, relativeFilePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
    return `Deleted file ${relativeFilePath}`;
  }
  return `Error: File did not exist - ${relativeFilePath}`;
}
// LLM calling handler
async function callLLM(prompt, systemPrompt) {
  if (OPENAI_KEY) {
    return await callOpenAI(prompt, systemPrompt);
  } else if (ANTHROPIC_KEY) {
    return await callAnthropic(prompt, systemPrompt);
  } else if (GEMINI_KEY) {
    return await callGemini(prompt, systemPrompt);
  } else {
    throw new Error("No API secrets (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY) found.");
  }
}

// Main autonomous loop
async function runAgent() {
  if (!EVENT_PAYLOAD || !EVENT_PAYLOAD.issue) {
    console.error("No active GitHub issue payload found. Exiting.");
    process.exit(1);
  }

  const issueTitle = EVENT_PAYLOAD.issue.title;
  const issueBody = EVENT_PAYLOAD.issue.body || '';
  const request = `Issue: ${issueTitle}\n\nDetails:\n${issueBody}`;

  const systemPrompt = `You are Martin, the autonomous repository maintenance agent. 
You are tasked with executing the repository changes requested in the GitHub issue.
You can read, write, move, delete files and list directories.

To take actions, you must output a structured JSON plan in your response. Match this schema:
{
  "actions": [
    { "type": "read", "path": "relative/file/path" },
    { "type": "write", "path": "relative/file/path", "content": "..." },
    { "type": "move", "from": "old/path", "to": "new/path" },
    { "type": "delete", "path": "relative/path" }
  ],
  "reasoning": "Brief explanation of steps",
  "finished": true/false
}
Set "finished" to true when you have completed all requested cleanup and organization. Do not write node_modules or .git.`;

  let currentTurn = 1;
  const maxTurns = 6;
  let logOfActions = [];

  while (currentTurn <= maxTurns) {
    console.log(`\n--- TURN ${currentTurn}/${maxTurns} ---`);
    const files = listFiles();
    const stateContext = `Active files in repo:\n${files.join('\n')}\n\nHistory of completed actions:\n${logOfActions.join('\n')}`;
    const userPrompt = `${request}\n\n${stateContext}\n\nWhat is your next action? Output ONLY the JSON block matching the requested schema.`;

    const rawResponse = await callLLM(userPrompt, systemPrompt);
    let parsed;
    try {
      // Find JSON block if model wrote wrapping text
      const cleanJson = rawResponse.substring(rawResponse.indexOf('{'), rawResponse.lastIndexOf('}') + 1);
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse agent JSON. Raw content:", rawResponse);
      break;
    }

    console.log(`Agent reasoning: ${parsed.reasoning}`);
    
    if (parsed.actions && parsed.actions.length > 0) {
      for (const action of parsed.actions) {
        let resultMsg = "";
        if (action.type === 'read') {
          resultMsg = `Read file ${action.path} (Length: ${safeReadFile(action.path).length})`;
        } else if (action.type === 'write') {
          resultMsg = safeWriteFile(action.path, action.content);
        } else if (action.type === 'move') {
          resultMsg = safeMoveFile(action.from, action.to);
        } else if (action.type === 'delete') {
          resultMsg = safeDeleteFile(action.path);
        }
        console.log(`Action executed: ${resultMsg}`);
        logOfActions.push(resultMsg);
      }
    }

    if (parsed.finished) {
      console.log("Martin declared the cleanup finished!");
      fs.writeFileSync(path.join(WORKSPACE, 'martin-agent-run.md'), `### Martin-Cloud Run Summary\n\n**Issue Handled:** ${issueTitle}\n\n**Actions Completed:**\n\n${logOfActions.map(a => `- ${a}`).join('\n')}\n\n**Reasoning:** ${parsed.reasoning}\n`, 'utf8');
      break;
    }

    currentTurn++;
  }
}
// Native API integrations
function callOpenAI(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(body);
        if (parsed.choices && parsed.choices[0]) {
          resolve(parsed.choices[0].message.content);
        } else {
          reject(new Error(`OpenAI API error: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function callAnthropic(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(body);
        if (parsed.content && parsed.content[0]) {
          resolve(parsed.content[0].text);
        } else {
          reject(new Error(`Anthropic API error: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function callGemini(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(body);
        if (parsed.candidates && parsed.candidates[0].content.parts[0]) {
          resolve(parsed.candidates[0].content.parts[0].text);
        } else {
          reject(new Error(`Gemini API error: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Execute
runAgent().catch(err => {
  console.error("Critical Runtime Error in Martin Cloud handler:", err);
  process.exit(1);
});
