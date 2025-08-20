import type { DraggableContextType } from '@/hooks/use-draggable';
import { cn } from '@/utils';
import { useEffect, useState } from 'react';

const POSITION_KEY = 'stagewise_toolbar_toolbar_position';
const POSITIONS = [
  { key: 'topLeft', label: 'Top Left' },
  { key: 'topRight', label: 'Top Right' },
  { key: 'bottomLeft', label: 'Bottom Left' },
  { key: 'bottomRight', label: 'Bottom Right' },
] as const;

type ToolbarPosition = keyof DraggableContextType['snapAreas'];

// Custom event for position changes
const POSITION_CHANGE_EVENT = 'toolbar-position-change';

export function SettingsPositionSelector() {
  const [current, setCurrent] = useState<ToolbarPosition>(() => {
    if (typeof window !== 'undefined') {
      return (
        (localStorage.getItem(POSITION_KEY) as ToolbarPosition) || 'bottomRight'
      );
    }
    return 'bottomRight';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrent(
        (localStorage.getItem(POSITION_KEY) as ToolbarPosition) ||
          'bottomRight',
      );
    }
  }, []);

  const handleChange = (pos: string) => {
    const position = pos as ToolbarPosition;
    localStorage.setItem(POSITION_KEY, position);
    setCurrent(position);

    // Dispatch custom event to notify the draggable system
    window.dispatchEvent(
      new CustomEvent(POSITION_CHANGE_EVENT, {
        detail: { position },
      }),
    );
  };

  return (
    <div className="space-y-3">
      <div className="font-medium text-foreground text-sm">
        Toolbar Position
      </div>
      <div className="grid grid-cols-2 gap-2">
        {POSITIONS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handleChange(p.key)}
            className={cn(
              'flex items-center justify-center rounded-lg border px-3 py-2 font-medium text-xs transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'hover:scale-105 active:scale-95',
              current === p.key
                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm dark:border-green-400 dark:bg-green-900/30 dark:text-green-300'
                : 'border-gray-200 bg-background text-foreground hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700',
            )}
            aria-pressed={current === p.key}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="text-foreground text-xs">
        Choose a fixed position for the toolbar, or drag it manually to any
        corner.
      </div>
    </div>
  );
}
