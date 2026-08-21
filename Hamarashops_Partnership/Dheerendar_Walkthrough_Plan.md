# Presentation Playbook: Dheerendar's 15-Minute Walkthrough
**Date:** Friday, August 21, 2026 @ 2:00 PM CST (Central Standard Time)  
**Host:** Robert McCarthy, AgentLab  
**Objective:** Present the unified "Authority Engine" to Dheerendar and team, showing how **Pulse Social** captures/shapes content demand and **Founder Signal System** autonomously converts those signals into cold hard sales pipeline (HubSpot).

---

## 🛠️ Step 0: Pre-Meeting Technical Setup (10 Mins Before)
1. **Launch the Pulse Social App:**
   - Double-click [**`run_pulse_social.bat`**](./run_pulse_social.bat). This opens two terminals automatically, spinning up your FastAPI backend and launching your React 19 web interface at `http://localhost:3000`.
   - Log into the app with your test credentials (make sure a draft post is queued in your calendar view to show off!).
2. **Open your HubSpot Pipeline Board:**
   - Go to your HubSpot account. Load your Free Sales Pipeline board so the "New Lead" column is visible. 
   - *Note: Leave Sandra Hill's Deal Card there as proof of a real, successfully synced lead!*
3. **Open n8n Canvas:**
   - Go to `http://localhost:5678` and show the **SDR-Agent: Google Sheets to HubSpot Pipeline Sync** canvas. Dheerendar's technical team will love seeing the visual node routing!

---

## ⏱️ The 15-Minute Walkthrough Agenda

### 🎤 Phase 1: The Vision & Strategy (3 Minutes)
*   **The Slide/Talk Track:** *The Content-to-Pipeline Bottleneck.*
*   **What to say:**
    > "Dheerendar, thank you for jumping on. The biggest issue high-growth service operators face is not writing content—it’s **monetizing** it. Founders write LinkedIn posts, get likes and comments, but those never turn into real sales conversations. Why? Because manual lead entry and follow-up is an administrative bottleneck.
    >
    > At AgentLab, we built the **Founder Signal System (FSS)**. It is a thin-slice pipeline that turns public social signals into structured sales opportunities in under an hour. Here is how the complete ecosystem works from creation to closing."

---

### 💻 Phase 2: Live Demo — Pulse Social (7 Minutes)
*   **The Transition:** *Share your screen showing `http://localhost:3000` (Pulse Social).*
*   **Key Demonstration Features:**
    1. **Neo-Brutalist Landing Page & Calendar:** 
       - Show off the vibrant, bold neo-brutalist dashboard. Point out how easy it is for an operator to see planned campaigns and post dates in a single visual calendar.
    2. **AI Caption Generator (Powered by Claude Sonnet 4.5):**
       - Click "Create Post". Type a simple prompt: *"Why service companies in India need automated SDR pipelines."*
       - Click **Generate with AI**. Watch Claude Sonnet 4.5 materialize a high-converting, authority-building caption instantly. Highlight that this uses our unified, secure LLM service account integration.
    3. **The Simulator (Signal Capture):**
       - Click "Publish Now". Show how the app simulates publishing across LinkedIn, Facebook, and Instagram, and automatically generates realistic initial engagement (likes, comments).
       - Explain: *"This simulated or live engagement is where our public 'Founder Signal' is born."*

---

### ⚙️ Phase 3: Live Demo — n8n & HubSpot (3 Minutes)
*   **The Transition:** *Switch tabs to your CRM-lite Google Sheet and your n8n canvas (`http://localhost:5678`).*
*   **What to show:**
    1. **The CRM-lite Sheet (The Bridge):**
       - Show how your SDR (or our script) appends interested leads from LinkedIn into the Google Sheet. 
       - Point out: *"Our Google integrations run strictly via trusted **Service Accounts**, bypassing standard organization blocks."*
    2. **n8n Automation Canvas:**
       - Show your lean 6-node sync workflow. Emphasize how efficient and robust it is for speed and accuracy—no bloated routing, just a tight logic loop from trigger to CRM.
    3. **The Payoff (HubSpot Pipeline):**
       - Open HubSpot. Point to the **Sandra Hill** Deal card sitting under "New Lead" valued at **$12,500**.
       - Explain: *"Every hour, n8n scans the sheet, detects new signals, auto-creates/updates the Contact in HubSpot, spaws a high-value Deal card, and links them cleanly. No manual typing."*

---

### 🤝 Phase 4: Partner & Expansion Discussion (2 Minutes)
*   **The Pitch:** *White-Labeling & Indian Market Growth.*
*   **What to say:**
    > "Dheerendar, because Pulse and FSS are built on modular, lightweight stacks (FastAPI, React 19, MongoDB, and n8n), they can be white-labeled, customized, and integrated into existing enterprise stacks in under a week.
    >
    > We are looking for development and consulting partners to implement this unified Authority Engine for service companies and agency incubators in India. I'd love to hear how your team is currently managing outbound, and where you see the biggest fit."

---

## 💡 Quick Tips for Robert
- **Screen Layout Setup:** Since you have a single monitor, split your screen into four distinct quadrants before the call: (1) Pulse Social, (2) CRM-lite Google Sheet, (3) n8n Canvas, (4) HubSpot Pipeline. This lets you show data instantly moving from app to app without tab-switching.
- **Keep it moving:** 15 minutes is short. Don't go deep into the code—focus on the **result** (social post -> leads in sheet -> card in HubSpot).
- **Emphasize the Service Account:** Technical buyers love seeing robust corporate-compliant setups. Mentioning that your n8n and script run on strict service account JSON files rather than brittle user OAuth will be a major selling point.
- **The Follow-Up:** After the call, send them the PDF/markdown of the [**Founder Signal System README.md**](../README.md) to review.