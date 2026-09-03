# AgentLab Python SDK

Official Python Client SDK for **AgentLab Agentic OS** — enabling programmatic orchestration of autonomous swarms, DAG workflows, browser-use agent sessions, and real-time SAIF telemetry streaming.

---

## Installation

```bash
pip install -e ./sdk/python
```

Or install directly from dependencies:

```bash
pip install requests urllib3 typing-extensions
```

---

## Quickstart

```python
from agentlab import AgentLabClient

# 1. Connect to local or production AgentLab instance
client = AgentLabClient(
    base_url="http://localhost:3000", # or https://agentlab-718497644379.us-central1.run.app
    api_key="<YOUR_WORKSPACE_TOKEN>"
)

# 2. Check System Telemetry & SAIF Compliance
stats = client.get_audit_stats()
print("24h Events:", stats["totalEvents24h"])
print("SAIF Compliance:", stats["saifComplianceRate"])

# 3. List & Control Swarm Agents
agents = client.list_agents()["agents"]
for agent in agents:
    print(f"{agent['name']} ({agent['status']}) - {agent['role']}")

# Pause or Resume an agent node
client.toggle_agent("alpha-node-01")

# 4. Trigger Autonomous DAG Workflow
run = client.trigger_workflow(
    workflow_id="mkt-01-lead-scraper",
    inputs={"target_industry": "Healthcare", "lead_count": 25}
)
print("Triggered Run ID:", run["runId"])

# 5. Mount a 7-Department Knowledge Playbook
client.mount_playbook("ops-playbook")
```

---

## Real-Time SSE Event Streaming

```python
# Stream live agent reasoning steps, tool calls, and model tokens
for event in client.stream_events(session_id="session_123", sanitize=True):
    print(f"[{event['event']}] -> {event['data']}")
```

---

## License

Proprietary © 2026 Uncle Robert Consulting LLC. All rights reserved.
