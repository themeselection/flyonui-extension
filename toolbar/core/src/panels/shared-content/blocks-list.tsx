import { searchComponents } from '@/hooks/use-component-search';
import { useLicenseKey } from '@/hooks/use-license-key';
import { cn } from '@/utils';
import { Loader } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface BlockItem {
  path: string;
  title: string;
  description: string;
  category: 'popular' | 'recent';
  name?: string;
}

interface BlocksListProps {
  searchQuery?: string;
  onBlockSelection?: (item: BlockItem) => void;
  onFocusReturn?: () => void;
  onFocusChange?: (isFocused: boolean, activeBlock?: BlockItem) => void;
  onCloseBlocks?: () => void;
  onReady?: () => void;
}

export interface BlocksListRef {
  focusOnBlocks: () => void;
  selectActiveBlock: () => boolean;
}

const RECENT_BLOCKS_KEY = 'toolbar-blocks-recent';

// Helper functions for localStorage
const getRecentBlocks = (): BlockItem[] => {
  try {
    const stored = localStorage.getItem(RECENT_BLOCKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addToRecentBlocks = (item: BlockItem) => {
  try {
    const recent = getRecentBlocks();
    // Remove if already exists
    const filtered = recent.filter((block) => block.path !== item.path);
    // Add to beginning with recent category
    const updatedRecent = [
      { ...item, category: 'recent' as const },
      ...filtered,
    ].slice(0, 5);
    localStorage.setItem(RECENT_BLOCKS_KEY, JSON.stringify(updatedRecent));
  } catch (error) {
    console.warn('Failed to save recent blocks:', error);
  }
};

export const BlocksList = forwardRef<BlocksListRef, BlocksListProps>(
  (
    {
      searchQuery,
      onBlockSelection,
      onFocusReturn,
      onFocusChange,
      onCloseBlocks,
      onReady,
    },
    ref,
  ) => {
    const { licenseKey } = useLicenseKey();
    const [recentBlocks, setRecentBlocks] = useState<BlockItem[]>([]);
    const [searchResults, setSearchResults] = useState<BlockItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Load recent blocks on mount
    useEffect(() => {
      setRecentBlocks(getRecentBlocks());
    }, []);

    // Search for blocks using the API
    useEffect(() => {
      if (!searchQuery?.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setSearchError(null);
        return;
      }

      const searchTimeout = setTimeout(async () => {
        setIsSearching(true);
        setSearchError(null);

        try {
          const query = searchQuery.trim().toLowerCase();

          // Step 1: Quick local search first
          const allSearchableBlocks = [...recentBlocks];
          const localResults = allSearchableBlocks.filter((block) => {
            const titleMatch =
              block.title?.toLowerCase().includes(query) || false;
            const descriptionMatch =
              block.description?.toLowerCase().includes(query) || false;
            const pathMatch =
              block.path?.toLowerCase().includes(query) || false;
            const nameMatch =
              block.name?.toLowerCase().includes(query) || false;

            return titleMatch || descriptionMatch || pathMatch || nameMatch;
          });

          // Show local results immediately
          setSearchResults(localResults);

          // Step 2: Try to fetch from FlyonUI API
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
                signal: AbortSignal.timeout(5000), // 5 second timeout
              },
            );

            if (response.ok) {
              const data = await response.json();

              // Use searchComponents to find matching blocks
              const searchResults = searchComponents(data, searchQuery.trim());

              // Convert search results to BlockItem format
              const apiResults: BlockItem[] = searchResults.map((item) => ({
                path: item.path,
                title: item.name || item.path.split('/').pop() || 'Unknown',
                description: item.description || `Component at ${item.path}`,
                category: 'popular' as const,
                name: item.name,
              }));

              // Combine local and API results, remove duplicates
              const combinedResults = [...localResults, ...apiResults];
              const uniqueResults = combinedResults.filter(
                (block, index, self) =>
                  index === self.findIndex((b) => b.path === block.path),
              );

              // Sort results: exact title matches first, then partial matches
              const sortedResults = uniqueResults.sort((a, b) => {
                const aExactTitle = a.title?.toLowerCase() === query;
                const bExactTitle = b.title?.toLowerCase() === query;

                if (aExactTitle && !bExactTitle) return -1;
                if (!aExactTitle && bExactTitle) return 1;

                const aTitleStarts = a.title?.toLowerCase().startsWith(query);
                const bTitleStarts = b.title?.toLowerCase().startsWith(query);

                if (aTitleStarts && !bTitleStarts) return -1;
                if (!aTitleStarts && bTitleStarts) return 1;

                return a.title?.localeCompare(b.title || '') || 0;
              });

              setSearchResults(sortedResults);
            }
          } catch (apiError) {
            // API failed, but we already have local results - no need to show error
            console.warn(
              'FlyonUI API search failed, using local results only:',
              apiError,
            );
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchError('Search failed');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce for API requests

      return () => clearTimeout(searchTimeout);
    }, [searchQuery, recentBlocks, licenseKey]);

    // Popular blocks (can be expanded based on usage patterns)
    const POPULAR_BLOCKS: BlockItem[] = [
      {
        path: '/components/button',
        title: 'Button',
        description: 'Interactive button component',
        category: 'popular',
        name: 'Button',
      },
      {
        path: '/components/input',
        title: 'Input',
        description: 'Text input field component',
        category: 'popular',
        name: 'Input',
      },
      {
        path: '/components/card',
        title: 'Card',
        description: 'Card container component',
        category: 'popular',
        name: 'Card',
      },
      // Add more popular blocks as needed
    ];

    // Combine popular and recent blocks (only when no search query)
    const allBlocks = useMemo(() => {
      // Recent blocks first, then popular (excluding duplicates)
      const recentPaths = new Set(recentBlocks.map((block) => block.path));
      const popularFiltered = POPULAR_BLOCKS.filter(
        (block) => !recentPaths.has(block.path),
      );
      return [...recentBlocks, ...popularFiltered];
    }, [recentBlocks]);

    // Use search results from API if searching, otherwise use local blocks
    const filteredBlocks = useMemo(() => {
      if (searchQuery?.trim()) {
        // When searching, use API results
        return searchResults;
      } else {
        // When no search, show local popular + recent blocks
        return allBlocks;
      }
    }, [searchQuery, searchResults, allBlocks]);

    // Keyboard navigation state
    const [activeIndex, setActiveIndex] = useState(-1);
    const [startIndex, setStartIndex] = useState(0); // Start of the visible window
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Show 3 blocks starting from startIndex (like bookmarks-list)
    const visibleBlocks = useMemo(() => {
      return filteredBlocks.slice(startIndex, startIndex + 3);
    }, [filteredBlocks, startIndex]);

    // Reset activeIndex when search results change
    useEffect(() => {
      if (activeIndex >= filteredBlocks.length && filteredBlocks.length > 0) {
        setActiveIndex(filteredBlocks.length - 1);
        setStartIndex(Math.max(0, filteredBlocks.length - 3));
      } else if (filteredBlocks.length === 0 && activeIndex !== -1) {
        setActiveIndex(-1);
        setStartIndex(0);
      }
    }, [filteredBlocks.length, activeIndex]);

    // Auto-select first item when blocks appear (regardless of focus state)
    useEffect(() => {
      if (filteredBlocks.length > 0 && activeIndex === -1) {
        setActiveIndex(0);
        setStartIndex(0);
      }
    }, [filteredBlocks.length, activeIndex]);

    // Note: Visual focus (activeIndex) persists even when keyboard focus (isFocused) is false
    // This enables the dual focus pattern where blocks remain visually focused while
    // allowing character input to flow to the textarea

    const activeBlock = useMemo(() => {
      // Visual focus persists even when keyboard focus is temporarily given to textarea
      // This enables the dual focus pattern where preview remains visible during character input
      if (activeIndex >= 0 && activeIndex < filteredBlocks.length) {
        return filteredBlocks[activeIndex];
      }
      return null;
    }, [activeIndex, filteredBlocks]);

    // Notify ready immediately
    useEffect(() => {
      onReady?.();
    }, [onReady]);

    const handleBlockSelection = useCallback(
      (item: BlockItem) => {
        // Add to recent blocks
        addToRecentBlocks(item);
        setRecentBlocks(getRecentBlocks());

        onBlockSelection?.(item);
        if (onCloseBlocks) {
          setTimeout(() => onCloseBlocks(), 100);
        }
      },
      [onBlockSelection, onCloseBlocks],
    );

    // Expose methods
    useImperativeHandle(
      ref,
      () => ({
        focusOnBlocks: () => {
          if (!isFocused) {
            setIsFocused(true);
            // CRITICAL: Don't reset activeIndex when re-focusing - maintain current selection
            // Only set activeIndex if no item is currently selected
            if (activeIndex === -1 && filteredBlocks.length > 0) {
              setActiveIndex(0);
              setStartIndex(0);
            }
            // NOTE: Don't call containerRef.current?.focus() here!
            // This would steal DOM focus from textarea and hide the cursor.
            // For dual focus, textarea keeps DOM focus (cursor) while blocks get logical focus (keyboard handling)
          }
        },
        selectActiveBlock: () => {
          if (
            isFocused &&
            activeIndex >= 0 &&
            activeIndex < filteredBlocks.length
          ) {
            const activeBlockItem = filteredBlocks[activeIndex];
            handleBlockSelection(activeBlockItem);
            return true;
          }
          return false;
        },
      }),
      [filteredBlocks, isFocused, activeIndex, handleBlockSelection],
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (!isFocused || filteredBlocks.length === 0) {
          return;
        }

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setActiveIndex((prev) => {
              const nextIndex = prev + 1;
              const newIndex =
                nextIndex < filteredBlocks.length ? nextIndex : 0;

              // Update startIndex to keep active element visible (like bookmarks-list)
              setStartIndex((currentStart) => {
                if (newIndex === 0) {
                  return 0; // Wrapped to beginning
                } else if (newIndex >= currentStart + 3) {
                  return Math.min(newIndex - 2, filteredBlocks.length - 3); // Scroll down
                }
                return currentStart;
              });

              return newIndex;
            });
            break;
          case 'ArrowUp':
            e.preventDefault();
            setActiveIndex((prev) => {
              const newIndex = prev > 0 ? prev - 1 : filteredBlocks.length - 1;

              // Update startIndex to keep active element visible (like bookmarks-list)
              setStartIndex((currentStart) => {
                if (newIndex === filteredBlocks.length - 1) {
                  return Math.max(0, filteredBlocks.length - 3); // Wrapped to end
                } else if (newIndex < currentStart) {
                  return Math.max(0, newIndex); // Scroll up
                }
                return currentStart;
              });

              return newIndex;
            });
            break;
          case 'Enter':
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < filteredBlocks.length) {
              const activeBlockItem = filteredBlocks[activeIndex];
              handleBlockSelection(activeBlockItem);
              setTimeout(() => {
                setIsFocused(false);
                setActiveIndex(-1);
                setStartIndex(0);
                if (onCloseBlocks) {
                  onCloseBlocks();
                }
                if (onFocusReturn) {
                  onFocusReturn();
                }
              }, 100);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsFocused(false);
            setActiveIndex(-1);
            setStartIndex(0);
            if (onFocusChange) {
              onFocusChange(false);
            }
            if (onFocusReturn) {
              onFocusReturn();
            }
            break;
          default:
            // THE KEY TO DUAL FOCUS: Character input and editing keys return to textarea
            if (
              (e.key.length === 1 && !e.ctrlKey && !e.metaKey) || // Regular characters
              e.key === 'Backspace' || // Backspace to edit
              e.key === 'Delete' || // Delete to edit
              (e.ctrlKey &&
                (e.key === 'a' ||
                  e.key === 'x' ||
                  e.key === 'c' ||
                  e.key === 'v')) || // Ctrl+A, Ctrl+X, Ctrl+C, Ctrl+V
              (e.metaKey &&
                (e.key === 'a' ||
                  e.key === 'x' ||
                  e.key === 'c' ||
                  e.key === 'v')) // Cmd+A, Cmd+X, Cmd+C, Cmd+V (Mac)
            ) {
              setIsFocused(false); // IMMEDIATELY stop handling events
              if (onFocusReturn) {
                onFocusReturn(); // Focus textarea
              }
              // NOTE: Key event continues propagating to textarea!
              // Do NOT reset activeIndex/startIndex - maintain visual focus
            }
            break;
        }
      },
      [
        isFocused,
        filteredBlocks.length,
        activeIndex,
        handleBlockSelection,
        onFocusReturn,
        onFocusChange,
        onCloseBlocks,
      ],
    );

    // Add keyboard listeners when focused
    useEffect(() => {
      if (isFocused) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [isFocused, handleKeyDown]);

    const handleContainerFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleContainerBlur = useCallback(() => {
      setTimeout(() => {
        // In dual focus mode, container doesn't get DOM focus, so this blur
        // should only reset focus state, not visual selection
        if (!containerRef.current?.contains(document.activeElement)) {
          setIsFocused(false);
          // Don't reset activeIndex here - visual focus should persist
          // Only explicit actions (Escape, selection, etc.) should reset it
        }
      }, 100);
    }, []);

    // Notify focus change
    useEffect(() => {
      onFocusChange?.(isFocused, activeBlock);
    }, [isFocused, activeBlock, onFocusChange]);

    return (
      <div
        ref={containerRef}
        tabIndex={-1}
        onFocus={handleContainerFocus}
        onBlur={handleContainerBlur}
        className="space-y-3 outline-none"
        role="listbox"
        aria-label="Blocks list"
      >
        {/* Preview */}
        {activeBlock && (
          <div className="flex justify-center">
            <div className="max-w-[280px] space-y-2 rounded-md border border-border bg-muted p-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">
                  {activeBlock.title}
                </span>
                {activeBlock.category === 'recent' && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-300">
                    Recent
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-muted-foreground text-xs">
                {activeBlock.description}
              </p>
            </div>
          </div>
        )}

        {isSearching ? (
          <div className="flex items-center justify-center p-4">
            <Loader className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-muted-foreground text-xs">
              Searching components...
            </span>
          </div>
        ) : searchError ? (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-2 text-destructive text-xs">
            Search error: {searchError}
          </div>
        ) : filteredBlocks.length > 0 ? (
          <div className="space-y-1">
            {/* Show category headers only for local blocks (when not searching) */}
            {!searchQuery?.trim() && (
              <>
                {/* Show Recent header only if there are visible recent blocks */}
                {visibleBlocks.some((block) => block.category === 'recent') && (
                  <div className="px-1 font-medium text-muted-foreground text-xs">
                    Recent
                  </div>
                )}
                {/* Show Popular header only if there are visible popular blocks */}
                {visibleBlocks.some(
                  (block) => block.category === 'popular',
                ) && (
                  <div
                    className={cn(
                      'px-1 font-medium text-muted-foreground text-xs',
                      visibleBlocks.some(
                        (block) => block.category === 'recent',
                      ) && 'mt-2',
                    )}
                  >
                    Popular
                  </div>
                )}
              </>
            )}

            {visibleBlocks.map((block, idx) => {
              // Visual focus indicator persists even during character input (dual focus pattern)
              const isItemFocused = activeIndex === startIndex + idx;
              return (
                <button
                  key={block.path}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md border p-2 text-left text-xs transition-colors',
                    isItemFocused
                      ? 'border-border bg-background ring-2 ring-muted-foreground'
                      : 'border-border bg-background hover:border-muted-foreground hover:bg-muted',
                  )}
                  onClick={() => handleBlockSelection(block)}
                >
                  <span className="truncate font-medium text-foreground">
                    {block.title}
                  </span>
                  {block.category === 'recent' && !searchQuery?.trim() && (
                    <span className="ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-300">
                      Recent
                    </span>
                  )}
                </button>
              );
            })}

            <div className="flex items-center justify-between px-1 py-1">
              {filteredBlocks.length > 0 && (
                <div className="text-muted-foreground text-xs">
                  {searchQuery?.trim() ? (
                    <>
                      Found {filteredBlocks.length} blocks •{' '}
                      {activeIndex >= 0 ? activeIndex + 1 : 1} of{' '}
                      {filteredBlocks.length}
                    </>
                  ) : (
                    <>
                      {activeIndex >= 0 ? activeIndex + 1 : 1} of{' '}
                      {filteredBlocks.length}
                    </>
                  )}
                </div>
              )}
              <div className="ml-auto text-primary text-xs">
                ↑↓ navigate • ⏎ select
              </div>
            </div>
          </div>
        ) : (
          <div className="px-1 py-2 text-muted-foreground text-xs">
            {searchQuery?.trim()
              ? `No components found for "${searchQuery}"`
              : 'No components found'}
          </div>
        )}
      </div>
    );
  },
);

BlocksList.displayName = 'BlocksList';
