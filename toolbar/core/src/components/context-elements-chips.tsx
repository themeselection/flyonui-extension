import {
  useChatState,
  type BlocksContextItem,
  type DocsContextItem,
} from '@/hooks/use-chat-state';
import { useContextChipHover } from '@/hooks/use-context-chip-hover';
import { cn } from '@/utils';
import { BookOpenIcon, ComponentIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';

export function ContextElementsChips() {
  const {
    domContextElements,
    removeChatDomContext,
    selectedDocs,
    selectedBlocks,
    removeChatDocsContext,
    removeChatBlocksContext,
  } = useChatState();
  const { setHoveredElement } = useContextChipHover();

  if (
    domContextElements.length === 0 &&
    selectedDocs.length === 0 &&
    selectedBlocks.length === 0
  ) {
    return null;
  }

  return (
    <div className="mb-1.5 min-h-0">
      <div className="scrollbar-thin flex max-h-8 gap-2 overflow-x-auto overflow-y-hidden pb-1">
        {/* DOM Element Chips */}
        {domContextElements.map((contextElement, index) => (
          <ContextElementChip
            key={`dom-${contextElement.element.tagName}-${index}`}
            element={contextElement.element}
            pluginContext={contextElement.pluginContext}
            onDelete={() => removeChatDomContext(contextElement.element)}
            onHover={setHoveredElement}
            onUnhover={() => setHoveredElement(null)}
          />
        ))}

        {/* Docs Chips */}
        {selectedDocs.map((doc) => (
          <DocsChip
            key={`docs-${doc.id}`}
            doc={doc}
            onDelete={() => removeChatDocsContext(doc.id)}
          />
        ))}

        {/* Blocks Chips */}
        {selectedBlocks.map((block) => (
          <BlocksChip
            key={`blocks-${block.path}`}
            block={block}
            onDelete={() => removeChatBlocksContext(block.path)}
          />
        ))}
      </div>
    </div>
  );
}

interface ContextElementChipProps {
  element: HTMLElement;
  pluginContext: {
    pluginName: string;
    context: any;
  }[];
  onDelete: () => void;
  onHover: (element: HTMLElement) => void;
  onUnhover: () => void;
}

function ContextElementChip({
  element,
  pluginContext,
  onDelete,
  onHover,
  onUnhover,
}: ContextElementChipProps) {
  const chipLabel = useMemo(() => {
    // First try to get label from plugin context
    const firstAnnotation = pluginContext.find(
      (plugin) => plugin.context?.annotation,
    )?.context?.annotation;

    if (firstAnnotation) {
      return firstAnnotation;
    }

    // Fallback to element tag name
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    return `${tagName}${id}`;
  }, [element, pluginContext]);

  return (
    <button
      type="button"
      tabIndex={-1}
      className={cn(
        'flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-border/20 bg-white/10 px-2 py-1 text-xs transition-all hover:border-border/40 hover:bg-white/20',
      )}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onUnhover()}
    >
      <span className="max-w-24 truncate font-medium text-foreground/80">
        {chipLabel}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-muted-foreground transition-colors hover:text-red-500"
      >
        <XIcon className="size-3" />
      </button>
    </button>
  );
}

interface DocsChipProps {
  doc: DocsContextItem;
  onDelete: () => void;
}

function DocsChip({ doc, onDelete }: DocsChipProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={cn(
        'flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-blue-200/40 bg-blue-50/50 px-2 py-1 text-xs transition-all hover:border-blue-300/60 hover:bg-blue-100/70 dark:border-blue-800/40 dark:bg-blue-950/50 dark:hover:border-blue-700/60 dark:hover:bg-blue-900/70',
      )}
    >
      <BookOpenIcon className="size-3 text-blue-600 dark:text-blue-400" />
      <span className="max-w-24 truncate font-medium text-blue-800 dark:text-blue-200">
        {doc.title}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-blue-500 transition-colors hover:text-red-500 dark:text-blue-400"
      >
        <XIcon className="size-3" />
      </button>
    </button>
  );
}

interface BlocksChipProps {
  block: BlocksContextItem;
  onDelete: () => void;
}

function BlocksChip({ block, onDelete }: BlocksChipProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={cn(
        'flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-green-200/40 bg-green-50/50 px-2 py-1 text-xs transition-all hover:border-green-300/60 hover:bg-green-100/70 dark:border-green-800/40 dark:bg-green-950/50 dark:hover:border-green-700/60 dark:hover:bg-green-900/70',
      )}
    >
      <ComponentIcon className="size-3 text-green-600 dark:text-green-400" />
      <span className="max-w-24 truncate font-medium text-green-800 dark:text-green-200">
        {block.title}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-green-500 transition-colors hover:text-red-500 dark:text-green-400"
      >
        <XIcon className="size-3" />
      </button>
    </button>
  );
}
