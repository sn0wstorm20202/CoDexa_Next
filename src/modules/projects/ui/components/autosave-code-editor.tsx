"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { 
  Copy, 
  Download, 
  Save, 
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock
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

type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

export function AutosaveCodeEditor({ files, selectedFile, onFileContentChange, onSave, isSaving = false }: Props) {
  const [editorContent, setEditorContent] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedFileContent = selectedFile ? files[selectedFile] : "";
  const AUTOSAVE_DELAY = 2000; // 2 seconds

  // Suppress Monaco cancellation errors globally
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args[0];
      // Filter out Monaco cancellation errors
      if (typeof message === 'string' && message.includes('Canceled')) {
        console.log('⚠️ Suppressed Monaco cancellation error (this is normal)');
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Update editor content when selected file changes
  useEffect(() => {
    if (selectedFile && files[selectedFile]) {
      setEditorContent(files[selectedFile]);
      setIsModified(false);
      setSaveStatus('saved');
    } else {
      setEditorContent("");
      setIsModified(false);
      setSaveStatus('saved');
    }
  }, [selectedFile, files]);

  // Autosave functionality
  const performAutosave = useCallback(async () => {
    console.log('💾 performAutosave called:', {
      selectedFile,
      isModified,
      hasOnSave: !!onSave,
      contentChanged: editorContent !== selectedFileContent,
      editorContentLength: editorContent.length,
      selectedFileContentLength: selectedFileContent.length
    });
    
    if (selectedFile && isModified && onSave && editorContent !== selectedFileContent) {
      console.log('✅ All conditions met, starting autosave...');
      setSaveStatus('saving');
      try {
        console.log('🚀 Calling onSave function...');
        await onSave(selectedFile, editorContent);
        console.log('✅ onSave completed successfully');
        
        // Update parent component with saved content
        console.log('🔍 Updating parent component after successful save');
        onFileContentChange(selectedFile, editorContent);
        
        setIsModified(false);
        setSaveStatus('saved');
        setLastSavedTime(new Date());
        
        // Show success toast
        toast.success(
          `${selectedFile.split('/').pop()} saved successfully!`,
          {
            duration: 2000,
            position: "bottom-right",
            style: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }
          }
        );
      } catch (error) {
        console.error("❌ Autosave failed:", error);
        setSaveStatus('error');
        toast.error("Autosave failed", {
          duration: 3000,
          position: "bottom-right"
        });
      }
    } else {
      console.log('❌ Autosave conditions not met:', {
        hasSelectedFile: !!selectedFile,
        isModified,
        hasOnSave: !!onSave,
        contentChanged: editorContent !== selectedFileContent
      });
    }
  }, [selectedFile, isModified, onSave, editorContent, selectedFileContent, onFileContentChange]);

  // Setup autosave timer
  useEffect(() => {
    console.log('⏰ Autosave timer effect triggered:', {
      isModified,
      selectedFile,
      hasOnSave: !!onSave,
      willSetupTimer: isModified && selectedFile && onSave
    });
    
    if (isModified && selectedFile && onSave) {
      // Clear existing timeout
      if (autosaveTimeoutRef.current) {
        console.log('🔄 Clearing existing autosave timeout');
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      // Set new timeout for autosave
      console.log(`⏱️ Setting autosave timeout for ${AUTOSAVE_DELAY}ms`);
      autosaveTimeoutRef.current = setTimeout(() => {
        console.log('🚀 Autosave timeout triggered, calling performAutosave');
        performAutosave();
      }, AUTOSAVE_DELAY);
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        console.log('🧹 Cleaning up autosave timeout');
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [isModified, selectedFile, onSave, performAutosave]);

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

  const handleEditorChange = useCallback((value: string | undefined) => {
    try {
      const newContent = value || "";
      
      console.log('🔄 Editor content changed - DETAILED DEBUG:', {
        selectedFile,
        newContentLength: newContent.length,
        selectedFileContentLength: selectedFileContent.length,
        newContentPreview: newContent.substring(0, 100) + '...',
        selectedFileContentPreview: selectedFileContent.substring(0, 100) + '...',
        areEqual: newContent === selectedFileContent,
        hasChanges: newContent !== selectedFileContent
      });
      
      console.log('🔍 Calling setEditorContent with:', newContent.length + ' chars');
      setEditorContent(newContent);
      
      const hasChanges = newContent !== selectedFileContent;
      console.log('🔍 Calling setIsModified with:', hasChanges);
      setIsModified(hasChanges);
      
      const newStatus = hasChanges ? 'unsaved' : 'saved';
      console.log('🔍 Calling setSaveStatus with:', newStatus);
      setSaveStatus(newStatus);
      
      console.log('📊 Save status update completed:', {
        hasChanges,
        newStatus,
        onSaveAvailable: !!onSave
      });
      
      // DON'T update parent component here - it causes state race condition!
      // We'll update it after successful save instead
      
      // Force a re-render check
      console.log('🔄 State should now be: isModified =', hasChanges);
    } catch (error) {
      // Suppress Monaco cancellation errors - they're benign
      if (error instanceof Error && error.message.includes('Canceled')) {
        console.log('⚠️ Monaco cancellation error suppressed (this is normal during rapid typing)');
        return;
      }
      console.error('❌ Error in handleEditorChange:', error);
    }
  }, [selectedFile, selectedFileContent, onSave]);

  const handleManualSave = async () => {
    if (selectedFile && isModified && onSave) {
      setSaveStatus('saving');
      try {
        await onSave(selectedFile, editorContent);
        
        // Update parent component with saved content
        console.log('🔍 Updating parent component after successful manual save');
        onFileContentChange(selectedFile, editorContent);
        
        setIsModified(false);
        setSaveStatus('saved');
        setLastSavedTime(new Date());
        
        toast.success(
          `${selectedFile.split('/').pop()} saved successfully!`,
          {
            duration: 2000,
            position: "bottom-right",
            style: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }
          }
        );
      } catch (error) {
        console.error("Manual save failed:", error);
        setSaveStatus('error');
        toast.error("Save failed", {
          duration: 3000,
          position: "bottom-right"
        });
      }
    } else if (selectedFile && isModified) {
      // Fallback to local change only
      onFileContentChange(selectedFile, editorContent);
      setIsModified(false);
      setSaveStatus('saved');
      toast.success("File updated locally!", {
        duration: 2000,
        position: "bottom-right"
      });
    }
  };

  const handleReset = () => {
    if (selectedFile && files[selectedFile]) {
      setEditorContent(files[selectedFile]);
      setIsModified(false);
      setSaveStatus('saved');
      toast.info("Changes reverted", {
        duration: 2000,
        position: "bottom-right"
      });
    }
  };

  const handleCopy = () => {
    if (editorContent) {
      navigator.clipboard.writeText(editorContent);
      toast.success("Code copied to clipboard!", {
        duration: 2000,
        position: "bottom-right"
      });
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
      toast.success("File downloaded!", {
        duration: 2000,
        position: "bottom-right"
      });
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

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'unsaved':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return "Saving...";
      case 'saved':
        return lastSavedTime ? `Saved ${lastSavedTime.toLocaleTimeString()}` : "Saved";
      case 'unsaved':
        return "Unsaved changes";
      case 'error':
        return "Save failed";
      default:
        return "";
    }
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
            
            {/* Save Status Badge */}
            <div className="flex items-center gap-1">
              {getSaveStatusIcon()}
              <Badge 
                variant={
                  saveStatus === 'saved' ? 'default' : 
                  saveStatus === 'saving' ? 'secondary' :
                  saveStatus === 'error' ? 'destructive' : 'outline'
                } 
                className="text-xs px-1.5 py-0.5"
              >
                {saveStatus === 'saved' ? 'Saved' :
                 saveStatus === 'saving' ? 'Saving...' :
                 saveStatus === 'unsaved' ? 'Unsaved' : 'Error'}
              </Badge>
            </div>
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
            onClick={handleManualSave}
            disabled={!isModified || isSaving || saveStatus === 'saving'}
            className="h-7 px-2 text-primary"
          >
            {isSaving || saveStatus === 'saving' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('🧪 Test button clicked - BEFORE change');
              console.log('🧪 Current state:', {
                editorContentLength: editorContent.length,
                selectedFileContentLength: selectedFileContent.length,
                isModified,
                saveStatus
              });
              const testContent = editorContent + ' // test change ' + Date.now();
              console.log('🧪 About to call handleEditorChange with:', testContent.length + ' chars');
              handleEditorChange(testContent);
            }}
            className="h-7 px-2 text-orange-500 border-orange-500/20"
          >
            Test
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
            onChange={(value, event) => {
              try {
                console.log('📝 Monaco Editor onChange fired:', {
                  newValueLength: value?.length || 0,
                  currentValueLength: editorContent.length,
                  selectedFile,
                  event: event?.changes?.length || 0 + ' changes'
                });
                handleEditorChange(value);
              } catch (error) {
                // Suppress Monaco cancellation errors
                if (error instanceof Error && error.message.includes('Canceled')) {
                  console.log('⚠️ Monaco onChange cancellation error suppressed');
                  return;
                }
                console.error('❌ Error in Monaco onChange:', error);
              }
            }}
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
              formatOnType: false, // Disable to reduce rapid change events
              formatOnPaste: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false
              },
              parameterHints: { enabled: true },
              hover: { enabled: true },
              contextmenu: true,
              // Reduce update frequency to minimize cancellations
              smoothScrolling: false,
              cursorSmoothCaretAnimation: 'off',
              // Enable stable content widget positioning
              stablePeek: true,
            }}
            onMount={(editor) => {
              console.log('🚀 Monaco Editor mounted:', {
                selectedFile,
                editorContentLength: editorContent.length,
                language: getLanguage(selectedFile)
              });
              setIsLoading(false);
              editor.focus();
              
              // Add additional change listener as backup with error handling
              editor.onDidChangeModelContent((e) => {
                try {
                  console.log('📝 Monaco onDidChangeModelContent fired:', e.changes.length + ' changes');
                  const newValue = editor.getValue();
                  handleEditorChange(newValue);
                } catch (error) {
                  // Suppress Monaco cancellation errors
                  if (error instanceof Error && error.message.includes('Canceled')) {
                    console.log('⚠️ Monaco onDidChangeModelContent cancellation error suppressed');
                    return;
                  }
                  console.error('❌ Error in onDidChangeModelContent:', error);
                }
              });
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
          {onSave && (
            <div className="flex items-center gap-1">
              {getSaveStatusIcon()}
              <span className={cn(
                saveStatus === 'saved' ? 'text-green-600' :
                saveStatus === 'saving' ? 'text-blue-600' :
                saveStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
              )}>
                {getSaveStatusText()}
              </span>
            </div>
          )}
          {onSave && !isModified && (
            <span className="text-muted-foreground">• Autosave enabled</span>
          )}
        </div>
      </div>
    </div>
  );
}