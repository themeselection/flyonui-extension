# Stagewise Local Testing Guide

## Complete Step-by-Step Testing Plan

This guide will walk you through testing the stagewise CLI and VS Code extension in your local environment.

## Phase 1: Environment Setup ✅

### Prerequisites Checklist

- [x] Node.js 18+ installed
- [x] pnpm package manager installed  
- [x] VS Code installed
- [x] Git installed
- [x] Repository cloned and dependencies installed

### Build Status

- [x] All packages built successfully
- [x] CLI built with proper environment variables
- [x] VS Code extension ready for installation

## Phase 2: CLI Testing Scenarios

### Scenario 1: CLI with IDE Agent

This tests the full stagewise agent functionality:

```bash
# Terminal 1: Start React development server
cd /Users/clevision/clevision/extra/stagewise/examples/react-example
pnpm dev  # Runs on port 3005

# Terminal 2: Start stagewise CLI with built-in agent
cd /Users/clevision/clevision/extra/stagewise/apps/cli
pnpm dev -a 3005 -p 3000

# Test: Open http://localhost:3000 in browser
```

**Expected Results:**

- ✅ Stagewise toolbar appears overlay on the React app
- ✅ Agent interface is available for interactions
- ✅ File operations work through the agent tools
- ✅ User can interact with DOM elements

### Scenario 2: CLI in Bridge Mode

This tests the extension integration pathway:

```bash
# Terminal 1: Keep React server running (port 3005)

# Terminal 2: Start stagewise CLI in bridge mode
cd /Users/clevision/clevision/extra/stagewise/apps/cli
pnpm dev -a 3005 -p 3000 -b

# Test: Open http://localhost:3000 in browser
```

**Expected Results:**

- ✅ Stagewise toolbar appears but without built-in agent
- ✅ Agent discovery shows available external agents
- ✅ Ready to connect to VS Code extension

## Phase 3: VS Code Extension Testing

### Step 1: Package the Extension

Use F5 key and vs code will open a new window with the extension loaded. Currently this will open a new window with website project loaded. but we are going to remove this package soon.

**Extension Testing Checklist:**

- [ ] Extension appears in VS Code extensions list
- [ ] Stagewise status bar item appears
- [ ] Agent selector command works (`stagewise.setAgent`)
- [ ] Extension can detect running IDE (VS Code)
- [ ] Toolbar can connect to extension agent

## Phase 4: Integration Testing Scenarios

### Test Case 1: Basic Workflow

1. Start React app (port 3005)
2. Start stagewise CLI in bridge mode (port 3000)
3. Install and activate VS Code extension
4. Open React project in VS Code
5. Open browser to <http://localhost:3000>
6. Test agent selection in toolbar
7. Send test prompt through toolbar
8. Verify prompt reaches VS Code

### Test Case 2: Agent Detection

1. Test with different IDEs/agents:
   - VS Code with Copilot
   - VS Code with Cline
   - Cursor (if available)
   - Other supported agents

### Test Case 3: Framework Support

Test with different framework examples:

- React: `/examples/react-example`
- Next.js: `/examples/next-example`
- Vue: `/examples/vue-example`
- Angular: `/examples/angular-example`

## Phase 5: Debugging and Troubleshooting

### Common Issues and Solutions

#### CLI Build Fails

```bash
# Check environment variables
cat .env

# Rebuild with verbose output
cd apps/cli
DEBUG=true pnpm build
```

#### Extension Not Loading

```bash
# Check VS Code developer tools
# Help > Toggle Developer Tools
# Look for extension errors in Console

# Reload VS Code window
# Command Palette > Developer: Reload Window
```

#### Port Conflicts

```bash
# Check what's running on ports
lsof -i :3000
lsof -i :3005

# Kill processes if needed
kill -9 <PID>
```

#### Agent Not Connecting

1. Verify CLI is in bridge mode (`-b` flag)
2. Check VS Code extension is active
3. Verify network connectivity between components
4. Check browser console for connection errors

### Debug Commands

```bash
# CLI with verbose logging
cd apps/cli
pnpm dev -a 3005 -p 3000 -v

# Check stagewise processes
ps aux | grep stagewise

# Test API endpoints
curl http://localhost:3000/api/info
curl http://localhost:3000/api/agent/info
```

## Phase 6: Advanced Testing

### Performance Testing

- Test with large React applications
- Monitor memory usage during long sessions
- Test toolbar responsiveness

### Cross-Browser Testing

- Chrome/Chromium
- Firefox
- Safari
- Edge

### Network Testing

- Test on different networks
- Test with proxy configurations
- Test offline behavior

## Success Criteria

Your local testing setup is successful when:

- ✅ CLI builds without errors
- ✅ VS Code extension installs and activates
- ✅ React example runs on port 3005
- ✅ Stagewise toolbar appears on port 3000
- ✅ Agent selection works in toolbar
- ✅ Prompts can be sent from toolbar to VS Code
- ✅ Extension can dispatch to appropriate IDE agents

## Next Steps

After successful local testing:

1. **Contribute**: Submit PRs for any improvements found
2. **Document**: Update documentation based on testing experience
3. **Deploy**: Consider deploying to staging environment
4. **Share**: Share testing results with the team

## Quick Test Script

Use the provided `test-local.sh` script for automated setup:

```bash
./test-local.sh
```

This script automates most of the setup and provides guided testing steps.
