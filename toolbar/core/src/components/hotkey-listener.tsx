import { useChatState } from '@/hooks/use-chat-state';
import { useEventListener } from '@/hooks/use-event-listener';
import { usePanels } from '@/hooks/use-panels';
import { useCallback, useMemo } from 'react';
import { hotkeyActionDefinitions, HotkeyActions } from '../utils';

type StopPreventPropagation = boolean;

// This listener is responsible for listening to hotkeys and triggering the appropriate actions in the global app state.
export function HotkeyListener() {
  const { startPromptCreation, stopPromptCreation, isPromptCreationActive } =
    useChatState();
  const { isChatOpen, closeChat, openChat } = usePanels();

  const hotKeyHandlerMap: Record<HotkeyActions, () => StopPreventPropagation> =
    useMemo(
      () => ({
        // Functions that return true will prevent further propagation of the event.
        [HotkeyActions.CTRL_ALT_C]: () => {
          if (!isPromptCreationActive) {
            startPromptCreation();
            return true;
          }
          return false;
        },
        [HotkeyActions.TOGGLE_CHAT]: () => {
          // Toggle the chat panel open/closed
          if (isChatOpen) {
            closeChat();
          } else {
            openChat();
          }
          return true;
        },
        [HotkeyActions.ESC]: () => {
          if (isPromptCreationActive) {
            // If prompting mode is active, stop it
            stopPromptCreation();
            return true;
          } else if (isChatOpen) {
            // If prompting is not active but chat is open, close the chat
            closeChat();
            return true;
          }
          return false;
        },
      }),
      [
        startPromptCreation,
        stopPromptCreation,
        isPromptCreationActive,
        isChatOpen,
        closeChat,
      ],
    );

  const hotKeyListener = useCallback(
    (ev: KeyboardEvent) => {
      // The first matching hotkey action will be executed and abort further processing of other hotkey actions.
      for (const [action, definition] of Object.entries(
        hotkeyActionDefinitions,
      )) {
        if (definition.isEventMatching(ev)) {
          const matched =
            hotKeyHandlerMap[action as unknown as HotkeyActions]();
          if (matched) {
            ev.preventDefault();
            ev.stopPropagation();
          }
          break;
        }
      }
    },
    [hotKeyHandlerMap],
  );

  useEventListener('keydown', hotKeyListener, {
    capture: true,
  });
  return null;
}
