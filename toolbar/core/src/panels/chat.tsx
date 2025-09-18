import { AgentMessageDisplay } from '@/components/agent-message-display';
import { ContextElementsChips } from '@/components/context-elements-chips';
import { Button } from '@/components/ui/button';
import {
  GradientBackgroundChat,
  type GradientBackgroundVariant,
} from '@/components/ui/gradient-background-chat';
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from '@/components/ui/panel';
import { TextSlideshow } from '@/components/ui/text-slideshow';
import { useAgentMessaging } from '@/hooks/agent/use-agent-messaging';
import { useAgents } from '@/hooks/agent/use-agent-provider';
import { useAgentState } from '@/hooks/agent/use-agent-state';
import { useChatState } from '@/hooks/use-chat-state';
import { cn } from '@/utils';
import { Textarea } from '@headlessui/react';
import { AgentStateType } from '@stagewise/agent-interface/toolbar';
import {
  CheckIcon,
  CogIcon,
  Loader2Icon,
  MessageCircleQuestionIcon,
  XCircleIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AtMenu } from './shared-content/at-menu';
import type { BlockItem, BlocksListRef } from './shared-content/blocks-list';
import { BlocksList } from './shared-content/blocks-list';
import type { DocsItem, DocsListRef } from './shared-content/docs-list';
import { DocsList } from './shared-content/docs-list';

const agentStateToText: Record<AgentStateType, string> = {
  [AgentStateType.WAITING_FOR_USER_RESPONSE]: 'Waiting for user response',
  [AgentStateType.IDLE]: '',
  [AgentStateType.THINKING]: 'Thinking',
  [AgentStateType.FAILED]: 'Failed',
  [AgentStateType.COMPLETED]: 'Completed',
  [AgentStateType.WORKING]: 'Working',
  [AgentStateType.CALLING_TOOL]: 'Calling tool',
};

const agentStateToIcon: Record<AgentStateType, React.ReactNode> = {
  [AgentStateType.WAITING_FOR_USER_RESPONSE]: (
    <MessageCircleQuestionIcon className="size-6" />
  ),
  [AgentStateType.IDLE]: <></>,
  [AgentStateType.THINKING]: (
    <Loader2Icon className="size-6 animate-spin stroke-violet-600" />
  ),
  [AgentStateType.FAILED]: <XCircleIcon className="size-6 stroke-rose-600" />,
  [AgentStateType.COMPLETED]: <CheckIcon className="size-6 stroke-green-600" />,
  [AgentStateType.WORKING]: (
    <Loader2Icon className="size-6 animate-spin stroke-blue-600" />
  ),
  [AgentStateType.CALLING_TOOL]: (
    <CogIcon className="size-6 animate-spin stroke-fuchsia-700" />
  ),
};

export function ChatPanel() {
  const agentState = useAgentState();
  const chatState = useChatState();
  const chatMessaging = useAgentMessaging();
  const [isComposing, setIsComposing] = useState(false);
  const { connected } = useAgents();

  // For docs State
  const [isDocsActivated, setIsDocsActivated] = useState(false);
  const [isDocsFocused, setIsDocsFocused] = useState(false);
  const docsListRef = useRef<DocsListRef>(null);

  // For blocks State
  const [isBlocksActivated, setIsBlocksActivated] = useState(false);
  const [isBlocksFocused, setIsBlocksFocused] = useState(false);
  const blocksListRef = useRef<BlocksListRef>(null);

  // @ mention mode state (docs, blocks, etc.)
  const [atMode, setAtMode] = useState<'docs' | 'blocks' | null>(null);

  // Extract search query from @ input
  const atSearchQuery = useMemo(() => {
    if (!chatState.chatInput.startsWith('@')) return '';
    return chatState.chatInput.slice(1).trim();
  }, [chatState.chatInput]);

  // Handle @ menu selection
  const handleAtMenuSelect = useCallback(
    (type: 'docs' | 'blocks') => {
      setAtMode(type);
      // Replace @ with the selected mode prefix and add a space for further input
      chatState.setChatInput(`@${type} `);

      // Activate docs when docs is selected
      if (type === 'docs') {
        setIsDocsActivated(true);
      } else if (type === 'blocks') {
        setIsBlocksActivated(true);
      }
    },
    [chatState],
  );

  // Show docs search when @mode is docs
  const shouldShowDocs = useMemo(() => {
    const result =
      atMode === 'docs' && chatState.chatInput.trim().startsWith('@');
    return result;
  }, [atMode, chatState.chatInput]);

  // Show blocks search when @mode is blocks
  const shouldShowBlocks = useMemo(() => {
    const result =
      atMode === 'blocks' && chatState.chatInput.trim().startsWith('@');
    return result;
  }, [atMode, chatState.chatInput]);

  // Auto-focus on docs when they become visible
  useEffect(() => {
    if (shouldShowDocs && isDocsActivated) {
      docsListRef.current?.focusOnDocs();
    }
  }, [shouldShowDocs, isDocsActivated]);

  // Auto-focus on blocks when they become visible
  useEffect(() => {
    if (shouldShowBlocks && isBlocksActivated) {
      blocksListRef.current?.focusOnBlocks();
    }
  }, [shouldShowBlocks, isBlocksActivated]);

  // Reset readiness when docs hidden or disabled
  useEffect(() => {
    // Docs reset logic (if needed later)
  }, [shouldShowDocs]);

  // Reset readiness when blocks hidden or disabled
  useEffect(() => {
    // Blocks reset logic (if needed later)
  }, [shouldShowBlocks]);

  // Reset docs activation when prompt creation is not active (commented out to allow docs without inspector mode)
  useEffect(() => {
    if (!chatState.isPromptCreationActive) {
      setIsDocsActivated(false);
      setIsBlocksActivated(false);
    }
  }, [chatState.isPromptCreationActive]);

  const docsSearchQuery = useMemo(() => {
    if (!shouldShowDocs) return '';
    const input = chatState.chatInput.trim();
    if (input.startsWith('@docs ')) {
      return input.slice(6).trim();
    } else if (input === '@docs') {
      return '';
    }
    return '';
  }, [shouldShowDocs, chatState.chatInput]);

  const blocksSearchQuery = useMemo(() => {
    if (!shouldShowBlocks) return '';
    const input = chatState.chatInput.trim();
    if (input.startsWith('@blocks ')) {
      return input.slice(8).trim();
    } else if (input === '@blocks') {
      return '';
    }
    return '';
  }, [shouldShowBlocks, chatState.chatInput]);

  const handleDocSelection = useCallback(
    (doc: DocsItem) => {
      // Add doc to chat context
      chatState.addChatDocsContext({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        code: '',
        install_command: `// Documentation ${doc.title}`,
      });

      // Clear the @docs input and reset mode
      chatState.setChatInput('');
      setAtMode(null);
      setIsDocsActivated(false);
    },
    [chatState],
  );

  const handleBlockSelection = useCallback(
    (block: BlockItem) => {
      // Add block to chat context
      chatState.addChatBlocksContext({
        path: block.path,
        title: block.title,
        description: block.description,
        category: block.category,
      });

      // Clear the @blocks input and reset mode
      chatState.setChatInput('');
      setAtMode(null);
      setIsBlocksActivated(false);
    },
    [chatState],
  );

  // Handle @ menu focus return
  const handleAtMenuFocusReturn = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Reset atMode when input no longer starts with "@" or when switching modes
  useEffect(() => {
    if (!chatState.chatInput.startsWith('@')) {
      setAtMode(null);
      setIsDocsActivated(false);
      setIsBlocksActivated(false);
    } else {
      // Check if user selected a specific mode
      const input = chatState.chatInput.toLowerCase();
      if (input.startsWith('@docs ')) {
        setAtMode('docs');
        setIsDocsActivated(true);
        setIsBlocksActivated(false);
      } else if (input.startsWith('@blocks ')) {
        setAtMode('blocks');
        setIsDocsActivated(false);
        setIsBlocksActivated(true);
      } else if (input === '@docs' || input === '@blocks') {
        // User typed exact mode but no space yet
        const mode = input.slice(1) as 'docs' | 'blocks';
        setAtMode(mode);
        if (mode === 'docs') {
          setIsDocsActivated(true);
          setIsBlocksActivated(false);
        } else {
          setIsDocsActivated(false);
          setIsBlocksActivated(true);
        }
      }
    }
  }, [chatState.chatInput]);

  const enableInputField = useMemo(() => {
    // Disable input if agent is not connected
    if (!connected) {
      return false;
    }
    return (
      agentState.state === AgentStateType.WAITING_FOR_USER_RESPONSE ||
      agentState.state === AgentStateType.IDLE
    );
  }, [agentState.state, connected]);

  // Show At-menu when user just typed "@" and no specific mode selected yet
  const shouldShowAtMenu = useMemo(() => {
    const input = chatState.chatInput.trim();
    const result =
      input.startsWith('@') &&
      !input.startsWith('@docs ') &&
      !input.startsWith('@blocks ') &&
      input !== '@docs' &&
      input !== '@blocks' &&
      enableInputField && // Check if input is enabled instead of prompt creation mode
      atMode === null;
    return result;
  }, [chatState.chatInput, enableInputField, atMode]);

  const canSendMessage = useMemo(() => {
    return enableInputField && chatState.chatInput.trim().length > 2;
  }, [enableInputField, chatState]);

  const anyMessageInChat = useMemo(() => {
    return chatMessaging.agentMessage?.contentItems?.length > 0;
  }, [chatMessaging.agentMessage?.contentItems]);

  const handleSubmit = useCallback(() => {
    if (docsListRef.current && (isDocsActivated || isDocsFocused)) {
      if (isDocsActivated && !isDocsFocused) {
        docsListRef.current.focusOnDocs();
      }

      const success = docsListRef.current.selectActiveDoc();
      if (success) {
        setTimeout(() => handleFocusReturn(), 100);
        return;
      }
    }

    if (blocksListRef.current && (isBlocksActivated || isBlocksFocused)) {
      if (isBlocksActivated && !isBlocksFocused) {
        blocksListRef.current.focusOnBlocks();
      }

      const success = blocksListRef.current.selectActiveBlock();
      if (success) {
        setTimeout(() => handleFocusReturn(), 100);
        return;
      }
    }

    chatState.sendMessage();
    chatState.stopPromptCreation();
  }, [chatState, isDocsFocused, isBlocksFocused]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault();
        if (shouldShowAtMenu) return;

        handleSubmit();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // CRITICAL: Re-activate docs focus when arrow keys are pressed and docs are visible
        // This completes the dual focus pattern - allows seamless switching between typing and navigation
        if (shouldShowDocs && isDocsActivated && !isDocsFocused) {
          e.preventDefault();
          docsListRef.current?.focusOnDocs();
        }
        // CRITICAL: Re-activate blocks focus when arrow keys are pressed and blocks are visible
        if (shouldShowBlocks && isBlocksActivated && !isBlocksFocused) {
          e.preventDefault();
          blocksListRef.current?.focusOnBlocks();
        }
      }
    },
    [
      handleSubmit,
      isComposing,
      shouldShowDocs,
      shouldShowBlocks,
      isDocsActivated,
      isBlocksActivated,
      isDocsFocused,
      isBlocksFocused,
      docsListRef,
      blocksListRef,
    ],
  );

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  const handleFocusReturn = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleCloseDocs = useCallback(() => {
    setIsDocsFocused(false);
    setIsDocsActivated(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleCloseBlocks = useCallback(() => {
    setIsBlocksFocused(false);
    setIsBlocksActivated(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleDocsFocusChange = useCallback((isFocused: boolean) => {
    setIsDocsFocused(isFocused);
  }, []);

  const handleBlocksFocusChange = useCallback((isFocused: boolean) => {
    setIsBlocksFocused(isFocused);
  }, []);

  /* If the user clicks on prompt creation mode, we force-focus the input field all the time. */
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Panel
      className={cn(
        anyMessageInChat
          ? 'h-[35vh] max-h-[50vh] min-h-[20vh]'
          : '!h-[calc-size(auto,size)] h-auto min-h-0',
      )}
    >
      <PanelHeader
        className={cn(
          'mb-0 origin-bottom transition-all duration-300 ease-out',
          agentState.state !== AgentStateType.IDLE
            ? '!h-[calc-size(auto,size)] h-auto'
            : 'h-0 scale-x-75 scale-y-0 p-0 opacity-0 blur-md',
        )}
        title={
          <span className="text-base">
            {agentStateToText[agentState.state]}
          </span>
        }
        description={
          agentState.description && (
            <span className="text-sm">{agentState.description}</span>
          )
        }
        iconArea={
          <div className="flex size-8 items-center justify-center">
            {Object.values(AgentStateType).map((state) => (
              <StateIcon key={state} shouldRender={agentState.state === state}>
                {agentStateToIcon[state]}
              </StateIcon>
            ))}
          </div>
        }
        actionArea={
          <>
            <div className="-z-10 pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-50">
              <GradientBackgroundChat
                className="size-full"
                currentVariant={agentState.state}
                variants={GradientBackgroundVariants}
                transparent={agentState.state === AgentStateType.IDLE}
              />
            </div>
            {/* This area can be used to clean chats, etc. But this will come later...
            <div className="flex flex-row-reverse gap-1">
              <Button
                variant="secondary"
                glassy
                className="size-8 rounded-full p-1"
              >
                <BrushCleaningIcon className="size-4" />
              </Button>
              <Button
                variant="secondary"
                glassy
                className="size-8 rounded-full p-1"
              >
                <ListIcon className="size-4" />
              </Button>
            </div>
            */}
          </>
        }
      />
      <PanelContent
        className={cn(
          'flex basis-[initial] flex-col gap-0 px-1 py-0',
          anyMessageInChat ? '!h-[calc-size(auto,size)] h-auto flex-1' : 'h-0',
          agentState.state === AgentStateType.IDLE
            ? 'rounded-t-[inherit]'
            : 'rounded-t-none',
          'mask-alpha mask-[linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]',
          'overflow-hidden',
        )}
      >
        {/* This are renders the output of the agent as markdown and makes it scrollable if necessary. */}
        <AgentMessageDisplay />
      </PanelContent>
      <PanelFooter
        className={cn(
          'mt-0 origin-top px-2 pt-1 pb-2 duration-150 ease-out',
          !enableInputField && 'pointer-events-none opacity-80 brightness-75',
          chatState.isPromptCreationActive && 'bg-red-400/10',
          anyMessageInChat ? 'h-32' : 'h-36',
          !anyMessageInChat &&
            agentState.state === AgentStateType.IDLE &&
            'rounded-t-[inherit] border-transparent border-t-none pt-3 pl-3',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Context chips container with fixed height and overflow handling */}
          <div className="max-h-8 min-h-0 flex-shrink-0 overflow-hidden">
            <ContextElementsChips />
          </div>
          <div className="relative h-full flex-1">
            <Textarea
              ref={inputRef}
              value={chatState.chatInput}
              onChange={(e) => {
                chatState.setChatInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              disabled={!enableInputField}
              className="m-1 h-full w-full resize-none focus:outline-none"
            />

            <div className="pointer-events-none absolute inset-0 z-10 p-1">
              <TextSlideshow
                className={cn(
                  'text-foreground/40 text-sm',
                  chatState.chatInput.length !== 0 && 'opacity-0',
                )}
                texts={['Write something or type "@" for more options...']}
              />
            </div>

            {/* @ Menu */}
            {shouldShowAtMenu && (
              <div
                className={cn(
                  'pointer-events-auto absolute right-0 bottom-full left-0 z-50',
                  // Adjust margin based on whether context chips are present
                  chatState.domContextElements.length > 0 ||
                    chatState.selectedDocs.length > 0 ||
                    chatState.selectedBlocks.length > 0
                    ? 'mb-16' // Increased margin when context chips are present
                    : 'mb-8', // Normal margin when no context chips
                )}
              >
                <AtMenu
                  onSelect={handleAtMenuSelect}
                  onFocusReturn={handleAtMenuFocusReturn}
                  searchQuery={atSearchQuery}
                />
              </div>
            )}

            {/* Docs List - positioned above chat input */}
            {shouldShowDocs && isDocsActivated && (
              <div
                className={cn(
                  'absolute right-0 bottom-full left-0 z-50',
                  // Adjust margin based on whether context chips are present
                  chatState.domContextElements.length > 0 ||
                    chatState.selectedDocs.length > 0 ||
                    chatState.selectedBlocks.length > 0
                    ? 'mb-16' // Increased margin when context chips are present
                    : 'mb-8', // Normal margin when no context chips
                )}
              >
                <DocsList
                  ref={docsListRef}
                  searchQuery={docsSearchQuery}
                  onDocSelection={handleDocSelection}
                  onFocusReturn={handleFocusReturn}
                  onFocusChange={handleDocsFocusChange}
                  onCloseDocs={handleCloseDocs}
                  onReady={() => {
                    /* docs ready */
                  }}
                />
              </div>
            )}

            {/* Blocks List - positioned above chat input */}
            {shouldShowBlocks && isBlocksActivated && (
              <div
                className={cn(
                  'absolute right-0 bottom-full left-0 z-50',
                  // Adjust margin based on whether context chips are present
                  chatState.domContextElements.length > 0 ||
                    chatState.selectedDocs.length > 0 ||
                    chatState.selectedBlocks.length > 0
                    ? 'mb-16' // Increased margin when context chips are present
                    : 'mb-8', // Normal margin when no context chips
                )}
              >
                <BlocksList
                  ref={blocksListRef}
                  searchQuery={blocksSearchQuery}
                  onBlockSelection={handleBlockSelection}
                  onFocusReturn={handleFocusReturn}
                  onFocusChange={handleBlocksFocusChange}
                  onCloseBlocks={handleCloseBlocks}
                  onReady={() => {
                    /* blocks ready */
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              disabled={!canSendMessage}
              onClick={handleSubmit}
              size="sm"
              variant="primary"
              className="cursor-pointer rounded-xl p-2"
            >
              Send to {connected ? connected.name : 'Agent'}
            </Button>

            <Button
              onClick={() =>
                chatState.isPromptCreationActive
                  ? chatState.stopPromptCreation()
                  : chatState.startPromptCreation()
              }
              size="sm"
              variant="outline"
            >
              {chatState.isPromptCreationActive ? 'Close' : 'Open'} Inspector
            </Button>
          </div>
        </div>
      </PanelFooter>
    </Panel>
  );
}

const StateIcon = ({
  children,
  shouldRender,
}: {
  children: React.ReactNode;
  shouldRender: boolean;
}) => {
  return (
    <div
      className={cn(
        'absolute origin-center transition-all duration-500 ease-spring-soft',
        shouldRender ? 'scale-100' : 'scale-0 opacity-0 blur-md',
      )}
    >
      {children}
    </div>
  );
};

const GradientBackgroundVariants: Record<
  AgentStateType,
  GradientBackgroundVariant
> = {
  [AgentStateType.WAITING_FOR_USER_RESPONSE]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-blue-200)',
    colors: [
      'var(--color-blue-200)',
      'var(--color-indigo-400)',
      'var(--color-sky-100)',
      'var(--color-cyan-200)',
    ],
  },
  [AgentStateType.IDLE]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-white/0)',
    colors: [
      'var(--color-white/0)',
      'var(--color-white/0)',
      'var(--color-white/0)',
      'var(--color-white/0)',
    ],
  },
  [AgentStateType.THINKING]: {
    activeSpeed: 'medium',
    backgroundColor: 'var(--color-blue-400)',
    colors: [
      'var(--color-orange-300)',
      'var(--color-teal-300)',
      'var(--color-fuchsia-400)',
      'var(--color-indigo-200)',
    ],
  },
  [AgentStateType.WORKING]: {
    activeSpeed: 'medium',
    backgroundColor: 'var(--color-indigo-400)',
    colors: [
      'var(--color-sky-300)',
      'var(--color-teal-500)',
      'var(--color-violet-400)',
      'var(--color-indigo-200)',
    ],
  },
  [AgentStateType.CALLING_TOOL]: {
    activeSpeed: 'fast',
    backgroundColor: 'var(--color-fuchsia-400)',
    colors: [
      'var(--color-fuchsia-400)',
      'var(--color-violet-400)',
      'var(--color-indigo-500)',
      'var(--color-purple-200)',
    ],
  },
  [AgentStateType.FAILED]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-red-200)',
    colors: [
      'var(--color-red-100)',
      'var(--color-rose-300)',
      'var(--color-fuchsia-400)',
      'var(--color-indigo-300)',
    ],
  },
  [AgentStateType.COMPLETED]: {
    activeSpeed: 'slow',
    backgroundColor: 'var(--color-green-400)',
    colors: [
      'var(--color-green-300)',
      'var(--color-teal-400)',
      'var(--color-emerald-500)',
      'var(--color-lime-200)',
    ],
  },
};
