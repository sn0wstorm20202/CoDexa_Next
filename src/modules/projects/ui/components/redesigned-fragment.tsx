"use client";

import { useState } from "react";
import { 
  ExternalLinkIcon, 
  RefreshCcwIcon, 
  Monitor, 
  Copy,
  Download,
  Save,
  Loader2
} from "lucide-react";
import { Fragment } from "generated/prisma";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Hint } from "./hint";
import { FileExplorer } from "./file-explorer";
import { AutosaveCodeEditor } from "./autosave-code-editor";
import { SandboxDebug } from "./sandbox-debug";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface Props {
  data: Fragment;
}

export function RedesignedFragment({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>(
    typeof data.files === 'object' && data.files !== null ? data.files as Record<string, string> : {}
  );
  const [savingFile, setSavingFile] = useState<string | null>(null);

  const trpc = useTRPC();

  const updateFileMutation = useMutation(trpc.fragments.updateSingleFile.mutationOptions({
    onSuccess: (result) => {
      if (result.success) {
        // Check if sandbox update was successful
        if (result.sandboxUpdateSuccess) {
          toast.success(
            `File saved to database and live preview!`,
            {
              duration: 3000,
              position: "bottom-right",
              style: {
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }
            }
          );
          // Auto refresh preview after successful sandbox save
          setTimeout(() => {
            setFragmentKey(prev => prev + 1);
          }, 1500);
        } else {
          toast.warning(
            `File saved to database only. Preview may not reflect changes.`,
            {
              duration: 4000,
              position: "bottom-right"
            }
          );
        }
      }
    },
    onError: (error) => {
      console.error("Error saving file:", error);
      toast.error("Failed to save file", {
        duration: 3000,
        position: "bottom-right"
      });
    }
  }));

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Sandbox URL copied to clipboard!");
  };

  const handleFileContentChange = (path: string, content: string) => {
    setFileContents(prev => ({
      ...prev,
      [path]: content
    }));
  };

  const handleSaveFile = async (filePath: string, content: string) => {
    console.log('💾 handleSaveFile called from redesigned fragment:', {
      filePath,
      contentLength: content.length,
      fragmentId: data.id
    });
    
    if (!filePath || !data.id) {
      console.error('❌ handleSaveFile: Missing filePath or data.id');
      return;
    }

    setSavingFile(filePath);
    try {
      console.log('🚀 Calling updateFileMutation.mutateAsync...');
      await updateFileMutation.mutateAsync({
        fragmentId: data.id,
        filePath: filePath,
        content: content
      });
      
      console.log('✅ updateFileMutation completed successfully');
      
      // Update local state with saved content
      setFileContents(prev => ({
        ...prev,
        [filePath]: content
      }));
    } catch (error) {
      console.error('❌ handleSaveFile failed:', error);
      throw error; // Re-throw so the code editor can handle it
    } finally {
      setSavingFile(null);
    }
  };

  const handleDownloadProject = () => {
    const projectData = {
      files: fileContents,
      sandboxUrl: data.sandboxUrl,
      title: data.title,
      createdAt: data.createdAt
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title || 'project'}-files.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Project files downloaded!");
  };

  // Auto-select first file when switching to Files & Code tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "files-code" && !selectedFile && Object.keys(fileContents).length > 0) {
      const firstFile = Object.keys(fileContents)[0];
      setSelectedFile(firstFile);
    }
  };

  const fileCount = Object.keys(fileContents).length;
  const hasFiles = fileCount > 0;

  return (
    <div className="flex flex-col w-full h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/20">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="font-medium truncate">{data.title}</h3>
          {hasFiles && (
            <Badge variant="secondary" className="text-xs">
              {fileCount} file{fileCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {savingFile && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving {savingFile.split('/').pop()}...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <SandboxDebug fragment={data} />
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Hint text="Download project files" side="bottom">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadProject}
              disabled={!hasFiles}
              className="h-7 px-2"
            >
              <Download className="h-3 w-3" />
            </Button>
          </Hint>
          
          <Hint text="Copy sandbox URL" side="bottom">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!data.sandboxUrl || copied}
              className="h-7 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </Hint>

          <Hint text="Refresh preview" side="bottom">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={!data.sandboxUrl}
              className="h-7 px-2"
            >
              <RefreshCcwIcon className="h-3 w-3" />
            </Button>
          </Hint>

          <Hint text="Open in new tab" side="bottom">
            <Button
              variant="ghost"
              size="sm"
              disabled={!data.sandboxUrl}
              onClick={() => {
                if (!data.sandboxUrl) return;
                window.open(data.sandboxUrl, "_blank");
              }}
              className="h-7 px-2"
            >
              <ExternalLinkIcon className="h-3 w-3" />
            </Button>
          </Hint>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          <div className="px-3 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2 text-xs">
                <Monitor className="h-3 w-3" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="files-code" className="flex items-center gap-2 text-xs" disabled={!hasFiles}>
                <Save className="h-3 w-3" />
                Files & Code
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Preview Tab */}
            <TabsContent value="preview" className="h-full m-0 p-3">
              <div className="h-full flex flex-col rounded-lg border overflow-hidden bg-white">
                {data.sandboxUrl ? (
                  <iframe
                    key={fragmentKey}
                    className="h-full w-full"
                    sandbox="allow-forms allow-scripts allow-same-origin"
                    loading="lazy"
                    src={data.sandboxUrl}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No preview available</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Files & Code Tab */}
            <TabsContent value="files-code" className="h-full m-0 p-0">
              {hasFiles ? (
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {/* File Explorer Panel */}
                  <ResizablePanel defaultSize={30} minSize={20} maxSize={50} className="h-full">
                    <FileExplorer
                      files={fileContents}
                      selectedFile={selectedFile}
                      onFileSelect={setSelectedFile}
                    />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  {/* Code Editor Panel */}
                  <ResizablePanel defaultSize={70} minSize={50} className="h-full">
                    <AutosaveCodeEditor
                      files={fileContents}
                      selectedFile={selectedFile}
                      onFileContentChange={handleFileContentChange}
                      onSave={handleSaveFile}
                      isSaving={savingFile === selectedFile}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files available</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}