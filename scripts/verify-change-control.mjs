import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const canonicalJourneyKitPath = path.resolve(
  root,
  "..",
  "AI Native Agency Deepened",
  "Journey_Kit.md",
);
const requiredFiles = [
  "docs/operations/change-control-register.md",
  "docs/operations/scheduled-change-queue.md",
  "docs/operations/kit-auth-standard.md",
  "docs/operations/kit-auth-standard-audit-2026-05-07.md",
  "docs/operations/notion-tracker-update-2026-05-07-kit-auth-standard.md",
  "mkt-06-content-creation-dissemination/kit.md",
  "mkt-06-content-creation-dissemination/assets/agent-versions.md",
];

const failures = [];

function readRequired(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function includesAll(text, relativePath, requiredSnippets) {
  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) {
      failures.push(`${relativePath} is missing: ${snippet}`);
    }
  }
}

for (const file of requiredFiles) {
  readRequired(file);
}

if (!fs.existsSync(canonicalJourneyKitPath)) {
  failures.push(`Missing canonical kit standard: ${canonicalJourneyKitPath}`);
} else {
  const canonicalJourneyKit = fs.readFileSync(canonicalJourneyKitPath, "utf8");
  includesAll(canonicalJourneyKit, "AI Native Agency Deepened/Journey_Kit.md", [
    "authStandard",
    "kit-auth/1.0",
    "authPolicy",
    "connection-prompt",
    "missingImpact",
    "Certification guidance",
  ]);
}

const registerPath = "docs/operations/change-control-register.md";
const register = readRequired(registerPath);
includesAll(register, registerPath, [
  "CC-2026-05-07-001",
  "CC-2026-05-07-002",
  "CC-2026-05-07-003",
  "CC-2026-05-07-004",
  "AI Native Agency Deepened\\Compliance Audits",
  "docs/operations/scheduled-change-queue.md",
  "Source of Truth Impact",
  "Automation Impact",
  "pnpm change-control:check",
]);

const scheduledQueuePath = "docs/operations/scheduled-change-queue.md";
const scheduledQueue = readRequired(scheduledQueuePath);
includesAll(scheduledQueue, scheduledQueuePath, [
  "testing workflows",
  "certifying workflows",
  "packaging workflows",
  "getting them to market",
  "CC-2026-05-07-002",
  "CC-2026-05-07-003",
  "CC-2026-05-07-004",
]);

const kitAuthStandardPath = "docs/operations/kit-auth-standard.md";
const kitAuthStandard = readRequired(kitAuthStandardPath);
includesAll(kitAuthStandard, kitAuthStandardPath, [
  "authStandard: kit-auth/1.0",
  "requireValidationTest: true",
  "requireRevocationPath: true",
  "oauth2-delegated",
  "connection-prompt",
  "api-key-vault",
  "CC-2026-05-07-003",
]);

const kitPath = "mkt-06-content-creation-dissemination/kit.md";
const kit = readRequired(kitPath);
includesAll(kit, kitPath, [
  "changeLog:",
  "CC-2026-05-07-001",
  "CC-2026-05-07-003",
  "authStandard: kit-auth/1.0",
  "authPolicy:",
  "auth:",
  "missingImpact:",
  "## Change Log",
  "assets/agent-versions.md",
]);

const notionUpdatePath =
  "docs/operations/notion-tracker-update-2026-05-07-kit-auth-standard.md";
const notionUpdate = readRequired(notionUpdatePath);
includesAll(notionUpdate, notionUpdatePath, [
  "Prepared for Notion tracker sync",
  "Auth Coverage",
  "One-Click Install Link",
  "Connector Validation Report",
  "CC-2026-05-07-003",
]);

const agentVersionsPath =
  "mkt-06-content-creation-dissemination/assets/agent-versions.md";
const agentVersions = readRequired(agentVersionsPath);
includesAll(agentVersions, agentVersionsPath, [
  "AI Drafting Agent",
  "CC-2026-05-07-001",
  "src/agents/drafting-agent.md",
]);

if (failures.length > 0) {
  console.error("Change-control verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Change-control verification passed.");
