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
import { usePanels } from '@/hooks/use-panels';

import { useHotkeyListenerComboText } from '@/hooks/use-hotkey-listener-combo-text';
import { HotkeyActions } from '@/utils';
import { MessageCircleQuestionMarkIcon, XIcon } from 'lucide-react';
import { AgentSelection } from './shared-content/agent-selection';
import { CompactSettingsPositionSelector } from './shared-content/compact-settings-position';
import { CompactThemeToggle } from './shared-content/compact-theme-toggle';
import { LicenseKeyManager } from './shared-content/license-key-manager';

export function SettingsPanel() {
  const { closeSettings } = usePanels();

  return (
    <Panel>
      <PanelHeader
        title="Settings"
        actionArea={
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSettings}
            className="size-8 rounded-full p-1"
          >
            <XIcon className="size-4" />
          </Button>
        }
      />
      <PanelContent>
        <div className="space-y-6">
          <LicenseKeyManager />
          <AgentSelection showConnectedDetails />
          <CompactSettingsPositionSelector />
          <CompactThemeToggle />
          {/* Shortcut info for toggling the chat panel */}
          <div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">Toggle chat</div>
              <div className="text-muted-foreground text-xs">
                {useHotkeyListenerComboText(HotkeyActions.TOGGLE_CHAT)}
              </div>
            </div>
            <div className="mt-1 text-muted-foreground text-sm">
              Use this shortcut to toggle the chat panel.
            </div>
          </div>
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
