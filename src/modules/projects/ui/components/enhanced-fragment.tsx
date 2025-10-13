"use client";

import { useState } from "react";
import { 
  ExternalLinkIcon, 
  RefreshCcwIcon, 
  Monitor, 
  Code, 
  FolderOpen,
  Copy,
  Download 
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
import { CodeEditor } from "./code-editor";
import { toast } from "sonner";

interface Props {
  data: Fragment;
}

export function EnhancedFragment({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>(
    typeof data.files === 'object' && data.files !== null ? data.files as Record<string, string> : {}
  );

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
    // Here you could also save to the backend if needed
  };

  const handleDownloadProject = () => {
    // Create a zip-like structure for download
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
        </div>
        
        <div className="flex items-center gap-1">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-3 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview" className="flex items-center gap-2 text-xs">
                <Monitor className="h-3 w-3" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2 text-xs" disabled={!hasFiles}>
                <Code className="h-3 w-3" />
                Code
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2 text-xs" disabled={!hasFiles}>
                <FolderOpen className="h-3 w-3" />
                Files
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
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

            <TabsContent value="code" className="h-full m-0 p-0">
              {hasFiles ? (
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={30} minSize={20} className="h-full">
                    <FileExplorer
                      files={fileContents}
                      selectedFile={selectedFile}
                      onFileSelect={setSelectedFile}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={70} minSize={30} className="h-full">
                    <CodeEditor
                      files={fileContents}
                      selectedFile={selectedFile}
                      onFileContentChange={handleFileContentChange}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files available</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="h-full m-0 p-0">
              {hasFiles ? (
                <FileExplorer
                  files={fileContents}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
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