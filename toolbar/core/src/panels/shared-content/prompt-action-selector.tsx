import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuButtonItem,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { useAppState } from '@/hooks/use-app-state';
import { ClipboardCheckIcon, CopyIcon, SendHorizonalIcon } from 'lucide-react';

export function PromptActionSelector() {
  const { promptAction, setPromptAction } = useAppState();

  const getActionIcon = () => {
    switch (promptAction) {
      case 'copy':
        return <CopyIcon className="size-4" />;
      case 'send':
        return <SendHorizonalIcon className="size-4" />;
      case 'both':
        return <ClipboardCheckIcon className="size-4" />;
      default:
        return <ClipboardCheckIcon className="size-4" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="font-medium text-sm">Prompt action</div>
          <div className="text-muted-foreground text-xs">
            Set your prompt action.
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuButton>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 rounded-md text-xs"
            >
              {getActionIcon()}
              {promptAction === 'copy' && 'Copy'}
              {promptAction === 'send' && 'Send'}
              {promptAction === 'both' && 'Both'}
            </Button>
          </DropdownMenuButton>
          <DropdownMenuContent>
            <DropdownMenuButtonItem
              onClick={() => setPromptAction('copy')}
              className="flex items-center gap-2"
            >
              <CopyIcon className="size-4" />
              Copy only
            </DropdownMenuButtonItem>
            <DropdownMenuButtonItem
              onClick={() => setPromptAction('send')}
              className="flex items-center gap-2"
            >
              <SendHorizonalIcon className="size-4" />
              Send to IDE only
            </DropdownMenuButtonItem>
            <DropdownMenuButtonItem
              onClick={() => setPromptAction('both')}
              className="flex items-center gap-2"
            >
              <ClipboardCheckIcon className="size-4" />
              Copy and Send
            </DropdownMenuButtonItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
