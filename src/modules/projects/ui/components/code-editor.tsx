"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  Copy, 
  Download, 
  Save, 
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  files: Record<string, string>;
  selectedFile: string | null;
  onFileContentChange: (path: string, content: string) => void;
  onSave?: (filePath: string, content: string) => Promise<void>;
  isSaving?: boolean;
}

export function CodeEditor({ files, selectedFile, onFileContentChange, onSave, isSaving = false }: Props) {
  const [editorContent, setEditorContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedFileContent = selectedFile ? files[selectedFile] : "";

  // Update editor content when selected file changes
  useEffect(() => {
    if (selectedFile && files[selectedFile]) {
      setEditorContent(files[selectedFile]);
      setIsModified(false);
    } else {
      setEditorContent("");
      setIsModified(false);
    }
  }, [selectedFile, files]);

  // Get language based on file extension
  const getLanguage = (filename: string): string => {
    if (!filename) return "plaintext";
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (!extension) return "plaintext";
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'dockerfile': 'dockerfile'
    };

    return languageMap[extension] || 'plaintext';
  };

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || "";
    setEditorContent(newContent);
    setIsModified(newContent !== selectedFileContent);
  };

  const handleSave = async () => {
    if (selectedFile && isModified) {
      if (onSave) {
        try {
          await onSave(selectedFile, editorContent);
          setIsModified(false);
        } catch (error) {
          console.error("Save failed:", error);
        }
      } else {
        // Fallback to local change only
        onFileContentChange(selectedFile, editorContent);
        setIsModified(false);
        toast.success("File updated locally!");
      }
    }
  };

  const handleReset = () => {
    if (selectedFile && files[selectedFile]) {
      setEditorContent(files[selectedFile]);
      setIsModified(false);
      toast.info("Changes reverted");
    }
  };

  const handleCopy = () => {
    if (editorContent) {
      navigator.clipboard.writeText(editorContent);
      toast.success("Code copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (selectedFile && editorContent) {
      const blob = new Blob([editorContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.split('/').pop() || 'file.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("File downloaded!");
    }
  };

  const getFileSize = (content: string): string => {
    const bytes = new Blob([content]).size;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p className="text-sm">Select a file from the explorer to view its content</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-full flex flex-col bg-background",
      isFullscreen && "fixed inset-0 z-50 bg-background"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/20">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium truncate">
              {selectedFile.split('/').pop()}
            </span>
            {isModified && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Modified
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {getFileSize(editorContent)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!editorContent}
            className="h-7 px-2"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!editorContent}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!isModified}
            className="h-7 px-2"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!isModified || isSaving}
            className="h-7 px-2 text-primary"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 px-2"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguage(selectedFile)}
            value={editorContent}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
              folding: true,
              matchBrackets: 'always',
              autoIndent: 'advanced',
              formatOnType: true,
              formatOnPaste: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: true,
              parameterHints: { enabled: true },
              hover: { enabled: true },
              contextmenu: true,
            }}
            onMount={(editor) => {
              setIsLoading(false);
              // Focus the editor
              editor.focus();
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1 border-t bg-muted/20 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Language: {getLanguage(selectedFile)}</span>
          <span>Lines: {editorContent.split('\n').length}</span>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-primary">Saving...</span>
          )}
          {!isSaving && isModified && (
            <span className="text-primary">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}