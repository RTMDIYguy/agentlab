import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { Loader2 } from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  departmentCode: string;
  monthlyPrice: string;
  isUnlocked: boolean;
}

export default function Marketplace() {
  const { data, isLoading, refetch } = useQuery<{ packages: Package[] }>({
    queryKey: ["marketplace-packages"],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const res = await fetch(`/api/marketplace/packages/${packageId}/subscribe`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to subscribe");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success(data.message || "Successfully subscribed!");
        refetch();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageLayout>
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Marketplace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Supercharge your AgentLab with our specialized departmental playbooks.
            Unlock automated workflows, templates, and intelligent agents.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.packages.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col border border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={pkg.isUnlocked ? "secondary" : "default"} className="uppercase">
                      {pkg.departmentCode}
                    </Badge>
                    {pkg.isUnlocked && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Installed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="pt-2 text-base">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-3xl font-bold text-foreground">
                    ${pkg.monthlyPrice}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>
                </CardContent>
                <CardFooter>
                  {pkg.isUnlocked ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Unlocked
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => subscribeMutation.mutate(pkg.id)}
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Subscribe - ${pkg.monthlyPrice}/mo
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
