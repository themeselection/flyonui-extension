// ...existing code...
'use client';
import type { ToolbarPlugin } from '@stagewise/plugin-sdk';
import VueLogo from './assets/vue.svg';
import { ExampleComponent } from './component';

const Plugin: ToolbarPlugin = {
  displayName: 'my-plugin',
  description: 'My Plugin',
  iconSvg: (
    <img src={VueLogo} alt="Vue Logo" style={{ width: 100, height: 10 }} />
  ), // Display Vue logo as SVG
  pluginName: 'my-plugin',
  onActionClick: () => <ExampleComponent />,
  onLoad: () => {
    console.log('My Plugin loaded');
  },
  onPromptSend: async (prompt) => {
    console.log('Prompt sent:', prompt);
    return null;
  },
  onContextElementHover: (element) => {
    console.log('Context element hovered:', element);
    return { annotation: 'Hovered Element' };
  },
};

/**
 * WARNING: Make sure that the plugin is exported as default as this is a required format for the plugin builder.
 */
export default Plugin;
