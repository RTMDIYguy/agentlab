export interface DocHotspot {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  actionPrompt: string;
  outputMeaning: string;
  badgeType: "action" | "data" | "control" | "status";
}

export interface DocControlItem {
  name: string;
  type: "Button" | "Toggle" | "Input" | "Dropdown" | "Table Action" | "Filter";
  purpose: string;
  defaultState: string;
  permissions: "All Users" | "Admin Only" | "Operator";
}

export interface DocOutputItem {
  field: string;
  interpretation: string;
  normalRange: string;
  alertThreshold: string;
}

export interface DocTroubleshootingItem {
  symptom: string;
  cause: string;
  resolution: string;
  command?: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

export interface DocArchitectureItem {
  layer: "Frontend Component" | "Backend Controller" | "Database Schema" | "Cron / Scheduler" | "Operational SOP";
  component: string;
  filePath: string;
  description: string;
}

export interface DocPageEntry {
  slug: string;
  title: string;
  category: "Core Operations" | "Fleet & Agents" | "Security & Governance" | "Growth & Pipeline" | "Infrastructure & System";
  iconName: string;
  summary: string;
  targetRoute: string;
  version: string;
  estimatedReadTime: string;
  overview: {
    purpose: string;
    businessValue: string;
    keyWorkflows: string[];
  };
  mockLayoutType: 
    | "command-center" 
    | "agents" 
    | "auditing" 
    | "founder-signal-system" 
    | "settings" 
    | "marketplace" 
    | "blog-manager" 
    | "billing"
    | "help";
  hotspots: DocHotspot[];
  controls: DocControlItem[];
  outputs: DocOutputItem[];
  troubleshooting: DocTroubleshootingItem[];
  architecture: DocArchitectureItem[];
  relatedDocs: string[];
}

export const DOCS_REGISTRY: DocPageEntry[] = [
  {
    slug: "command-center",
    title: "Command Center",
    category: "Core Operations",
    iconName: "TerminalSquare",
    summary: "Mission control for all active AI agents, live telemetry, execution logs, and instant operational sync.",
    targetRoute: "/command-center",
    version: "v1.4.2",
    estimatedReadTime: "4 min read",
    overview: {
      purpose: "The Command Center provides a single pane of glass into the entire agency runtime. It monitors background workers, autonomous agents, trigger queues, and live system health across Google Cloud Run and local runtimes.",
      businessValue: "Eliminates operational blindness by consolidating cloud fleet telemetry, recent agent runs, cost counters, and automated scheduled sync status in real time.",
      keyWorkflows: [
        "One-click 'Run Real-time Sync' to aggregate cloud logs, lead queues, and agent heartbeats",
        "Live inspection of running agents and background execution logs",
        "Instant drill-down into failed workflow runs with payload debugging",
      ],
    },
    mockLayoutType: "command-center",
    hotspots: [
      {
        id: 1,
        x: 18,
        y: 18,
        title: "Fleet Health & Live Status Badge",
        description: "Displays real-time operational status (Operational, Degraded, or Outage) with active worker counts.",
        actionPrompt: "Inspect this badge first upon opening to confirm all background runtimes and API connectors are healthy.",
        outputMeaning: "🟢 Green = All cloud services reporting 200 OK. 🟡 Yellow = Minor latency or 1 worker retrying. 🔴 Red = Container failure or credential expiry.",
        badgeType: "status",
      },
      {
        id: 2,
        x: 82,
        y: 18,
        title: "Sync All & Live Refresh Trigger",
        description: "Executes an immediate sync across all API connectors, Instantly campaigns, audit logs, and Cloud Run backends.",
        actionPrompt: "Click 'Sync All' to force a fresh pull of lead metrics, audit logs, and agent activity immediately.",
        outputMeaning: "Dispatches POST /api/sync/all and streams updated JSON telemetry directly into the dashboard state.",
        badgeType: "action",
      },
      {
        id: 3,
        x: 35,
        y: 42,
        title: "Active Agent Fleet Matrix",
        description: "Shows individual agent status cards with current task, uptime, total step completions, and memory utilization.",
        actionPrompt: "Click any agent card to filter logs specifically for that agent or trigger an instant diagnostic ping.",
        outputMeaning: "Each card displays model name (e.g. Gemini 2.5 Flash / Claude 3.7), total runs completed, and error rate.",
        badgeType: "control",
      },
      {
        id: 4,
        x: 65,
        y: 72,
        title: "Real-time Execution & Audit Stream",
        description: "Live scrolling log feed of every workflow step, agent tool execution, and HTTP webhook event.",
        actionPrompt: "Filter by status ('Success', 'Failed', 'Pending') or search for specific workflow IDs.",
        outputMeaning: "Shows timestamp, execution latency (ms), tool name, and clickable payload inspector for every event.",
        badgeType: "data",
      },
    ],
    controls: [
      {
        name: "Sync All Button",
        type: "Button",
        purpose: "Triggers full backend synchronization across database, Instantly, ElevenLabs, and Cloud Run.",
        defaultState: "Idle (Active on click)",
        permissions: "All Users",
      },
      {
        name: "Status Filter Dropdown",
        type: "Dropdown",
        purpose: "Filters the live event stream by execution status (All, Success, Error, Warning).",
        defaultState: "All Events",
        permissions: "All Users",
      },
      {
        name: "Agent Quick-Pause Toggle",
        type: "Toggle",
        purpose: "Immediately pauses automatic execution triggers for a specific agent without deleting configuration.",
        defaultState: "Active (Enabled)",
        permissions: "Admin Only",
      },
      {
        name: "Export Logs Button",
        type: "Button",
        purpose: "Downloads the filtered log set as JSON or CSV for compliance audits.",
        defaultState: "Enabled",
        permissions: "Operator",
      },
    ],
    outputs: [
      {
        field: "Active Agents",
        interpretation: "Number of AI workers currently online and ready to accept trigger dispatches.",
        normalRange: "3 - 10 agents",
        alertThreshold: "< 1 agent online",
      },
      {
        field: "Average Latency (ms)",
        interpretation: "Roundtrip duration for tool execution and LLM response generation.",
        normalRange: "450ms - 2,200ms",
        alertThreshold: "> 8,000ms",
      },
      {
        field: "Error Rate (%)",
        interpretation: "Percentage of step runs that returned an error over the last 24 hours.",
        normalRange: "< 2.0%",
        alertThreshold: "> 5.0%",
      },
      {
        field: "Daily API Spend ($)",
        interpretation: "Cumulative cost incurred today across Gemini API, Instantly, and Cloud Run compute.",
        normalRange: "$0.10 - $5.00 / day",
        alertThreshold: "> $25.00 / day",
      },
    ],
    troubleshooting: [
      {
        symptom: "Command Center shows 'Disconnected' or Red Fleet Alert",
        cause: "Cloud Run backend container is either scaling up from zero or the database connection pool is saturated.",
        resolution: "Click 'Sync All'. If unresolved, check Google Cloud Run logs or run the local diagnostic script.",
        command: "pnpm run check",
        severity: "High",
      },
      {
        symptom: "Execution logs are not updating automatically",
        cause: "WebSocket heartbeat dropped or browser tab was suspended in background.",
        resolution: "Refresh the browser tab or click 'Sync All' to reconnect the real-time event pipeline.",
        command: "curl -I https://agentlab-718497644379.us-central1.run.app/api/health",
        severity: "Medium",
      },
      {
        symptom: "Agent tool executions show 'Simulated' badge",
        cause: "Legacy mock fallback was active due to missing environment credentials.",
        resolution: "All tools are now real. Verify API keys in Settings > Integrations to ensure live execution.",
        command: "pnpm change-control:check",
        severity: "Critical",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "CommandCenter.tsx",
        filePath: "client/src/pages/CommandCenter.tsx",
        description: "Renders fleet cards, live event stream, and sync triggers with WebSocket listeners.",
      },
      {
        layer: "Backend Controller",
        component: "agent-runner.ts",
        filePath: "server/execution/agent-runner.ts",
        description: "Dispatches real tool calls (web scraping, filesystem audit, DB log query, Instantly API).",
      },
      {
        layer: "Database Schema",
        component: "auditLogs & workflowRunSteps",
        filePath: "drizzle/schema.ts",
        description: "Stores persistent step traces, payload snippets, latencies, and execution costs.",
      },
      {
        layer: "Operational SOP",
        component: "Agency Command Center Blueprint",
        filePath: "docs/operations/agency-command-center.md",
        description: "Canonical operating blueprint for fleet orchestration and human-in-the-loop triggers.",
      },
    ],
    relatedDocs: ["agents", "auditing", "settings"],
  },
  {
    slug: "agents",
    title: "AI Agents Hub",
    category: "Fleet & Agents",
    iconName: "Cpu",
    summary: "Configure autonomous agents, tool permissions, system prompts, model selections, and task assignments.",
    targetRoute: "/agents",
    version: "v1.3.0",
    estimatedReadTime: "5 min read",
    overview: {
      purpose: "The AI Agents Hub provides granular management of all specialized autonomous agents operating within Uncle Robert Consulting and Bootstrapper Capital.",
      businessValue: "Empowers operators to tune prompt boundaries, bind specific execution tools, adjust temperature, and restrict write permissions with zero code deployments.",
      keyWorkflows: [
        "Configuring agent roles (Ops Cleanup Agent, Founder Intake Agent, Content Strategist)",
        "Assigning live tools (Web Scraping, Filesystem Audit, DB Query, Instantly Lead Pusher)",
        "Reviewing agent performance metrics and token usage efficiency",
      ],
    },
    mockLayoutType: "agents",
    hotspots: [
      {
        id: 1,
        x: 20,
        y: 22,
        title: "Agent Roster & Role Selector",
        description: "List of all active and standby agents with assigned domain competencies and active status.",
        actionPrompt: "Select an agent from the roster to load its configuration, prompt template, and tool bindings.",
        outputMeaning: "Displays active agents (e.g., Ops Cleanup, Founder Intake, Content Strategist, Compliance Auditor).",
        badgeType: "control",
      },
      {
        id: 2,
        x: 55,
        y: 22,
        title: "Model & Hyperparameter Selector",
        description: "Sets the underlying LLM engine (Gemini 2.5 Flash, Gemini 1.5 Pro, Claude 3.7 Sonnet) and temperature.",
        actionPrompt: "Adjust temperature lower (0.1 - 0.3) for deterministic auditing, or higher (0.6 - 0.8) for creative content.",
        outputMeaning: "Configures token limit, context window allocation, and reasoning budget for the selected agent.",
        badgeType: "control",
      },
      {
        id: 3,
        x: 82,
        y: 45,
        title: "Live Tool Permissions Matrix",
        description: "Toggles which real tools the agent is permitted to execute autonomously during workflow runs.",
        actionPrompt: "Enable or disable tools like 'scrapeUrlContent', 'auditFileInventory', 'inspectExecutionLogs', or 'addLeadToInstantlyCampaign'.",
        outputMeaning: "Active switches grant live execution capabilities. Grayed switches prevent tool exposure to LLM function-calling schema.",
        badgeType: "action",
      },
      {
        id: 4,
        x: 50,
        y: 75,
        title: "System Prompt & Guardrail Editor",
        description: "Rich prompt editor with live variable injection (e.g. {{workspaceId}}, {{clientName}}, {{date}}).",
        actionPrompt: "Edit the agent's core identity, guardrails, and stop conditions. Click 'Save Configuration' to deploy immediately.",
        outputMeaning: "Directly updates the agent system prompt in the database, affecting all subsequent execution runs.",
        badgeType: "data",
      },
    ],
    controls: [
      {
        name: "Create New Agent Button",
        type: "Button",
        purpose: "Opens the agent creation wizard to scaffold a new AI worker from template.",
        defaultState: "Enabled",
        permissions: "Admin Only",
      },
      {
        name: "Model Dropdown",
        type: "Dropdown",
        purpose: "Selects the LLM provider and model variant for this agent's inference engine.",
        defaultState: "Gemini 2.5 Flash",
        permissions: "Operator",
      },
      {
        name: "Tool Toggles",
        type: "Toggle",
        purpose: "Enables or revokes specific tool access (e.g., web scraping, filesystem audit, email outreach).",
        defaultState: "Role-dependent",
        permissions: "Admin Only",
      },
      {
        name: "Save Configuration Button",
        type: "Button",
        purpose: "Persists modified prompt, model settings, and tool permissions to the database.",
        defaultState: "Disabled until modified",
        permissions: "Operator",
      },
    ],
    outputs: [
      {
        field: "Total Steps Run",
        interpretation: "Cumulative number of tool and thought iterations completed by this agent.",
        normalRange: "100 - 50,000 steps",
        alertThreshold: "N/A",
      },
      {
        field: "Average Success Rate",
        interpretation: "Percentage of runs where the agent successfully resolved its assigned goal without throwing errors.",
        normalRange: "> 95.0%",
        alertThreshold: "< 90.0%",
      },
      {
        field: "Context Window Utilization",
        interpretation: "Average tokens utilized per invocation relative to maximum model limit.",
        normalRange: "5% - 40%",
        alertThreshold: "> 85%",
      },
    ],
    troubleshooting: [
      {
        symptom: "Agent throws 'Tool execution unauthorized or missing permission'",
        cause: "The required tool toggle is turned off in the Agent's Tool Permissions matrix.",
        resolution: "Navigate to Agents Hub, select the agent, and toggle on the required tool switch before saving.",
        severity: "Low",
      },
      {
        symptom: "Agent hallucinates or fails to follow structured format",
        cause: "Temperature is set too high, or prompt guardrails lack explicit schema examples.",
        resolution: "Lower temperature to 0.2 and add concrete JSON or Markdown schema specifications to the System Prompt.",
        severity: "Medium",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "Agents.tsx",
        filePath: "client/src/pages/Agents.tsx",
        description: "UI for agent selection, model config, prompt editor, and tool switches.",
      },
      {
        layer: "Backend Controller",
        component: "agent-runner.ts",
        filePath: "server/execution/agent-runner.ts",
        description: "Executes agent reasoning loop, binds tool schemas, and records step traces in DB.",
      },
      {
        layer: "Operational SOP",
        component: "URC Agent Execution Checklist",
        filePath: "docs/operations/urc-agent-execution-checklist.md",
        description: "Checklist for certifying, testing, and packaging autonomous agent workflows.",
      },
    ],
    relatedDocs: ["command-center", "auditing", "marketplace"],
  },
  {
    slug: "auditing",
    title: "Auditing & Compliance",
    category: "Security & Governance",
    iconName: "ShieldAlert",
    summary: "Review agent decision traces, verify SHA-256 artifact hashes, approve human-in-the-loop actions, and inspect compliance drift.",
    targetRoute: "/auditing",
    version: "v1.2.1",
    estimatedReadTime: "4 min read",
    overview: {
      purpose: "Auditing & Compliance enforces strict human-in-the-loop governance and mathematical artifact verification across all autonomous actions.",
      businessValue: "Guarantees that no agent writes to disk, publishes public content, or modifies critical records without verifiable cryptographic trails and operational audit checks.",
      keyWorkflows: [
        "Reviewing and approving human-in-the-loop execution gates",
        "Inspecting SHA-256 integrity hashes for generated business artifacts",
        "Running the Change Control & Operational Drift Scanner across all 81 SOP documents",
      ],
    },
    mockLayoutType: "auditing",
    hotspots: [
      {
        id: 1,
        x: 22,
        y: 20,
        title: "Pending Human-in-the-Loop Approvals",
        description: "Queue of high-impact agent actions (e.g. sending batch emails, modifying core files) awaiting human sign-off.",
        actionPrompt: "Review the proposed payload and click 'Approve Action' or 'Reject with Feedback'.",
        outputMeaning: "Agents pause execution safely until an authorized operator approves or modifies the step.",
        badgeType: "control",
      },
      {
        id: 2,
        x: 78,
        y: 20,
        title: "Drift Scanner & Change Control Status",
        description: "Displays result of the automated drift verification against the Canonical Operations Register.",
        actionPrompt: "Click 'Run Drift Check' to scan all 81 operational SOPs against active system behavior.",
        outputMeaning: "0 Critical / 0 High findings confirms complete alignment between documentation and codebase.",
        badgeType: "status",
      },
      {
        id: 3,
        x: 50,
        y: 55,
        title: "Cryptographic Artifact Hash Ledger",
        description: "Table of all generated output documents with SHA-256 checksums, byte counts, and creator agent IDs.",
        actionPrompt: "Click any artifact to verify its tamper-proof hash matches the original generated file on disk.",
        outputMeaning: "Guarantees file integrity and auditability for client deliverables and financial trackers.",
        badgeType: "data",
      },
      {
        id: 4,
        x: 50,
        y: 85,
        title: "Compliance Audit Trail & Raw Trace Inspector",
        description: "Exhaustive timeline of agent prompts, tool inputs, API responses, latencies, and token costs.",
        actionPrompt: "Filter traces by Agent ID, Workflow Run ID, or Date to inspect exact system behavior.",
        outputMeaning: "Provides complete forensics for debugging, compliance certification, and optimization.",
        badgeType: "action",
      },
    ],
    controls: [
      {
        name: "Approve / Reject Action Buttons",
        type: "Button",
        purpose: "Grants or denies permission for a pending human-in-the-loop workflow gate.",
        defaultState: "Pending review",
        permissions: "Admin Only",
      },
      {
        name: "Run Drift Scanner Button",
        type: "Button",
        purpose: "Executes `pnpm change-control:check` to detect any drift across the 81 operational SOPs.",
        defaultState: "Enabled",
        permissions: "Operator",
      },
      {
        name: "Date Range Filter",
        type: "Input",
        purpose: "Filters the audit ledger by specific date boundaries.",
        defaultState: "Past 7 Days",
        permissions: "All Users",
      },
    ],
    outputs: [
      {
        field: "Pending Approvals",
        interpretation: "Number of workflows paused waiting for human validation.",
        normalRange: "0 - 3 items",
        alertThreshold: "> 5 items",
      },
      {
        field: "Drift Findings",
        interpretation: "Number of inconsistencies detected between documentation and live system state.",
        normalRange: "0 findings",
        alertThreshold: "> 0 findings",
      },
      {
        field: "Artifact Hash Match Rate",
        interpretation: "Percentage of disk files whose current SHA-256 hash matches the recorded creation hash.",
        normalRange: "100.0%",
        alertThreshold: "< 100.0%",
      },
    ],
    troubleshooting: [
      {
        symptom: "Drift Scanner reports warnings or mismatches",
        cause: "A documentation file or schema was edited without updating the Change Control Register.",
        resolution: "Add a corresponding change entry in `docs/operations/change-control-register.md` and re-run check.",
        command: "pnpm change-control:check",
        severity: "Medium",
      },
      {
        symptom: "Workflow stuck in 'PAUSED_FOR_APPROVAL' state",
        cause: "An automated trigger required human approval, but no operator has reviewed the audit item.",
        resolution: "Visit the Auditing page, inspect the pending approval card, and click 'Approve Action'.",
        severity: "Low",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "Auditing.tsx",
        filePath: "client/src/pages/Auditing.tsx",
        description: "Renders approvals queue, artifact hash ledger, and compliance scanner controls.",
      },
      {
        layer: "Database Schema",
        component: "auditLogs table",
        filePath: "drizzle/schema.ts",
        description: "Immutable audit log records recording user/agent actions, IP addresses, and payloads.",
      },
      {
        layer: "Operational SOP",
        component: "Change Control Register",
        filePath: "docs/operations/change-control-register.md",
        description: "Canonical source of truth for all architectural, operational, and schema changes.",
      },
    ],
    relatedDocs: ["command-center", "agents", "settings"],
  },
  {
    slug: "founder-signal-system",
    title: "Founder Signal System",
    category: "Growth & Pipeline",
    iconName: "ShoppingBag",
    summary: "Outbound lead capture, Instantly.ai email sequence orchestration, diagnostic sprint scheduling, and pipeline analytics.",
    targetRoute: "/founder-signal-system",
    version: "v1.1.0",
    estimatedReadTime: "4 min read",
    overview: {
      purpose: "The Founder Signal System automates the discovery, qualification, and outbound outreach for founders needing Microsoft 365 diagnostics and Agentic OS migrations.",
      businessValue: "Drives predictable pipeline generation through verified Instantly.ai campaigns with automated warm-up, rate-limiting, and lead status tracking.",
      keyWorkflows: [
        "Monitoring active Instantly campaigns (e.g. KC & Missouri Founders Batch 01)",
        "Reviewing daily lead send quotas, email deliverability, and open/reply rates",
        "Triggering outbound batches and syncing response telemetry back to CRM-lite",
      ],
    },
    mockLayoutType: "founder-signal-system",
    hotspots: [
      {
        id: 1,
        x: 25,
        y: 20,
        title: "Campaign Status & Active Sequence Card",
        description: "Displays current campaign name, status (🟢 Active / Sending), and scheduled timezone windows.",
        actionPrompt: "Verify campaign schedule (e.g. Mon-Fri 9:00 AM - 5:00 PM CDT) and daily sending limit (30/day).",
        outputMeaning: "Confirms whether the campaign is actively dispatching emails or resting outside scheduled hours.",
        badgeType: "status",
      },
      {
        id: 2,
        x: 75,
        y: 20,
        title: "Outbound Quota & Deliverability Gauge",
        description: "Visual gauge tracking leads sent today against the safe daily sending threshold.",
        actionPrompt: "Adjust daily limit if warmup score is high or throttle down if domain reputation needs rest.",
        outputMeaning: "Keeps outbound volume within safe deliverability thresholds to avoid spam filtering.",
        badgeType: "control",
      },
      {
        id: 3,
        x: 50,
        y: 50,
        title: "Lead Inventory & Diagnostic Pipeline Table",
        description: "List of qualified founder prospects with company name, email, diagnostic status, and reply signals.",
        actionPrompt: "Filter leads by status ('Contacted', 'Opened', 'Replied', 'Sprint Booked'). Click a lead to view history.",
        outputMeaning: "Provides real-time visibility into which founders are engaging with the M365 Diagnostic Sprint offer.",
        badgeType: "data",
      },
      {
        id: 4,
        x: 82,
        y: 80,
        title: "Add Leads & Sync Instantly Trigger",
        description: "Direct action button to push new scraped leads directly into active Instantly.ai sequences.",
        actionPrompt: "Click 'Sync Leads to Instantly' to validate email syntax, deduplicate, and upload to the active sequence.",
        outputMeaning: "Executes real Instantly API v2 calls with instant confirmation and campaign lead count update.",
        badgeType: "action",
      },
    ],
    controls: [
      {
        name: "Campaign Pause / Resume Button",
        type: "Button",
        purpose: "Toggles campaign status between Active (sending) and Paused directly on Instantly.ai.",
        defaultState: "Active",
        permissions: "Operator",
      },
      {
        name: "Sync Leads to Instantly Button",
        type: "Button",
        purpose: "Pushes newly qualified founder prospects into the active outbound email sequence.",
        defaultState: "Enabled",
        permissions: "Operator",
      },
      {
        name: "Daily Limit Slider",
        type: "Input",
        purpose: "Controls the maximum number of new emails dispatched per business day.",
        defaultState: "30 / day",
        permissions: "Admin Only",
      },
    ],
    outputs: [
      {
        field: "Total Leads in Campaign",
        interpretation: "Number of founder prospects uploaded and enrolled in the outbound sequence.",
        normalRange: "20 - 500 leads / batch",
        alertThreshold: "< 5 leads remaining",
      },
      {
        field: "Open Rate (%)",
        interpretation: "Percentage of delivered emails opened by recipients.",
        normalRange: "35.0% - 65.0%",
        alertThreshold: "< 20.0%",
      },
      {
        field: "Reply Rate (%)",
        interpretation: "Percentage of founders who replied to the initial or follow-up touchpoint.",
        normalRange: "4.0% - 12.0%",
        alertThreshold: "< 2.0%",
      },
    ],
    troubleshooting: [
      {
        symptom: "Instantly campaign shows '0 Leads Sent' during business hours",
        cause: "Campaign sending schedule timezone mismatch or daily limit reached for today.",
        resolution: "Verify schedule is set to Central Time (CDT) and check if today's quota was already filled.",
        command: "curl -H \"Authorization: Bearer $INSTANTLY_API_KEY\" https://api.instantly.ai/api/v2/campaigns/summary",
        severity: "Medium",
      },
      {
        symptom: "Failed to upload leads: 'Invalid email or duplicate'",
        cause: "Lead has malformed syntax or already exists in an active sequence.",
        resolution: "Review the lead inventory table to verify syntax and remove duplicate email entries.",
        severity: "Low",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "FounderSignalSystem.tsx",
        filePath: "client/src/pages/FounderSignalSystem.tsx",
        description: "Dashboard for campaign monitoring, lead tables, and sending limits.",
      },
      {
        layer: "Backend Controller",
        component: "agent-runner.ts (Instantly Tool)",
        filePath: "server/execution/agent-runner.ts",
        description: "Connects to live Instantly.ai v2 API to list campaigns, push leads, and check metrics.",
      },
      {
        layer: "Operational SOP",
        component: "Lead Inventory Registry",
        filePath: "docs/operations/lead-inventory-registry.md",
        description: "Tracks lead batches, qualification criteria, and outbound sequence copy.",
      },
    ],
    relatedDocs: ["command-center", "settings", "blog-manager"],
  },
  {
    slug: "settings",
    title: "Settings & Integrations",
    category: "Infrastructure & System",
    iconName: "Settings",
    summary: "Manage API credentials (OpenAI, Vertex AI, Instantly, ElevenLabs), workspace parameters, and live connectivity health checks.",
    targetRoute: "/dashboard/settings",
    version: "v1.2.0",
    estimatedReadTime: "3 min read",
    overview: {
      purpose: "Settings provides centralized secret management, integration diagnostics, and workspace parameter tuning.",
      businessValue: "Enables instant live health checks for third-party APIs without exposing secrets in logs or plaintext files.",
      keyWorkflows: [
        "Testing live connectivity to Google Cloud, Instantly.ai, and ElevenLabs APIs",
        "Updating API keys and model credentials securely",
        "Managing workspace metadata and notification preferences",
      ],
    },
    mockLayoutType: "settings",
    hotspots: [
      {
        id: 1,
        x: 30,
        y: 25,
        title: "API Credentials & Secrets Vault",
        description: "Masked input fields for Gemini API Key, OpenAI Key, Instantly Key, and ElevenLabs credentials.",
        actionPrompt: "Enter API tokens. Values are masked and encrypted before storage in environment/secrets store.",
        outputMeaning: "Shows green checkmark when valid key format is detected.",
        badgeType: "control",
      },
      {
        id: 2,
        x: 75,
        y: 25,
        title: "Live Health Check & Test Probe Buttons",
        description: "Runs an authentic HTTP probe against each integrated service to confirm live credentials and latency.",
        actionPrompt: "Click 'Test Connection' on any integration to run a real probe and view exact ping latency.",
        outputMeaning: "🟢 Connected (240ms) = API key is active and responding. 🔴 Failed = Invalid key or rate limited.",
        badgeType: "action",
      },
      {
        id: 3,
        x: 50,
        y: 65,
        title: "Workspace & Agency Configuration",
        description: "Defines primary agency brand (URC / Bootstrapper Capital / Tactix), timezone, and currency.",
        actionPrompt: "Set agency parameters and click 'Save Changes'.",
        outputMeaning: "Propagates company identity across reports, generated blueprints, and email templates.",
        badgeType: "data",
      },
    ],
    controls: [
      {
        name: "Test Connection Button",
        type: "Button",
        purpose: "Executes real HTTP ping to verify integration API tokens (e.g. OpenAI, Instantly, ElevenLabs).",
        defaultState: "Enabled",
        permissions: "All Users",
      },
      {
        name: "Save Credentials Button",
        type: "Button",
        purpose: "Securely persists updated API keys to the backend environment store.",
        defaultState: "Enabled",
        permissions: "Admin Only",
      },
    ],
    outputs: [
      {
        field: "Integration Status",
        interpretation: "Live network reachability and authentication verification for each configured service.",
        normalRange: "🟢 Connected",
        alertThreshold: "🔴 Connection Failed",
      },
      {
        field: "Probe Latency (ms)",
        interpretation: "Time in milliseconds for the third-party API endpoint to respond to a health probe.",
        normalRange: "150ms - 800ms",
        alertThreshold: "> 3,500ms",
      },
    ],
    troubleshooting: [
      {
        symptom: "Test Connection returns '401 Unauthorized' for Instantly or ElevenLabs",
        cause: "API key was copied with leading/trailing whitespace or has expired on the provider side.",
        resolution: "Regenerate the API key in the provider console, paste cleanly without spaces, and test again.",
        severity: "High",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "Settings.tsx",
        filePath: "client/src/pages/Settings.tsx",
        description: "Settings view with API key inputs and live test buttons.",
      },
      {
        layer: "Backend Controller",
        component: "router.ts (Settings Router)",
        filePath: "server/settings/router.ts",
        description: "Handles secure API token validation and executes real HTTP health probes.",
      },
      {
        layer: "Operational SOP",
        component: "Secret Handling Standard",
        filePath: "docs/operations/secret-handling-standard.md",
        description: "Security protocols for storing, rotating, and managing API keys.",
      },
    ],
    relatedDocs: ["command-center", "agents", "billing"],
  },
  {
    slug: "marketplace",
    title: "Marketplace & Workflows",
    category: "Core Operations",
    iconName: "ShoppingBag",
    summary: "Browse, certify, and install pre-packaged autonomous workflows, lead engines, and operational modules.",
    targetRoute: "/marketplace",
    version: "v1.2.0",
    estimatedReadTime: "3 min read",
    overview: {
      purpose: "The Marketplace houses certified, reusable agent workflow packages ready for one-click installation into any workspace.",
      businessValue: "Accelerates time-to-value by providing pre-built, tested operating recipes for lead generation, content syndication, and compliance.",
      keyWorkflows: [
        "Browsing available workflow bundles (e.g. M365 Diagnostic Sprint, Ops Cleanup Suite)",
        "Reviewing certification status, required API dependencies, and estimated cost per run",
        "Installing and activating workflows into the active Command Center queue",
      ],
    },
    mockLayoutType: "marketplace",
    hotspots: [
      {
        id: 1,
        x: 30,
        y: 20,
        title: "Workflow Catalog & Category Filter",
        description: "Explore workflows filtered by domain (Lead Gen, Content, Ops, Compliance, Security).",
        actionPrompt: "Filter by category to find the exact workflow recipe needed.",
        outputMeaning: "Displays certified packages with version numbers, author tags, and difficulty badges.",
        badgeType: "control",
      },
      {
        id: 2,
        x: 75,
        y: 45,
        title: "Workflow Specification & Cost Estimator",
        description: "Detailed card showing workflow steps, required tools, token requirements, and expected runtime.",
        actionPrompt: "Review prerequisites (e.g. requires Instantly API key) before installing.",
        outputMeaning: "Ensures operator is aware of tool dependencies and compute footprint before activation.",
        badgeType: "data",
      },
      {
        id: 3,
        x: 75,
        y: 80,
        title: "Install & Activate Bundle Trigger",
        description: "One-click deployment that scaffolds the workflow into your workspace execution registry.",
        actionPrompt: "Click 'Install Workflow' to mount the recipe to your active Command Center schedule.",
        outputMeaning: "Creates database records and binds assigned agents to the workflow steps immediately.",
        badgeType: "action",
      },
    ],
    controls: [
      {
        name: "Install Workflow Button",
        type: "Button",
        purpose: "Installs the selected workflow bundle into the current workspace.",
        defaultState: "Enabled",
        permissions: "Operator",
      },
      {
        name: "Search Input",
        type: "Input",
        purpose: "Search workflow titles, descriptions, and tags.",
        defaultState: "Empty",
        permissions: "All Users",
      },
    ],
    outputs: [
      {
        field: "Installed Workflows",
        interpretation: "Number of active workflow recipes currently provisioned in this workspace.",
        normalRange: "3 - 15 workflows",
        alertThreshold: "N/A",
      },
    ],
    troubleshooting: [
      {
        symptom: "Workflow installation fails with 'Missing Required Integration'",
        cause: "The workflow requires an integration (e.g., ElevenLabs) that is not configured in Settings.",
        resolution: "Visit Settings > Integrations, configure the required API key, and retry the installation.",
        severity: "Medium",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "Marketplace.tsx",
        filePath: "client/src/pages/Marketplace.tsx",
        description: "Marketplace catalog view and package installation modal.",
      },
      {
        layer: "Operational SOP",
        component: "Workflow Registry",
        filePath: "docs/operations/workflow-registry.md",
        description: "Official registry of all certified autonomous workflow packages.",
      },
    ],
    relatedDocs: ["command-center", "agents", "founder-signal-system"],
  },
  {
    slug: "blog-manager",
    title: "Blog & Content Engine",
    category: "Growth & Pipeline",
    iconName: "BookOpen",
    summary: "Autonomous article drafting, SEO keyword optimization, publishing queues, and newsletter manager.",
    targetRoute: "/blog-manager",
    version: "v1.3.0",
    estimatedReadTime: "3 min read",
    overview: {
      purpose: "The Blog Manager orchestrates autonomous thought leadership, article generation, and newsletter distribution.",
      businessValue: "Maintains consistent market presence and SEO authority without requiring manual daily writing.",
      keyWorkflows: [
        "Generating targeted articles on Agentic AI, Microsoft 365, and founder bootstrapping",
        "Managing draft queues, revision approvals, and markdown formatting",
        "Publishing live articles and synchronizing newsletter digests to subscribers",
      ],
    },
    mockLayoutType: "blog-manager",
    hotspots: [
      {
        id: 1,
        x: 20,
        y: 22,
        title: "Article Queue & Publishing Status",
        description: "List of drafts, scheduled posts, and published articles with live status badges.",
        actionPrompt: "Click any article row to open the full rich markdown editor and preview.",
        outputMeaning: "🟢 Published = Live on public blog. 🟡 Draft = Pending review. 🔵 Scheduled = Awaiting publish time.",
        badgeType: "data",
      },
      {
        id: 2,
        x: 80,
        y: 22,
        title: "Generate New Article with AI",
        description: "Triggers the Content Strategist agent to draft a full-length, SEO-optimized article from a prompt topic.",
        actionPrompt: "Enter a topic (e.g. 'Why Founders Waste $5k/mo on SaaS Sprawl') and click Generate.",
        outputMeaning: "Agent researches, outlines, writes, formats markdown, and queues the article in < 60 seconds.",
        badgeType: "action",
      },
      {
        id: 3,
        x: 50,
        y: 65,
        title: "Live SEO & Readability Score Card",
        description: "Evaluates keyword density, reading level, heading structure, and meta tags.",
        actionPrompt: "Review recommendations to improve organic search ranking before publishing.",
        outputMeaning: "Calculates score from 0-100 based on modern search engine best practices.",
        badgeType: "control",
      },
    ],
    controls: [
      {
        name: "Generate Article Button",
        type: "Button",
        purpose: "Dispatches the Content Strategist agent to research and draft an article.",
        defaultState: "Enabled",
        permissions: "Operator",
      },
      {
        name: "Publish Now Button",
        type: "Button",
        purpose: "Instantly promotes a draft to the live public blog.",
        defaultState: "Disabled for already published items",
        permissions: "Admin Only",
      },
    ],
    outputs: [
      {
        field: "Total Published Articles",
        interpretation: "Total count of live public thought leadership posts.",
        normalRange: "5 - 100+ articles",
        alertThreshold: "N/A",
      },
      {
        field: "SEO Score",
        interpretation: "Algorithmic assessment of search engine optimization quality.",
        normalRange: "85 - 100",
        alertThreshold: "< 70",
      },
    ],
    troubleshooting: [
      {
        symptom: "Article generation times out or returns empty markdown",
        cause: "LLM token limit exceeded or topic prompt lacked sufficient structure.",
        resolution: "Provide a more focused topic prompt with target audience and key takeaways.",
        severity: "Low",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "BlogManager.tsx",
        filePath: "client/src/pages/BlogManager.tsx",
        description: "Blog queue management and article generation interface.",
      },
      {
        layer: "Backend Controller",
        component: "blog.ts",
        filePath: "server/controllers/blog.ts",
        description: "Handles article CRUD, slug generation, and database persistence.",
      },
    ],
    relatedDocs: ["command-center", "founder-signal-system", "marketplace"],
  },
  {
    slug: "billing",
    title: "Billing & Cloud Spend",
    category: "Infrastructure & System",
    iconName: "CreditCard",
    summary: "Monitor cloud infrastructure costs, API token consumption, compute resource spending, and bootstrap thresholds.",
    targetRoute: "/billing",
    version: "v1.1.0",
    estimatedReadTime: "3 min read",
    overview: {
      purpose: "Billing provides financial transparency over cloud infrastructure, Compute Engine VMs, Cloud Run containers, and LLM inference spend.",
      businessValue: "Enforces the 'Bootstrap Limit Threshold' to protect agency margins and eliminate runaway cloud spending.",
      keyWorkflows: [
        "Reviewing daily and monthly cloud run compute cost breakdowns",
        "Auditing LLM token costs per agent and workflow execution",
        "Configuring hard spending caps and anomaly alerts",
      ],
    },
    mockLayoutType: "billing",
    hotspots: [
      {
        id: 1,
        x: 25,
        y: 22,
        title: "Monthly Spend & Budget Meter",
        description: "Visual progress meter comparing current monthly spend against the target bootstrap cap ($25/mo).",
        actionPrompt: "Monitor this meter to ensure infrastructure remains lean and highly profitable.",
        outputMeaning: "🟢 < 70% of budget. 🟡 70-90% of budget. 🔴 > 90% triggers automated scale-down warnings.",
        badgeType: "status",
      },
      {
        id: 2,
        x: 75,
        y: 22,
        title: "Cost Breakdown by Resource Category",
        description: "Donut chart detailing costs: Google Cloud Run, Compute Engine VM, Gemini API, Instantly.",
        actionPrompt: "Click any segment to see which specific workflow or container generated the spend.",
        outputMeaning: "Breaks down exact dollar amounts for each infrastructure component.",
        badgeType: "data",
      },
      {
        id: 3,
        x: 50,
        y: 65,
        title: "Per-Workflow Unit Economics Table",
        description: "Granular table showing exact average cost per lead generated, cost per article, and cost per audit.",
        actionPrompt: "Sort by unit cost to identify opportunities for prompt optimization and caching.",
        outputMeaning: "Calculates cost per output (e.g. $0.002 per lead scored, $0.015 per article generated).",
        badgeType: "control",
      },
    ],
    controls: [
      {
        name: "Set Budget Threshold Input",
        type: "Input",
        purpose: "Configures the monthly dollar limit before automated alerts are dispatched.",
        defaultState: "$50.00",
        permissions: "Admin Only",
      },
      {
        name: "Download Invoice / Report Button",
        type: "Button",
        purpose: "Exports full financial cost breakdown CSV for accounting and M365 Finance Tracker.",
        defaultState: "Enabled",
        permissions: "Operator",
      },
    ],
    outputs: [
      {
        field: "Current Month Spend",
        interpretation: "Total expenses billed across all cloud providers this billing cycle.",
        normalRange: "$5.00 - $35.00",
        alertThreshold: "> $50.00",
      },
      {
        field: "Projected Month-End Spend",
        interpretation: "Extrapolated monthly bill based on trailing 7-day usage trends.",
        normalRange: "$10.00 - $40.00",
        alertThreshold: "> $60.00",
      },
    ],
    troubleshooting: [
      {
        symptom: "Unexpected spike in API token costs",
        cause: "An agent was executed in a loop with an overly large context window without prompt caching.",
        resolution: "Inspect recent logs in Auditing to identify the high-token workflow run and enable completion caching.",
        severity: "High",
      },
    ],
    architecture: [
      {
        layer: "Frontend Component",
        component: "Settings.tsx (Billing Section)",
        filePath: "client/src/pages/Settings.tsx",
        description: "Renders usage charts, budget meters, and invoice history.",
      },
      {
        layer: "Operational SOP",
        component: "Bootstrap Limit Threshold",
        filePath: "docs/operations/bootstrap-limit-threshold.md",
        description: "Canonical policy governing low-cost operating ceilings and cloud cost controls.",
      },
    ],
    relatedDocs: ["command-center", "settings", "auditing"],
  },
];
