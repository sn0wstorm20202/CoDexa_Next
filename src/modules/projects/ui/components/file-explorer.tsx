"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder,
  FolderOpen,
  Code2,
  Palette,
  FileIcon,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

interface Props {
  files: Record<string, string>;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

export function FileExplorer({ files, selectedFile, onFileSelect }: Props) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  // Convert flat file structure to tree
  const buildFileTree = (files: Record<string, string>): FileNode[] => {
    const tree: FileNode[] = [];
    const folderMap: Record<string, FileNode> = {};

    Object.entries(files).forEach(([path, content]) => {
      const parts = path.split('/').filter(Boolean);
      let currentLevel = tree;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = index === parts.length - 1;

        let existingNode = currentLevel.find(node => node.name === part);
        
        if (!existingNode) {
          const newNode: FileNode = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            content: isFile ? content : undefined
          };
          
          currentLevel.push(newNode);
          existingNode = newNode;
          
          if (!isFile) {
            folderMap[currentPath] = newNode;
          }
        }

        if (!isFile && existingNode.children) {
          currentLevel = existingNode.children;
        }
      });
    });

    return tree.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code2 className="h-4 w-4 text-yellow-500" />;
      case 'css':
      case 'scss':
      case 'less':
        return <Palette className="h-4 w-4 text-blue-500" />;
      case 'json':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'html':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'md':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start h-7 px-2 font-normal hover:bg-accent",
            selectedFile === node.path && "bg-accent text-accent-foreground",
            "transition-colors duration-150"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="h-3 w-3 mr-1 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1 shrink-0" />
              )}
              {expandedFolders.has(node.path) ? (
                <FolderOpen className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
              ) : (
                <Folder className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-4 mr-1 shrink-0" />
              {getFileIcon(node.name)}
              <span className="ml-2" />
            </>
          )}
          <span className="truncate text-left flex-1">{node.name}</span>
        </Button>
        
        {node.type === 'folder' && 
         node.children && 
         expandedFolders.has(node.path) && (
          <div>
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const fileTree = buildFileTree(files);

  if (Object.keys(files).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20">
        <h3 className="text-sm font-medium">Files</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-1">
          {renderTree(fileTree)}
        </div>
      </ScrollArea>
    </div>
  );
}