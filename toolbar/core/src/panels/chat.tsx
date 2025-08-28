import { AgentMessageDisplay } from '@/components/agent-message-display';
import { BlocksOverlay } from '@/components/blocks-overlay';
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
import { useLicenseKey } from '@/hooks/use-license-key';
import { cn } from '@/utils';
import { Textarea } from '@headlessui/react';
import { AgentStateType } from '@stagewise/agent-interface/toolbar';
import {
  ArrowUpIcon,
  CheckIcon,
  CogIcon,
  Loader2Icon,
  MessageCircleQuestionIcon,
  XCircleIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AtMenu } from './shared-content/at-menu';
import type { DocsItem, DocsListRef } from './shared-content/docs-list';
import { DocsList } from './shared-content/docs-list';

import { searchComponents } from '@/hooks/use-component-search';

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
  const { licenseKey } = useLicenseKey();
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFinal, setDataFinal] = useState<any>(null);
  const [isBlocksOverlayOpen, setIsBlocksOverlayOpen] = useState(false);
  const { connected } = useAgents();

  // For docs State
  const [isDocsActivated, setIsDocsActivated] = useState(false);
  const [isDocsFocused, setIsDocsFocused] = useState(false);
  const [isDocsReady, setIsDocsReady] = useState(false);
  const docsListRef = useRef<DocsListRef>(null);

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
      }
    },
    [chatState],
  );

  // Show docs search when @mode is docs
  const shouldShowDocs = useMemo(() => {
    const result =
      atMode === 'docs' && chatState.chatInput.trim().startsWith('@');
    // Removed isPromptCreationActive requirement - docs should be available always
    console.log('shouldShowDocs debug:', {
      atMode,
      chatInput: chatState.chatInput,
      startsWithAt: chatState.chatInput.trim().startsWith('@'),
      isPromptCreationActive: chatState.isPromptCreationActive,
      result,
    });
    return result;
  }, [atMode, chatState.chatInput, chatState.isPromptCreationActive]);

  // Auto-focus on docs when they become visible
  useEffect(() => {
    if (shouldShowDocs && isDocsActivated) {
      docsListRef.current?.focusOnDocs();
    }
  }, [shouldShowDocs, isDocsActivated]);

  // Reset readiness when docs hidden or disabled
  useEffect(() => {
    if (!shouldShowDocs) {
      setIsDocsReady(false);
    }
  }, [shouldShowDocs]);

  // Reset docs activation when prompt creation is not active (commented out to allow docs without inspector mode)
  useEffect(() => {
    if (!chatState.isPromptCreationActive) {
      setIsDocsActivated(false);
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

  const handleDocSelection = useCallback(
    (doc: DocsItem) => {
      chatState.setChatInput(`@docs ${doc.title}`);
      setAtMode('docs');
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
    } else {
      // Check if user selected a specific mode
      const input = chatState.chatInput.toLowerCase();
      if (input.startsWith('@docs ')) {
        setAtMode('docs');
        setIsDocsActivated(true);
      } else if (input.startsWith('@blocks ')) {
        setAtMode('blocks');
        setIsDocsActivated(false);
      } else if (input === '@docs' || input === '@blocks') {
        // User typed exact mode but no space yet
        const mode = input.slice(1) as 'docs' | 'blocks';
        setAtMode(mode);
        if (mode === 'docs') {
          setIsDocsActivated(true);
        } else {
          setIsDocsActivated(false);
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
    return (
      enableInputField &&
      chatState.chatInput.trim().length > 2 &&
      chatState.isPromptCreationActive
    );
  }, [enableInputField, chatState]);

  const anyMessageInChat = useMemo(() => {
    return chatMessaging.agentMessage?.contentItems?.length > 0;
  }, [chatMessaging.agentMessage?.contentItems]);

  const handleSubmit = useCallback(() => {
    chatState.sendMessage();
    chatState.stopPromptCreation();
  }, [chatState]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault();
        if (shouldShowAtMenu) return;

        handleSubmit();
      } else if (e.key === 'Tab') {
        setIsLoading(true);
        e.preventDefault();
        try {
          const headers: Record<string, string> = {
            Accept: '*/*',
            'Content-Type': 'application/json',
          };

          // Add license key to headers if available
          if (licenseKey) {
            headers['x-license-key'] = licenseKey;
          }

          const response = await fetch(
            'https://flyonui.com/api/mcp/instructions?path=block_metadata.json',
            {
              headers,
            },
          );
          const data = await response.json();

          // Use currentTarget because it's correctly typed as HTMLTextAreaElement
          const searchResults = searchComponents(
            data,
            (e.target as HTMLTextAreaElement)?.value,
          );

          const responseFinal = await fetch(
            `https://flyonui.com/api/mcp${searchResults[0].path}?type=mcp`,
            {
              headers,
            },
          );

          const dataFinal = await responseFinal.json();
          setDataFinal(dataFinal);
          setIsLoading(false);

          // Open the blocks overlay
          if (dataFinal?.blocks?.length > 0) {
            setIsBlocksOverlayOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch from API:', error);
          setIsLoading(false);
        }
      }
    },
    [handleSubmit, isComposing, licenseKey],
  );

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  const handleBlockSelect = useCallback(
    (block: any) => {
      console.log('Selected block:', block);
      // You can handle the selected block here (e.g., insert it into the chat input)
      const currentInput = chatState.chatInput;
      const newInput = `${currentInput}\n\nSelected component: ${block.title}\nPath: ${block.path}`;
      chatState.setChatInput(newInput);
    },
    [chatState],
  );

  const handleCloseBlocksOverlay = useCallback(() => {
    setIsBlocksOverlayOpen(false);
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

  const handleDocsFocusChange = useCallback((isFocused: boolean) => {
    setIsDocsFocused(isFocused);
  }, []);

  /* If the user clicks on prompt creation mode, we force-focus the input field all the time. */
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isIntentionallyStoppingRef = useRef<boolean>(false);

  useEffect(() => {
    const blurHandler = () => {
      // Don't refocus if we're intentionally stopping prompt creation
      if (isIntentionallyStoppingRef.current) {
        isIntentionallyStoppingRef.current = false;
        return;
      }
      inputRef.current?.focus();
    };

    if (chatState.isPromptCreationActive && enableInputField) {
      inputRef.current?.focus();
      // We only force re-focus if the prompt creation is active.
      inputRef.current?.addEventListener('blur', blurHandler);
      isIntentionallyStoppingRef.current = false;
    } else {
      // When stopping prompt creation, set the flag to prevent refocus
      if (inputRef.current === document.activeElement) {
        isIntentionallyStoppingRef.current = true;
      }
      inputRef.current?.blur();
    }

    return () => {
      inputRef.current?.removeEventListener('blur', blurHandler);
    };
  }, [chatState.isPromptCreationActive, enableInputField]);

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
          anyMessageInChat ? 'h-24' : 'h-48',
          !anyMessageInChat &&
            agentState.state === AgentStateType.IDLE &&
            'rounded-t-[inherit] border-transparent border-t-none pt-3 pl-3',
        )}
      >
        <ContextElementsChips />
        <div className="flex h-full flex-col">
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
              placeholder={isLoading ? 'Loading components...' : undefined}
            />

            <div className="pointer-events-none absolute inset-0 z-10 p-1">
              <TextSlideshow
                className={cn(
                  'text-foreground/40 text-sm',
                  chatState.chatInput.length !== 0 && 'opacity-0',
                )}
                texts={[
                  'Try: Add a new button into the top right corner',
                  'Try: Convert these cards into accordions',
                  'Try: Add a gradient to the background',
                ]}
              />
            </div>

            {/* @ Menu */}
            {shouldShowAtMenu && (
              <div className="pointer-events-auto absolute right-0 bottom-full left-0 z-50 mb-8">
                <AtMenu
                  onSelect={handleAtMenuSelect}
                  onFocusReturn={handleAtMenuFocusReturn}
                  searchQuery={atSearchQuery}
                />
              </div>
            )}

            {/* Docs List - positioned above chat input */}
            {shouldShowDocs && isDocsActivated && (
              <div className="absolute right-0 bottom-full left-0 z-50 mb-8">
                <DocsList
                  ref={docsListRef}
                  searchQuery={docsSearchQuery}
                  onDocSelection={handleDocSelection}
                  onFocusReturn={handleFocusReturn}
                  onFocusChange={handleDocsFocusChange}
                  onCloseDocs={handleCloseDocs}
                  onReady={() => setIsDocsReady(true)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              disabled={!canSendMessage}
              onClick={handleSubmit}
              glassy
              variant="primary"
              className="size-8 cursor-pointer rounded-full p-1"
            >
              <ArrowUpIcon className="size-4 stroke-3" />
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

      {/* Blocks Overlay */}
      <BlocksOverlay
        isOpen={isBlocksOverlayOpen}
        onClose={handleCloseBlocksOverlay}
        blocks={dataFinal?.blocks || []}
        onBlockSelect={handleBlockSelect}
      />
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
