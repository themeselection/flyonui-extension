import type { DraggableContextType } from '@/hooks/use-draggable';
import { cn } from '@/utils';
import {
  MoveDownLeft,
  MoveDownRight,
  MoveUpLeft,
  MoveUpRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const POSITION_KEY = 'stagewise_toolbar_toolbar_position';

const POSITIONS = [
  {
    key: 'topLeft',
    label: 'Top Left',
    icon: MoveUpLeft,
    tooltip: 'Move to top left',
  },
  {
    key: 'topRight',
    label: 'Top Right',
    icon: MoveUpRight,
    tooltip: 'Move to top right',
  },
  {
    key: 'bottomLeft',
    label: 'Bottom Left',
    icon: MoveDownLeft,
    tooltip: 'Move to bottom left',
  },
  {
    key: 'bottomRight',
    label: 'Bottom Right',
    icon: MoveDownRight,
    tooltip: 'Move to bottom right',
  },
] as const;

type ToolbarPosition = keyof DraggableContextType['snapAreas'];

// Custom event for position changes
const POSITION_CHANGE_EVENT = 'toolbar-position-change';

export function CompactSettingsPositionSelector() {
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="font-medium text-foreground text-sm">
            Toolbar Position
          </div>
          <div className="text-muted-foreground text-xs">
            Select toolbar Position.
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {POSITIONS.map((position) => {
            const Icon = position.icon;
            const isActive = current === position.key;

            return (
              <button
                key={position.key}
                type="button"
                onClick={() => handleChange(position.key)}
                title={position.tooltip}
                className={cn(
                  'rounded-full border p-1.5 transition-all duration-200 ease-out',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'hover:scale-105 hover:cursor-pointer active:scale-95',
                  isActive
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm dark:border-green-400 dark:bg-green-900/30 dark:text-green-300'
                    : 'border-gray-200 bg-background text-foreground hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700',
                )}
                aria-pressed={isActive}
                aria-label={position.tooltip}
              >
                <Icon className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
