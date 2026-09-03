import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Lock,
  MapPin,
  Bell,
  Settings2,
  Key,
  Plug,
  Building2,
  CreditCard,
  Download,
  CheckCircle2,
  Trash2,
  Plus,
  ShieldAlert,
  Globe,
  DollarSign
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "billing"
    | "notifications"
    | "security"
    | "llm"
    | "secrets"
    | "integrations"
  >("profile");

  const utils = trpc.useContext();

  // Queries
  const { data: workspaceSettings } = trpc.settings.getWorkspaceSettings.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: secrets } = trpc.settings.getSecrets.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: integrations } = trpc.settings.getIntegrations.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutations
  const updateSettingsMut = trpc.settings.updateWorkspaceSettings.useMutation({
    onSuccess: () => {
      toast.success("Workspace settings updated.");
      utils.settings.getWorkspaceSettings.invalidate();
    },
    onError: () => toast.error("Failed to update settings."),
  });

  const upsertSecretMut = trpc.settings.upsertSecret.useMutation({
    onSuccess: () => {
      toast.success("Secret saved successfully.");
      utils.settings.getSecrets.invalidate();
      setNewSecret({ provider: "", value: "" });
    },
    onError: () => toast.error("Failed to save secret."),
  });

  const deleteSecretMut = trpc.settings.deleteSecret.useMutation({
    onSuccess: () => {
      toast.success("Secret deleted.");
      utils.settings.getSecrets.invalidate();
    },
    onError: () => toast.error("Failed to delete secret."),
  });

  // Persistent Local State (Profile)
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("agentlab_profile_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: user?.name || "Robert McCarthy",
      email: user?.email || "robert@unclerobertconsulting.com",
      companyName: "Uncle Robert Consulting LLC",
      role: "Founder & Lead Architect",
      timezone: "America/Chicago (Central Time)",
    };
  });

  // Persistent Local State (Billing)
  const [billingData, setBillingData] = useState(() => {
    const saved = localStorage.getItem("agentlab_billing_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      companyName: "Uncle Robert Consulting LLC",
      taxId: "US-884920194",
      address: "100 Innovation Way, Suite 400",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "United States",
      currency: "USD ($)",
      paymentMethod: "Visa ending in 4242",
      billingEmail: "billing@unclerobertconsulting.com"
    };
  });

  // Persistent Local State (Notifications)
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem("agentlab_notification_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      emailNotifications: true,
      dagCompletionAlerts: true,
      invoiceReceipts: true,
      securityBreachAlerts: true,
      weeklyFounderDigest: true,
    };
  });
  
  // LLM Local State
  const [llmForm, setLlmForm] = useState({
    orchestratorName: "",
    defaultModel: "",
    orchestratorSystemPrompt: "",
  });

  // Ensure state matches fetched data
  useEffect(() => {
    if (workspaceSettings) {
      setLlmForm({
        orchestratorName: workspaceSettings.orchestratorName || "AgentLab Master Orchestrator",
        defaultModel: workspaceSettings.defaultModel || "gemini-2.5-flash",
        orchestratorSystemPrompt: workspaceSettings.orchestratorSystemPrompt || "",
      });
    }
  }, [workspaceSettings]);

  // Secrets Local State
  const [newSecret, setNewSecret] = useState({ provider: "", value: "" });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access settings.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleProfileSave = () => {
    localStorage.setItem("agentlab_profile_settings", JSON.stringify(profileData));
    toast.success("Profile & Company info saved successfully! 💾");
  };

  const handleBillingSave = () => {
    localStorage.setItem("agentlab_billing_settings", JSON.stringify(billingData));
    toast.success("Billing profile and invoice details saved! 💳");
  };

  const handleNotificationSave = () => {
    localStorage.setItem("agentlab_notification_settings", JSON.stringify(notificationSettings));
    toast.success("Notification preferences saved! 🔔");
  };

  const handleLlmSave = () => {
    updateSettingsMut.mutate({
      orchestratorName: llmForm.orchestratorName,
      defaultModel: llmForm.defaultModel,
      orchestratorSystemPrompt: llmForm.orchestratorSystemPrompt,
    });
  };

  const handleAddSecret = () => {
    if (!newSecret.provider || !newSecret.value) {
      toast.error("Please fill in both fields.");
      return;
    }
    upsertSecretMut.mutate(newSecret);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workspace Settings</h1>
              <p className="text-xs text-muted-foreground">Manage profile, company billing, API secrets, and governance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-3 border border-border bg-card/60 backdrop-blur sticky top-24">
              <nav className="space-y-1.5 text-xs">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                    activeTab === "profile"
                      ? "bg-primary text-primary-foreground font-bold shadow"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Profile & Organization
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                    activeTab === "billing"
                      ? "bg-primary text-primary-foreground font-bold shadow"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Billing & Invoices
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                    activeTab === "notifications"
                      ? "bg-primary text-primary-foreground font-bold shadow"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Notification Preferences
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                    activeTab === "security"
                      ? "bg-primary text-primary-foreground font-bold shadow"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Security & Auth
                </button>
                
                <div className="pt-3 mt-3 border-t border-border">
                  <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Engine & Developer Vault
                  </p>
                  <button
                    onClick={() => setActiveTab("llm")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                      activeTab === "llm"
                        ? "bg-primary text-primary-foreground font-bold shadow"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                    LLM Controls & Models
                  </button>
                  <button
                    onClick={() => setActiveTab("secrets")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                      activeTab === "secrets"
                        ? "bg-primary text-primary-foreground font-bold shadow"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    Secrets Vault (API Keys)
                  </button>
                  <button
                    onClick={() => setActiveTab("integrations")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                      activeTab === "integrations"
                        ? "bg-primary text-primary-foreground font-bold shadow"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Plug className="w-4 h-4" />
                    Integrations & MCP
                  </button>
                </div>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Profile & Organization Details</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your personal identity, company namespace, and primary business contacts.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Primary Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Company / Legal Entity</label>
                      <input
                        type="text"
                        value={profileData.companyName}
                        onChange={e => setProfileData({ ...profileData, companyName: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Role / Title</label>
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={e => setProfileData({ ...profileData, role: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Primary Timezone</label>
                    <input
                      type="text"
                      value={profileData.timezone}
                      onChange={e => setProfileData({ ...profileData, timezone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <Button size="sm" onClick={handleProfileSave} className="font-bold text-xs shadow">
                      Save Profile Changes
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Billing & Invoices Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Billing Profile & Legal Address</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tax information, payment methods, and invoice recipient address.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Legal Business Name</label>
                        <input
                          type="text"
                          value={billingData.companyName}
                          onChange={e => setBillingData({ ...billingData, companyName: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Tax / VAT ID (Optional)</label>
                        <input
                          type="text"
                          value={billingData.taxId}
                          onChange={e => setBillingData({ ...billingData, taxId: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Street Address</label>
                      <input
                        type="text"
                        value={billingData.address}
                        onChange={e => setBillingData({ ...billingData, address: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">City</label>
                        <input
                          type="text"
                          value={billingData.city}
                          onChange={e => setBillingData({ ...billingData, city: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">State / Province</label>
                        <input
                          type="text"
                          value={billingData.state}
                          onChange={e => setBillingData({ ...billingData, state: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block font-semibold text-foreground mb-1.5">ZIP / Postal Code</label>
                        <input
                          type="text"
                          value={billingData.zipCode}
                          onChange={e => setBillingData({ ...billingData, zipCode: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Country</label>
                        <input
                          type="text"
                          value={billingData.country}
                          onChange={e => setBillingData({ ...billingData, country: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Billing Email for Receipts</label>
                        <input
                          type="email"
                          value={billingData.billingEmail}
                          onChange={e => setBillingData({ ...billingData, billingEmail: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button size="sm" onClick={handleBillingSave} className="font-bold text-xs shadow">
                        Save Billing Address
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Invoices & Receipts History */}
                <Card className="p-6 border border-border bg-card/80 backdrop-blur space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Recent Invoices & Receipts</h3>
                      <p className="text-xs text-muted-foreground">Download receipts for CPA & tax reconciliation</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                      Stripe Verified
                    </Badge>
                  </div>

                  <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        <tr>
                          <td className="p-3 font-mono">2026-09-01</td>
                          <td className="p-3 font-medium">Ownable OS Pro Membership (Monthly)</td>
                          <td className="p-3 font-mono font-bold">$500.00</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">Paid</span>
                          </td>
                          <td className="p-3 text-right">
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toast.success("Downloading PDF invoice...")}>
                              <Download className="w-3.5 h-3.5" /> PDF
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Control which operational alerts and summary digests are sent to your team.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl bg-background/50 hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-bold text-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {key === "dagCompletionAlerts" ? "Alert when long-running autonomous swarms finish execution" : "Deliver notifications directly to your primary email"}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={e =>
                          setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })
                        }
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button size="sm" onClick={handleNotificationSave} className="font-bold text-xs shadow">
                      Save Notification Preferences
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Security & Session Controls</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multi-factor authentication, tenant boundary guardrails, and session governance.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">Session Isolation & SAIF Guardrails</div>
                      <p className="text-[11px] text-muted-foreground">Tenant boundaries enforced across all DAG executions.</p>
                    </div>
                    <Badge className="bg-emerald-500 text-black font-bold text-[10px]">Active & Enforced</Badge>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">Authentication Provider</div>
                      <p className="text-[11px] text-muted-foreground">Signed in as {user?.email}</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">Manage Auth</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* LLM Controls Tab */}
            {activeTab === "llm" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">LLM Controls & Master Orchestrator</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure the primary language models driving your autonomous DAGs.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Orchestrator Name</label>
                    <input
                      type="text"
                      value={llmForm.orchestratorName}
                      onChange={e => setLlmForm({ ...llmForm, orchestratorName: e.target.value })}
                      className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1.5">Default Model</label>
                    <select
                      value={llmForm.defaultModel}
                      onChange={e => setLlmForm({ ...llmForm, defaultModel: e.target.value })}
                      className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                    >
                      <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended - High Speed)</option>
                      <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Reasoning)</option>
                      <option value="gpt-4o">OpenAI GPT-4o</option>
                      <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <Button size="sm" onClick={handleLlmSave} className="font-bold text-xs shadow">
                      Save LLM Controls
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Secrets Vault */}
            {activeTab === "secrets" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Secrets Vault (API Keys)</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Store your direct API keys to pay model providers directly at raw wholesale token cost.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">
                    AES-256 Encrypted
                  </Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Provider Name</label>
                      <input
                        type="text"
                        placeholder="e.g. GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY"
                        value={newSecret.provider}
                        onChange={e => setNewSecret({ ...newSecret, provider: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Secret Value</label>
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={newSecret.value}
                        onChange={e => setNewSecret({ ...newSecret, value: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                  </div>

                  <Button size="sm" onClick={handleAddSecret} className="font-bold text-xs gap-1.5 shadow">
                    <Plus className="w-3.5 h-3.5" /> Save API Secret
                  </Button>

                  {secrets && secrets.length > 0 && (
                    <div className="pt-4 border-t border-border space-y-2">
                      <span className="font-bold text-foreground block">Active Stored Secrets:</span>
                      <div className="divide-y divide-border/60 border border-border/60 rounded-xl overflow-hidden">
                        {secrets.map((sec: any) => (
                          <div key={sec.id} className="p-3 bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-primary" />
                              <span className="font-mono font-bold text-foreground">{sec.provider}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 h-7"
                              onClick={() => deleteSecretMut.mutate({ id: sec.id })}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Integrations & Tool Protocols (MCP)</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Connect your workspace to external databases, Microsoft 365, Google Drive, and cloud execution environments.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">Microsoft 365 Bridge</span>
                      <Badge className="bg-emerald-500 text-black text-[10px]">Connected</Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">Primary operating backbone for files, email, and finance logs.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">Google Drive Sync</span>
                      <Badge className="bg-emerald-500 text-black text-[10px]">Active</Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">Automatic mirroring of client SOPs and output deliverables.</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
