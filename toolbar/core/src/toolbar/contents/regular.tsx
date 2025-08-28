import { usePanels } from '@/hooks/use-panels';
import { usePlugins } from '@/hooks/use-plugins';
import { ToolbarButton } from '@/toolbar/components/button';
import { ToolbarSection } from '@/toolbar/components/section';
import { MessageCircleIcon, PuzzleIcon, SettingsIcon } from 'lucide-react';

export function RegularContent() {
  const {
    isSettingsOpen,
    openSettings,
    closeSettings,
    isChatOpen,
    openChat,
    closeChat,
    openPluginName,
    closePlugin,
    openPlugin,
  } = usePanels();

  const plugins = usePlugins();

  const pluginsWithActions = plugins.plugins.filter(
    (plugin) => plugin.onActionClick,
  );

  return (
    <>
      <ToolbarSection>
        <ToolbarButton
          onClick={isSettingsOpen ? closeSettings : openSettings}
          active={isSettingsOpen}
        >
          <SettingsIcon className="size-4" />
        </ToolbarButton>
      </ToolbarSection>

      {pluginsWithActions.length > 0 && (
        <ToolbarSection>
          {pluginsWithActions.map((plugin) => (
            <ToolbarButton
              key={plugin.pluginName}
              onClick={
                openPluginName === plugin.pluginName
                  ? closePlugin
                  : () => openPlugin(plugin.pluginName)
              }
              active={openPluginName === plugin.pluginName}
            >
              {plugin.iconSvg ? (
                <span className="size-4 *:size-full">{plugin.iconSvg}</span>
              ) : (
                <PuzzleIcon className="size-4" />
              )}
            </ToolbarButton>
          ))}
        </ToolbarSection>
      )}

      <ToolbarSection>
        <ToolbarButton
          onClick={
            isChatOpen
              ? closeChat
              : () => {
                  openChat();
                }
          }
          active={isChatOpen}
        >
          <MessageCircleIcon className="size-4" />
        </ToolbarButton>
      </ToolbarSection>
    </>
  );
}
