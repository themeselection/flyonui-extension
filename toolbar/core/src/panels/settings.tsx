import { Button } from '@/components/ui/button';
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from '@/components/ui/panel';
import { usePanels } from '@/hooks/use-panels';

import { useHotkeyListenerComboText } from '@/hooks/use-hotkey-listener-combo-text';
import { HotkeyActions } from '@/utils';
import { XIcon } from 'lucide-react';
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
        <div className="space-y-4">
          <LicenseKeyManager />
          <AgentSelection showConnectedDetails />
          <hr className="-mx-4 text-zinc-500/15" />
          <CompactSettingsPositionSelector />
          <hr className="-mx-4 text-zinc-500/15" />
          <CompactThemeToggle />
          <hr className="-mx-4 text-zinc-500/15" />
          {/* Shortcut info for toggling the chat panel */}
          <div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">Toggle chat</div>
              <div className="text-muted-foreground text-xs">
                {useHotkeyListenerComboText(HotkeyActions.TOGGLE_CHAT)}
              </div>
            </div>
            <div className="mt-1 text-muted-foreground text-xs">
              Use this shortcut to toggle the chat panel.
            </div>
          </div>
        </div>
      </PanelContent>

      <PanelFooter>
        <div className="flex justify-between text-muted-foreground text-xs">
          <div>Open source Visual Editor</div>
          <div>
            Fork of{' '}
            <a
              href="https://stagewise.io"
              target="blank"
              className="italic underline"
            >
              Stagewise
            </a>
            .
          </div>
        </div>
      </PanelFooter>
    </Panel>
  );
}
