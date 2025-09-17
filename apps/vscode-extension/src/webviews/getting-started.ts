import * as fs from 'fs';
import { AnalyticsService, EventName } from 'src/services/analytics-service';
import type { StorageService } from 'src/services/storage-service';
import * as vscode from 'vscode';

export function createGettingStartedPanel(
  context: vscode.ExtensionContext,
  storage: StorageService,
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    'stagewiseGettingStarted',
    'Getting Started with stagewise',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );
  panel.webview.html = getWebviewContent(panel.webview, context);

  // Immediately mark as seen
  void storage.set('stagewise.hasSeenGettingStarted', true);

  // Handle messages from the webview
  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case 'openTerminal': {
          const terminal = vscode.window.createTerminal({
            cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
          });
          terminal.show();
          terminal.sendText('npx flyonui-extension-cli', false);
          break;
        }
        case 'openApiPanel':
          vscode.commands.executeCommand('flyonui.focusApiDataView');
          break;
        case 'openDiscord':
          vscode.env.openExternal(vscode.Uri.parse(message.url));
          break;
        case 'dismissPanel':
          AnalyticsService.getInstance().trackEvent(
            EventName.DISMISSED_GETTING_STARTED_PANEL,
          );
          panel.dispose();
          break;
      }
    },
    undefined,
    context.subscriptions,
  );

  return panel;
}

function getWebviewContent(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
): string {
  const cspDomain =
    context.extensionMode === vscode.ExtensionMode.Development
      ? 'http://localhost:3000'
      : 'https://flyonui.com';

  const proUrl = 'https://flyonui.com/pro';

  // Get path to media directory
  const mediaPath = vscode.Uri.joinPath(
    context.extensionUri,
    'out',
    'src',
    'webviews',
    'media',
  );

  // Get URIs for CSS and JS files using the found media path
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(mediaPath, 'getting-started.css'),
  );
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(mediaPath, 'getting-started.js'),
  );

  // Get URI for the FlyonUI logo icon
  const iconUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'icon.png'),
  );

  // Read HTML template
  const htmlPath = vscode.Uri.joinPath(mediaPath, 'getting-started.html');
  let htmlContent: string;

  try {
    const htmlBytes = fs.readFileSync(htmlPath.fsPath);
    htmlContent = htmlBytes.toString();
  } catch (error) {
    console.error('Error reading HTML template:', error);
    return getErrorHtml('Failed to load HTML template');
  }

  // Replace placeholders with actual URIs and values
  htmlContent = htmlContent
    .replace('{{styleUri}}', styleUri.toString())
    .replace('{{iconUri}}', iconUri.toString())
    .replace(/{{proUrl}}/g, proUrl);

  // Inject proUrl as a global variable before the main script
  const proUrlScript = `<script>window.proUrl = '${proUrl}';</script>`;
  htmlContent = htmlContent.replace(
    '<script src="{{scriptUri}}"></script>',
    `${proUrlScript}\n  <script src="${scriptUri.toString()}"></script>`,
  );

  // Add CSP meta tag
  const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="default-src ${webview.cspSource} ${cspDomain}; style-src ${webview.cspSource} 'unsafe-inline' ${cspDomain}; script-src ${webview.cspSource} 'unsafe-inline' ${cspDomain};">`;
  htmlContent = htmlContent.replace('<title>', `${cspMetaTag}\n    <title>`);

  return htmlContent;
}

function getErrorHtml(errorMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h2>Error Loading Panel</h2>
    <p>${errorMessage}</p>
</body>
</html>`;
}

export async function shouldShowGettingStarted(
  storage: StorageService,
): Promise<boolean> {
  // Show getting started panel if the user hasn't seen it before
  return !(await storage.get('stagewise.hasSeenGettingStarted', false));
}
