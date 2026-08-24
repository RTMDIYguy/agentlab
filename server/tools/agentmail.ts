import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables if local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

/**
 * AgentMail Secure API Client
 * Facilitates direct agent-to-agent and outbound email communications using your agentmail.to credentials.
 */
export class AgentMailClient {
  apiKey: string;
  apiBaseUrl: string;

  constructor() {
    this.apiKey = process.env.AGENTMAIL_API_KEY || ''; // Master Key am_us_5ad6...
    this.apiBaseUrl = 'https://api.agentmail.to/v0'; // Canonical REST API V0 Endpoint
  }

  /**
   * Dispatches an outbound email through the AgentMail.to cloud relay
   * @param {string} fromInbox - Sender mailbox (e.g., 'urcagentcomms@agentmail.to')
   * @param {string} to - Recipient email (e.g. 'sean.zaher@cbre.com' or 'robert-4826@agentmail.to')
   * @param {string} subject - Email Subject
   * @param {string} body - Plain text or HTML email body
   */
  async sendEmail(fromInbox: string, to: string, subject: string, body: string) {
    if (!this.apiKey) {
      console.warn('⚠️ AGENTMAIL_API_KEY is not configured in .env.local. Writing email locally to Sent queue...');
      this.writeLocalBackup(to, subject, body, 'sent');
      return { success: false, reason: 'api_key_missing' };
    }

    const payload = {
      to: [to],
      subject: subject,
      body: body
    };

    try {
      console.log(`📡 Dispatching AgentMail from ${fromInbox} to ${to}...`);
      const response = await fetch(`${this.apiBaseUrl}/inboxes/${fromInbox}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ AgentMail successfully dispatched! MsgID: ${result.message_id || 'N/A'}`);
        this.writeLocalBackup(to, subject, body, 'sent');
        return { success: true, messageId: result.message_id };
      } else {
        const errorText = await response.text();
        throw new Error(`AgentMail API Error: ${response.status} - ${errorText}`);
      }
    } catch (err: any) {
      console.error('❌ Failed to dispatch AgentMail:', err.message);
      this.writeLocalBackup(to, subject, body, 'queued_error');
      return { success: false, error: err.message };
    }
  }

  /**
   * Helper to write a local copy of emails for zero-loss offline tracking
   */
  writeLocalBackup(to: string, subject: string, body: string, folder: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}_to_${to.replace(/[@.]/g, '_')}.md`;
    // Use a relative path so it doesn't break in Cloud Run
    const targetDir = path.resolve(process.cwd(), 'agentmail_backups', folder === 'sent' ? 'Sent' : 'Inbox');
    
    const content = `# Outbound AgentMail File Backup\n**To:** ${to}\n**Subject:** ${subject}\n**Date:** ${new Date().toLocaleString()}\n\n---\n\n${body}`;
    
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(targetDir, fileName), content, 'utf-8');
      console.log(`💾 Local markdown copy saved to ${targetDir}/${fileName}`);
    } catch (err) {
      console.error(`Failed to write local backup to ${targetDir}`, err);
    }
  }
}
