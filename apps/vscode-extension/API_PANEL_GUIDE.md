# API Data Panel - Testing Guide

## Overview

You have successfully created a dedicated sidebar panel for your VS Code extension! The panel displays as a sidebar (similar to the "Build & Launch" panel in your screenshot) instead of opening as a tab.

## What's Been Implemented

### 1. **Sidebar Panel Configuration**

- Added a new view container `stagewise-sidebar` with rocket icon in the Activity Bar
- Registered a webview view `stagewise.apiDataView` named "Build & Launch"
- The panel appears as a dedicated sidebar when you click the Stagewise icon

### 2. **Sample API Data Display**

The panel now shows realistic API-related data:

- **Stats Cards**: Total APIs, Active APIs, Total Endpoints, Average Response Time
- **API Services List**: Shows 4 sample API services with details:
  - User Authentication API (REST API)
  - Payment Gateway Integration (GraphQL)
  - File Upload Service (REST API)
  - Notification System (WebSocket)

### 3. **Interactive Features**

- **Refresh Button**: Updates the data dynamically
- **Clickable Items**: Click on any API service to trigger actions
- **Responsive Design**: Uses VS Code's native styling and themes

## How to Test

### Step 1: Launch Extension Development Host

The extension should already be running in development mode. If not:

```bash
cd apps/vscode-extension
code . --extensionDevelopmentPath=.
```

### Step 2: Find the Sidebar Panel

1. Look for the **rocket icon** (🚀) in the Activity Bar (left side of VS Code)
2. Click on it to open the Stagewise sidebar
3. You should see the "Build & Launch" panel

### Step 3: Test Features

1. **View the Dashboard**: See the stats cards and API services list
2. **Click Refresh**: Use the refresh button to update data
3. **Click API Services**: Click on any API service item to see info messages
4. **Test Commands**: Use Ctrl/Cmd+Shift+P and search for:
   - "Stagewise: Focus API Data View"
   - "Stagewise: Open API Data Panel"

## File Structure

```
src/
├── webviews/
│   └── api-data-panel.ts          # Main webview provider
└── activation/
    └── activate.ts                # Registration logic
```

## Key Features

### Visual Design

- **VS Code Native Styling**: Uses CSS variables for theming
- **Grid Layout**: 2x2 stats cards layout
- **Status Indicators**: Color-coded status badges (Active, In Progress, Pending)
- **Hover Effects**: Interactive hover states for better UX

### Data Structure

```typescript
{
  projects: [
    {
      id: number,
      name: string,
      status: 'Active' | 'In Progress' | 'Pending',
      type: 'REST API' | 'GraphQL' | 'WebSocket',
      endpoints: number,
      methods: string[]
    }
  ],
  stats: {
    totalProjects: number,
    activeProjects: number,
    totalEndpoints: number,
    responseTime: string
  }
}
```

## Next Steps

### 1. **Connect Real Data**

Replace the `_getSampleData()` method with actual API calls:

```typescript
private async _fetchRealData() {
  // Fetch from your actual API
  const response = await fetch('your-api-endpoint');
  return await response.json();
}
```

### 2. **Add More Functionality**

- Add search/filter functionality
- Implement API testing features
- Add configuration options
- Create detailed API documentation views

### 3. **Enhance UI**

- Add icons for different API types
- Implement expandable/collapsible sections
- Add charts or graphs for analytics
- Include error handling and loading states

## Configuration Commands

The following commands are available:

- `stagewise.setAgent` - Set preferred agent
- `extension.openDataPanel` - Show info about sidebar (legacy)
- `stagewise.focusApiDataView` - Focus the API Data view

## Troubleshooting

If the sidebar doesn't appear:

1. Check the Activity Bar for the rocket icon
2. Try reloading the Extension Development Host (Ctrl/Cmd+R)
3. Check the Developer Console for any errors
4. Ensure the extension is properly activated

The panel should now work exactly like the sidebar shown in your screenshot! 🎉
