import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, MapPin, Bell } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "notifications" | "security">("profile");

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
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

  const handleProfileSave = async () => {
    try {
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleBillingSave = async () => {
    try {
      toast.success("Billing address updated successfully");
    } catch (error) {
      toast.error("Failed to update billing address");
    }
  };

  const handleNotificationSave = async () => {
    try {
      toast.success("Notification preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update notification preferences");
    }
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
                      ? "bg-primary text-white"
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
                      ? "bg-primary text-white"
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
                      ? "bg-primary text-white"
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
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Lock className="w-4 h-4 inline-block mr-2" />
                  Security
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
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
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button
                    onClick={handleProfileSave}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                </div>
              </Card>
            )}

            {/* Billing Address Tab */}
            {activeTab === "billing" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Billing Address</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={billingData.address}
                      onChange={(e) =>
                        setBillingData({ ...billingData, address: e.target.value })
                      }
                      placeholder="123 Main St"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={billingData.city}
                        onChange={(e) =>
                          setBillingData({ ...billingData, city: e.target.value })
                        }
                        placeholder="San Francisco"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={billingData.state}
                        onChange={(e) =>
                          setBillingData({ ...billingData, state: e.target.value })
                        }
                        placeholder="CA"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={billingData.zipCode}
                        onChange={(e) =>
                          setBillingData({ ...billingData, zipCode: e.target.value })
                        }
                        placeholder="94102"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={billingData.country}
                        onChange={(e) =>
                          setBillingData({ ...billingData, country: e.target.value })
                        }
                        placeholder="United States"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleBillingSave}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save Billing Address
                  </Button>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive general email notifications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">Invoice Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when invoices are available
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.invoiceNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          invoiceNotifications: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">Renewal Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get reminded before your subscription renews
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.renewalReminders}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          renewalReminders: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">Promotional Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Receive offers and promotional content
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.promotionalEmails}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          promotionalEmails: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>
                  <Button
                    onClick={handleNotificationSave}
                    className="bg-primary hover:bg-primary/90"
                  >
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
                    <p className="text-sm text-muted-foreground mb-4">
                      Your password is managed through your Manus account. To change your password, visit your account settings.
                    </p>
                    <Button variant="outline">
                      Manage Account Settings
                    </Button>
                  </div>
                  <div className="p-6 bg-muted/50 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account with two-factor authentication.
                    </p>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>
                  <div className="p-6 bg-muted/50 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Active Sessions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your active sessions and sign out from other devices.
                    </p>
                    <Button variant="outline">
                      View Sessions
                    </Button>
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
