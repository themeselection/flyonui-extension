// Get VS Code API
const vscode = acquireVsCodeApi();

// Main functions
function refreshData() {
  vscode.postMessage({
    type: 'refresh',
  });
}

function saveLicenseKey() {
  const input = document.getElementById('license-key-input');
  const licenseKey = input.value.trim();

  if (!licenseKey) {
    alert('Please enter a license key');
    return;
  }

  // Disable button while saving
  const saveBtn = document.getElementById('save-license-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  vscode.postMessage({
    type: 'saveLicenseKey',
    licenseKey: licenseKey,
  });
}

function openFlyonuiPro() {
  vscode.postMessage({
    type: 'openFlyonuiPro',
  });
}

function fetchApiData() {
  vscode.postMessage({
    type: 'fetchApiData',
  });
}

function validateLicense() {
  const input = document.getElementById('license-key-input');
  const licenseKey = input.value.trim();

  if (!licenseKey) {
    return;
  }

  vscode.postMessage({
    type: 'validateLicense',
    licenseKey: licenseKey,
  });
}

// UI Update Functions
function renderComponentCards(components) {
  const grid = document.getElementById('components-grid');

  // Clear existing content
  grid.innerHTML = '';

  // Add search functionality
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  searchContainer.innerHTML = `
    <input 
      type="text" 
      class="search-input" 
      id="component-search" 
      placeholder="🔍 Search components..."
      oninput="filterComponents(this.value)"
    />
  `;
  grid.appendChild(searchContainer);

  // Add components count
  const countContainer = document.createElement('div');
  countContainer.className = 'components-count';
  countContainer.id = 'components-count';
  countContainer.textContent = `Found ${components.length} components Category`;
  grid.appendChild(countContainer);

  // Store original components for filtering
  window.originalComponents = components;

  // Render component cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'components-grid';
  cardsContainer.id = 'cards-container';

  components.forEach((component, index) => {
    const card = createComponentCard(component, index);
    cardsContainer.appendChild(card);
  });

  grid.appendChild(cardsContainer);
}

function createComponentCard(component, index) {
  const card = document.createElement('div');
  card.className = 'component-card';
  card.setAttribute('data-component-index', index);

  // Generate a simple icon based on component name
  const icon = getComponentIcon(component.name);

  card.innerHTML = `
    <div class="component-header">
      <h3 class="component-name">${escapeHtml(component.name)}</h3>
      <span class="component-icon">${icon}</span>
    </div>
    <p class="component-description">${escapeHtml(component.description || 'No description available')}</p>
    <div class="component-footer">
      <code class="component-path">${escapeHtml(component.path)}</code>
      <div class="component-actions">
        <button class="action-btn primary" onclick="copyComponentPath('${escapeHtml(component.path)}')">
          📋 Copy
        </button>
        <button class="action-btn" onclick="openComponent('${escapeHtml(component.name)}', '${escapeHtml(component.path)}')">
          👁️ View
        </button>
      </div>
    </div>
  `;

  // Add click handler for the entire card
  card.addEventListener('click', (e) => {
    // Don't trigger if clicking on buttons
    if (!e.target.classList.contains('action-btn')) {
      copyComponentPath(component.path);
    }
  });

  return card;
}

function getComponentIcon(name) {
  const iconMap = {
    grid: '🏗️',
    card: '🎴',
    button: '🔘',
    form: '📝',
    input: '📝',
    modal: '🪟',
    menu: '📋',
    nav: '🧭',
    table: '📊',
    chart: '📈',
    avatar: '👤',
    badge: '🏷️',
    alert: '⚠️',
    toast: '🍞',
    tab: '📑',
    accordion: '📁',
    slider: '🎚️',
    progress: '📊',
    loading: '⏳',
    spinner: '🔄',
  };

  const nameLower = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (nameLower.includes(key)) {
      return icon;
    }
  }

  return '🧩'; // Default component icon
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function copyComponentPath(path) {
  // Use VS Code API to copy to clipboard
  vscode.postMessage({
    type: 'copyToClipboard',
    text: path,
  });

  // Show temporary feedback
  showCopyFeedback();
}

function openComponent(name, path) {
  vscode.postMessage({
    type: 'openComponent',
    name: name,
    path: path,
  });
}

function showCopyFeedback() {
  // Create temporary feedback element
  const feedback = document.createElement('div');
  feedback.textContent = '✅ Copied to clipboard!';
  feedback.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: var(--vscode-notificationsInfoIcon-foreground);
    color: var(--vscode-foreground);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
    animation: fadeInOut 2s ease-in-out;
  `;

  document.body.appendChild(feedback);

  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
  }, 2000);
}

function filterComponents(searchTerm) {
  const components = window.originalComponents || [];
  const searchLower = searchTerm.toLowerCase().trim();

  if (!searchLower) {
    // Show all components
    renderFilteredComponents(components);
    return;
  }

  // Filter components based on name, description, or path
  const filtered = components.filter((component) => {
    return (
      component.name.toLowerCase().includes(searchLower) ||
      component.description?.toLowerCase().includes(searchLower) ||
      component.path.toLowerCase().includes(searchLower)
    );
  });

  renderFilteredComponents(filtered);
}

function renderFilteredComponents(components) {
  const cardsContainer = document.getElementById('cards-container');
  const countContainer = document.getElementById('components-count');

  if (!cardsContainer || !countContainer) return;

  // Update count
  countContainer.textContent = `Found ${components.length} components Category`;

  // Clear and render filtered components
  cardsContainer.innerHTML = '';

  if (components.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <p>🔍 No components found</p>
      <p>Try adjusting your search terms</p>
    `;
    cardsContainer.appendChild(noResults);
    return;
  }

  components.forEach((component, index) => {
    const card = createComponentCard(component, index);
    cardsContainer.appendChild(card);
  });
}

function showComponentDetails(blocks, componentName, componentPath, error) {
  const emptyState = document.getElementById('empty-state');
  const errorState = document.getElementById('error-state');
  const dataContainer = document.getElementById('api-data-container');

  console.log('showComponentDetails called with:', {
    blocks,
    componentName,
    componentPath,
    error,
    blocksIsArray: Array.isArray(blocks),
    blocksLength: blocks ? blocks.length : 'null',
  });

  // Hide loading state
  showLoadingState(false);

  // Hide other states
  emptyState.style.display = 'none';
  errorState.style.display = 'none';
  dataContainer.style.display = 'block';

  // Render component details view
  renderComponentDetails(blocks, componentName, componentPath, error);
}

function renderComponentDetails(blocks, componentName, componentPath, error) {
  console.log('renderComponentDetails called with:', {
    blocks,
    componentName,
    componentPath,
    error,
  });

  const grid = document.getElementById('components-grid');

  // Clear existing content
  grid.innerHTML = '';

  // Create header with back button
  const header = document.createElement('div');
  header.className = 'details-header';
  header.innerHTML = `
    <button class="back-btn" onclick="goBackToComponents()">
      ← Back to Components
    </button>
    <h2 class="details-title">${escapeHtml(componentName)}</h2>
    <p class="details-path">${escapeHtml(componentPath)}</p>
  `;
  grid.appendChild(header);

  // Handle error case
  if (error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'no-results';
    errorDiv.innerHTML = `
      <p>❌ Error loading component details</p>
      <p>${escapeHtml(error)}</p>
    `;
    grid.appendChild(errorDiv);
    return;
  }

  // Check if blocks exist and have content
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    console.log('No blocks found, showing no-results message');
    const noBlocks = document.createElement('div');
    noBlocks.className = 'no-results';
    noBlocks.innerHTML = `
      <p>📄 No blocks found for this component</p>
      <p>This component might not have detailed block information available</p>
    `;
    grid.appendChild(noBlocks);
    return;
  }

  // Create blocks container
  const blocksContainer = document.createElement('div');
  blocksContainer.className = 'blocks-container';

  blocks.forEach((block, index) => {
    const blockCard = createBlockCard(block, index);
    blocksContainer.appendChild(blockCard);
  });

  grid.appendChild(blocksContainer);
}

function createBlockCard(block, index) {
  const card = document.createElement('div');
  card.className = 'block-card';

  // Handle different possible block structures
  const blockName = block.name || block.title || `Block ${index + 1}`;
  const blockDescription =
    block.description || block.blockDescription || 'No description available';
  const blockCode = block.code || block.html || block.template || '';
  const imgUrl = `https://cdn.flyonui.com/fy-assets/extension${block.path}.png`;

  card.innerHTML = `
    ${imgUrl ? `<img src="${imgUrl}" alt="${escapeHtml(blockName)}" class="contain h-[200px] w-[250px] rounded-lg border border-border object-cover shadow-md" />` : ''}
    <div class="block-header">
      <h3 class="block-name">${escapeHtml(blockName)}</h3>
      <span class="block-index">#${index + 1}</span>
    </div>
    <p class="block-description">${escapeHtml(blockDescription)}</p>
    ${
      blockCode
        ? `
      <div class="block-code-container">
        <div class="code-header">
          <span class="code-label">Code</span>
          <button class="copy-code-btn" data-block-index="${index}">
            📋 Copy Code
          </button>
        </div>
        <pre class="block-code"><code>${escapeHtml(blockCode)}</code></pre>
      </div>
    `
        : ''
    }
  `;

  // Add event listener for copy button if code exists
  if (blockCode) {
    const copyBtn = card.querySelector('.copy-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyBlockCode(blockCode);
      });
    }
  }

  return card;
}

function copyBlockCode(code) {
  vscode.postMessage({
    type: 'copyToClipboard',
    text: code,
  });

  showCopyFeedback();
}

function goBackToComponents() {
  // Re-fetch the original component list
  fetchApiData();
}

function showLoadingState(loading) {
  const fetchBtn = document.getElementById('fetch-api-btn');
  const emptyState = document.getElementById('empty-state');
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const dataContainer = document.getElementById('api-data-container');

  if (loading) {
    if (fetchBtn) {
      fetchBtn.disabled = true;
      fetchBtn.textContent = '⏳ Fetching...';
    }
    emptyState.style.display = 'none';
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    dataContainer.style.display = 'none';
  } else {
    if (fetchBtn) {
      fetchBtn.disabled = false;
      fetchBtn.textContent = '📡 Fetch Data';
    }
    loadingState.style.display = 'none';
  }
}

function showApiData(data, error) {
  console.log('showApiData called with data:', data, 'error:', error);

  const emptyState = document.getElementById('empty-state');
  const errorState = document.getElementById('error-state');
  const dataContainer = document.getElementById('api-data-container');
  const errorMessage = document.getElementById('error-message');

  // Hide loading state
  showLoadingState(false);

  if (error) {
    // Show error state
    emptyState.style.display = 'none';
    errorState.style.display = 'block';
    dataContainer.style.display = 'none';
    errorMessage.textContent = error;
  } else if (data && Array.isArray(data) && data.length > 0) {
    // Show data
    emptyState.style.display = 'none';
    errorState.style.display = 'none';
    dataContainer.style.display = 'block';

    renderComponentCards(data);
  } else {
    // Show empty state
    emptyState.style.display = 'block';
    errorState.style.display = 'none';
    dataContainer.style.display = 'none';
  }
}

function updateLicenseStatus(isValid, licenseKey) {
  const statusElement = document.getElementById('license-status');
  const saveBtn = document.getElementById('save-license-btn');
  const input = document.getElementById('license-key-input');
  const currentLicenseDiv = document.getElementById('license-current');
  const currentLicenseText = document.getElementById('current-license-text');

  // Re-enable save button
  saveBtn.disabled = false;
  saveBtn.textContent = 'Save License';

  if (isValid && licenseKey) {
    statusElement.textContent = 'Valid';
    statusElement.className = 'license-status valid';
    input.value = licenseKey;
    currentLicenseDiv.style.display = 'block';
    currentLicenseText.textContent = licenseKey;
  } else if (licenseKey) {
    statusElement.textContent = 'Invalid';
    statusElement.className = 'license-status invalid';
    currentLicenseDiv.style.display = 'none';
  } else {
    statusElement.textContent = 'No License';
    statusElement.className = 'license-status none';
    currentLicenseDiv.style.display = 'none';
  }
}

function updateUI(data) {
  // Update license info
  if (data.licenseInfo) {
    const statusElement = document.getElementById('license-status');
    const input = document.getElementById('license-key-input');
    const currentLicenseDiv = document.getElementById('license-current');
    const currentLicenseText = document.getElementById('current-license-text');

    if (data.licenseInfo.hasLicense) {
      statusElement.textContent = data.licenseInfo.isValid
        ? 'Valid'
        : 'Invalid';
      statusElement.className = `license-status ${data.licenseInfo.isValid ? 'valid' : 'invalid'}`;
      input.value = data.licenseInfo.licenseKey;

      if (data.licenseInfo.isValid) {
        currentLicenseDiv.style.display = 'block';
        currentLicenseText.textContent = data.licenseInfo.licenseKey;
      } else {
        currentLicenseDiv.style.display = 'none';
      }
    } else {
      statusElement.textContent = 'No License';
      statusElement.className = 'license-status none';
      input.value = '';
      currentLicenseDiv.style.display = 'none';
    }
  }
}

// Initialize when page loads
function initializePage(initialData) {
  if (initialData?.licenseInfo) {
    updateUI(initialData);

    // If we have a valid license, automatically fetch data
    if (initialData.licenseInfo.hasLicense && initialData.licenseInfo.isValid) {
      fetchApiData();
    }
  }
}

// Message listener for communication with extension
window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'updateData':
      updateUI(message.data);
      break;
    case 'licenseValidated':
      updateLicenseStatus(message.isValid, message.licenseKey);
      break;
    case 'apiDataLoading':
      showLoadingState(message.loading);
      break;
    case 'apiDataReceived':
      showApiData(message.data, message.error);
      break;
    case 'componentDetailsReceived':
      showComponentDetails(
        message.data,
        message.componentName,
        message.componentPath,
        message.error,
      );
      break;
    case 'initialize':
      initializePage(message.data);
      break;
  }
});

// Make functions globally accessible
window.filterComponents = filterComponents;
window.openComponent = openComponent;
window.goBackToComponents = goBackToComponents;

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Request initial data from extension
  vscode.postMessage({
    type: 'requestInitialData',
  });
});
