# AgentLab

> The AI-native operating system for Uncle Robert Consulting & our partners.

AgentLab is an advanced AI workflow orchestration platform built to automate business operations. It provides a highly scalable, multi-tenant Command Center for managing automated AI agents, processing data pipelines, and executing scheduled outreach workflows.

![AgentLab Command Center](./client/public/command-center-preview.png)
*(Drop a screenshot of the Command Center at `client/public/command-center-preview.png`)*

---

## 🚀 How It Works (Domains & Delivery Models)

- **Official Marketing Website**: Hosted at [agent-lab.tech](https://agent-lab.tech) (Built via B12, hosted on Ionos) with companion domain [agent-lab.me](https://agent-lab.me) (Ionos).
- **Application Platform & SaaS Engine**: Multi-tenant operating system deployed on **Google Cloud Run** and **Vercel** edge.

We offer two distinct ways to access and deploy AgentLab based on your technical requirements and data sovereignty needs:

### 1. SaaS Cloud-Hosted (Recommended for most)
AgentLab is delivered primarily as a **Software as a Service (SaaS)** platform.
- **Delivery:** Immediate access upon registration / onboarding.
- **Process:** Create an account, browse the marketplace, subscribe to workflow playbooks, and execute them directly from our secure cloud infrastructure.
- **Benefits:** No servers to manage, automatic updates, and zero maintenance.


### 2. Enterprise Self-Hosted (For absolute control)
For enterprise clients who require absolute control or "Done-With-You" implementations, you can purchase a self-hosted license.
- **Delivery:** Upon purchase, you will receive an automated email containing a unique **License Key** and an invite to our **Private GitHub Repository** (or a secure download link for the deployment bundle).
- **Process:** Clone the repository, inject your license key into the `.env` file, and deploy using our provided Docker configurations.
- **Benefits:** Full source code access (excluding proprietary LLM backend heuristics), deploy on your own VPC, and absolute data privacy.

![App Store Marketplace](./client/public/app-store-preview.png)
*(Drop a screenshot of the Marketplace at `client/public/app-store-preview.png`)*

## 🏗️ Architecture

The architecture is built for extreme stability and scale:
- **Frontend**: React + Vite + TailwindCSS (Dark-mode, Glassmorphism UI)
- **Backend Engine**: Express + tRPC (Node.js) + n8n automation engine (Port 5678)
- **Database**: PostgreSQL (via Drizzle ORM) with strict Multi-Tenant Row Level Security.
- **AI Orchestration**: Deepmind / Gemini models powering the decision engine, strictly adhering to SAIF (Secure AI Framework) principles.

## 🔐 Security & Telemetry

AgentLab doesn't just run agents; it audits them.
- **Hard Budget Caps**: Every tenant has an auto-pause threshold. The Billing Engine checks limits before any LLM token is spent.
- **Audit Logging**: Every agent step, token count, and data mutation is securely logged to the `audit_logs` table for compliance review.
- **PII Redaction**: Built-in scrubbing ensures sensitive data never hits the AI models blindly.

## 🛠️ Development (For Contributors)

If you are an authorized collaborator accessing this repo, here is how to run AgentLab locally:

```bash
# Install dependencies
npm install

# Start the full stack (Frontend on Vite, Backend on Express)
npm run dev
```

## 👥 Authorized Repository Collaborators

In accordance with repository governance, only registered collaborators and certified partners are authorized to clone, download, and deploy from this source repository:

| Name | Organization & Role | Email / Access Identity | Role / Permissions | Status |
|---|---|---|---|---|
| **Robert T. McCarthy** | Uncle Robert Consulting LLC / Principal | `robert@unclerobertconsulting.com` | Owner & Admin | Active |
| **Sheena Burns** | Uncle Robert Consulting LLC / Co-Founder | `burnssheena335@gmail.com` | Co-Founder & Admin | Active |
| **Lorenzo** | NWN Advisory / Strategic Partner | `lorenzo@nwnadvisory.com` | Registered Collaborator | Active |
| **Chris** | Bootstrapper Capital / Community Director | `chris@bootstrappercapital.com` | Registered Collaborator | Active |
| **Mahmudul Haison** | AgentLab & Tactix / Remote Tech Specialist | `mahmudhaisan@gmail.com` | Technical Collaborator | Active |

---

*AgentLab, an Uncle Robert Consulting LLC project. All rights reserved.*
*Servant leadership, honest communication, and radical transparency.*

