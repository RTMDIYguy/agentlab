import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import CustomerDetailsModal from "@/components/CustomerDetailsModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  LogOut,
  ChevronRight,
  Search,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch admin data
  const { data: analytics, isLoading: analyticsLoading } =
    trpc.admin.getAnalytics.useQuery();
  const { data: customers, isLoading: customersLoading } =
    trpc.admin.getAllCustomers.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to access this dashboard.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const subscriptionCounts = analytics?.subscriptionCounts as any || {};
  const subscriptionData = analytics
    ? [
        { name: "Active", value: subscriptionCounts.active || 0 },
        { name: "Canceled", value: subscriptionCounts.canceled || 0 },
        { name: "Past Due", value: subscriptionCounts.past_due || 0 },
      ]
    : [];

  const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

  // Filter customers based on search
  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customerId={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Subscription Analytics & Customer Management</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  ${analyticsLoading ? "..." : (analytics?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          {/* Monthly Recurring Revenue */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  ${analyticsLoading ? "..." : (analytics?.mrr || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Active Subscriptions */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-foreground">
                  {analyticsLoading ? "..." : subscriptionCounts.active || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Churn Rate */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Churn (30 days)</p>
                <p className="text-3xl font-bold text-foreground">
                  {analyticsLoading ? "..." : analytics?.churnRate || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subscription Status Pie Chart */}
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Subscription Status</h2>
            {analyticsLoading ? (
              <div className="h-80 bg-muted rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Revenue Metrics */}
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Revenue Breakdown</h2>
            {analyticsLoading ? (
              <div className="h-80 bg-muted rounded animate-pulse"></div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(analytics?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(analytics?.mrr || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Average Revenue Per User</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${
                      subscriptionCounts.active && analytics
                        ? Math.round(
                            (analytics.mrr / (subscriptionCounts.active || 1)) * 100
                          ) / 100
                        : 0
                    }
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Customers</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {customersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Current Period</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-foreground font-medium">
                        {customer.userId}
                      </td>
                      <td className="py-4 px-4 text-foreground capitalize">
                        {customer.plan}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            customer.status === "active"
                              ? "bg-green-100 text-green-800"
                              : customer.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {customer.currentPeriodStart && customer.currentPeriodEnd
                          ? `${new Date(customer.currentPeriodStart).toLocaleDateString()} - ${new Date(customer.currentPeriodEnd).toLocaleDateString()}`
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCustomer(customer.userId)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 bg-muted/50 rounded-lg border border-border text-center">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
