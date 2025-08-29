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
import { CompactSettingsPositionSelector } from './shared-content/compact-settings-position';
import { CompactThemeToggle } from './shared-content/compact-theme-toggle';
import { LicenseKeyManager } from './shared-content/license-key-manager';

export function SettingsPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Settings"
        description="Manage your settings."
        actionArea={<CompactThemeToggle />}
      />
      <PanelContent>
        <div className="space-y-6">
          <AgentSelection showConnectedDetails />
          <CompactSettingsPositionSelector />
          <LicenseKeyManager />
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
