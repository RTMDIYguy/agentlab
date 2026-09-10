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
  DollarSign,
  Cpu,
  Brain,
  Sliders,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Phone,
  Server,
  Activity,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  ExternalLink,
  Code,
  Copy,
  Building,
  Archive,
  FolderDown,
  FolderUp,
  Boxes
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
    | "snapshots"
  >("llm");

  const utils = trpc.useContext();

  // Queries
  const { data: workspaceSettings } = trpc.settings.getWorkspaceSettings.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: secrets } = trpc.settings.getSecrets.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: dbIntegrations } = trpc.settings.getIntegrations.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutations
  const updateSettingsMut = trpc.settings.updateWorkspaceSettings.useMutation({
    onSuccess: () => {
      toast.success("Granular LLM & Ops Agent controls saved! 🧠");
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

  const upsertIntegrationMut = trpc.settings.upsertIntegration.useMutation({
    onSuccess: () => {
      toast.success("Integration saved & registered! 🔌");
      utils.settings.getIntegrations.invalidate();
      setShowAddMcpModal(false);
      setShowAddIntegrationModal(false);
      setNewMcpForm({ name: "", transport: "sse", endpoint: "", apiKey: "", capabilities: "tools,resources" });
      setNewIntegrationForm({ name: "", type: "webhook", endpoint: "", portalUrl: "", apiKey: "" });
    },
    onError: () => toast.error("Failed to save integration."),
  });

  const deleteIntegrationMut = trpc.settings.deleteIntegration.useMutation({
    onSuccess: () => {
      toast.success("Integration removed.");
      utils.settings.getIntegrations.invalidate();
    },
    onError: () => toast.error("Failed to remove integration."),
  });

  const testIntegrationMut = trpc.settings.testIntegration.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error(err.message || "Handshake failed. Check endpoint and credentials."),
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

  // Granular LLM & Ops Agent Extended Controls
  const [llmForm, setLlmForm] = useState(() => {
    const saved = localStorage.getItem("agentlab_llm_granular_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      orchestratorName: "AgentLab Ops Orchestrator",
      personaRole: "Chief Systems Architect & Autonomous Swarm Director",
      toneStyle: "servant_leadership", // 'servant_leadership' | 'technical_architect' | 'executive_operator' | 'action_only'
      activeSopBrain: "canonical_7_dept", // 'canonical_7_dept' | 'cre_expansion' | 'medspa_intake' | 'founder_signal'
      defaultModel: "gemini-2.5-flash",
      fallbackModel: "gemini-2.5-pro",
      temperature: 0.2,
      maxOutputTokens: 4096,
      topP: 0.9,
      antiPassivityMandate: true,
      chainOfThought: true,
      qualityFlywheelScoring: true,
      monthlyTokenBudgetCap: 100,
      autoPauseBudgetThreshold: 90,
      orchestratorSystemPrompt: "You are the central Ops Agent for Uncle Robert Consulting and AgentLab. Ground all decisions in servant leadership, responsible automation, and tangible execution without conversational excuses.",
    };
  });

  // Synchronize with database settings when loaded
  useEffect(() => {
    if (workspaceSettings) {
      setLlmForm((prev: any) => ({
        ...prev,
        orchestratorName: workspaceSettings.orchestratorName || prev.orchestratorName,
        defaultModel: workspaceSettings.defaultModel || prev.defaultModel,
        orchestratorSystemPrompt: workspaceSettings.orchestratorSystemPrompt || prev.orchestratorSystemPrompt,
      }));
    }
  }, [workspaceSettings]);

  // Secrets Local State
  const [newSecret, setNewSecret] = useState({ provider: "", value: "" });

  // MCP & Integrations Modals State
  const [showAddMcpModal, setShowAddMcpModal] = useState(false);
  const [showAddIntegrationModal, setShowAddIntegrationModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [newMcpForm, setNewMcpForm] = useState({
    name: "",
    transport: "sse",
    endpoint: "",
    apiKey: "",
    capabilities: "tools,resources",
  });

  const [newIntegrationForm, setNewIntegrationForm] = useState({
    name: "",
    type: "webhook",
    endpoint: "",
    portalUrl: "",
    apiKey: "",
  });

  // Helper to resolve live status and key preview from vault & DB
  const getSecretForProvider = (providerName: string) => {
    if (!secrets) return null;
    return secrets.find(
      (s: any) =>
        s.provider.toLowerCase().includes(providerName.toLowerCase()) ||
        providerName.toLowerCase().includes(s.provider.toLowerCase())
    );
  };

  const getIntegrationForName = (name: string) => {
    if (!dbIntegrations) return null;
    return dbIntegrations.find(
      (i: any) =>
        i.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(i.name.toLowerCase())
    );
  };

  const hubspotSec = getSecretForProvider("hubspot");
  const instantlySec = getSecretForProvider("instantly");
  const elevenlabsSec = getSecretForProvider("elevenlabs");
  const agentmailSec = getSecretForProvider("agentmail");

  // Core Operating System Built-in Integrations
  const canonicalIntegrations = [
    {
      id: "builtin-hubspot",
      name: "HubSpot CRM",
      type: "CRM & Sales (SAL-01)",
      description: "2-Way lead capture, deal pipeline sync, and contact engagement tracking.",
      status: hubspotSec?.status === "connected" || getIntegrationForName("hubspot")?.status === "active" ? "active" : "configured",
      protocol: "OAuth 2.0 / REST API",
      icon: Layers,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: hubspotSec ? `Connected (${hubspotSec.maskedPreview || "Token Active"}) • 2-way sync live` : "Connected via Developer Token • 9 KC leads active",
    },
    {
      id: "builtin-agentmail",
      name: "AgentMail Inbound & Direct SMTP",
      type: "Transactional Email & Dispatch",
      description: "Autonomous cold outreach and verified lead reply ingestion on agent-lab.tech.",
      status: agentmailSec?.status === "connected" || getIntegrationForName("agentmail")?.status === "active" ? "active" : "configured",
      protocol: "Direct REST / Webhook Ingest",
      icon: Mail,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      details: agentmailSec ? `Connected (${agentmailSec.maskedPreview || "am_us_..."}) active` : "am_us_5ad6... active on agent-lab.tech",
    },
    {
      id: "builtin-elevenlabs",
      name: "ElevenLabs / Pamela Telephony",
      type: "Conversational Voice Agent",
      description: "Inbound triage, diagnostic slot booking, and post-call transcript ingestion.",
      status: elevenlabsSec?.status === "connected" || getIntegrationForName("elevenlabs")?.status === "active" ? "active" : "configured",
      protocol: "REST & Webhook Handshake",
      icon: Phone,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      details: elevenlabsSec ? `Connected (${elevenlabsSec.maskedPreview || "sk_1e..."}) • Voice ID Pamela` : "sk_1e0a... • Voice ID JBFqn... (Pamela)",
    },
    {
      id: "builtin-ionos",
      name: "IONOS Cloud & Domains",
      type: "Official Infrastructure Partner",
      description: "Enterprise DNS, agent-lab.tech hosting, sovereign instances & SSL certs.",
      status: "active",
      protocol: "Certified Partner Network",
      icon: Globe,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      details: "Partner ID: agent.lab • agent-lab.tech active",
    },
    {
      id: "builtin-m365",
      name: "Microsoft 365 Operating Backbone",
      type: "File Storage & Financial Control",
      description: "OneDrive ledger synchronization, Outlook calendar dispatch & M365 reconciliation.",
      status: "active",
      protocol: "M365 Graph Bridge",
      icon: Server,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Uncle Robert Consulting LLC Tenant",
    },
    {
      id: "builtin-twilio",
      name: "Twilio Telephony & SIP",
      type: "Local Number Provisioning",
      description: "Local Las Vegas (702) number routing, SMS gate, and Pamela SIP forward.",
      status: "configured",
      protocol: "Twilio REST API v2010",
      icon: Phone,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      details: "AC4981b2... (Las Vegas 702 routing ready)",
    },
    {
      id: "builtin-n8n",
      name: "n8n Autonomous Workflow Engine",
      type: "Multi-Agent DAG Runner",
      description: "Scheduled daily CRON triggers, HubSpot sync loops, and background jobs.",
      status: "active",
      protocol: "n8n Webhook / MCP Server",
      icon: Zap,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      details: "MKT-02 Nurture & SDR-Agent Sync live",
    },
    {
      id: "builtin-instantly",
      name: "Instantly.ai Outbound Engine",
      type: "Cold Outbound & Warmup (SAL-01)",
      description: "High-deliverability cold email sequences, multi-inbox warmup, and AI reply classification.",
      status: instantlySec?.status === "connected" || getIntegrationForName("instantly")?.status === "active" ? "active" : "configured",
      protocol: "Instantly REST API v1 / Webhook",
      icon: Zap,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      details: instantlySec ? `Connected (${instantlySec.maskedPreview || "Key Active"}) • Outbound Live` : "YmYxNmQ3... (OwnableOS Master Key)",
    },
    {
      id: "builtin-pulse",
      name: "Pulse Social Scheduler",
      type: "Social Media Distribution",
      description: "Autonomous content queue scheduling and graphic distribution for LinkedIn.",
      status: "active",
      protocol: "AgentLab Social Dispatch API",
      icon: Sparkles,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
      details: "Content Queue batch scheduled (100% verified)",
    },
  ];

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
    localStorage.setItem("agentlab_llm_granular_settings", JSON.stringify(llmForm));
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

  const handleAddMcpSubmit = () => {
    if (!newMcpForm.name || !newMcpForm.endpoint) {
      toast.error("Please enter a name and endpoint URL / command.");
      return;
    }
    upsertIntegrationMut.mutate({
      type: "mcp",
      name: newMcpForm.name,
      config: {
        transport: newMcpForm.transport,
        endpoint: newMcpForm.endpoint,
        apiKey: newMcpForm.apiKey,
        capabilities: newMcpForm.capabilities.split(",").map(c => c.trim()),
      },
      status: "active",
    });
  };

  const handleAddIntegrationSubmit = () => {
    if (!newIntegrationForm.name || !newIntegrationForm.endpoint) {
      toast.error("Please provide both name and endpoint URL.");
      return;
    }
    upsertIntegrationMut.mutate({
      type: newIntegrationForm.type,
      name: newIntegrationForm.name,
      config: {
        endpoint: newIntegrationForm.endpoint,
        portalUrl: newIntegrationForm.portalUrl || newIntegrationForm.endpoint,
        apiKey: newIntegrationForm.apiKey,
      },
      status: "active",
    });
  };

  const runTestHandshake = (name: string, type: string) => {
    setTestingId(name);
    testIntegrationMut.mutate({
      name,
      type,
    }, {
      onSettled: () => setTestingId(null)
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur">
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
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span>Workspace Settings & Developer Vault</span>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  v1.2 Sovereign
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Fine-tune LLM cognitive parameters, secrets vault, and Model Context Protocol (MCP) integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-3 border border-border bg-card/60 backdrop-blur sticky top-24 space-y-4">
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
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <div className="flex-1 flex justify-between items-center">
                      <span>Ops Agent LLM Controls</span>
                      <Badge className="text-[9px] bg-purple-500/20 text-purple-300 border-none px-1.5 py-0">Granular</Badge>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("secrets")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                      activeTab === "secrets"
                        ? "bg-primary text-primary-foreground font-bold shadow"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Key className="w-4 h-4 text-amber-400" />
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
                    <Plug className="w-4 h-4 text-blue-400" />
                    <div className="flex-1 flex justify-between items-center">
                      <span>Integrations & MCP</span>
                      <Badge className="text-[9px] bg-blue-500/20 text-blue-300 border-none px-1.5 py-0">9 Nodes</Badge>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("snapshots")}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2.5 ${
                      activeTab === "snapshots"
                        ? "bg-primary text-primary-foreground font-bold shadow"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Archive className="w-4 h-4 text-emerald-400" />
                    <div className="flex-1 flex justify-between items-center">
                      <span>Snapshots & Franchises</span>
                      <Badge className="text-[9px] bg-emerald-500/20 text-emerald-300 border-none px-1.5 py-0">Clone</Badge>
                    </div>
                  </button>
                </div>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">

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
                      <label className="block font-semibold text-foreground mb-1.5">Email Address</label>
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
                      <label className="block font-semibold text-foreground mb-1.5">Company / Organization</label>
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
                    <label className="block font-semibold text-foreground mb-1.5">Default Timezone</label>
                    <input
                      type="text"
                      value={profileData.timezone}
                      onChange={e => setProfileData({ ...profileData, timezone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <Button size="sm" onClick={handleProfileSave} className="font-bold text-xs shadow">
                      Save Profile & Organization
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Billing & Invoice Settings</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage corporate legal entity, tax ID, payment method, and billing receipt recipients.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Legal Entity Name</label>
                      <input
                        type="text"
                        value={billingData.companyName}
                        onChange={e => setBillingData({ ...billingData, companyName: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Tax ID / EIN</label>
                      <input
                        type="text"
                        value={billingData.taxId}
                        onChange={e => setBillingData({ ...billingData, taxId: e.target.value })}
                        className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button size="sm" onClick={handleBillingSave} className="font-bold text-xs shadow">
                      Save Billing Information
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure automated alert triggers for DAG execution, budget limits, and security events.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background/50">
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
                      <p className="text-[11px] text-muted-foreground">Tenant boundaries enforced across all DAG executions with zero data leakage.</p>
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

            {/* Granular LLM Controls & Ops Agent Tab */}
            {activeTab === "llm" && (
              <div className="space-y-6">
                {/* 1. Identity & Tone */}
                <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-bold text-foreground">Ops Agent Master Brain & Cognitive Controls</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Define model hyper-parameters, persona tone, reasoning depth, and anti-passivity rules.
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px] uppercase font-bold self-start">
                      Granular Tuning
                    </Badge>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <label className="block font-semibold text-foreground mb-1.5">Persona & Executive Role</label>
                        <input
                          type="text"
                          value={llmForm.personaRole}
                          onChange={e => setLlmForm({ ...llmForm, personaRole: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Tone & Operating Code</label>
                        <select
                          value={llmForm.toneStyle}
                          onChange={e => setLlmForm({ ...llmForm, toneStyle: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        >
                          <option value="servant_leadership">Servant Leadership (Stewardship, Direct, Honest Build Logs)</option>
                          <option value="technical_architect">Technical Architect (High Precision, Zero Fluff, Strict Code)</option>
                          <option value="executive_operator">Executive Operator (Commercial ROI & Outcome Focus)</option>
                          <option value="action_only">Concise Action-Only (Deliverables & Diffs Only)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Active Domain Knowledge Brain</label>
                        <select
                          value={llmForm.activeSopBrain}
                          onChange={e => setLlmForm({ ...llmForm, activeSopBrain: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        >
                          <option value="canonical_7_dept">URC 7-Department Canonical Brain (MKT, SAL, OPS, FIN, FUL, CUL, AFT)</option>
                          <option value="cre_expansion">Commercial Real Estate & Industrial Expansion Radar (SAL-01)</option>
                          <option value="medspa_intake">Aesthetics & MedSpa Patient Acquisition System (SAL-01)</option>
                          <option value="founder_signal">Founder Signal Accelerator & Ownable Valuation Engine</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 2. Model Engine & Sampling Hyperparameters */}
                <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                  <div className="flex items-center gap-2 border-b border-border pb-4">
                    <Cpu className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Model Engines & Sampling Hyperparameters</h3>
                      <p className="text-xs text-muted-foreground">Control generation temperature, context limits, and automated fallback tiers.</p>
                    </div>
                  </div>

                  <div className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Primary Reasoning Model</label>
                        <select
                          value={llmForm.defaultModel}
                          onChange={e => setLlmForm({ ...llmForm, defaultModel: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono"
                        >
                          <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra-Fast 14ms - Recommended)</option>
                          <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Reasoning & DAG Orchestration)</option>
                          <option value="gpt-4o">OpenAI GPT-4o (Multimodal Advanced)</option>
                          <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Architecture & Diffs)</option>
                          <option value="llama-3.3-70b">Llama 3.3 70B (Groq Lightning Inference)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Automatic Fallback Model</label>
                        <select
                          value={llmForm.fallbackModel}
                          onChange={e => setLlmForm({ ...llmForm, fallbackModel: e.target.value })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono"
                        >
                          <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (High Availability)</option>
                          <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Cost-Optimized)</option>
                          <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                          <option value="none">None (Strict Fail-fast)</option>
                        </select>
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">Sampling Temperature ({llmForm.temperature})</span>
                        <span className="text-[11px] font-mono text-primary font-bold">
                          {llmForm.temperature < 0.3 ? "Deterministic / Strict SOP Adherence" : llmForm.temperature < 0.7 ? "Balanced Strategy & Execution" : "Creative Ideation"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={llmForm.temperature}
                        onChange={e => setLlmForm({ ...llmForm, temperature: parseFloat(e.target.value) })}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>0.0 (Zero Hallucination / Fact-Only)</span>
                        <span>0.5 (Balanced)</span>
                        <span>1.0 (Maximum Divergence)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Max Output Tokens</label>
                        <select
                          value={llmForm.maxOutputTokens}
                          onChange={e => setLlmForm({ ...llmForm, maxOutputTokens: parseInt(e.target.value) })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        >
                          <option value={2048}>2,048 Tokens (~1,500 words)</option>
                          <option value={4096}>4,096 Tokens (~3,000 words - Standard)</option>
                          <option value={8192}>8,192 Tokens (~6,000 words - Deep Documents)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1.5">Top-P Nucleus Sampling</label>
                        <input
                          type="number"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={llmForm.topP}
                          onChange={e => setLlmForm({ ...llmForm, topP: parseFloat(e.target.value) })}
                          className="w-full px-3.5 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 3. Cognitive Governance & Anti-Passivity Gate */}
                <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                  <div className="flex items-center gap-2 border-b border-border pb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Autonomous Execution Governance</h3>
                      <p className="text-xs text-muted-foreground">Enforce active delivery over conversational commentary and maintain strict SAIF isolation.</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background/50">
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <span>Anti-Passivity Mandate (Zero Refusal Gate)</span>
                          <Badge className="text-[9px] bg-emerald-500 text-black font-bold">Recommended</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Forces agents to produce tangible output files, tool calls, and verified diffs instead of acknowledgments or passive notes.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={llmForm.antiPassivityMandate}
                        onChange={e => setLlmForm({ ...llmForm, antiPassivityMandate: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background/50">
                      <div>
                        <div className="font-bold text-foreground">Multi-Step Chain-of-Thought DAG Planning</div>
                        <p className="text-[11px] text-muted-foreground">
                          Synthesizes structural dependencies and multi-department execution steps before calling runtime tools.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={llmForm.chainOfThought}
                        onChange={e => setLlmForm({ ...llmForm, chainOfThought: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background/50">
                      <div>
                        <div className="font-bold text-foreground">Quality Flywheel Auto-Evaluation & Scoring</div>
                        <p className="text-[11px] text-muted-foreground">
                          Automatically grades all workflow artifacts against Brand Voice, Actionable CTAs, and Factual Integrity rubrics.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={llmForm.qualityFlywheelScoring}
                        onChange={e => setLlmForm({ ...llmForm, qualityFlywheelScoring: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </Card>

                {/* 4. System Prompt Preamble */}
                <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-4">
                  <div>
                    <label className="block font-bold text-foreground text-sm mb-1">
                      System Prompt Preamble & Custom Guardrails
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Injected at the root of every swarm agent dispatch to establish proprietary company directives and safety rules.
                    </p>
                  </div>
                  <textarea
                    rows={4}
                    value={llmForm.orchestratorSystemPrompt}
                    onChange={e => setLlmForm({ ...llmForm, orchestratorSystemPrompt: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-xs font-mono leading-relaxed"
                  />
                  <div className="pt-2">
                    <Button size="sm" onClick={handleLlmSave} className="font-bold text-xs shadow gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Save LLM & Cognitive Controls
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Secrets Vault */}
            {activeTab === "secrets" && (
              <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Secrets Vault (API Keys)</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Store direct API keys to pay model providers directly at raw wholesale token cost.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">
                    AES-256 Encrypted
                  </Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Provider / Key Name</label>
                      <input
                        type="text"
                        placeholder="e.g. GOOGLE_GENERATIVE_AI_API_KEY, ELEVENLABS_API_KEY"
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
                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground block">Active Stored Secrets & Vault Keys:</span>
                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                          {secrets.length} Active in Vault
                        </Badge>
                      </div>
                      <div className="divide-y divide-border/60 border border-border/60 rounded-xl overflow-hidden">
                        {secrets.map((sec: any) => {
                          const isTesting = testingId === sec.provider;
                          return (
                            <div key={sec.id} className="p-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                  <Key className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-foreground text-xs uppercase">{sec.provider}</span>
                                    <Badge className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                                      {sec.status || "CONNECTED"}
                                    </Badge>
                                    <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground">
                                      v{sec.version || "1"}
                                    </Badge>
                                  </div>
                                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                    {sec.maskedPreview || "••••••••"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isTesting}
                                  onClick={() => runTestHandshake(sec.provider, "secret")}
                                  className="h-7 px-2.5 text-[10px] font-bold text-primary hover:bg-primary/10 gap-1"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin" : ""}`} />
                                  {isTesting ? "Testing..." : "Test"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 h-7 px-2"
                                  onClick={() => deleteSecretMut.mutate({ id: sec.id })}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Integrations & MCP Protocol Hub */}
            {activeTab === "integrations" && (
              <div className="space-y-6">
                {/* Header Action Card */}
                <Card className="p-6 sm:p-8 border border-border bg-card/80 backdrop-blur space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Plug className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold text-foreground">Integrations & Model Context Protocol (MCP)</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Manage pre-configured OS integrations, external webhooks, and Model Context Protocol servers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddIntegrationModal(true)}
                        className="text-xs font-bold gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Webhook
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowAddMcpModal(true)}
                        className="text-xs font-bold gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add MCP Server
                      </Button>
                    </div>
                  </div>

                  {/* Pre-Configured Core OS Integrations Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <span>Core Agency Operating System Integrations</span>
                        <Badge variant="secondary" className="text-[10px] font-mono">9 Mounted</Badge>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {canonicalIntegrations.map((item) => {
                        const Icon = item.icon;
                        const isTesting = testingId === item.name;

                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl border border-border/80 bg-background/50 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-foreground text-sm">{item.name}</div>
                                    <span className="text-[10px] text-primary font-mono">{item.type}</span>
                                  </div>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                                  {item.status.toUpperCase()}
                                </Badge>
                              </div>

                              <p className="text-muted-foreground text-[11px] leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                              <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
                                {item.details}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isTesting}
                                onClick={() => runTestHandshake(item.name, "core")}
                                className="h-7 px-2.5 text-[10px] font-bold text-primary hover:bg-primary/10 gap-1"
                              >
                                <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin" : ""}`} />
                                {isTesting ? "Testing..." : "Test Ping"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Registered Custom MCP Servers Section */}
                  <div className="pt-6 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                          <Code className="w-4 h-4 text-purple-400" />
                          <span>Custom Model Context Protocol (MCP) Servers</span>
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Provides standardized tool execution, context prompts, and external resource schemas to AI models.
                        </p>
                      </div>
                    </div>

                    {dbIntegrations && dbIntegrations.filter((i: any) => i.type === "mcp").length > 0 ? (
                      <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden bg-background/50">
                        {dbIntegrations
                          .filter((i: any) => i.type === "mcp")
                          .map((mcp: any) => (
                            <div key={mcp.id} className="p-4 flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground text-sm">{mcp.name}</span>
                                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                    {mcp.config?.transport || "SSE"}
                                  </Badge>
                                </div>
                                <div className="text-[11px] font-mono text-muted-foreground">
                                  {mcp.config?.endpoint}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => runTestHandshake(mcp.name, "mcp")}
                                >
                                  Test Ping
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 h-7"
                                  onClick={() => deleteIntegrationMut.mutate({ id: mcp.id })}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl border border-dashed border-border/80 text-center space-y-2 bg-muted/10">
                        <Plug className="w-6 h-6 text-muted-foreground mx-auto" />
                        <p className="text-xs font-semibold text-foreground">No Custom MCP Servers Mounted Yet</p>
                        <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                          Click <strong>"Add MCP Server"</strong> above to mount standard protocol tools like PostgreSQL MCP, BigQuery MCP, or Filesystem MCP.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Add Custom MCP Server Modal */}
                {showAddMcpModal && (
                  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg border border-border bg-card p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-purple-400" />
                          <h3 className="font-bold text-base text-foreground">Mount New MCP Server</h3>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setShowAddMcpModal(false)}>✕</Button>
                      </div>

                      {/* 1-Click Quick Preset Strip */}
                      <div className="space-y-1.5 bg-muted/20 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          ⚡ 1-Click Popular MCP Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: "PostgreSQL Database MCP", transport: "stdio", endpoint: "npx -y @modelcontextprotocol/server-postgres postgresql://user:pass@localhost:5432/agentlab", capabilities: "tools,resources", badge: "Postgres DB" },
                            { name: "Filesystem Workspace MCP", transport: "stdio", endpoint: 'npx -y @modelcontextprotocol/server-filesystem "e:\\OneDrive - Uncle Robert Consulting LLC\\Working Docs"', capabilities: "tools,resources", badge: "Local Files" },
                            { name: "GitHub Repo MCP", transport: "stdio", endpoint: "npx -y @modelcontextprotocol/server-github", capabilities: "tools,resources,prompts", badge: "GitHub" },
                            { name: "Puppeteer Web Scraping MCP", transport: "stdio", endpoint: "npx -y @modelcontextprotocol/server-puppeteer", capabilities: "tools,resources", badge: "Puppeteer Scraping" },
                            { name: "Google BigQuery MCP", transport: "stdio", endpoint: "npx -y @modelcontextprotocol/server-bigquery", capabilities: "tools,resources", badge: "BigQuery" },
                            { name: "Brave Web Search MCP", transport: "stdio", endpoint: "npx -y @modelcontextprotocol/server-brave-search", capabilities: "tools", badge: "Brave Search" },
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setNewMcpForm({
                                name: preset.name,
                                transport: preset.transport,
                                endpoint: preset.endpoint,
                                apiKey: "",
                                capabilities: preset.capabilities,
                              })}
                              className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>+</span> {preset.badge}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-foreground mb-1">Server Identifier Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Postgres-MCP, Filesystem-MCP, BigQuery-MCP"
                            value={newMcpForm.name}
                            onChange={e => setNewMcpForm({ ...newMcpForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Transport Protocol</label>
                            <select
                              value={newMcpForm.transport}
                              onChange={e => setNewMcpForm({ ...newMcpForm, transport: e.target.value })}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-xs"
                            >
                              <option value="stdio">stdio (Local Executable Command - Standard)</option>
                              <option value="sse">SSE (Server-Sent Events HTTP URL)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-foreground mb-1">Capabilities</label>
                            <input
                              type="text"
                              value={newMcpForm.capabilities}
                              onChange={e => setNewMcpForm({ ...newMcpForm, capabilities: e.target.value })}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-xs"
                              placeholder="tools,resources,prompts"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-foreground mb-1">
                            {newMcpForm.transport === "sse" ? "Server SSE Endpoint URL" : "Executable CLI Command"}
                          </label>
                          <input
                            type="text"
                            placeholder={newMcpForm.transport === "sse" ? "https://mcp.agent-lab.tech/sse" : "npx -y @modelcontextprotocol/server-postgres"}
                            value={newMcpForm.endpoint}
                            onChange={e => setNewMcpForm({ ...newMcpForm, endpoint: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-foreground mb-1">Authorization Token / API Key (Optional)</label>
                          <input
                            type="password"
                            placeholder="Bearer token or API secret (e.g., GITHUB_PERSONAL_ACCESS_TOKEN)"
                            value={newMcpForm.apiKey}
                            onChange={e => setNewMcpForm({ ...newMcpForm, apiKey: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-xs"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setShowAddMcpModal(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddMcpSubmit} className="font-bold text-xs">
                          Mount MCP Server
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Add Custom Integration / Webhook Modal */}
                {showAddIntegrationModal && (
                  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg border border-border bg-card p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <Plug className="w-5 h-5 text-blue-400" />
                          <h3 className="font-bold text-base text-foreground">Add Custom Webhook Integration</h3>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setShowAddIntegrationModal(false)}>✕</Button>
                      </div>

                      {/* 1-Click Popular Webhook Presets */}
                      <div className="space-y-1.5 bg-muted/20 p-2.5 rounded-lg border border-border/60">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          ⚡ 1-Click Popular Webhook Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: "n8n Autonomous Workflow Trigger", type: "webhook", endpoint: "http://localhost:5678/webhook/agentlab-intake", portalUrl: "http://localhost:5678", badge: "n8n Trigger" },
                            { name: "Slack Operations Channel Alert", type: "webhook", endpoint: "https://example.com/webhook/slack-alerts", portalUrl: "https://app.slack.com", badge: "Slack Alerts" },
                            { name: "Stripe Payment & Checkout Sync", type: "webhook", endpoint: "https://agent-lab.tech/api/stripe/webhook", portalUrl: "https://dashboard.stripe.com", badge: "Stripe Webhook" },
                            { name: "Mercury Bank Transaction Ingest", type: "webhook", endpoint: "https://api.mercury.com/v1/webhooks", portalUrl: "https://app.mercury.com", badge: "Mercury Bank" },
                            { name: "Make.com Lead Dispatch Webhook", type: "zapier", endpoint: "https://example.com/webhook/make-trigger", portalUrl: "https://make.com", badge: "Make / Zapier" },
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setNewIntegrationForm({
                                name: preset.name,
                                type: preset.type,
                                endpoint: preset.endpoint,
                                portalUrl: preset.portalUrl,
                                apiKey: "",
                              })}
                              className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>+</span> {preset.badge}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-foreground mb-1">Integration Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Slack Webhook, Mercury Bank Webhook, Stripe Sync"
                            value={newIntegrationForm.name}
                            onChange={e => setNewIntegrationForm({ ...newIntegrationForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-foreground mb-1">Integration Type</label>
                          <select
                            value={newIntegrationForm.type}
                            onChange={e => setNewIntegrationForm({ ...newIntegrationForm, type: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-xs"
                          >
                            <option value="webhook">Outbound/Inbound REST Webhook</option>
                            <option value="oauth">OAuth 2.0 Client</option>
                            <option value="zapier">Zapier / Make Trigger</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-foreground mb-1">Webhook / API Endpoint URL</label>
                          <input
                            type="text"
                            placeholder="https://hooks.slack.com/services/... or https://api.service.com"
                            value={newIntegrationForm.endpoint}
                            onChange={e => setNewIntegrationForm({ ...newIntegrationForm, endpoint: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-foreground mb-1">Dashboard 1-Click Launch URL (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. https://app.hubspot.com, https://slack.com, https://dashboard.stripe.com"
                            value={newIntegrationForm.portalUrl}
                            onChange={e => setNewIntegrationForm({ ...newIntegrationForm, portalUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input font-mono text-xs"
                          />
                          <p className="text-[10px] text-muted-foreground mt-0.5">Direct 1-click launch link rendered on your main Dashboard.</p>
                        </div>

                        <div>
                          <label className="block font-semibold text-foreground mb-1">Secret / Auth Token (Optional)</label>
                          <input
                            type="password"
                            placeholder="Optional secret token"
                            value={newIntegrationForm.apiKey}
                            onChange={e => setNewIntegrationForm({ ...newIntegrationForm, apiKey: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-xs"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setShowAddIntegrationModal(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddIntegrationSubmit} className="font-bold text-xs">
                          Save Integration
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Snapshots & Multi-Office Franchise Replication Tab */}
            {activeTab === "snapshots" && (
              <div className="space-y-6">
                <Card className="p-6 border border-border bg-card/80 backdrop-blur space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-foreground">Snapshots & Multi-Office Cloning</h2>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                          Proprietary Replication Engine
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Save complete operational configurations—including LLM hyperparameters, 9-node integrations, active swarms, and playbook DAGs—and replicate them seamlessly across duplicate offices, franchises, or branches.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          const office = prompt("Enter Office / Branch Name (e.g. 'St. Louis Advisory Office', 'Austin Franchise 01'):");
                          if (!office) return;
                          const name = prompt("Enter Snapshot Name:", `${office} Master Setup`) || `${office} Master Setup`;
                          const desc = prompt("Enter Brief Description:", `Full operational configuration for ${office}`) || "";

                          try {
                            const res = await fetch("/api/snapshots/save", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name,
                                officeName: office,
                                description: desc,
                                tags: ["branch", "custom", "replicated"],
                              }),
                            });
                            if (!res.ok) throw new Error("Failed to save snapshot");
                            const data = await res.json();
                            toast.success(data.message || "Snapshot saved successfully!");
                            window.location.reload();
                          } catch (err: any) {
                            toast.error(err.message || "Failed to save snapshot");
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Snapshot
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-background/60 border border-border flex items-start gap-2.5">
                      <Building className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-foreground">Franchise Multi-Tenant Ready</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Spin up identical agency stacks for new partners without rebuilding workflows.</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border flex items-start gap-2.5">
                      <Sliders className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-foreground">Hyperparameter Lock</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Freezes temperature, token caps, and zero-refusal safeguards across deployments.</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/60 border border-border flex items-start gap-2.5">
                      <Plug className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-foreground">1-Click Integration Portability</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Instantly maps Instantly.ai, ElevenLabs, and M365 configs to satellite locations.</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Pre-Seeded & Saved Snapshots Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Archive className="w-4 h-4 text-primary" />
                      <span>Available Workspace Snapshots</span>
                    </h3>
                    <span className="text-xs text-muted-foreground">2 Canonical Templates + User Snapshots</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Kansas City Flagship Master */}
                    <Card className="p-5 border border-primary/40 bg-card/90 backdrop-blur shadow-sm hover:border-primary/60 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">Kansas City HQ Master Configuration</span>
                            <Badge className="bg-primary/20 text-primary text-[10px] font-mono border-primary/30">v1.1.0 Flagship</Badge>
                            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Active Default</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-primary" />
                            <span>Uncle Robert Consulting — KC Flagship</span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                            Full production configuration with 10 autonomous workflows, Instantly.ai Batch 01 outbound engine, Pamela ElevenLabs telephony greeting, and M365 financial control layer.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const newOffice = prompt("Enter Target Franchise / Office Name to Clone into:", "St. Louis Branch Office");
                              if (!newOffice) return;
                              try {
                                const res = await fetch("/api/snapshots/snap_kc_hq_primary/clone", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ targetOfficeName: newOffice }),
                                });
                                const data = await res.json();
                                toast.success(data.message || `Cloned KC Flagship to ${newOffice}!`);
                              } catch (err) {
                                toast.error("Failed to clone snapshot.");
                              }
                            }}
                            className="text-xs font-semibold gap-1.5 border-border hover:border-primary"
                          >
                            <Copy className="w-3.5 h-3.5 text-primary" />
                            Clone to Branch
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast.success("Active workspace already running Kansas City HQ Master Configuration.");
                            }}
                            className="text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active in Workspace
                          </Button>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase font-mono font-bold text-foreground">Scope:</span>
                          <Badge variant="secondary" className="text-[10px]">9 Integrations</Badge>
                          <Badge variant="secondary" className="text-[10px]">5 Swarm Nodes</Badge>
                          <Badge variant="secondary" className="text-[10px]">4 Active DAGs</Badge>
                          <Badge variant="secondary" className="text-[10px]">Pamela Voice</Badge>
                          <Badge variant="secondary" className="text-[10px]">M365 Ledger</Badge>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">ID: snap_kc_hq_primary</span>
                      </div>
                    </Card>

                    {/* Franchise Starter Template */}
                    <Card className="p-5 border border-border bg-card/70 backdrop-blur shadow-sm hover:border-border/80 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">Franchise & Branch Office Zero-Waste Starter</span>
                            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">v1.0.0 Template</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Standard Partner Franchise Template</span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                            Lightweight zero-cost starter kit optimized for new advisory branches, boutique agencies, and satellite locations. Includes M365 sync and regional founder outreach DAG.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const newOffice = prompt("Enter Branch Office Name for this Clone:", "Denver Satellite Office");
                              if (!newOffice) return;
                              try {
                                const res = await fetch("/api/snapshots/snap_franchise_starter/clone", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ targetOfficeName: newOffice }),
                                });
                                const data = await res.json();
                                toast.success(data.message || `Cloned Franchise Starter to ${newOffice}!`);
                              } catch (err) {
                                toast.error("Failed to clone snapshot.");
                              }
                            }}
                            className="text-xs font-semibold gap-1.5 border-border hover:border-primary"
                          >
                            <Copy className="w-3.5 h-3.5 text-primary" />
                            Clone to Branch
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/snapshots/snap_franchise_starter/restore", {
                                  method: "POST",
                                });
                                const data = await res.json();
                                toast.success(data.message || "Applied Franchise Starter snapshot to workspace!");
                              } catch (err) {
                                toast.error("Failed to restore snapshot.");
                              }
                            }}
                            className="text-xs font-bold gap-1.5 border-border hover:bg-muted"
                          >
                            Apply to Workspace
                          </Button>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase font-mono font-bold text-foreground">Scope:</span>
                          <Badge variant="secondary" className="text-[10px]">Zero-Waste Stack</Badge>
                          <Badge variant="secondary" className="text-[10px]">2 Swarm Nodes</Badge>
                          <Badge variant="secondary" className="text-[10px]">2 Workflows</Badge>
                          <Badge variant="secondary" className="text-[10px]">M365 Default</Badge>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">ID: snap_franchise_starter</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
