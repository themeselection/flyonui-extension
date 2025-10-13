import * as fs from 'fs';
import * as vscode from 'vscode';
import { dispatchAgentCall } from '../utils/dispatch-agent-call';

export class ApiDataProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'flyonui.apiDataView';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'refresh':
          this._refreshData();
          break;
        case 'openItem':
          vscode.window.showInformationMessage(`Opening item: ${data.item}`);
          break;
        case 'saveLicenseKey':
          await this._saveLicenseKey(data.licenseKey);
          break;
        case 'openFlyonuiPro':
          vscode.env.openExternal(vscode.Uri.parse('https://flyonui.com/pro'));
          break;
        case 'validateLicense':
          await this._validateLicense(data.licenseKey);
          break;
        case 'fetchApiData':
          await this._fetchFlyonuiData();
          break;
        case 'copyToClipboard':
          await vscode.env.clipboard.writeText(data.text);
          vscode.window.showInformationMessage('📋 Path copied to clipboard!');
          break;
        case 'openComponent':
          await this._fetchFlyonuiBlockData(data.path, data.name);
          break;
        case 'copyBlockCode':
          await this._copyBlockCode(data.path);
          break;
        case 'sendToIDEAgent':
          await this._sendToIDEAgent(data.path, data.name);
          break;
        case 'previewBlock':
          await this._previewBlock(data.path, data.name);
          break;
      }
    });
  }

  private async _previewBlock(path: string, componentName: string) {
    const licenseKey = this._getCurrentLicenseKey();

    try {
      const url = `https://flyonui.com/api/mcp${path}?type=mcp`;
      const headers = {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'x-license-key': licenseKey,
      };

      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: any = await response.json();
      const previewUrl = apiData.iframeSrc;

      if (previewUrl) {
        vscode.env.openExternal(vscode.Uri.parse(previewUrl));
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        'Failed to fetch block preview from FlyonUI API',
      );
    }
  }

  private async _fetchFlyonuiBlockData(
    dataPath: string,
    componentName: string,
  ) {
    // Show loading state
    if (this._view) {
      this._view.webview.postMessage({
        type: 'apiDataLoading',
        loading: true,
      });
    }

    const licenseKey = this._getCurrentLicenseKey();

    try {
      // Show loading state
      const url = `https://flyonui.com/api/mcp${dataPath}?type=mcp`;
      const headers = {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'x-license-key': licenseKey,
      };

      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: any = await response.json();

      // Handle case where API returns a JSON string instead of an object
      let parsedData: any;
      if (typeof apiData === 'string') {
        parsedData = JSON.parse(apiData);
      } else {
        parsedData = apiData;
      }

      // Extract blocks data - handle different possible structures
      let blocksData = null;
      if (parsedData.blocks) {
        blocksData = parsedData.blocks;
      } else if (Array.isArray(parsedData)) {
        blocksData = parsedData;
      } else if (parsedData.data && Array.isArray(parsedData.data)) {
        blocksData = parsedData.data;
      } else {
        // If no recognizable structure, send the whole data
        blocksData = [parsedData];
      }

      // Send data to webview
      if (this._view) {
        const message = {
          type: 'componentDetailsReceived',
          data: blocksData,
          componentName: componentName,
          componentPath: dataPath,
          loading: false,
        };
        this._view.webview.postMessage(message);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        'Failed to fetch block data from FlyonUI API',
      );

      // Hide loading state and show error in webview
      if (this._view) {
        this._view.webview.postMessage({
          type: 'componentDetailsReceived',
          data: null,
          componentName: componentName,
          componentPath: dataPath,
          loading: false,
          error: 'Failed to fetch block data',
        });
      }
    }
  }

  private async _fetchBlockCodeFromAPI(
    dataPath: string,
  ): Promise<string | null> {
    const licenseKey = this._getCurrentLicenseKey();

    try {
      const url = `https://flyonui.com/api/mcp${dataPath}?type=mcp`;
      const headers = {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'x-license-key': licenseKey,
      };

      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: any = await response.json();

      // Handle case where API returns a JSON string instead of an object
      let parsedData: any;
      if (typeof apiData === 'string') {
        parsedData = JSON.parse(apiData);
      } else {
        parsedData = apiData;
      }

      // Extract the code from the response
      // First, try to get blocks data similar to the existing method
      let blocksData = null;
      if (Array.isArray(parsedData.snippets)) blocksData = parsedData.snippets;
      else blocksData = [parsedData];

      // Format the code in each snippet
      blocksData.forEach((block: any) => {
        if (block.code) {
          block.code = block.code.replace(/\\n/g, '\n').replace(/ {4}/g, '  ');
        }
      });

      // Find the HTML snippet
      const htmlSnippet = blocksData.find(
        (block: any) => block.fileType === 'html' && block.code,
      );
      const cssSnippet = blocksData.find(
        (block: any) => block.fileType === 'css' && block.code,
      );
      const jsSnippet = blocksData.find(
        (block: any) => block.fileType === 'js' && block.code,
      );

      const parts = [];
      if (htmlSnippet?.code) {
        parts.push(`<!-- HTML Code -->\n\n${htmlSnippet.code}`);
      }
      if (cssSnippet?.code) {
        parts.push(`<!-- CSS Code -->\n\n${cssSnippet.code}`);
      }
      if (jsSnippet?.code) {
        parts.push(`<!-- JS Code -->\n\n${jsSnippet.code}`);
      }
      return parts.join('\n\n');
    } catch (error) {
      console.error('Error fetching block code from API:', error);
      vscode.window.showErrorMessage(
        'Failed to fetch block code from FlyonUI API',
      );
      return null;
    }
  }

  private async _copyBlockCode(dataPath: string): Promise<void> {
    try {
      vscode.window.showInformationMessage('⏳ Fetching block code...');

      const code = await this._fetchBlockCodeFromAPI(dataPath);

      if (code) {
        await vscode.env.clipboard.writeText(code);
        vscode.window.showInformationMessage(
          '📋 Block code copied to clipboard!',
        );
      } else {
        vscode.window.showErrorMessage('Failed to fetch block code');
      }
    } catch (error) {
      console.error('Error copying block code:', error);
      vscode.window.showErrorMessage('Failed to copy block code');
    }
  }

  private async _sendToIDEAgent(
    dataPath: string,
    componentName: string,
  ): Promise<void> {
    try {
      vscode.window.showInformationMessage(
        '⏳ Fetching block code and sending to IDE agent...',
      );

      const code = await this._fetchBlockCodeFromAPI(dataPath);

      if (code) {
        const prompt = `You need to Integrate this FlyonUI component "${componentName}" in this codebase. 

Here is the HTML/CSS/JS code for the component:

\`\`\`html
${code}
\`\`\`

Follow the below instructions to integrate this component into the codebase:
1. Analyze currently existing codebase and our FlyonUI Component Code and see how this component can fit in
2. Explain what this component does and how it works
3. Provided code is in HTML/CSS/JS format, if the codebase is using any specific framework (React, Vue, Angular, etc.), convert the code accordingly
4. Check if I need any additional CSS classes or dependencies to use this component
5. Integrate this component into the codebase and provide the updated code files
`;

        await dispatchAgentCall({
          prompt: prompt,
        });

        vscode.window.showInformationMessage(
          '🤖 Code sent to IDE agent successfully!',
        );
      } else {
        vscode.window.showErrorMessage(
          'Failed to fetch block code for IDE agent',
        );
      }
    } catch (error) {
      console.error('Error sending to IDE agent:', error);
      vscode.window.showErrorMessage('Failed to send code to IDE agent');
    }
  }

  private async _fetchFlyonuiData() {
    const licenseKey = this._getCurrentLicenseKey();

    try {
      // Show loading state
      if (this._view) {
        this._view.webview.postMessage({
          type: 'apiDataLoading',
          loading: true,
        });
      }

      const response = await fetch(
        'https://flyonui.com/api/mcp/instructions?path=block_metadata.json',
        {
          method: 'GET',
          headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
            'x-license-key': licenseKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: any = await response.json();

      // Handle case where API returns a JSON string instead of an object
      let parsedData: any;
      if (typeof apiData === 'string') {
        parsedData = JSON.parse(apiData);
      } else {
        parsedData = apiData;
      }

      const resultData: any[] = [];

      parsedData.components.forEach((component: any) => {
        if ('category' in component) {
          component.components.forEach((subComponent: any) => {
            resultData.push(subComponent);
          });
        } else {
          resultData.push(component);
        }
      });

      // Send data to webview
      if (this._view) {
        this._view.webview.postMessage({
          type: 'apiDataReceived',
          data: resultData,
          loading: false,
        });
      }

      vscode.window.showInformationMessage('API data fetched successfully!');
    } catch (error) {
      console.error('Error fetching FlyonUI data:', error);

      let errorMessage = 'Failed to fetch data from FlyonUI API';
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Invalid license key. Please check your license.';
        } else if (error.message.includes('403')) {
          errorMessage =
            'Access denied. Please verify your license has the required permissions.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API endpoint not found.';
        } else {
          errorMessage = `API Error: ${error.message}`;
        }
      }

      vscode.window.showErrorMessage(errorMessage);

      // Hide loading state
      if (this._view) {
        this._view.webview.postMessage({
          type: 'apiDataReceived',
          data: null,
          error: errorMessage,
          loading: false,
        });
      }
    }
  }

  private _refreshData() {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'updateData',
        data: this._fetchFlyonuiData(),
      });
    }
  }

  private async _saveLicenseKey(licenseKey: string) {
    try {
      // Save license key to VS Code settings
      await vscode.workspace
        .getConfiguration('flyonui')
        .update('licenseKey', licenseKey, vscode.ConfigurationTarget.Global);

      // Validate the license key
      const isValid = await this._validateLicenseKey(licenseKey);

      if (isValid) {
        vscode.window.showInformationMessage(
          'License key saved successfully! ✅',
        );
        // Update the UI to show license status
        if (this._view) {
          this._view.webview.postMessage({
            type: 'licenseValidated',
            isValid: true,
            licenseKey: licenseKey,
          });
        }
      } else {
        vscode.window.showWarningMessage(
          'Invalid license key. Please check and try again.',
        );
        if (this._view) {
          this._view.webview.postMessage({
            type: 'licenseValidated',
            isValid: false,
            licenseKey: licenseKey,
          });
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage('Failed to save license key');
      console.error('Error saving license key:', error);
    }
  }

  private async _validateLicense(licenseKey: string) {
    const isValid = await this._validateLicenseKey(licenseKey);
    if (this._view) {
      this._view.webview.postMessage({
        type: 'licenseValidated',
        isValid: isValid,
        licenseKey: licenseKey,
      });
    }
  }

  private async _validateLicenseKey(licenseKey: string): Promise<boolean> {
    // For now, we'll implement a simple validation
    const trimmedKey = licenseKey.trim();

    try {
      const response = await fetch(
        'https://flyonui.com/api/mcp/validate-license-key',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-license-key': trimmedKey,
          },
        },
      );

      if (!response.ok) {
        console.error('Invalid license key:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating license key:', error);
      return false;
    }
  }

  private _getCurrentLicenseKey(): string {
    const config = vscode.workspace.getConfiguration('flyonui');
    return config.get('licenseKey', '');
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get path to media directory
    const mediaPath = vscode.Uri.joinPath(
      this._extensionUri,
      'out',
      'src',
      'webviews',
      'media',
    );

    // Get URIs for CSS and JS files using the found media path
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(mediaPath, 'api-panel.css'),
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(mediaPath, 'api-panel.js'),
    );

    // Read HTML template
    const htmlPath = vscode.Uri.joinPath(mediaPath, 'api-panel.html');
    let htmlContent: string;

    try {
      const htmlBytes = fs.readFileSync(htmlPath.fsPath);
      htmlContent = htmlBytes.toString();
    } catch (error) {
      console.error('Error reading HTML template:', error);
      return this._getErrorHtml('Failed to load HTML template');
    }

    // Replace placeholders with actual URIs
    htmlContent = htmlContent
      .replace('{{styleUri}}', styleUri.toString())
      .replace('{{scriptUri}}', scriptUri.toString());

    return htmlContent;
  }

  private _getErrorHtml(errorMessage: string): string {
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
}
