import { PageLayout } from "@/components/PageLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Plus,
  Send,
  BarChart3,
  Users,
  Eye,
  Trash2,
  Edit,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface Campaign {
  id: number;
  title: string;
  subject: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdAt: Date;
}

export default function NewsletterManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"campaigns" | "subscribers" | "templates" | "stats">("campaigns");
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignContent, setCampaignContent] = useState("");

  // Queries
  const campaignsQuery = trpc.newsletter.getCampaigns.useQuery({
    limit: 100,
  });
  const subscribersQuery = trpc.newsletter.getSubscribers.useQuery({
    limit: 100,
  });
  const statsQuery = trpc.newsletter.getStats.useQuery();
  const templatesQuery = trpc.newsletter.getTemplates.useQuery({
    limit: 50,
  });

  // Mutations
  const createCampaignMutation = trpc.newsletter.createCampaign.useMutation();
  const sendCampaignMutation = trpc.newsletter.sendCampaign.useMutation();

  // Check authorization
  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You need admin privileges to access the newsletter manager.
          </p>
        </Card>
      </div>
    );
  }

  const handleCreateCampaign = async () => {
    if (!campaignTitle || !campaignSubject || !campaignContent) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createCampaignMutation.mutateAsync({
        title: campaignTitle,
        subject: campaignSubject,
        content: campaignContent,
      });

      toast.success("Campaign created successfully!");
      setCampaignTitle("");
      setCampaignSubject("");
      setCampaignContent("");
      setShowNewCampaign(false);
      campaignsQuery.refetch();
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const handleSendCampaign = async (campaignId: number) => {
    try {
      await sendCampaignMutation.mutateAsync({ id: campaignId });
      toast.success("Campaign sent successfully!");
      campaignsQuery.refetch();
    } catch (error) {
      toast.error("Failed to send campaign");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Newsletter Manager
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage newsletter campaigns, subscribers, and templates
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border">
        {["campaigns", "subscribers", "templates", "stats"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">Campaigns</h2>
            <Button
              onClick={() => setShowNewCampaign(!showNewCampaign)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {showNewCampaign && (
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Create New Campaign</h3>
              <input
                type="text"
                placeholder="Campaign Title"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Email Subject"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Campaign Content (HTML)"
                value={campaignContent}
                onChange={(e) => setCampaignContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create"}
                </Button>
                <Button
                  onClick={() => setShowNewCampaign(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {campaignsQuery.isLoading ? (
            <p className="text-muted-foreground">Loading campaigns...</p>
          ) : campaignsQuery.data?.length === 0 ? (
            <p className="text-muted-foreground">No campaigns yet</p>
          ) : (
            <div className="grid gap-4">
              {campaignsQuery.data?.map((campaign: any) => (
                <Card key={campaign.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.subject}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {campaign.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Recipients</p>
                      <p className="font-bold text-foreground">
                        {campaign.recipientCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sent</p>
                      <p className="font-bold text-foreground">
                        {campaign.sentCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Opens</p>
                      <p className="font-bold text-foreground">
                        {campaign.openCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clicks</p>
                      <p className="font-bold text-foreground">
                        {campaign.clickCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === "draft" && (
                      <Button
                        onClick={() => handleSendCampaign(campaign.id)}
                        disabled={sendCampaignMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Subscribers</h2>

          {subscribersQuery.isLoading ? (
            <p className="text-muted-foreground">Loading subscribers...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      Subscribed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribersQuery.data?.map((subscriber: any) => (
                    <tr key={subscriber.id} className="border-b border-border">
                      <td className="py-3 px-4">{subscriber.email}</td>
                      <td className="py-3 px-4">{subscriber.name || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Templates</h2>
          <p className="text-muted-foreground">
            {templatesQuery.data?.length || 0} templates available
          </p>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Statistics</h2>

          {statsQuery.isLoading ? (
            <p className="text-muted-foreground">Loading statistics...</p>
          ) : statsQuery.data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <h3 className="font-bold text-foreground">Subscribers</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground">
                      {statsQuery.data.subscribers.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unsubscribed</span>
                    <span className="font-bold text-foreground">
                      {statsQuery.data.subscribers.unsubscribed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bounced</span>
                    <span className="font-bold text-foreground">
                      {statsQuery.data.subscribers.bounced}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <h3 className="font-bold text-foreground">Campaigns</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sent</span>
                    <span className="font-bold text-foreground">
                      {statsQuery.data.campaigns.totalSent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Open Rate</span>
                    <span className="font-bold text-foreground">
                      {statsQuery.data.campaigns.avgOpenRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Clicks</span>
                    <span className="font-bold text-foreground">
                      {statsQuery.data.campaigns.totalClicks}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
