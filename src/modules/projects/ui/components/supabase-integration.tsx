"use client";

import { useState, useEffect } from "react";
import { Database, ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  projectId: string;
}

export const SupabaseIntegration = ({ projectId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<{
    enabled: boolean;
    url: string | null;
    projectId: string | null;
  } | null>(null);

  // Check Supabase status on mount
  useEffect(() => {
    checkSupabaseStatus();
  }, [projectId]);

  const checkSupabaseStatus = async () => {
    try {
      const response = await fetch(`/api/supabase/status?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setIsConnected(data.enabled);
      }
    } catch (err) {
      console.error("Failed to check Supabase status:", err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/supabase/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          supabaseUrl,
          supabaseAnonKey,
          supabaseServiceKey: supabaseServiceKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect Supabase");
      }

      setIsConnected(true);
      setIsDialogOpen(false);
      setSupabaseUrl("");
      setSupabaseAnonKey("");
      setSupabaseServiceKey("");
      await checkSupabaseStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/supabase/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect Supabase");
      }

      setIsConnected(false);
      setStatus(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Integrations</span>
          {isConnected && (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-3 space-y-3">
        <div className="flex items-start gap-2 p-3 rounded-md border bg-muted/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-5 w-5 text-green-600" />
              <span className="font-medium text-sm">Supabase</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isConnected
                ? "Enable fullstack apps with real database"
                : "Connect to enable fullstack generation"}
            </p>

            {isConnected && status && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Project: <span className="font-mono">{status.projectId}</span>
                </p>
                <a
                  href={status.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Open Dashboard <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {isConnected ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDisconnect}
                disabled={loading}
                className="text-xs"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="default" className="text-xs">
                    Connect
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Connect Supabase</DialogTitle>
                    <DialogDescription>
                      Enter your Supabase project credentials to enable fullstack app generation with real database, authentication, and storage.
                    </DialogDescription>
                  </DialogHeader>

                  {error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="supabase-url">Project URL</Label>
                      <Input
                        id="supabase-url"
                        placeholder="https://xxxxx.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Found in Project Settings → API
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supabase-anon-key">Anon Key</Label>
                      <Input
                        id="supabase-anon-key"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={supabaseAnonKey}
                        onChange={(e) => setSupabaseAnonKey(e.target.value)}
                        type="password"
                      />
                      <p className="text-xs text-muted-foreground">
                        Public anon key (safe to use in frontend)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supabase-service-key">
                        Service Role Key (Optional)
                      </Label>
                      <Input
                        id="supabase-service-key"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={supabaseServiceKey}
                        onChange={(e) => setSupabaseServiceKey(e.target.value)}
                        type="password"
                      />
                      <p className="text-xs text-muted-foreground">
                        For admin operations (never exposed to frontend)
                      </p>
                    </div>

                    <Alert>
                      <Database className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Don't have a Supabase project?{" "}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          Create one for free
                        </a>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConnect}
                      disabled={!supabaseUrl || !supabaseAnonKey || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground px-1">
          When connected, CoDexa will generate fullstack apps with real database, auth, and more.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
};
