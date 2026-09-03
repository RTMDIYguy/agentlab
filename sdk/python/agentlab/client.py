"""
AgentLab Python SDK Client
Enables programmatic interaction with AgentLab Agentic OS, Swarms, Workflows, and Browser Sessions.
"""

import os
import json
import time
import requests
from typing import Dict, Any, List, Optional, Generator


class AgentLabClient:
    """Official Python Client for AgentLab Agentic OS."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
    ):
        """
        Initialize the AgentLab Client.
        
        :param base_url: Target AgentLab instance (e.g. http://localhost:3000 or production Cloud Run)
        :param api_key: JWT token or API key for workspace authentication
        :param timeout: HTTP request timeout in seconds
        """
        self.base_url = (
            base_url
            or os.getenv("AGENTLAB_BASE_URL")
            or "http://localhost:3000"
        ).rstrip("/")
        self.api_key = api_key or os.getenv("AGENTLAB_API_KEY") or os.getenv("AGI_API_KEY") or ""
        self.timeout = timeout
        self.session = requests.Session()

    def _headers(self, custom_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "AgentLab-Python-SDK/1.0.0",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        if custom_headers:
            headers.update(custom_headers)
        return headers

    def _req(self, method: str, path: str, **kwargs) -> Any:
        url = f"{self.base_url}{path}"
        headers = self._headers(kwargs.pop("headers", None))
        res = self.session.request(
            method=method,
            url=url,
            headers=headers,
            timeout=self.timeout,
            **kwargs
        )
        try:
            res.raise_for_status()
        except requests.HTTPError as e:
            try:
                error_body = res.json()
            except Exception:
                error_body = res.text
            raise RuntimeError(f"{method} {url} failed (HTTP {res.status_code}): {error_body}") from e

        if res.status_code == 204 or not res.content:
            return None
        return res.json()

    # ==========================================
    # 1. System Health & Models
    # ==========================================
    def health(self) -> Dict[str, Any]:
        """Check system health status."""
        try:
            return self._req("GET", "/health")
        except Exception:
            return self._req("GET", "/api/runs")

    def list_models(self) -> Dict[str, Any]:
        """List active foundational LLM backbones."""
        return self._req("GET", "/v1/models")

    # ==========================================
    # 2. Session Lifecycle (Recovered from Colab)
    # ==========================================
    def create_session(self, agent_name: str = "Alpha-Node-01") -> Dict[str, Any]:
        """Create a new autonomous agent session."""
        return self._req("POST", "/v1/sessions", json={"agent_name": agent_name})

    def list_sessions(self) -> List[Dict[str, Any]]:
        """List all active agent sessions."""
        return self._req("GET", "/v1/sessions")

    def get_session(self, session_id: str) -> Dict[str, Any]:
        """Get session details and metadata."""
        return self._req("GET", f"/v1/sessions/{session_id}")

    def delete_session(self, session_id: str) -> Dict[str, Any]:
        """Tear down and flush an agent session."""
        return self._req("DELETE", f"/v1/sessions/{session_id}")

    # ==========================================
    # 3. Agent Swarms & Nodes
    # ==========================================
    def list_agents(self) -> Dict[str, Any]:
        """List active swarm agents and telemetry counters."""
        return self._req("GET", "/api/agents")

    def toggle_agent(self, agent_id: str) -> Dict[str, Any]:
        """Pause or resume a swarm agent."""
        return self._req("POST", f"/api/agents/{agent_id}/toggle")

    def deploy_agent(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Deploy a new autonomous swarm agent node."""
        return self._req("POST", "/api/agents/deploy", json=payload)

    # ==========================================
    # 4. Workflows & Autonomic DAG Runs
    # ==========================================
    def list_workflows(self) -> Dict[str, Any]:
        """List all deployable DAG workflows."""
        return self._req("GET", "/api/workflows")

    def trigger_workflow(self, workflow_id: str, inputs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Trigger an autonomous DAG execution run."""
        return self._req("POST", f"/api/workflows/{workflow_id}/run", json={"inputs": inputs or {}})

    def list_runs(self) -> Dict[str, Any]:
        """List workflow execution run traces."""
        return self._req("GET", "/api/runs")

    def get_run(self, run_id: str) -> Dict[str, Any]:
        """Get detailed execution state for a specific run."""
        return self._req("GET", f"/api/runs/{run_id}")

    def approve_run(self, run_id: str) -> Dict[str, Any]:
        """Human-in-the-Loop operator approval."""
        return self._req("POST", f"/api/runs/{run_id}/approve")

    def reject_run(self, run_id: str, reason: str = "") -> Dict[str, Any]:
        """Human-in-the-Loop operator rejection."""
        return self._req("POST", f"/api/runs/{run_id}/reject", json={"reason": reason})

    # ==========================================
    # 5. Browser-Use & Interaction Controls
    # ==========================================
    def message_agent(self, session_id: str, message: str) -> Dict[str, Any]:
        """Send a natural language instruction to an agent."""
        return self._req("POST", f"/v1/sessions/{session_id}/message", json={"message": message})

    def navigate(self, session_id: str, url: str) -> Dict[str, Any]:
        """Direct the agent to browse a target URL."""
        return self._req("POST", f"/v1/sessions/{session_id}/navigate", json={"url": url})

    def screenshot(self, session_id: str) -> Dict[str, Any]:
        """Capture a live viewport screenshot."""
        return self._req("GET", f"/v1/sessions/{session_id}/screenshot")

    def pause(self, session_id: str) -> Dict[str, Any]:
        """Pause agent execution."""
        return self._req("POST", f"/v1/sessions/{session_id}/pause")

    def resume(self, session_id: str) -> Dict[str, Any]:
        """Resume agent execution."""
        return self._req("POST", f"/v1/sessions/{session_id}/resume")

    def cancel(self, session_id: str) -> Dict[str, Any]:
        """Halt agent execution."""
        return self._req("POST", f"/v1/sessions/{session_id}/cancel")

    # ==========================================
    # 6. Real-Time SSE Event Streaming
    # ==========================================
    def stream_events(
        self,
        session_id: str,
        sanitize: bool = True,
        include_history: bool = True,
        event_types: Optional[List[str]] = None,
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Stream real-time Server-Sent Events (SSE) from the agent session.
        Yields events with structure: {'id': ..., 'event': ..., 'data': {...}}
        """
        params = {
            "sanitize": str(bool(sanitize)).lower(),
            "include_history": str(bool(include_history)).lower(),
        }
        if event_types:
            params["event_types"] = ",".join(event_types)

        url = f"{self.base_url}/v1/sessions/{session_id}/events"
        headers = self._headers()

        with self.session.get(url, headers=headers, params=params, stream=True, timeout=self.timeout) as res:
            res.raise_for_status()
            current_event = {"id": None, "event": "message", "data": ""}

            for raw_line in res.iter_lines(decode_unicode=True):
                if raw_line is None:
                    continue
                line = raw_line.strip()
                if not line:
                    if current_event.get("data") != "":
                        try:
                            parsed_data = json.loads(current_event["data"])
                        except Exception:
                            parsed_data = current_event["data"]
                        yield {
                            "id": current_event.get("id"),
                            "event": current_event.get("event", "message"),
                            "data": parsed_data,
                        }
                    current_event = {"id": None, "event": "message", "data": ""}
                    continue

                if line.startswith("id:"):
                    current_event["id"] = line[3:].strip()
                elif line.startswith("event:"):
                    current_event["event"] = line[6:].strip()
                elif line.startswith("data:"):
                    data_val = line[5:].strip()
                    if current_event["data"]:
                        current_event["data"] += "\n" + data_val
                    else:
                        current_event["data"] = data_val

    # ==========================================
    # 7. System Auditing & SAIF Compliance
    # ==========================================
    def get_audit_stats(self) -> Dict[str, Any]:
        """Get real-time SAIF compliance and 24h event counters."""
        return self._req("GET", "/api/audit-logs/stats")

    def get_audit_logs(self) -> Dict[str, Any]:
        """Fetch model execution traces and policy check telemetry."""
        return self._req("GET", "/api/audit-logs")

    # ==========================================
    # 8. Ecosystem Marketplace & Playbooks
    # ==========================================
    def list_marketplace_items(self) -> Dict[str, Any]:
        """Fetch all 7-department playbooks, apps, and books."""
        return self._req("GET", "/api/marketplace/items")

    def mount_playbook(self, playbook_id: str) -> Dict[str, Any]:
        """Mount a knowledge playbook into the active workspace."""
        return self._req("POST", f"/api/marketplace/mount/{playbook_id}")

    def unmount_playbook(self, playbook_id: str) -> Dict[str, Any]:
        """Unmount a knowledge playbook from the workspace."""
        return self._req("POST", f"/api/marketplace/unmount/{playbook_id}")


class AgentLabSession:
    """Convenience context manager for scoped agent sessions."""

    def __init__(self, client: AgentLabClient, agent_name: str = "Alpha-Node-01"):
        self.client = client
        self.agent_name = agent_name
        self.session_id: Optional[str] = None

    def __enter__(self):
        res = self.client.create_session(self.agent_name)
        self.session_id = res.get("session_id") or res.get("id")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.session_id:
            try:
                self.client.delete_session(self.session_id)
            except Exception:
                pass
