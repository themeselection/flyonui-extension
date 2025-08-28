import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Block {
  path: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

interface BlocksOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  onBlockSelect?: (block: Block) => void;
}

export function BlocksOverlay({
  isOpen,
  onClose,
  blocks,
  onBlockSelect,
}: BlocksOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset selected index when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      itemRefs.current = itemRefs.current.slice(0, blocks.length);
    }
  }, [isOpen, blocks.length]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = itemRefs.current[selectedIndex];
    if (selectedElement && scrollContainerRef.current) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || blocks.length === 0) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(blocks.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (onBlockSelect && blocks[selectedIndex]) {
            onBlockSelect(blocks[selectedIndex]);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedIndex(blocks.length - 1);
          break;
      }
    },
    [isOpen, blocks, selectedIndex, onBlockSelect, onClose],
  );

  const handleBlockClick = useCallback(
    (block: Block, index: number) => {
      setSelectedIndex(index);
      if (onBlockSelect) {
        onBlockSelect(block);
        onClose();
      }
    },
    [onBlockSelect, onClose],
  );

  if (!isOpen || blocks.length === 0) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-x-0 top-0 flex w-screen justify-center p-4">
        <DialogPanel className="mx-auto flex h-[60vh] max-h-[500px] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-gray-200 border-b px-4 py-3 dark:border-gray-700">
            <div>
              <DialogTitle className="font-medium text-base text-foreground">
                Select Component
              </DialogTitle>
              <Description className="text-foreground/60 text-sm">
                {blocks.length} components available
              </Description>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 rounded-full p-1"
            >
              <XIcon className="size-4" />
            </Button>
          </div>

          {/* Single column - scrollable list */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
            <div className="space-y-1 p-3">
              {blocks.map((block, index) => (
                <button
                  type="button"
                  key={`${block.path}-${index}`}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => handleBlockClick(block, index)}
                  className={cn(
                    'w-full cursor-pointer rounded-md px-3 py-2.5 text-left transition-colors',
                    index === selectedIndex
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                  )}
                >
                  <div className="font-medium text-sm">{block.title}</div>
                  <div className="flex items-center gap-2 text-foreground/60 text-xs">
                    {block.category && (
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-600">
                        {block.category}
                      </span>
                    )}
                    <span className="truncate font-mono">{block.path}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="border-gray-200 border-t px-4 py-2 dark:border-gray-700">
            <div className="flex items-center justify-between text-foreground/60 text-xs">
              <div className="flex gap-3">
                <span>
                  <kbd className="rounded border bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-700">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span>
                  <kbd className="rounded border bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-700">
                    Enter
                  </kbd>{' '}
                  Select
                </span>
                <span>
                  <kbd className="rounded border bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-700">
                    Esc
                  </kbd>{' '}
                  Close
                </span>
              </div>
              <span>
                {selectedIndex + 1} of {blocks.length}
              </span>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
