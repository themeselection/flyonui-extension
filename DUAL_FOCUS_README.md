# Dual Focus Pattern Implementation

## Overview

The Dual Focus Pattern is an advanced UX design that allows users to seamlessly switch between typing in a textarea and navigating documentation/components with arrow keys, while maintaining visual feedback and cursor visibility throughout the interaction.

## Core Concept

**Dual Focus** separates two types of focus:

- **DOM Focus**: Where the browser cursor appears (always stays in textarea)
- **Logical Focus**: Which component handles keyboard events (switches between textarea and docs)

This enables users to:

1. Type naturally in the textarea (cursor visible, text input works)
2. Navigate docs with arrow keys (visual selection changes)
3. Return to typing instantly by pressing any character key

## Architecture

### Key Components

#### 1. DocsList Component (`docs-list.tsx`)

Main documentation search and navigation component with dual focus capabilities.

#### 2. BlocksList Component (`blocks-list.tsx`)

Component search and navigation with identical dual focus pattern.

#### 3. Parent Component (Chat/Toolbar)

Orchestrates focus between textarea and docs components.

### State Management

```typescript
// Visual focus (persists during character input)
const [activeIndex, setActiveIndex] = useState(-1);     // Currently selected item
const [startIndex, setStartIndex] = useState(0);       // Window start position
const [isFocused, setIsFocused] = useState(false);     // Logical focus state

// Search state
const [searchResults, setSearchResults] = useState<DocsItem[]>([]);
const [isSearching, setIsSearching] = useState(false);
```

## Complete Flow Explanation

### 1. Initial State

```text
┌─────────────────┐    ┌─────────────────┐
│   Textarea      │    │   Docs List     │
│   (DOM Focus)   │    │   (No Focus)    │
│   Cursor: █     │    │                 │
│                 │    │   No items      │
└─────────────────┘    └─────────────────┘
```

- Textarea has DOM focus (cursor visible)
- Docs list has no logical focus
- No visual selection in docs

### 2. User Types Search Query

```text
User types: "react"
┌─────────────────┐    ┌─────────────────┐
│   Textarea      │    │   Docs List     │
│   react█        │    │   (Searching)   │
│                 │    │   Loading...    │
└─────────────────┘    └─────────────────┘
```

**Flow:**

1. User types in textarea
2. `searchQuery` prop updates in DocsList
3. Local search executes immediately
4. API search starts (non-blocking)
5. Results appear, first item auto-selected

### 3. Trigger Navigation Mode

```text
User presses: ↓ (Arrow Down)
┌─────────────────┐    ┌─────────────────┐
│   Textarea      │    │   Docs List     │
│   react█        │    │   (Focused)     │
│                 │    │   ▶ React       │
│                 │    │     Vue         │
│                 │    │     Angular     │
└─────────────────┘    └─────────────────┘
```

**Flow:**

1. Arrow key triggers `focusOnDocs()` via global listener
2. `isFocused` becomes `true`
3. Visual selection appears (first item highlighted)
4. Keyboard events now handled by docs component

### 4. Navigate Through Results

```text
User presses: ↓ ↓ ↑
┌─────────────────┐    ┌─────────────────┐
│   Textarea      │    │   Docs List     │
│   react█        │    │   (Focused)     │
│                 │    │     React       │
│                 │    │   ▶ Vue         │
│                 │    │     Angular     │
└─────────────────┘    └─────────────────┘
```

**Navigation Logic:**

```typescript
case 'ArrowDown':
  const nextIndex = activeIndex + 1;
  const newIndex = nextIndex < docs.length ? nextIndex : 0; // Wrap to start
  setActiveIndex(newIndex);
  // Update visible window if needed
  break;
```

### 5. Return to Typing Mode

```text
User presses: "c" (any character)
┌─────────────────┐    ┌─────────────────┐
│   Textarea      │    │   Docs List     │
│   reactc█       │    │   (Visual Only) │
│                 │    │   ▶ Vue         │
│                 │    │     Angular     │
└─────────────────┘    └─────────────────┘
```

**Critical Flow:**

1. Character key detected in `handleKeyDown`
2. `isFocused` set to `false` (stops keyboard handling)
3. `onFocusReturn()` called (focuses textarea)
4. **Visual selection persists** (activeIndex unchanged)
5. Key event propagates to textarea

### 6. Selection and Completion

```text
User presses: ⏎ (Enter)
┌─────────────────┐    ┌─────────────────┐
│   Textarea      │    │   Docs List     │
│   @react/vue█   │    │   (Completed)   │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
```

**Selection Flow:**

1. Enter key triggers `selectActiveDoc()`
2. Selected item added to recent docs
3. `onDocSelection` callback fired
4. Component closes, focus returns to textarea
5. Selected doc inserted into textarea

## Key Implementation Details

### Global Event Handling

```typescript
// Add listener when logically focused
useEffect(() => {
  if (isFocused) {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
}, [isFocused, handleKeyDown]);
```

### Focus Separation

```typescript
focusOnDocs: () => {
  setIsFocused(true);
  // CRITICAL: Don't call containerRef.current?.focus()
  // This would steal DOM focus from textarea!
}
```

### Character Input Detection

```typescript
// Return to textarea for character input
if ((e.key.length === 1 && !e.ctrlKey && !e.metaKey) || // Characters
    e.key === 'Backspace' || e.key === 'Delete' ||     // Editing
    (e.ctrlKey && (e.key === 'a' || e.key === 'x' ||   // Shortcuts
                   e.key === 'c' || e.key === 'v'))) {
  setIsFocused(false);
  onFocusReturn(); // Focus textarea
  // Key continues to textarea!
}
```

### Visual Focus Persistence

```typescript
// Visual selection survives focus changes
const isItemFocused = activeIndex === startIndex + idx;
return (
  <button className={cn(
    'flex w-full items-center gap-2 rounded-md border p-2',
    isItemFocused
      ? 'border-border bg-background ring-2 ring-muted-foreground'
      : 'border-border bg-background hover:border-muted-foreground'
  )}>
```

## Integration with Parent Component

### Props Interface

```typescript
interface DocsListProps {
  searchQuery?: string;
  onDocSelection?: (item: DocsItem) => void;
  onFocusReturn?: () => void;
  onFocusChange?: (isFocused: boolean, activeDoc?: DocsItem) => void;
  onCloseDocs?: () => void;
  onReady?: () => void;
}
```

### Ref Interface

```typescript
interface DocsListRef {
  focusOnDocs: () => void;      // Enable navigation mode
  selectActiveDoc: () => boolean; // Select current item
}
```

### Usage Example

```typescript
const docsRef = useRef<DocsListRef>(null);

// Trigger navigation
const handleArrowKey = () => {
  docsRef.current?.focusOnDocs();
};

// Handle selection
const handleDocSelection = (doc: DocsItem) => {
  insertIntoTextarea(`@${doc.id}`);
};
```

## User Experience Benefits

### 1. Seamless Transitions

- No focus stealing or cursor jumping
- Natural typing experience maintained
- Instant navigation when needed

### 2. Visual Continuity

- Selection remains visible during typing
- Preview shows current selection
- Smooth transitions between modes

### 3. Keyboard Efficiency

- Arrow keys for navigation
- Character keys return to typing
- Enter to select, Escape to cancel

### 4. Accessibility

- Proper ARIA labels and roles
- Keyboard-only navigation
- Screen reader friendly

## Error Handling

### Search Failures

```typescript
try {
  // API search
} catch (apiError) {
  // Fall back to local results
  console.warn('API failed, using local results only');
}
```

### Focus Edge Cases

```typescript
const handleContainerBlur = useCallback(() => {
  setTimeout(() => {
    // Only reset if truly blurred
    if (!containerRef.current?.contains(document.activeElement)) {
      setIsFocused(false);
    }
  }, 100);
}, []);
```

## Performance Optimizations

### 1. Debounced Search

```typescript
const searchTimeout = setTimeout(async () => {
  // Search logic
}, 300); // 300ms debounce
```

### 2. Local Results First

```typescript
// Show local results immediately
setSearchResults(localResults);

// Then enhance with API results
const apiResults = await fetchAPI();
setSearchResults([...localResults, ...apiResults]);
```

### 3. Memoized Computations

```typescript
const visibleDocs = useMemo(() => {
  return filteredDocs.slice(startIndex, startIndex + 3);
}, [filteredDocs, startIndex]);
```

## Testing Scenarios

### Happy Path

1. Type search query → Results appear
2. Press ↓ → Navigation mode activates
3. Navigate with arrows → Selection changes
4. Press 'x' → Returns to typing
5. Press Enter → Selection completes

### Edge Cases

1. Empty search → No results, graceful handling
2. API failure → Local results only
3. Rapid typing → Debounced search
4. Window resize → Layout adapts
5. Keyboard shortcuts → Proper handling

## Future Enhancements

### Potential Improvements

1. **Touch Support**: Swipe gestures for mobile
2. **Voice Input**: Speech-to-text integration
3. **Multi-Select**: Shift+click for multiple items
4. **Favorites**: Star items for quick access
5. **Categories**: Filter by framework type

### Performance

1. **Virtual Scrolling**: For large result sets
2. **Caching**: API response caching
3. **Prefetching**: Predict and preload results

This dual focus pattern provides a sophisticated yet intuitive user experience that feels natural while offering powerful navigation capabilities.
