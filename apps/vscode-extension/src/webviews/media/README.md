# WebView Media Files Structure

This directory contains the separated media files for the VS Code extension webviews, following industry best practices for maintainability and organization.

## Files Structure

```
src/webviews/media/
├── api-panel.html    # HTML template for the API data panel
├── api-panel.css     # Styles for the API data panel
└── api-panel.js      # JavaScript logic for the API data panel
```

## Benefits of This Approach

### 1. **Separation of Concerns**

- **HTML**: Structure and content
- **CSS**: Styling and layout
- **JavaScript**: Functionality and interactions
- **TypeScript**: VS Code extension logic

### 2. **Better Maintainability**

- Each file focuses on a single responsibility
- Easier to debug and modify specific aspects
- Better code organization and readability

### 3. **Development Experience**

- Proper syntax highlighting for each file type
- IDE support for HTML, CSS, and JavaScript
- Easier collaboration between developers

### 4. **Industry Standards**

- Follows standard web development practices
- Aligns with VS Code extension best practices
- Consistent with modern frontend development patterns

## How It Works

### Build Process

1. **Webpack Configuration**: The `webpack.config.js` includes a `CopyWebpackPlugin` that copies media files to the output directory
2. **File Copying**: Media files are copied from `src/webviews/media/` to `out/src/webviews/media/` during build
3. **URI Generation**: The TypeScript code generates proper webview URIs for the copied files

### TypeScript Integration

```typescript
// Generate URIs for media files
const mediaPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webviews', 'media');
const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'api-panel.css'));
const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'api-panel.js'));

// Replace placeholders in HTML template
htmlContent = htmlContent
  .replace('{{styleUri}}', styleUri.toString())
  .replace('{{scriptUri}}', scriptUri.toString());
```

### HTML Template System

- HTML files use placeholders (`{{styleUri}}`, `{{scriptUri}}`) that are replaced at runtime
- This ensures proper webview URI handling and security

## File Descriptions

### api-panel.html

- Main HTML structure for the API data panel
- Contains semantic markup for license management and API data display
- Uses placeholder syntax for dynamic URI injection

### api-panel.css

- Complete styling for the webview using VS Code CSS variables
- Responsive design with proper theming support
- Organized by component sections (license, API data, buttons, etc.)

### api-panel.js

- All JavaScript functionality for the webview
- Handles communication with the VS Code extension
- Manages UI state updates and user interactions
- Includes proper error handling and loading states

## Adding New WebViews

To add a new webview following this pattern:

1. **Create Media Files**:

   ```
   src/webviews/media/
   ├── new-panel.html
   ├── new-panel.css
   └── new-panel.js
   ```

2. **Update Webpack Config**: The CopyWebpackPlugin will automatically copy all files in the media directory

3. **Create WebView Provider**: Follow the same pattern as `ApiDataProvider` to load external files

4. **Update Package.json**: Add view container and commands if needed

## Security Considerations

- All media files are served through VS Code's webview URI system
- Content Security Policy (CSP) is handled by VS Code
- No external resources are loaded directly
- All communications use VS Code's message passing system

## Performance Benefits

- **Smaller Bundle Size**: Media files are separate from the main extension bundle
- **Better Caching**: Static files can be cached independently
- **Faster Development**: Changes to media files don't require TypeScript recompilation
- **Parallel Loading**: CSS and JS can be loaded in parallel by the browser
