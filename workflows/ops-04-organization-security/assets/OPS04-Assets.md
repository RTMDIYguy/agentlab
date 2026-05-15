# OPS04: Organization & Security Assets

## 1. Offboarding Security Checklist
*To be executed by Operations/IT immediately upon an employee or contractor's departure.*

**Employee/Contractor Name:** [Name]
**Last Day:** [Date]

**Immediate Action (Within 1 hour of departure):**
- [ ] Block access to primary email/Google Workspace account (Do not delete yet, just block/change password).
- [ ] Revoke access to password manager (e.g., 1Password, LastPass).
- [ ] Remove from internal communication tools (Slack, Discord, Teams).

**Secondary Action (Within 24 hours):**
- [ ] Remove access to CRM (HubSpot, Salesforce).
- [ ] Remove access to Project Management tools (ClickUp, Asana, Notion).
- [ ] Remove access to Financial systems/Expense platforms.
- [ ] Remove access to any client-specific shared folders or tools.
- [ ] Remove from Social Media management tools/native platforms.
- [ ] If applicable, remotely wipe and lock company-issued devices.

**Wrap-Up (Within 1 week):**
- [ ] Transfer ownership of critical Google Drive files to a manager.
- [ ] Set up email forwarding from their account to a manager.
- [ ] Reassign their tool licenses to save costs.

---

## 2. Basic Vendor Security Questionnaire
*Sent to new third-party software vendors or contractors who will handle confidential agency or client data.*

**Vendor Name:** [Vendor]
**Service Provided:** [Service]

1. **Data Storage:** Where is your data physically hosted? (e.g., AWS US-East)
2. **Encryption:** Is data encrypted at rest and in transit?
3. **Access:** Who at your company has access to our data, and how is that access audited?
4. **Compliance:** Are you compliant with GDPR, CCPA, SOC2, or other relevant regulations? (Please attach summary reports if applicable).
5. **Breach History:** Have you experienced a data breach in the last 24 months? If so, what remediation steps were taken?
6. **Sub-processors:** Do you share our data with any third-party sub-processors? (If yes, please list them).

---

## 3. Incident Response Log (Template)
*Maintained by the Operations Lead to track security incidents.*

| Incident ID | Date/Time | Incident Type | Description & Scope | Remediation Actions Taken | Status | Lessons Learned / SOP Updates |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| INC-001 | 2024-05-12 | Phishing | Employee clicked phishing link. No data exfiltrated. | Reset employee password, ran malware scan, enforced MFA. | Closed | Added mandatory quarterly phishing awareness training. |
| INC-002 | | | | | | |
