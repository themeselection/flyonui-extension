import { useAppState } from '../hooks/use-app-state';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuButtonItem,
  DropdownMenuContent,
} from './ui/dropdown-menu';

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
    <DropdownMenu>
      <DropdownMenuButton>
        <Button
          variant="ghost"
          size="sm"
          title={`Current theme: ${THEME_LABELS[theme]}`}
          className="h-8 w-8 px-0"
        >
          <span className="text-sm">{THEME_ICONS[theme]}</span>
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
  );
}
