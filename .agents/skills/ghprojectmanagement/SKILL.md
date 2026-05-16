---
name: ghprojectmanagement
description: GitHub Project management
---

github
project-management
issue-tracking
project-boards
sprint-planning
agile
swarm-coordination difficulty: intermediate prerequisites:
GitHub CLI (gh) installed and authenticated
ruv-swarm or claude-flow MCP server configured
Repository access permissions tools_required:
mcp__github__*
mcp__claude-flow__*
Bash
Read
Write
TodoWrite related_skills:
github-pr-workflow
github-release-management
sparc-orchestrator estimated_time: 30-45 minutes
GitHub Project Management
Overview
A comprehensive skill for managing GitHub projects using AI swarm coordination. This skill combines intelligent issue management, automated project board synchronization, and swarm-based coordination for efficient project delivery.

Quick Start
Basic Issue Creation with Swarm Coordination
```bash

Create a coordinated issue
gh issue create \ --title "Feature: Advanced Authentication" \ --body "Implement OAuth2 with social login..." \ --label "enhancement,swarm-ready"

Initialize swarm for issue
npx claude-flow@alpha hooks pre-task --description "Feature implementation" ```

Project Board Quick Setup
```bash

Get project ID
PROJECT_ID=$(gh project list --owner @me --format json | \ jq -r '.projects[0].id')

Initialize board sync
npx ruv-swarm github board-init \ --project-id "$PROJECT_ID" \ --sync-mode "bidirectional" ```

Core Capabilities
1. Issue Management & Triage
Automated Issue Creation
Issue-to-Swarm Conversion
Automated Issue Triage
Task Decomposition & Progress Tracking
Stale Issue Management
2. Project Board Automation
Board Initialization & Configuration
Task Synchronization
Smart Card Management
Custom Views & Dashboards
3. Sprint Planning & Tracking
Sprint Management
Progress Tracking & Analytics
Release Planning
4. Advanced Coordination
Multi-Board Synchronization
Issue Dependencies & Epic Management
Cross-Repository Coordination
Team Collaboration
Issue Templates
Integration Issue Template
```markdown

ðŸ”„ Integration Task
Overview
[Brief description of integration requirements]

Objectives
[ ] Component A integration
[ ] Component B validation
[ ] Testing and verification
[ ] Documentation updates
Integration Areas
Dependencies
[ ] Package.json updates
[ ] Version compatibility
[ ] Import statements
Functionality
[ ] Core feature integration
[ ] API compatibility
[ ] Performance validation
Testing
[ ] Unit tests
[ ] Integration tests
[ ] End-to-end validation
Swarm Coordination
Coordinator: Overall progress tracking
Analyst: Technical validation
Tester: Quality assurance
Documenter: Documentation updates
Progress Tracking
Updates will be posted automatically by swarm agents during implementation.

ðŸ¤– Generated with Claude Code ```

Bug Report Template
```markdown

ðŸ�› Bug Report
Problem Description
[Clear description of the issue]

Expected Behavior
[What should happen]

Actual Behavior
[What actually happens]

Reproduction Steps
[Step 1]
[Step 2]
[Step 3]
Environment
Package: [package name and version]
Node.js: [version]
OS: [operating system]
Investigation Plan
[ ] Root cause analysis
[ ] Fix implementation
[ ] Testing and validation
[ ] Regression testing
Swarm Assignment
Debugger: Issue investigation
Coder: Fix implementation
Tester: Validation and testing
ðŸ¤– Generated with Claude Code ```

Feature Request Template
```markdown

âœ¨ Feature Request
Feature Description
[Clear description of the proposed feature]

Use Cases
[Use case 1]
[Use case 2]
[Use case 3]
Acceptance Criteria
[ ] Criterion 1
[ ] Criterion 2
[ ] Criterion 3
Implementation Approach
Design
[ ] Architecture design
[ ] API design
[ ] UI/UX mockups
Development
[ ] Core implementation
[ ] Integration with existing features
[ ] Performance optimization
Testing
[ ] Unit tests
[ ] Integration tests
[ ] User acceptance testing
Swarm Coordination
Architect: Design and planning
Coder: Implementation
Tester: Quality assurance
Documenter: Documentation
ðŸ¤– Generated with Claude Code ```

Swarm Task Template
```markdown

name: Swarm Task description: Create a task for AI swarm processing body: - type: dropdown id: topology attributes: label: Swarm Topology options: - mesh - hierarchical - ring - star - type: input id: agents attributes: label: Required Agents placeholder: "coder, tester, analyst" - type: textarea id: tasks attributes: label: Task Breakdown placeholder: | 1. Task one description 2. Task two description ```

Workflow Integration
GitHub Actions for Issue Management
```yaml

.github/workflows/issue-swarm.yml
name: Issue Swarm Handler on: issues: types: [opened, labeled, commented]

jobs: swarm-process: runs-on: ubuntu-latest steps: - name: Process Issue uses: ruvnet/swarm-action@v1 with: command: | if [[ "${{ github.event.label.name }}" == "swarm-ready" ]]; then npx ruv-swarm github issue-init ${{ github.event.issue.number }} fi ```

Board Integration Workflow
```bash

Sync with project board
npx ruv-swarm github issue-board-sync \ --project "Development" \ --column-mapping '{ "To Do": "pending", "In Progress": "active", "Done": "completed" }' ```

Specialized Issue Strategies
Bug Investigation Swarm
```bash

Specialized bug handling
npx ruv-swarm github bug-swarm 456 \ --reproduce \ --isolate \ --fix \ --test ```

Feature Implementation Swarm
```bash

Feature implementation swarm
npx ruv-swarm github feature-swarm 456 \ --design \ --implement \ --document \ --demo ```

Technical Debt Refactoring
```bash

Refactoring swarm
npx ruv-swarm github debt-swarm 456 \ --analyze-impact \ --plan-migration \ --execute \ --validate ```

Best Practices
1. Swarm-Coordinated Issue Management
Always initialize swarm for complex issues
Assign specialized agents based on issue type
Use memory for progress coordination
Regular automated progress updates
2. Board Organization
Clear column definitions with consistent naming
Systematic labeling strategy across repositories
Regular board grooming and maintenance
Well-defined automation rules
3. Data Integrity
Bidirectional sync validation
Conflict resolution strategies
Comprehensive audit trails
Regular backups of project data
4. Team Adoption
Comprehensive training materials
Clear, documented workflows
Regular team reviews and retrospectives
Active feedback loops for improvement
5. Smart Labeling and Organization
Consistent labeling strategy across repositories
Priority-based issue sorting and assignment
Milestone integration for project coordination
Agent-type to label mapping
6. Automated Progress Tracking
Regular automated updates with swarm coordination
Progress metrics and completion tracking
Cross-issue dependency management
Real-time status synchronization
Troubleshooting
Sync Issues
```bash

Diagnose sync problems
npx ruv-swarm github board-diagnose \ --check "permissions,webhooks,rate-limits" \ --test-sync \ --show-conflicts ```

Performance Optimization
```bash

Optimize board performance
npx ruv-swarm github board-optimize \ --analyze-size \ --archive-completed \ --index-fields \ --cache-views ```

Data Recovery
```bash

Recover board data
npx ruv-swarm github board-recover \ --backup-id "2024-01-15" \ --restore-cards \ --preserve-current \ --merge-conflicts ```

Metrics & Analytics
Performance Metrics
Automatic tracking of: - Issue creation and resolution times - Agent productivity metrics - Project milestone progress - Cross-repository coordination efficiency - Sprint velocity and burndown - Cycle time and throughput - Work-in-progress limits

Reporting Features
Weekly progress summaries
Agent performance analytics
Project health metrics
Integration success rates
Team collaboration metrics
Quality and defect tracking
Issue Resolution Time
```bash

Analyze swarm performance
npx ruv-swarm github issue-metrics \ --issue 456 \ --metrics "time-to-close,agent-efficiency,subtask-completion" ```

Swarm Effectiveness
```bash

Generate effectiveness report
npx ruv-swarm github effectiveness \ --issues "closed:>2024-01-01" \ --compare "with-swarm,without-swarm" ```

Security & Permissions
Command Authorization: Validate user permissions before executing commands
Rate Limiting: Prevent spam and abuse of issue commands
Audit Logging: Track all swarm operations on issues and boards
Data Privacy: Respect private repository settings
Access Control: Proper GitHub permissions for board operations
Webhook Security: Secure webhook endpoints for real-time updates
Integration with Other Skills
Seamless Integration With:
github-pr-workflow - Link issues to pull requests automatically
github-release-management - Coordinate release issues and milestones
sparc-orchestrator - Complex project coordination workflows
sparc-tester - Automated testing workflows for issues
Complete Workflow Example
Full-Stack Feature Development
```bash

1. Create feature issue with swarm coordination
gh issue create \ --title "Feature: Real-time Collaboration" \ --body "$(cat <<EOF

Feature: Real-time Collaboration
Overview
Implement real-time collaboration features using WebSockets.

Objectives
[ ] WebSocket server setup
[ ] Client-side integration
[ ] Presence tracking
[ ] Conflict resolution
[ ] Testing and documentation
Swarm Coordination
This feature will use mesh topology for parallel development. EOF )" \ --label "enhancement,swarm-ready,high-priority"

2. Initialize swarm and decompose tasks
ISSUE_NUM=$(gh issue list --label "swarm-ready" --limit 1 --json number --jq '.[0].number') npx ruv-swarm github issue-init $ISSUE_NUM \ --topology mesh \ --auto-decompose \ --assign-agents "architect,coder,tester"

3. Add to project board
PROJECT_ID=$(gh project list --owner @me --format json | jq -r '.projects[0].id') gh project item-add $PROJECT_ID --owner @me \ --url "https://github.com/$GITHUB_REPOSITORY/issues/$ISSUE_NUM"

4. Set up automated tracking
npx ruv-swarm github board-sync \ --auto-move-cards \ --update-metadata

5. Monitor progress
npx ruv-swarm github issue-progress $ISSUE_NUM \ --auto-update-comments \ --notify-on-completion ```

Quick Reference Commands
```bash

Issue Management
gh issue create --title "..." --body "..." --label "..." npx ruv-swarm github issue-init npx ruv-swarm github issue-decompose npx ruv-swarm github triage --unlabeled

Project Boards
npx ruv-swarm github board-init --project-id npx ruv-swarm github board-sync npx ruv-swarm github board-analytics

Sprint Management
npx ruv-swarm github sprint-manage --sprint "Sprint X" npx ruv-swarm github milestone-track --milestone "vX.X"

Analytics
npx ruv-swarm github issue-metrics --issue npx ruv-swarm github board-kpis ```

Additional Resources
GitHub CLI Documentation
GitHub Projects Documentation
Swarm Coordination Guide
Claude Flow Documentation
Last Updated: 2025-10-19 Version: 2.0.0 Maintainer: Claude Code
