// Get VS Code API
const vscode = acquireVsCodeApi();

// Fuzzy search utility function
function fuzzyMatch(text, query) {
  if (!text || !query) return { match: false, score: 0 };

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match gets highest score
  if (lowerText.includes(lowerQuery)) {
    return { match: true, score: 100 - lowerText.indexOf(lowerQuery) * 10 };
  }

  // Fuzzy matching algorithm
  let textIndex = 0;
  let queryIndex = 0;
  const matches = [];
  let consecutiveMatches = 0;
  let totalScore = 0;

  while (textIndex < lowerText.length && queryIndex < lowerQuery.length) {
    if (lowerText[textIndex] === lowerQuery[queryIndex]) {
      matches.push(textIndex);
      consecutiveMatches++;
      queryIndex++;

      // Bonus for consecutive matches
      totalScore += consecutiveMatches * 2;
    } else {
      consecutiveMatches = 0;
    }
    textIndex++;
  }

  // Check if all query characters were found
  if (queryIndex === lowerQuery.length) {
    // Bonus for matches at word boundaries
    const wordBoundaryBonus =
      matches.filter(
        (index) =>
          index === 0 ||
          lowerText[index - 1] === ' ' ||
          lowerText[index - 1] === '-' ||
          lowerText[index - 1] === '_',
      ).length * 5;

    // Penalty for distance between matches
    const spread =
      matches.length > 1 ? matches[matches.length - 1] - matches[0] : 0;
    const spreadPenalty = Math.floor(spread / lowerQuery.length);

    totalScore += wordBoundaryBonus - spreadPenalty;

    // Normalize score based on text length
    const normalizedScore = Math.max(
      0,
      Math.min(100, totalScore * (lowerQuery.length / lowerText.length) * 50),
    );

    return { match: true, score: normalizedScore };
  }

  return { match: false, score: 0 };
}

function fuzzySearchItems(items, query, searchFields) {
  if (!query.trim()) {
    return items;
  }

  const results = [];

  items.forEach((item) => {
    let bestScore = 0;
    let hasMatch = false;

    // Search in specified fields
    searchFields.forEach((field) => {
      const fieldValue = getNestedProperty(item, field);
      if (fieldValue) {
        const result = fuzzyMatch(fieldValue, query);
        if (result.match) {
          hasMatch = true;
          bestScore = Math.max(bestScore, result.score);
        }
      }
    });

    if (hasMatch) {
      results.push({ item, score: bestScore });
    }
  });

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  return results.map((result) => result.item);
}

function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
}

function highlightMatches(text, query) {
  if (!text || !query) return escapeHtml(text);

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // For exact matches, highlight the exact substring
  if (lowerText.includes(lowerQuery)) {
    const index = lowerText.indexOf(lowerQuery);
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    return `${escapeHtml(before)}<mark class="search-highlight">${escapeHtml(match)}</mark>${escapeHtml(after)}`;
  }

  // For fuzzy matches, highlight individual matching characters
  let result = '';
  let textIndex = 0;
  let queryIndex = 0;

  while (textIndex < text.length) {
    if (
      queryIndex < query.length &&
      lowerText[textIndex] === lowerQuery[queryIndex]
    ) {
      result += `<mark class="search-highlight">${escapeHtml(text[textIndex])}</mark>`;
      queryIndex++;
    } else {
      result += escapeHtml(text[textIndex]);
    }
    textIndex++;
  }

  return result;
}

// Main functions
function refreshData() {
  vscode.postMessage({
    type: 'refresh',
  });
}

function saveLicenseKey() {
  const input = document.getElementById('license-key-input');
  const licenseKey = input.value.trim();

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

function createComponentCard(component, index, searchQuery = '') {
  const card = document.createElement('div');
  card.className = 'component-card';
  card.setAttribute('data-component-index', index);

  const displayName = searchQuery
    ? highlightMatches(component.name, searchQuery)
    : escapeHtml(component.name);

  card.innerHTML = `
    <img src="${escapeHtml(component.imgSrc || '')}" alt="${escapeHtml(component.name)}" class="component-image" onclick="openComponent('${escapeHtml(component.name)}', '${escapeHtml(component.path)}')" />
    <div class="component-header">
      <h3 class="component-name">${displayName}</h3>
      <button class="icon-btn explore-btn" onclick="openComponent('${escapeHtml(component.name)}', '${escapeHtml(component.path)}')" title="Explore component blocks">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  `;

  return card;
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

function copyBlockCode(path) {
  vscode.postMessage({
    type: 'copyBlockCode',
    path: path,
  });
}

function sendToIDEAgent(path, name) {
  vscode.postMessage({
    type: 'sendToIDEAgent',
    path: path,
    name: name,
  });
}

function previewBlock(path, name) {
  vscode.postMessage({
    type: 'previewBlock',
    path: path,
    name: name,
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
  const searchQuery = searchTerm.trim();

  if (!searchQuery) {
    // Clear search query and show all components
    window.currentComponentSearch = '';
    renderFilteredComponents(components);
    return;
  }

  // Use fuzzy search for components
  const searchFields = ['name', 'description', 'path'];
  const filtered = fuzzySearchItems(components, searchQuery, searchFields);

  // Store current search query for highlighting
  window.currentComponentSearch = searchQuery;
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

  const searchQuery = window.currentComponentSearch || '';
  components.forEach((component, index) => {
    const card = createComponentCard(component, index, searchQuery);
    cardsContainer.appendChild(card);
  });
}

function filterBlocks(searchTerm) {
  const blocks = window.originalBlocks || [];
  const searchQuery = searchTerm.trim();

  if (!searchQuery) {
    // Clear search query and show all blocks
    window.currentBlockSearch = '';
    renderFilteredBlocks(blocks);
    return;
  }

  // Use fuzzy search for blocks - search in name, title, path, and description
  const searchFields = ['name', 'title', 'path', 'description'];
  const filtered = fuzzySearchItems(blocks, searchQuery, searchFields);

  // Store current search query for highlighting
  window.currentBlockSearch = searchQuery;
  renderFilteredBlocks(filtered);
}

function renderFilteredBlocks(blocks) {
  const blocksContainer = document.getElementById('blocks-container');
  const countContainer = document.getElementById('blocks-count');

  if (!blocksContainer || !countContainer) return;

  // Update count
  countContainer.textContent = `Found ${blocks.length} blocks`;

  // Clear and render filtered blocks
  blocksContainer.innerHTML = '';

  if (blocks.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <p>🔍 No blocks found</p>
      <p>Try adjusting your search terms</p>
    `;
    blocksContainer.appendChild(noResults);
    return;
  }

  const searchQuery = window.currentBlockSearch || '';
  blocks.forEach((block, index) => {
    const blockCard = createBlockCard(block, index, searchQuery);
    blocksContainer.appendChild(blockCard);
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

  // Add search functionality for blocks
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  searchContainer.innerHTML = `
    <input 
      type="text" 
      class="search-input" 
      id="blocks-search" 
      placeholder="🔍 Search blocks..."
      oninput="filterBlocks(this.value)"
    />
  `;
  grid.appendChild(searchContainer);

  // Add blocks count
  const countContainer = document.createElement('div');
  countContainer.className = 'blocks-count';
  countContainer.id = 'blocks-count';
  countContainer.textContent = `Found ${blocks.length} blocks`;
  grid.appendChild(countContainer);

  // Store original blocks for filtering
  window.originalBlocks = blocks;

  // Create blocks container
  const blocksContainer = document.createElement('div');
  blocksContainer.className = 'blocks-container';
  blocksContainer.id = 'blocks-container';

  blocks.forEach((block, index) => {
    const blockCard = createBlockCard(block, index);
    blocksContainer.appendChild(blockCard);
  });

  grid.appendChild(blocksContainer);
}

function createBlockCard(block, index, searchQuery = '') {
  const card = document.createElement('div');
  card.className = 'block-card';

  // Handle different possible block structures
  const blockName = block.name || block.title || `Block ${index + 1}`;
  const displayName = searchQuery
    ? highlightMatches(blockName, searchQuery)
    : escapeHtml(blockName);
  const imgUrl = `https://cdn.flyonui.com/fy-assets/extension${block.path}.png`;

  card.innerHTML = `
    ${imgUrl ? `<img src="${imgUrl}" alt="${escapeHtml(blockName)}" class="component-image" />` : ''}
    <div class="block-header">
      <h3 class="block-name">${displayName}</h3>
      <div class="block-actions">
        <button class="icon-btn preview-btn" onclick="previewBlock('${escapeHtml(block.path)}', '${escapeHtml(blockName)}')" title="Preview block">
          <svg xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke-width="2" 
              stroke="currentColor" 
              width="16" 
              height="16">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
        <button class="icon-btn copy-btn" onclick="copyBlockCode('${escapeHtml(block.path)}')" title="Copy code to clipboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="icon-btn agent-btn" onclick="sendToIDEAgent('${escapeHtml(block.path)}', '${escapeHtml(blockName)}')" title="Send to IDE Agent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

  return card;
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
  saveBtn.textContent = 'Save';

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

function toggleLicenseMenu() {
  const licenseMenu = document.querySelector('.license-content');
  licenseMenu.style.display =
    licenseMenu.style.display === 'none' ? 'block' : 'none';
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
window.filterBlocks = filterBlocks;
window.openComponent = openComponent;
window.goBackToComponents = goBackToComponents;
window.copyBlockCode = copyBlockCode;
window.sendToIDEAgent = sendToIDEAgent;
window.previewBlock = previewBlock;

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Request initial data from extension
  fetchApiData();
});
