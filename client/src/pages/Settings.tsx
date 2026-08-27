import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
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

  // Local State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [billingData, setBillingData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    invoiceNotifications: true,
    renewalReminders: true,
    promotionalEmails: false,
  });
  
  // LLM Local State
  const [llmForm, setLlmForm] = useState({
    orchestratorName: "",
    defaultModel: "",
    orchestratorSystemPrompt: "",
  });

  // Ensure state matches fetched data
  if (workspaceSettings && llmForm.orchestratorName === "" && llmForm.defaultModel === "") {
    setLlmForm({
      orchestratorName: workspaceSettings.orchestratorName || "",
      defaultModel: workspaceSettings.defaultModel || "",
      orchestratorSystemPrompt: workspaceSettings.orchestratorSystemPrompt || "",
    });
  }

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

  const handleProfileSave = async () => toast.success("Profile updated");
  const handleBillingSave = async () => toast.success("Billing address updated");
  const handleNotificationSave = async () => toast.success("Notification preferences updated");

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
        <div className="container flex items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 border border-border">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "billing"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <MapPin className="w-4 h-4 inline-block mr-2" />
                  Billing Address
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "notifications"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Bell className="w-4 h-4 inline-block mr-2" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "security"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Lock className="w-4 h-4 inline-block mr-2" />
                  Security
                </button>
                
                <div className="pt-4 mt-4 border-t border-border">
                  <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Agency & Platform
                  </p>
                  <button
                    onClick={() => setActiveTab("llm")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "llm"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Settings2 className="w-4 h-4 inline-block mr-2" />
                    LLM Controls
                  </button>
                  <button
                    onClick={() => setActiveTab("secrets")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "secrets"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Key className="w-4 h-4 inline-block mr-2" />
                    Secrets Vault
                  </button>
                  <button
                    onClick={() => setActiveTab("integrations")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "integrations"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Plug className="w-4 h-4 inline-block mr-2" />
                    Integrations (MCP)
                  </button>
                </div>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Profile Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={e =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button onClick={handleProfileSave}>Save Changes</Button>
                </div>
              </Card>
            )}

            {/* Billing Address Tab */}
            {activeTab === "billing" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Billing Address
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={billingData.address}
                      onChange={e => setBillingData({ ...billingData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">City</label>
                      <input
                        type="text"
                        value={billingData.city}
                        onChange={e => setBillingData({ ...billingData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">State/Province</label>
                      <input
                        type="text"
                        value={billingData.state}
                        onChange={e => setBillingData({ ...billingData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <Button onClick={handleBillingSave}>Save Billing Address</Button>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="capitalize font-semibold text-foreground">
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={e =>
                          setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })
                        }
                        className="w-5 h-5"
                      />
                    </div>
                  ))}
                  <Button onClick={handleNotificationSave} className="mt-4">
                    Save Preferences
                  </Button>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-6 bg-muted/50 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Password</h3>
                    <Button variant="outline">Manage Account Settings</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* LLM Controls Tab */}
            {activeTab === "llm" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  LLM Controls (Orchestrator)
                </h2>
                <p className="text-muted-foreground mb-6">
                  Configure the core identity and reasoning parameters of your central AI Orchestrator.
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Orchestrator Name
                    </label>
                    <input
                      type="text"
                      value={llmForm.orchestratorName}
                      onChange={e =>
                        setLlmForm({ ...llmForm, orchestratorName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. HAL 9000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Default Model
                    </label>
                    <select
                      value={llmForm.defaultModel}
                      onChange={e =>
                        setLlmForm({ ...llmForm, defaultModel: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      System Prompt / Personality Context
                    </label>
                    <textarea
                      rows={5}
                      value={llmForm.orchestratorSystemPrompt}
                      onChange={e =>
                        setLlmForm({ ...llmForm, orchestratorSystemPrompt: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="You are an expert AI operations manager..."
                    />
                  </div>
                  <Button onClick={handleLlmSave} disabled={updateSettingsMut.isLoading}>
                    {updateSettingsMut.isLoading ? "Saving..." : "Save LLM Settings"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Secrets Vault Tab */}
            {activeTab === "secrets" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Secrets Vault
                </h2>
                <p className="text-muted-foreground mb-6">
                  Manage third-party API credentials. Keys are securely stored in Google Secret Manager and are never retrievable in plaintext.
                </p>
                
                <div className="space-y-6">
                  {/* List active secrets */}
                  {secrets && secrets.length > 0 ? (
                    <div className="border border-border rounded-lg divide-y divide-border">
                      {secrets.map(secret => (
                        <div key={secret.id} className="flex items-center justify-between p-4 bg-muted/20">
                          <div>
                            <p className="font-semibold capitalize">{secret.provider}</p>
                            <p className="text-sm font-mono text-muted-foreground">
                              {secret.maskedPreview} • v{secret.version}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                              {secret.status}
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteSecretMut.mutate({ id: secret.id })}
                              disabled={deleteSecretMut.isLoading}
                            >
                              Revoke
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground">No secrets configured yet.</p>
                    </div>
                  )}

                  {/* Add new secret */}
                  <div className="pt-6 border-t border-border mt-6">
                    <h3 className="text-lg font-semibold mb-4">Connect Provider</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Provider Name</label>
                        <select
                          value={newSecret.provider}
                          onChange={e => setNewSecret({ ...newSecret, provider: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-input"
                        >
                          <option value="">Select Provider...</option>
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic</option>
                          <option value="google">Google Vertex/AI</option>
                          <option value="hubspot">HubSpot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">API Key / Token</label>
                        <input
                          type="password"
                          value={newSecret.value}
                          onChange={e => setNewSecret({ ...newSecret, value: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-input"
                          placeholder="sk-..."
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddSecret} disabled={upsertSecretMut.isLoading}>
                      {upsertSecretMut.isLoading ? "Saving..." : "Save Securely to Vault"}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Integrations & Extensibility
                </h2>
                <p className="text-muted-foreground mb-6">
                  Manage third-party integrations and Model Context Protocol (MCP) connections to expand your Orchestrator's capabilities.
                </p>

                {/* List integrations */}
                {integrations && integrations.length > 0 ? (
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {integrations.map(integration => (
                      <div key={integration.id} className="p-4 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{integration.name}</p>
                          <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 uppercase tracking-wider rounded-full">
                            {integration.type}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground break-all">
                          {JSON.stringify(integration.config)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No integrations active.</p>
                  </div>
                )}
                
                {/* Coming soon note for MCP */}
                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-primary flex items-center gap-2">
                    <Plug className="w-4 h-4" /> 
                    MCP Ecosystem Preview
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    The Model Context Protocol (MCP) allows your agents to interface with external systems (like Notion, GitHub, and local file systems) standardized across models. The "Add MCP Server" UI is currently under development.
                  </p>
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
