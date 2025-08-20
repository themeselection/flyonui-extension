import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuButtonItem,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { useAppState } from '@/hooks/use-app-state';

const THEME_ICONS = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
} as const;

const THEME_LABELS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useAppState();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label
            htmlFor="theme-toggle"
            className="mb-1 block bg-primary font-medium text-foreground text-sm"
          >
            Theme
          </label>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Choose your preferred color scheme for the toolbar.
          </p>
        </div>
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuButton>
              <Button
                id="theme-toggle"
                variant="outline"
                size="sm"
                title={`Current theme: ${THEME_LABELS[theme]}`}
                className="h-8 min-w-24"
              >
                <span className="mr-2 text-sm">{THEME_ICONS[theme]}</span>
                {THEME_LABELS[theme]}
              </Button>
            </DropdownMenuButton>

            <DropdownMenuContent>
              {Object.entries(THEME_LABELS).map(([themeKey, label]) => (
                <DropdownMenuButtonItem
                  key={themeKey}
                  onClick={() =>
                    handleThemeChange(themeKey as 'light' | 'dark' | 'system')
                  }
                  className={
                    theme === themeKey ? 'bg-accent text-accent-foreground' : ''
                  }
                >
                  <span className="mr-2">
                    {THEME_ICONS[themeKey as keyof typeof THEME_ICONS]}
                  </span>
                  {label}
                  {theme === themeKey && <span className="ml-auto">✓</span>}
                </DropdownMenuButtonItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
