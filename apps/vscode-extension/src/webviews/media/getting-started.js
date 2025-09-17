// Getting Started Panel JavaScript

// Get VS Code API
const vscode = acquireVsCodeApi();

// Get proUrl from global window variable (injected by TypeScript code)
const proUrl = window.proUrl || 'https://flyonui.com/pro';

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Open Terminal button
  const openTerminalBtn = document.getElementById('openTerminal');
  if (openTerminalBtn) {
    openTerminalBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'openTerminal' });
    });
  }

  // Open Extension Window button
  const openExtensionWindowBtn = document.getElementById('openExtensionWindow');
  if (openExtensionWindowBtn) {
    openExtensionWindowBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'openApiPanel' });
    });
  }

  // Open Pro License button
  const openProBtn = document.getElementById('openPro');
  if (openProBtn) {
    openProBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'openDiscord', url: proUrl });
    });
  }

  // Dismiss button
  const dismissBtn = document.getElementById('dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'dismissPanel' });
    });
  }
});
