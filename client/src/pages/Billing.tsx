import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDate } from "date-fns";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Download,
  Settings,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";

const safeFormatDate = (dateVal: any, formatStr: string) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return formatDate(d, formatStr);
  } catch (e) {
    return "N/A";
  }
};

export default function Billing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch subscription and payment data
  const { data: subscription, isLoading: subscriptionLoading } =
    trpc.stripe.getCurrentSubscription.useQuery();
  const { data: payments, isLoading: paymentsLoading } =
    trpc.stripe.getPaymentHistory.useQuery();
  const { data: invoices, isLoading: invoicesLoading } =
    trpc.stripe.getInvoices.useQuery();

  const updatePlanMutation = trpc.stripe.updateSubscriptionPlan.useMutation();
  const cancelMutation = trpc.stripe.cancelSubscription.useMutation();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access billing.
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
    <DashboardLayout>
      <div className="border-b border-border bg-background">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status Card */}
            <Card className="p-8 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Current Plan
                  </h2>
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
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(subscription.status)}`}
                    >
                      {getStatusIcon(subscription.status)}
                      <span className="font-semibold capitalize">
                        {subscription.status}
                      </span>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Current Plan
                      </p>
                      <p className="text-xl font-bold text-foreground capitalize">
                        {subscription.plan}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Billing Cycle
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {subscription.currentPeriodStart &&
                        subscription.currentPeriodEnd
                          ? `${safeFormatDate(subscription.currentPeriodStart, "MMM d")} - ${safeFormatDate(subscription.currentPeriodEnd, "MMM d, yyyy")}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Renewal Info */}
                  {subscription.status === "active" &&
                    subscription.currentPeriodEnd && (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Next Renewal
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {safeFormatDate(
                            subscription.currentPeriodEnd,
                            "MMMM d, yyyy"
                          )}
                        </p>
                      </div>
                    )}

                  {/* Canceled Info */}
                  {subscription.status === "canceled" &&
                    subscription.canceledAt && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Canceled On
                        </p>
                        <p className="text-lg font-semibold text-red-800">
                          {safeFormatDate(subscription.canceledAt, "MMMM d, yyyy")}
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
                          Payment Methods
                        </Button>
                        <Button
                          variant="outline"
                          className="ml-auto text-red-600 hover:text-red-700"
                          disabled={cancelMutation.isPending}
                          onClick={async () => {
                            if (
                              confirm(
                                "Are you sure you want to cancel your subscription?"
                              )
                            ) {
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
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/marketplace")}>
                    View Plans
                  </Button>
                </div>
              )}
            </Card>

            {/* Payment History */}
            <Card className="p-8 border border-border shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Payment History
                </h2>
                <p className="text-sm text-muted-foreground">
                  View all your past transactions and invoices
                </p>
              </div>

              {paymentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-16 bg-muted rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground text-sm">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr
                          key={payment.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-foreground text-sm">
                            {safeFormatDate(payment.createdAt, "MMM d, yyyy")}
                          </td>
                          <td className="py-4 px-4 text-foreground font-semibold text-sm">
                            ${payment.amount} {payment.currency}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                payment.status === "succeeded"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {payment.status === "succeeded" && (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              {payment.status === "failed" && (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {payment.status === "processing" && (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              <span className="capitalize">
                                {payment.status}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {invoices && invoices.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  const invoice = invoices.find(
                                    inv =>
                                      Math.abs(
                                        inv.date.getTime() -
                                          new Date(payment.createdAt).getTime()
                                      ) < 86400000
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
                  <p className="text-muted-foreground text-sm">
                    No payment history yet
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
