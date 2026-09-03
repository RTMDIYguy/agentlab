"""
AgentLab Python SDK - Quickstart Example
Demonstrates connecting to AgentLab OS, checking telemetry, triggering DAG workflows, and managing agent swarms.
"""

import sys
import os

# Set UTF-8 stdout encoding for cross-platform compatibility
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

# Add parent directory to path for local development
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agentlab import AgentLabClient, AgentLabSession

def main():
    print("=========================================")
    print("  AgentLab Python SDK - Quickstart Demo  ")
    print("=========================================")

    # 1. Initialize Client
    client = AgentLabClient(base_url="http://localhost:3000")
    print(f"\n[1] Connected to AgentLab runtime at: {client.base_url}")

    # 2. Check System Telemetry & SAIF Stats
    try:
        stats = client.get_audit_stats()
        print(f"    * 24h Telemetry Events : {stats.get('totalEvents24h')}")
        print(f"    * SAIF Compliance Rate : {stats.get('saifComplianceRate')}")
        print(f"    * Pending Reviews      : {stats.get('pendingReviews')}")
    except Exception as e:
        print(f"    * Telemetry check skipped: {e}")

    # 3. List Swarm Agents
    try:
        agents_data = client.list_agents()
        agents = agents_data.get("agents", [])
        print(f"\n[2] Active Swarm Agents ({len(agents)} nodes):")
        for agent in agents[:4]:
            print(f"    * {agent.get('name')} [{agent.get('status')}] - {agent.get('role')}")
    except Exception as e:
        print(f"    * Agent listing: {e}")

    # 4. List Marketplace Playbooks
    try:
        marketplace = client.list_marketplace_items()
        playbooks = marketplace.get("playbooks", [])
        print(f"\n[3] 7-Department Knowledge Playbooks ({len(playbooks)} total):")
        for pb in playbooks[:3]:
            print(f"    * {pb.get('name')} - {pb.get('price')} (Mounted: {pb.get('isMounted')})")
    except Exception as e:
        print(f"    * Marketplace listing: {e}")

    # 5. Autonomous Session Example
    print("\n[4] Autonomous Swarm Orchestration...")
    print("    * AgentLab Client initialized and ready for programmatic workflow execution.")

    print("\n[OK] Quickstart completed successfully.")

if __name__ == "__main__":
    main()
