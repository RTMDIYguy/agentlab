import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { X, AlertCircle } from "lucide-react";

interface CustomerDetailsModalProps {
  customerId: number;
  onClose: () => void;
}

export default function CustomerDetailsModal({
  customerId,
  onClose,
}: CustomerDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<"active" | "canceled" | "past_due" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: customer, isLoading } = trpc.admin.getCustomerDetails.useQuery({
    userId: customerId,
  });

  const updateStatusMutation = trpc.admin.updateCustomerStatus.useMutation({
    onSuccess: () => {
      toast.success("Customer status updated successfully");
      setShowConfirm(false);
      setSelectedStatus(null);
    },
    onError: () => {
      toast.error("Failed to update customer status");
    },
  });

  const handleStatusChange = (newStatus: "active" | "canceled" | "past_due") => {
    setSelectedStatus(newStatus);
    setShowConfirm(true);
  };

  const confirmStatusChange = async () => {
    if (selectedStatus) {
      await updateStatusMutation.mutateAsync({
        userId: customerId,
        newStatus: selectedStatus,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : customer ? (
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">User ID</p>
              <p className="text-lg font-semibold text-foreground">{customer.userId}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Plan</p>
              <p className="text-lg font-semibold text-foreground capitalize">
                {customer.plan}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Status</p>
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
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Stripe Subscription ID</p>
              <p className="text-sm font-mono text-foreground break-all">
                {customer.stripeSubscriptionId || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Period</p>
              <p className="text-sm text-foreground">
                {customer.currentPeriodStart && customer.currentPeriodEnd
                  ? `${new Date(customer.currentPeriodStart).toLocaleDateString()} - ${new Date(customer.currentPeriodEnd).toLocaleDateString()}`
                  : "N/A"}
              </p>
            </div>

            {/* Status Change Actions */}
            {!showConfirm ? (
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">Change Status</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={customer.status === "active" ? "default" : "outline"}
                    onClick={() => handleStatusChange("active")}
                    disabled={customer.status === "active"}
                  >
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant={customer.status === "past_due" ? "default" : "outline"}
                    onClick={() => handleStatusChange("past_due")}
                    disabled={customer.status === "past_due"}
                  >
                    Past Due
                  </Button>
                  <Button
                    size="sm"
                    variant={customer.status === "canceled" ? "destructive" : "outline"}
                    onClick={() => handleStatusChange("canceled")}
                    disabled={customer.status === "canceled"}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-4 border-t border-border bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">
                      Confirm Status Change
                    </p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Are you sure you want to change this customer's status to{" "}
                      <strong>{selectedStatus}</strong>?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowConfirm(false);
                      setSelectedStatus(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={confirmStatusChange}
                    disabled={updateStatusMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {updateStatusMutation.isPending ? "Updating..." : "Confirm"}
                  </Button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={updateStatusMutation.isPending}
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Customer not found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
