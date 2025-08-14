import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuContent,
  DropdownMenuLinkItem,
} from '@/components/ui/dropdown-menu';
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from '@/components/ui/panel';
import { MessageCircleQuestionMarkIcon } from 'lucide-react';
import { AgentSelection } from './shared-content/agent-selection';
import { SettingsPositionSelector } from './shared-content/settings-position';

export function SettingsPanel() {
  return (
    <Panel>
      <PanelHeader title="Preference" />
      <PanelContent>
        <div className="space-y-6">
          <AgentSelection showConnectedDetails />
          <SettingsPositionSelector />
        </div>
      </PanelContent>

      <PanelFooter>
        <DropdownMenu>
          <DropdownMenuButton>
            <Button glassy size="sm" variant="secondary">
              <MessageCircleQuestionMarkIcon className="mr-2 size-4" />
              Need help?
            </Button>
          </DropdownMenuButton>
          <DropdownMenuContent>
            <DropdownMenuLinkItem
              href="https://stagewise.io/docs"
              target="_blank"
            >
              Read the docs
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem
              href="https://discord.gg/y8gdNb4D"
              target="_blank"
            >
              Join the community
            </DropdownMenuLinkItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PanelFooter>
    </Panel>
  );
}
