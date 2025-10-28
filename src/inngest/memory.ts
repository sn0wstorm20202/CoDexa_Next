import { prisma } from "@/lib/db";

interface ConversationMessage {
  role: "USER" | "ASSISTANT";
  content: string;
  timestamp: string;
}

interface MemoryContext {
  lastContext?: string;
  currentTask?: string;
  domainInfo?: {
    colors?: string[];
    layout?: string;
    components?: string[];
    theme?: string;
    style?: string;
  };
  backendInfo?: {
    database?: {
      tables?: string[];
      relationships?: string[];
    };
    auth?: {
      enabled?: boolean;
      providers?: string[];
    };
    storage?: {
      buckets?: string[];
    };
    realtime?: {
      channels?: string[];
    };
  };
  recentMessages?: ConversationMessage[];
}

/**
 * Extract backend/database requirements from user message
 */
export function extractBackendContext(message: string, previousContext?: MemoryContext): {
  requiresDatabase: boolean;
  requiresAuth: boolean;
  requiresStorage: boolean;
  requiresRealtime: boolean;
  tables?: string[];
} {
  const lowerMessage = message.toLowerCase();
  
  // Database indicators
  const databaseKeywords = [
    'database', 'table', 'store', 'save', 'persist', 'crud',
    'create', 'read', 'update', 'delete', 'data', 'record'
  ];
  const requiresDatabase = databaseKeywords.some(k => lowerMessage.includes(k));
  
  // Auth indicators
  const authKeywords = [
    'login', 'signup', 'auth', 'user', 'profile', 'account',
    'register', 'password', 'authentication', 'protected'
  ];
  const requiresAuth = authKeywords.some(k => lowerMessage.includes(k));
  
  // Storage indicators
  const storageKeywords = [
    'upload', 'file', 'image', 'photo', 'document', 'attachment',
    'download', 'media', 'avatar', 'picture'
  ];
  const requiresStorage = storageKeywords.some(k => lowerMessage.includes(k));
  
  // Realtime indicators
  const realtimeKeywords = [
    'realtime', 'live', 'real-time', 'websocket', 'chat',
    'notification', 'instant', 'sync'
  ];
  const requiresRealtime = realtimeKeywords.some(k => lowerMessage.includes(k));
  
  // Extract table names from common patterns
  const tablePatterns = [
    /(?:create|add|make|build|setup)\s+(?:a\s+)?([\w]+)\s+(?:table|database|collection)/gi,
    /(?:store|save|persist)\s+([\w]+)/gi,
    /([\w]+)\s+(?:table|database|collection)/gi
  ];
  
  const tables: string[] = [];
  tablePatterns.forEach(pattern => {
    const matches = [...message.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && !tables.includes(match[1])) {
        tables.push(match[1]);
      }
    });
  });
  
  return {
    requiresDatabase,
    requiresAuth,
    requiresStorage,
    requiresRealtime,
    tables: tables.length > 0 ? tables : undefined
  };
}

/**
 * Extract context and intent from user message
 */
export function extractContextFromMessage(message: string, previousContext?: MemoryContext): {
  context: string;
  task: string;
  domainInfo: Record<string, unknown>;
  isModification: boolean;
} {
  console.log('🔍 [MEMORY] extractContextFromMessage - START', {
    message,
    previousContext: previousContext ? {
      lastContext: previousContext.lastContext,
      currentTask: previousContext.currentTask,
      domainInfoKeys: previousContext.domainInfo ? Object.keys(previousContext.domainInfo) : [],
      recentMessagesCount: previousContext.recentMessages?.length || 0
    } : null
  });
  
  const lowerMessage = message.toLowerCase();
  
  // Detect if this is a modification/change request
  const modificationKeywords = [
    'change', 'modify', 'update', 'edit', 'alter', 'switch', 'make it', 
    'turn it', 'convert', 'transform', 'adjust', 'replace'
  ];
  
  const isModification = modificationKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );

  // Extract colors
  const colorPattern = /(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|brown|cyan|magenta|lime|indigo|teal|amber|emerald|rose|violet|sky|stone|neutral|slate|zinc|primary|secondary)/gi;
  const colors = message.match(colorPattern) || [];

  // Extract UI/component types
  const componentPattern = /(landing page|homepage|website|page|form|button|card|modal|sidebar|header|footer|navbar|menu|dashboard|blog|portfolio|gallery|contact|about|login|signup|register)/gi;
  const components = message.match(componentPattern) || [];

  // Extract layout/style keywords
  const layoutPattern = /(responsive|mobile|desktop|centered|full-width|sidebar|grid|flexbox|modern|minimal|clean|professional|creative|dark|light|gradient)/gi;
  const layout = message.match(layoutPattern) || [];

  // Determine context and task
  let context = '';
  let task = message;

  if (isModification && previousContext?.currentTask) {
    // This is a modification to existing work
    context = `Modifying existing ${previousContext.currentTask}`;
    task = `${message} (modifying: ${previousContext.currentTask})`;
  } else if (components.length > 0) {
    // New component/page creation
    context = `Creating ${components[0]}`;
    task = message;
  } else {
    // General task
    context = 'General development task';
    task = message;
  }

  const domainInfo = {
    colors: colors.length > 0 ? colors : previousContext?.domainInfo?.colors || [],
    components: components.length > 0 ? components : previousContext?.domainInfo?.components || [],
    layout: layout.length > 0 ? layout.join(', ') : previousContext?.domainInfo?.layout || '',
    theme: lowerMessage.includes('dark') ? 'dark' : lowerMessage.includes('light') ? 'light' : previousContext?.domainInfo?.theme || '',
    style: layout.length > 0 ? layout.join(', ') : previousContext?.domainInfo?.style || ''
  };

  const result = {
    context,
    task,
    domainInfo,
    isModification
  };
  
  console.log('🔍 [MEMORY] extractContextFromMessage - RESULT', result);
  return result;
}

/**
 * Retrieve conversation memory for a project
 */
export async function getConversationMemory(projectId: string): Promise<MemoryContext | null> {
  console.log('🔍 [MEMORY] getConversationMemory - START', { projectId });
  
  try {
    const memory = await prisma.conversationMemory.findUnique({
      where: { projectId }
    });
    
    console.log('🔍 [MEMORY] getConversationMemory - RAW RESULT', {
      found: !!memory,
      memoryId: memory?.id,
      hasLastContext: !!memory?.lastContext,
      hasCurrentTask: !!memory?.currentTask,
      hasDomainInfo: !!memory?.domainInfo,
      hasRecentMessages: !!memory?.recentMessages,
      createdAt: memory?.createdAt,
      updatedAt: memory?.updatedAt
    });

    if (!memory) {
      console.log('🔍 [MEMORY] getConversationMemory - NO MEMORY FOUND');
      return null;
    }

    const result = {
      lastContext: memory.lastContext || undefined,
      currentTask: memory.currentTask || undefined,
      domainInfo: memory.domainInfo as Record<string, unknown> || {},
      recentMessages: (memory.recentMessages as unknown as ConversationMessage[]) || []
    };
    
    console.log('🔍 [MEMORY] getConversationMemory - PARSED RESULT', {
      lastContext: result.lastContext,
      currentTask: result.currentTask,
      domainInfoKeys: Object.keys(result.domainInfo),
      recentMessagesCount: result.recentMessages.length
    });
    
    return result;
  } catch (error) {
    console.error('❌ [MEMORY] getConversationMemory - ERROR:', {
      projectId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    return null;
  }
}

/**
 * Update conversation memory for a project
 */
export async function updateConversationMemory(
  projectId: string, 
  newMessage: ConversationMessage,
  extractedContext?: {
    context: string;
    task: string;
    domainInfo: Record<string, unknown>;
  }
): Promise<void> {
  console.log('🔍 [MEMORY] updateConversationMemory - START', {
    projectId,
    newMessage: {
      role: newMessage.role,
      contentLength: newMessage.content.length,
      timestamp: newMessage.timestamp
    },
    extractedContext: extractedContext ? {
      context: extractedContext.context,
      task: extractedContext.task,
      domainInfoKeys: Object.keys(extractedContext.domainInfo)
    } : null
  });
  
  try {
    const currentMemory = await getConversationMemory(projectId);
    
    // Keep last 8 messages for context
    const recentMessages = [
      ...(currentMemory?.recentMessages || []),
      newMessage
    ].slice(-8);
    
    console.log('🔍 [MEMORY] updateConversationMemory - MESSAGES', {
      previousCount: currentMemory?.recentMessages?.length || 0,
      newCount: recentMessages.length,
      newMessageRole: newMessage.role
    });

    const updateData = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentMessages: recentMessages as any,
      ...(extractedContext && {
        lastContext: extractedContext.context,
        currentTask: extractedContext.task,
        domainInfo: {
          ...(currentMemory?.domainInfo || {}),
          ...extractedContext.domainInfo
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      })
    };
    
    console.log('🔍 [MEMORY] updateConversationMemory - UPDATE DATA', {
      hasRecentMessages: !!updateData.recentMessages,
      recentMessagesLength: recentMessages.length,
      lastContext: updateData.lastContext,
      currentTask: updateData.currentTask,
      domainInfoKeys: updateData.domainInfo ? Object.keys(updateData.domainInfo) : []
    });

    const result = await prisma.conversationMemory.upsert({
      where: { projectId },
      update: updateData,
      create: {
        projectId,
        ...updateData
      }
    });
    
    console.log('✅ [MEMORY] updateConversationMemory - SUCCESS', {
      memoryId: result.id,
      projectId: result.projectId,
      wasCreate: !currentMemory,
      updatedAt: result.updatedAt
    });
  } catch (error) {
    console.error('❌ [MEMORY] updateConversationMemory - ERROR:', {
      projectId,
      newMessage: {
        role: newMessage.role,
        contentLength: newMessage.content.length
      },
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    
    // Re-throw the error so we can see it in the agent logs too
    throw error;
  }
}

/**
 * Generate enhanced prompt with conversation context
 */
export function generateContextualPrompt(basePrompt: string, memory: MemoryContext | null, currentUserMessage: string): string {
  console.log('📝 [MEMORY] generateContextualPrompt - START', {
    basePromptLength: basePrompt.length,
    hasMemory: !!memory,
    hasLastContext: !!memory?.lastContext,
    hasRecentMessages: !!memory?.recentMessages?.length,
    currentUserMessage: currentUserMessage.substring(0, 100) + (currentUserMessage.length > 100 ? '...' : '')
  });
  
  if (!memory || (!memory.lastContext && !memory.recentMessages?.length)) {
    console.log('📝 [MEMORY] generateContextualPrompt - NO CONTEXT, returning base prompt');
    return basePrompt;
  }

  let contextSection = '\n\n=== CONVERSATION CONTEXT ===\n';

  // Add current task context
  if (memory.currentTask) {
    contextSection += `Current Task: ${memory.currentTask}\n`;
  }

  if (memory.lastContext) {
    contextSection += `Last Context: ${memory.lastContext}\n`;
  }

  // Add domain-specific information
  if (memory.domainInfo && Object.keys(memory.domainInfo).length > 0) {
    contextSection += 'Domain Context:\n';
    
    if (memory.domainInfo.colors && memory.domainInfo.colors.length > 0) {
      contextSection += `- Colors mentioned: ${memory.domainInfo.colors.join(', ')}\n`;
    }
    
    if (memory.domainInfo.components && memory.domainInfo.components.length > 0) {
      contextSection += `- Components: ${memory.domainInfo.components.join(', ')}\n`;
    }
    
    if (memory.domainInfo.layout) {
      contextSection += `- Layout/Style: ${memory.domainInfo.layout}\n`;
    }
    
    if (memory.domainInfo.theme) {
      contextSection += `- Theme: ${memory.domainInfo.theme}\n`;
    }
  }

  // Add recent conversation history
  if (memory.recentMessages && memory.recentMessages.length > 0) {
    contextSection += '\nRecent Conversation:\n';
    memory.recentMessages.slice(-4).forEach((msg, idx) => {
      contextSection += `${idx + 1}. ${msg.role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
    });
  }

  contextSection += '\nCurrent Request: ' + currentUserMessage + '\n';
  contextSection += '\n=== END CONTEXT ===\n\n';

  contextSection += 'IMPORTANT: Use the conversation context above to understand what the user is referring to. ';
  contextSection += 'If they mention changes (like "change to yellow"), apply those changes to the current project context. ';
  contextSection += 'If they reference previous work (like "make it responsive"), understand what "it" refers to from the context.\n\n';

  const enhancedPrompt = contextSection + basePrompt;
  
  console.log('📝 [MEMORY] generateContextualPrompt - RESULT', {
    contextSectionLength: contextSection.length,
    enhancedPromptLength: enhancedPrompt.length,
    contextAdded: true
  });
  
  return enhancedPrompt;
}

/**
 * Detect if a message is a modification request
 */
export function isModificationRequest(message: string): boolean {
  const modificationKeywords = [
    'change', 'modify', 'update', 'edit', 'alter', 'switch', 'make it', 
    'turn it', 'convert', 'transform', 'adjust', 'replace', 'instead',
    'rather', 'now make', 'but', 'however'
  ];
  
  const lowerMessage = message.toLowerCase();
  return modificationKeywords.some(keyword => lowerMessage.includes(keyword));
}