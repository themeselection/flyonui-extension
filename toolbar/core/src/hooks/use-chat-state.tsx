import {
  collectUserMessageMetadata,
  generateId,
  getSelectedBlockInfo,
  getSelectedDocInfo,
  getSelectedElementInfo,
} from '@/utils';
import type {
  UserMessage,
  UserMessageContentItem,
} from '@stagewise/agent-interface/toolbar';
import { AgentStateType } from '@stagewise/agent-interface/toolbar';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAgentMessaging } from './agent/use-agent-messaging';
import { useAgentState } from './agent/use-agent-state';
import { useAppState } from './use-app-state';
import { useLicenseKey } from './use-license-key';
import { usePanels } from './use-panels';
import { usePlugins } from './use-plugins';

interface ContextSnippet {
  promptContextName: string;
  content: (() => string | Promise<string>) | string;
}
export type PluginContextSnippets = {
  pluginName: string;
  contextSnippets: ContextSnippet[];
};

export interface DocsContextItem {
  id: string;
  title: string;
  description: string;
  category: 'popular' | 'recent';
  install_command: string;
  code: string;
}

export interface BlocksContextItem {
  path: string;
  title: string;
  description: string;
  category: 'popular' | 'recent';
}

interface ChatContext {
  // Chat content operations
  chatInput: string;
  setChatInput: (value: string) => void;
  domContextElements: {
    element: HTMLElement;
    pluginContext: {
      pluginName: string;
      context: any;
    }[];
  }[];
  addChatDomContext: (element: HTMLElement) => void;
  removeChatDomContext: (element: HTMLElement) => void;

  // Docs and blocks context
  selectedDocs: DocsContextItem[];
  selectedBlocks: BlocksContextItem[];
  addChatDocsContext: (doc: DocsContextItem) => void;
  removeChatDocsContext: (docId: string) => void;
  addChatBlocksContext: (block: BlocksContextItem) => void;
  removeChatBlocksContext: (blockPath: string) => void;

  sendMessage: () => void;

  // UI state
  isPromptCreationActive: boolean;
  startPromptCreation: () => void;
  stopPromptCreation: () => void;
  isSending: boolean;
}

const ChatContext = createContext<ChatContext>({
  chatInput: '',
  setChatInput: () => {},
  domContextElements: [],
  addChatDomContext: () => {},
  removeChatDomContext: () => {},
  selectedDocs: [],
  selectedBlocks: [],
  addChatDocsContext: () => {},
  removeChatDocsContext: () => {},
  addChatBlocksContext: () => {},
  removeChatBlocksContext: () => {},
  sendMessage: () => {},
  isPromptCreationActive: false,
  startPromptCreation: () => {},
  stopPromptCreation: () => {},
  isSending: false,
});

interface ChatStateProviderProps {
  children: ReactNode;
}

export const ChatStateProvider = ({ children }: ChatStateProviderProps) => {
  const [chatInput, setChatInput] = useState<string>('');
  const [isPromptCreationMode, setIsPromptCreationMode] =
    useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [domContextElements, setDomContextElements] = useState<
    {
      element: HTMLElement;
      pluginContext: {
        pluginName: string;
        context: any;
      }[];
    }[]
  >([]);
  const [selectedDocs, setSelectedDocs] = useState<DocsContextItem[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<BlocksContextItem[]>([]);

  const { minimized } = useAppState();
  const { plugins } = usePlugins();
  const { sendMessage: sendAgentMessage } = useAgentMessaging();
  const { isChatOpen } = usePanels();
  const agentState = useAgentState();
  const { licenseKey } = useLicenseKey();
  const { promptAction } = useAppState();

  const startPromptCreation = useCallback(() => {
    setIsPromptCreationMode(true);
    plugins.forEach((plugin) => {
      plugin.onPromptingStart?.();
    });
  }, [plugins]);

  const stopPromptCreation = useCallback(() => {
    setIsPromptCreationMode(false);
    // setDomContextElements([]);
    // setSelectedDocs([]);
    // setSelectedBlocks([]);
    plugins.forEach((plugin) => {
      plugin.onPromptingAbort?.();
    });
  }, [plugins]);

  useEffect(() => {
    if (!isChatOpen) {
      stopPromptCreation();
    }
    // Note: We removed automatic startPromptCreation() when chat opens
    // Prompt creation should only start when user explicitly focuses input
  }, [isChatOpen, stopPromptCreation]);

  useEffect(() => {
    if (minimized) {
      stopPromptCreation();
    }
  }, [minimized]);

  // Auto-stop prompt creation when agent is busy
  useEffect(() => {
    const allowedStates = [
      AgentStateType.IDLE,
      AgentStateType.WAITING_FOR_USER_RESPONSE,
    ];

    if (
      isPromptCreationMode &&
      agentState.state &&
      !allowedStates.includes(agentState.state)
    ) {
      stopPromptCreation();
    }
  }, [agentState.state, isPromptCreationMode, stopPromptCreation]);

  const addChatDomContext = useCallback(
    (element: HTMLElement) => {
      const pluginsWithContextGetters = plugins.filter(
        (plugin) => plugin.onContextElementSelect,
      );

      setDomContextElements((prev) => [
        ...prev,
        {
          element,
          pluginContext: pluginsWithContextGetters.map((plugin) => ({
            pluginName: plugin.pluginName,
            context: plugin.onContextElementSelect?.(element),
          })),
        },
      ]);
    },
    [plugins],
  );

  const removeChatDomContext = useCallback((element: HTMLElement) => {
    setDomContextElements((prev) =>
      prev.filter((item) => item.element !== element),
    );
  }, []);

  const addChatDocsContext = useCallback((doc: DocsContextItem) => {
    setSelectedDocs((prev) => {
      // Check if doc already exists
      const exists = prev.some((existingDoc) => existingDoc.id === doc.id);
      if (exists) return prev;
      return [...prev, doc];
    });
  }, []);

  const removeChatDocsContext = useCallback((docId: string) => {
    setSelectedDocs((prev) => prev.filter((doc) => doc.id !== docId));
  }, []);

  const addChatBlocksContext = useCallback((block: BlocksContextItem) => {
    setSelectedBlocks((prev) => {
      // Check if block already exists
      const exists = prev.some(
        (existingBlock) => existingBlock.path === block.path,
      );
      if (exists) return prev;
      return [...prev, block];
    });
  }, []);

  const removeChatBlocksContext = useCallback((blockPath: string) => {
    setSelectedBlocks((prev) =>
      prev.filter((block) => block.path !== blockPath),
    );
  }, []);

  const sendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    setIsSending(true);

    try {
      // Generate the base for the user message
      // Prepare metadata with async block info processing
      const selectedElementsInfo = domContextElements.map((item) =>
        getSelectedElementInfo(item.element),
      );
      const selectedDocsInfo = selectedDocs.map((doc) =>
        getSelectedDocInfo(doc),
      );
      const selectedBlocksInfo = await Promise.all(
        selectedBlocks.map((block) => getSelectedBlockInfo(block, licenseKey)),
      );

      const metadata = collectUserMessageMetadata(
        selectedElementsInfo,
        selectedDocsInfo,
        selectedBlocksInfo,
        promptAction,
      );

      const baseUserMessage: UserMessage = {
        id: generateId(),
        createdAt: new Date(),
        contentItems: [
          {
            type: 'text',
            text: chatInput,
          },
        ],
        metadata,
        pluginContent: {},
        sentByPlugin: false,
      };

      const pluginProcessingPromises = plugins.map(async (plugin) => {
        const handlerResult = await plugin.onPromptSend?.(baseUserMessage);

        if (
          !handlerResult ||
          !handlerResult.contextSnippets ||
          handlerResult.contextSnippets.length === 0
        ) {
          return null;
        }

        const snippetPromises = handlerResult.contextSnippets.map(
          async (snippet) => {
            const resolvedContent =
              typeof snippet.content === 'string'
                ? snippet.content
                : await snippet.content();
            return {
              promptContextName: snippet.promptContextName,
              content: resolvedContent,
            };
          },
        );

        const resolvedSnippets = await Promise.all(snippetPromises);

        if (resolvedSnippets.length > 0) {
          const pluginSnippets: PluginContextSnippets = {
            pluginName: plugin.pluginName,
            contextSnippets: resolvedSnippets,
          };
          return pluginSnippets;
        }
        return null;
      });

      const allPluginContexts = await Promise.all(pluginProcessingPromises);

      const pluginContent: Record<
        string,
        Record<string, UserMessageContentItem>
      > = {};
      allPluginContexts.forEach((context) => {
        if (!context) return;
        pluginContent[context.pluginName] = {};
        context.contextSnippets.forEach((snippet) => {
          pluginContent[context.pluginName][snippet.promptContextName] = {
            type: 'text',
            text: `${snippet.content}`,
          };
        });
      });

      const userMessageInput: UserMessage = {
        ...baseUserMessage,
        pluginContent,
      };

      sendAgentMessage(userMessageInput);

      // Reset state after sending
      setChatInput('');
      setDomContextElements([]);
      setSelectedDocs([]);
      setSelectedBlocks([]);
      setIsPromptCreationMode(false);
    } finally {
      setIsSending(false);
    }
  }, [chatInput, domContextElements, plugins, sendAgentMessage]);

  const value: ChatContext = {
    chatInput,
    setChatInput,
    domContextElements,
    addChatDomContext,
    removeChatDomContext,
    selectedDocs,
    selectedBlocks,
    addChatDocsContext,
    removeChatDocsContext,
    addChatBlocksContext,
    removeChatBlocksContext,
    sendMessage,
    isPromptCreationActive: isPromptCreationMode,
    startPromptCreation,
    stopPromptCreation,
    isSending,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChatState() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return context;
}
