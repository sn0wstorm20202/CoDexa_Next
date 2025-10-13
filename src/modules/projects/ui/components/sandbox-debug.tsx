"use client";

import { useState } from "react";
import { Bug, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Fragment } from "generated/prisma";

interface Props {
  fragment: Fragment;
}

export function SandboxDebug({ fragment }: Props) {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{success: boolean; error?: string; data?: Record<string, unknown>} | null>(null);

  const testSandboxConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      toast.info("Testing sandbox connection...", {
        duration: 2000,
        position: "bottom-right"
      });

      const response = await fetch('/api/debug-sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fragmentId: fragment.id,
          testContent: `Debug test at ${new Date().toISOString()}\nThis is a test to verify sandbox connection and file writing capabilities.`
        }),
      });

      const result = await response.json();
      setLastTestResult(result);

      if (result.success) {
        toast.success("Sandbox connection test passed!", {
          duration: 4000,
          position: "bottom-right",
          description: `Sandbox ID: ${result.data.sandboxId}`,
        });
      } else {
        toast.error("Sandbox connection test failed", {
          duration: 5000,
          position: "bottom-right",
          description: result.error || "Unknown error",
        });
      }

    } catch (error) {
      console.error('Sandbox test error:', error);
      toast.error("Failed to test sandbox connection", {
        duration: 4000,
        position: "bottom-right",
      });
      setLastTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={testSandboxConnection}
        disabled={isTestingConnection}
        className="h-7 px-2 text-xs border-orange-500/20 hover:border-orange-500/40"
      >
        {isTestingConnection ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <Bug className="h-3 w-3 mr-1" />
        )}
        Debug Sandbox
      </Button>

      {lastTestResult && (
        <Badge 
          variant={lastTestResult.success ? "default" : "destructive"}
          className="text-xs"
        >
          {lastTestResult.success ? (
            <>
              <CheckCircle className="h-2 w-2 mr-1" />
              Connected
            </>
          ) : (
            <>
              <XCircle className="h-2 w-2 mr-1" />
              Failed
            </>
          )}
        </Badge>
      )}
    </div>
  );
}