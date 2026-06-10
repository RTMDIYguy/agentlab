import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDate } from "date-fns";
import { CheckCircle2, AlertCircle, Clock, CreditCard, LogOut, Download, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Fetch subscription and payment data
  const { data: subscription, isLoading: subscriptionLoading } =
    trpc.stripe.getCurrentSubscription.useQuery();
  const { data: payments, isLoading: paymentsLoading } =
    trpc.stripe.getPaymentHistory.useQuery();
  const { data: invoices, isLoading: invoicesLoading } =
    trpc.stripe.getInvoices.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation();
  const updatePlanMutation = trpc.stripe.updateSubscriptionPlan.useMutation();
  const cancelMutation = trpc.stripe.cancelSubscription.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access the dashboard.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-5 h-5" />;
      case "past_due":
        return <AlertCircle className="w-5 h-5" />;
      case "canceled":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <PageLayout>
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status Card */}
            <Card className="p-8 border border-border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Subscription Status
                  </h2>
                  <p className="text-muted-foreground">
                    Manage your subscription and billing information
                  </p>
                </div>
              </div>

              {subscriptionLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              ) : subscription ? (
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(subscription.status)}`}>
                      {getStatusIcon(subscription.status)}
                      <span className="font-semibold capitalize">{subscription.status}</span>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                      <p className="text-xl font-bold text-foreground capitalize">
                        {subscription.plan}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Billing Cycle</p>
                      <p className="text-xl font-bold text-foreground">
                        {subscription.currentPeriodStart && subscription.currentPeriodEnd
                          ? `${formatDate(subscription.currentPeriodStart, "MMM d")} - ${formatDate(subscription.currentPeriodEnd, "MMM d, yyyy")}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Renewal Info */}
                  {subscription.status === "active" && subscription.currentPeriodEnd && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Next Renewal</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatDate(subscription.currentPeriodEnd, "MMMM d, yyyy")}
                      </p>
                    </div>
                  )}

                  {/* Canceled Info */}
                  {subscription.status === "canceled" && subscription.canceledAt && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Canceled On</p>
                      <p className="text-lg font-semibold text-red-800">
                        {formatDate(subscription.canceledAt, "MMMM d, yyyy")}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    {subscription.status === "active" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/dashboard/upgrade")}
                        >
                          Upgrade Plan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/dashboard/settings")}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                        <Button
                          variant="outline"
                          className="ml-auto text-red-600 hover:text-red-700"
                          disabled={cancelMutation.isPending}
                          onClick={async () => {
                            if (confirm("Are you sure you want to cancel your subscription?")) {
                              try {
                                await cancelMutation.mutateAsync();
                                toast.success("Subscription canceled");
                              } catch (error) {
                                toast.error("Failed to cancel subscription");
                              }
                            }
                          }}
                        >
                          Cancel Subscription
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-muted/50 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-4">
                    You don't have an active subscription yet.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    View Plans
                  </Button>
                </div>
              )}
            </Card>

            {/* Payment History */}
            <Card className="p-8 border border-border">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment History</h2>
                <p className="text-muted-foreground">
                  View all your past transactions and invoices
                </p>
              </div>

              {paymentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4 text-foreground">
                            {formatDate(payment.createdAt, "MMM d, yyyy")}
                          </td>
                          <td className="py-4 px-4 text-foreground font-semibold">
                            ${payment.amount} {payment.currency}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                payment.status === "succeeded"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {payment.status === "succeeded" && (
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                              )}
                              {payment.status === "failed" && (
                                <AlertCircle className="w-4 h-4 mr-1" />
                              )}
                              {payment.status === "processing" && (
                                <Clock className="w-4 h-4 mr-1" />
                              )}
                              <span className="capitalize">{payment.status}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground text-sm">
                            {payment.description || "Subscription payment"}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {invoices && invoices.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  const invoice = invoices.find((inv) =>
                                    Math.abs(inv.date.getTime() - new Date(payment.createdAt).getTime()) < 86400000
                                  );
                                  if (invoice && invoice.pdfUrl) {
                                    window.open(invoice.pdfUrl, "_blank");
                                  }
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-muted/50 rounded-lg border border-border text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No payment history yet</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info Card */}
            <Card className="p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-semibold text-foreground">{user.name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-semibold text-foreground break-all">{user.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <p className="font-semibold text-foreground">
                    {formatDate(user.createdAt, "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" disabled>
                  Edit Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  Billing Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  Download Invoices
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  Support
                </Button>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-6 border border-border bg-primary/5">
              <h3 className="text-lg font-bold text-foreground mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check our documentation or contact our support team for assistance.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
