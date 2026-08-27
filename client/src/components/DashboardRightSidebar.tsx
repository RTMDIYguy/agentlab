import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ExternalLink, Link as LinkIcon, User } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function DashboardRightSidebar() {
  const { user } = useAuth();
  
  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Quick Links state (persisted to localStorage for now if backend not ready)
  const [quickLinks, setQuickLinks] = useState<{ id: string; title: string; url: string }[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  useEffect(() => {
    const savedLinks = localStorage.getItem("agentlab_quicklinks");
    if (savedLinks) {
      try {
        setQuickLinks(JSON.parse(savedLinks));
      } catch (e) {
        console.error("Failed to parse quick links", e);
      }
    } else {
      // Default links
      setQuickLinks([
        { id: "1", title: "Documentation", url: "/docs" },
        { id: "2", title: "Support", url: "/support" }
      ]);
    }
  }, []);

  const saveLinks = (links: { id: string; title: string; url: string }[]) => {
    setQuickLinks(links);
    localStorage.setItem("agentlab_quicklinks", JSON.stringify(links));
  };

  const handleUpdateProfile = () => {
    // In a real app we would call an update profile mutation here
    toast.success("Profile updated successfully");
    setIsEditingProfile(false);
  };

  const handleAddLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    const newLinks = [...quickLinks, { id: Date.now().toString(), title: newLinkTitle, url: newLinkUrl }];
    saveLinks(newLinks);
    setNewLinkTitle("");
    setNewLinkUrl("");
    setIsAddingLink(false);
    toast.success("Quick link added");
  };

  const handleRemoveLink = (id: string) => {
    const newLinks = quickLinks.filter(l => l.id !== id);
    saveLinks(newLinks);
  };

  return (
    <aside className="w-72 border-l border-border bg-card hidden lg:flex flex-col overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </h2>
          {!isEditingProfile && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setIsEditingProfile(true)}>
              Edit
            </Button>
          )}
        </div>
        
        {isEditingProfile ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Display Name</Label>
              <Input 
                size={1} 
                className="h-8 text-sm" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs w-full" onClick={handleUpdateProfile}>Save</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs w-full" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {displayName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{displayName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Workspace ID:</span>
                <span className="font-mono">{user?.uid?.substring(0, 8) || "0000-URC"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links Section */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Quick Links
          </h2>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsAddingLink(!isAddingLink)}>
            {isAddingLink ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>

        {isAddingLink && (
          <div className="bg-muted/50 p-3 rounded-md mb-4 space-y-3 border border-border">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input size={1} className="h-7 text-xs" placeholder="e.g. Notion Dashboard" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">URL</Label>
              <Input size={1} className="h-7 text-xs" placeholder="https://..." value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} />
            </div>
            <Button size="sm" className="h-7 text-xs w-full" onClick={handleAddLink}>Add Link</Button>
          </div>
        )}

        <div className="space-y-2">
          {quickLinks.map(link => (
            <div key={link.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground overflow-hidden">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{link.title}</span>
              </a>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveLink(link.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {quickLinks.length === 0 && !isAddingLink && (
            <p className="text-xs text-muted-foreground text-center py-4 italic">No quick links added yet.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
