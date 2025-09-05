# Example: Creating a New WebView Panel

This example demonstrates how to create a new webview panel using the separated media files structure.

## Step 1: Create Media Files

Create three files in `src/webviews/media/`:

**settings-panel.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings Panel</title>
    <link rel="stylesheet" href="{{styleUri}}">
</head>
<body>
    <div class="header">
        <h1>Settings</h1>
    </div>
    <div class="content">
        <div class="setting-group">
            <label for="theme">Theme:</label>
            <select id="theme" onchange="updateSetting('theme', this.value)">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
            </select>
        </div>
    </div>
    <script src="{{scriptUri}}"></script>
</body>
</html>
```

**settings-panel.css**

```css
body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    background-color: var(--vscode-editor-background);
    margin: 0;
    padding: 16px;
}

.header h1 {
    color: var(--vscode-panel-title-foreground);
    margin-bottom: 20px;
}

.setting-group {
    margin-bottom: 16px;
}

.setting-group label {
    display: block;
    margin-bottom: 4px;
    color: var(--vscode-foreground);
}

.setting-group select {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 4px;
    padding: 8px;
}
```

**settings-panel.js**

```javascript
const vscode = acquireVsCodeApi();

function updateSetting(key, value) {
    vscode.postMessage({
        type: 'updateSetting',
        key: key,
        value: value
    });
}

// Listen for messages from extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'settingsLoaded':
            loadSettings(message.settings);
            break;
    }
});

function loadSettings(settings) {
    document.getElementById('theme').value = settings.theme || 'dark';
}
```

## Step 2: Create WebView Provider

**src/webviews/settings-panel.ts**

```typescript
import * as vscode from 'vscode';
import * as fs from 'fs';

export class SettingsProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'myExtension.settingsView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'updateSetting':
                    await this._updateSetting(data.key, data.value);
                    break;
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const mediaPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webviews', 'media');
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'settings-panel.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'settings-panel.js'));
        
        try {
            const htmlPath = vscode.Uri.joinPath(mediaPath, 'settings-panel.html');
            const htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');
            
            return htmlContent
                .replace('{{styleUri}}', styleUri.toString())
                .replace('{{scriptUri}}', scriptUri.toString());
        } catch (error) {
            return this._getErrorHtml('Failed to load settings panel');
        }
    }

    private _getErrorHtml(errorMessage: string): string {
        return `<!DOCTYPE html>
<html><body style="color: var(--vscode-errorForeground);">
<h2>Error</h2><p>${errorMessage}</p>
</body></html>`;
    }

    private async _updateSetting(key: string, value: string) {
        await vscode.workspace
            .getConfiguration('myExtension')
            .update(key, value, vscode.ConfigurationTarget.Global);
        
        vscode.window.showInformationMessage(`Setting updated: ${key} = ${value}`);
    }
}
```

## Step 3: Register the Provider

**src/extension.ts**

```typescript
import { SettingsProvider } from './webviews/settings-panel';

export function activate(context: vscode.ExtensionContext) {
    const settingsProvider = new SettingsProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SettingsProvider.viewType,
            settingsProvider
        )
    );
}
```

## Step 4: Update package.json

Add to the `contributes` section:

```json
{
    "contributes": {
        "views": {
            "explorer": [
                {
                    "id": "myExtension.settingsView",
                    "name": "My Extension Settings",
                    "when": "true"
                }
            ]
        }
    }
}
```

## Benefits of This Structure

1. **Clean Separation**: Each file has a single responsibility
2. **Reusable**: CSS and JS can be shared between panels
3. **Maintainable**: Easy to update styles or behavior independently
4. **Standards Compliant**: Follows web development best practices
5. **IDE Support**: Full syntax highlighting and IntelliSense support

## Build Process

The webpack configuration automatically copies all files from `src/webviews/media/` to the output directory, so no additional configuration is needed.
