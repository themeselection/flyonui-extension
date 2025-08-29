import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuButtonItem,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { useAppState } from '@/hooks/use-app-state';
import { Monitor, Moon, Sun } from 'lucide-react';

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const THEME_LABELS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const;

export function CompactThemeToggle() {
  const { theme, setTheme } = useAppState();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const CurrentIcon = THEME_ICONS[theme];

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="font-medium">Theme</span>
        <span className="text-muted-foreground text-sm">
          Choose the appearance.
        </span>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuButton>
            <Button
              variant="ghost"
              size="sm"
              title={`Current theme: ${THEME_LABELS[theme]}`}
              className="inline-flex items-center rounded-md px-2 py-1"
              aria-label={`Theme (current: ${THEME_LABELS[theme]})`}
            >
              <CurrentIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{THEME_LABELS[theme]}</span>
            </Button>
          </DropdownMenuButton>

          <DropdownMenuContent>
            {Object.entries(THEME_LABELS).map(([themeKey, label]) => {
              const Icon = THEME_ICONS[themeKey as keyof typeof THEME_ICONS];
              return (
                <DropdownMenuButtonItem
                  key={themeKey}
                  onClick={() =>
                    handleThemeChange(themeKey as 'light' | 'dark' | 'system')
                  }
                  className={
                    theme === themeKey ? 'bg-accent text-accent-foreground' : ''
                  }
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                  {theme === themeKey && <span className="ml-auto">✓</span>}
                </DropdownMenuButtonItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
