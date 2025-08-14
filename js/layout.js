// Global variables
let pages = [];
let currentPageIndex = 0;
let isPortrait = true;
let selectedElement = null;
let savedLayouts = [];
let multiPageDisplayMode = 'single'; // 'single', 'double', 'all'
let customFonts = {};

// Page margin settings (in pixels)
let margins = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

// Convert measurement units
function mmToPx(mm) { return mm * 3.78; }
function inToPx(inches) { return inches * 96; }

const maxWidthPx = 360;

const paperSizes = {
  a4: { widthMM: 210, heightMM: 297 },
  letter: { widthIN: 8.5, heightIN: 11 },
  tabloid: { widthIN: 11, heightIN: 17 },
  custom: { widthPX: 300, heightPX: 400 }
};

// For the HSV color picker
const hsvState = {
  h: 0,
  s: 100,
  v: 100,
  updating: false
};

// Initialize DOM elements after document has loaded
document.addEventListener('DOMContentLoaded', function() {
  // Show the layout
  document.getElementById('layout').style.display = 'flex';
  
  // Create initial setup
  addPage('regular', 1);
  addPage('cover', 0);
  addPage('back', pages.length);
  
  // Update to show cover page first
  showPage(0);
  
  // Setup ruler system
  setupRulers();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load saved layouts
  loadSavedLayouts();
  
  // Create the context menu for elements
  createElementContextMenu();
  
  // Add color picker
  createColorPicker();
  
  // Load html2canvas library for export
  loadHtml2Canvas();
});

// Function to create rulers
function setupRulers() {
  const centerContainer = document.querySelector('.center-container');
  
  // Create ruler elements
  const rulerCorner = document.createElement('div');
  rulerCorner.className = 'ruler-corner';
  
  const rulerH = document.createElement('div');
  rulerH.className = 'ruler ruler-h';
  
  const rulerV = document.createElement('div');
  rulerV.className = 'ruler ruler-v';
  
  centerContainer.appendChild(rulerCorner);
  centerContainer.appendChild(rulerH);
  centerContainer.appendChild(rulerV);
  
  // Update rulers when page is shown
  updateRulers();
}

// Function to update rulers based on current page size
function updateRulers() {
  if (!pages[currentPageIndex]) return;
  
  const page = pages[currentPageIndex];
  const pageRect = page.getBoundingClientRect();
  const rulerH = document.querySelector('.ruler-h');
  const rulerV = document.querySelector('.ruler-v');
  
  // Clear existing markers
  rulerH.innerHTML = '';
  rulerV.innerHTML = '';
  
  // Create horizontal ruler markers
  const pageWidth = parseInt(page.style.width);
  const step = pageWidth > 300 ? 50 : 25;
  
  for (let i = 0; i <= pageWidth; i += step) {
    // Create marker line
    const line = document.createElement('div');
    line.className = 'ruler-line h-line';
    if (i % (step * 2) === 0) line.classList.add('major');
    line.style.left = i + 'px';
    
    // Create text for major markers
    if (i % (step * 2) === 0) {
      const text = document.createElement('div');
      text.className = 'ruler-marker h-marker';
      text.textContent = i;
      text.style.left = i + 'px';
      rulerH.appendChild(text);
    }
    
    rulerH.appendChild(line);
  }
  
  // Create vertical ruler markers
  const pageHeight = parseInt(page.style.height);
  
  for (let i = 0; i <= pageHeight; i += step) {
    // Create marker line
    const line = document.createElement('div');
    line.className = 'ruler-line v-line';
    if (i % (step * 2) === 0) line.classList.add('major');
    line.style.top = i + 'px';
    
    // Create text for major markers
    if (i % (step * 2) === 0) {
      const text = document.createElement('div');
      text.className = 'ruler-marker v-marker';
      text.textContent = i;
      text.style.top = i + 'px';
      rulerV.appendChild(text);
    }
    
    rulerV.appendChild(line);
  }
  
  // Position rulers relative to page
  const centerContainer = document.querySelector('.center-container');
  const centerRect = centerContainer.getBoundingClientRect();
  
  const offsetX = pageRect.left - centerRect.left;
  const offsetY = pageRect.top - centerRect.top;
  
  rulerH.style.transform = `translateX(${offsetX}px)`;
  rulerV.style.transform = `translateY(${offsetY}px)`;
}

// Function to setup event listeners
function setupEventListeners() {
  // Size selector
  document.getElementById('sizeSelector').addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      showCustomSizeDialog();
    } else {
      updateRectSize(e.target.value);
    }
  });
  
  // Orientation button
  document.getElementById('orientationBtn').addEventListener('click', () => {
    updateOrientation();
  });
  
  // Page navigation buttons
  document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPageIndex > 0) {
      showPage(currentPageIndex - 1);
    }
  });
  
  document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPageIndex < pages.length - 1) {
      showPage(currentPageIndex + 1);
    }
  });
  
  // Page management buttons
  document.getElementById('addPageBtn').addEventListener('click', () => addPage('regular'));
  document.getElementById('removePageBtn').addEventListener('click', () => removePage(currentPageIndex));
  document.getElementById('duplicatePageBtn').addEventListener('click', () => duplicatePage(currentPageIndex));
  
  // Menu toggle handlers
  document.getElementById('leftMenuBtn').addEventListener('click', toggleLeftSidebar);
  document.getElementById('rightMenuBtn').addEventListener('click', toggleRightSidebar);
  
  // Element addition handlers
  document.getElementById('addTitleBtn').addEventListener('click', () => addTextElement('title'));
  document.getElementById('addSubtitleBtn').addEventListener('click', () => addTextElement('subtitle'));
  document.getElementById('addParagraphBtn').addEventListener('click', () => addTextElement('paragraph'));
  document.getElementById('addImageBtn').addEventListener('click', () => addTextElement('image'));
  
  // Element deletion handler
  document.getElementById('deleteElementBtn').addEventListener('click', () => {
    if (selectedElement && selectedElement.parentNode) {
      selectedElement.parentNode.removeChild(selectedElement);
      deselectElement();
    }
  });
  
  // Color picker handlers
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
      if (selectedElement) {
        selectedElement.style.color = option.dataset.color;
      }
    });
  });
  
  // Font size handlers
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (selectedElement) {
        selectedElement.style.fontSize = `${btn.dataset.size}px`;
      }
    });
  });
  
  // Font family handler
  document.getElementById('fontFamilySelect').addEventListener('change', (e) => {
    if (selectedElement) {
      selectedElement.style.fontFamily = e.target.value;
    }
  });
  
  // Export handlers
  document.getElementById('exportPngBtn').addEventListener('click', () => exportAsImage('png'));
  document.getElementById('exportJpgBtn').addEventListener('click', () => exportAsImage('jpg'));
  document.getElementById('exportPdfBtn').addEventListener('click', exportAsPDF);
  document.getElementById('saveLayoutBtn').addEventListener('click', showSaveLayoutModal);
  
  // Save layout handlers
  document.getElementById('cancelSaveBtn').addEventListener('click', hideModal);
  document.getElementById('confirmSaveBtn').addEventListener('click', saveLayout);
  
  // Import layout handler
  document.getElementById('importLayoutBtn').addEventListener('click', importLayout);
  
  // Handle click outside elements to deselect
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.text-element') && 
        !e.target.closest('#elementEditor') && 
        !e.target.closest('.sidebar-btn') &&
        !e.target.closest('.element-context-menu')) {
      deselectElement();
    }
  });
}

// Custom Size Dialog
function showCustomSizeDialog() {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Custom Page Size</h3>
      <div class="custom-size-inputs">
        <input type="number" id="customWidth" placeholder="Width" min="100" max="2000">
        <input type="number" id="customHeight" placeholder="Height" min="100" max="2000">
        <select id="customUnit">
          <option value="px">px</option>
          <option value="mm">mm</option>
          <option value="in">in</option>
        </select>
      </div>
      <div class="modal-buttons">
        <button class="sidebar-btn" id="cancelCustomSizeBtn">Cancel</button>
        <button class="sidebar-btn" id="applyCustomSizeBtn">Apply</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus width input
  document.getElementById('customWidth').focus();
  
  // Set up event listeners
  document.getElementById('cancelCustomSizeBtn').addEventListener('click', () => {
    document.body.removeChild(modal);
    // Reset selector back to previous value
    document.getElementById('sizeSelector').value = 'a4';
  });
  
  document.getElementById('applyCustomSizeBtn').addEventListener('click', () => {
    const width = document.getElementById('customWidth').value;
    const height = document.getElementById('customHeight').value;
    const unit = document.getElementById('customUnit').value;
    
    if (width && height) {
      // Update custom paper size
      addCustomPaperSize('custom', parseFloat(width), parseFloat(height), unit);
      
      // Update page size
      updateRectSize('custom');
      
      // Close modal
      document.body.removeChild(modal);
    }
  });
}

// Function to add custom paper size
function addCustomPaperSize(name, width, height, unit = 'px') {
  if (unit === 'mm') {
    paperSizes[name] = { widthMM: width, heightMM: height };
  } else if (unit === 'in') {
    paperSizes[name] = { widthIN: width, heightIN: height };
  } else {
    paperSizes[name] = { widthPX: width, heightPX: height };
  }
  
  // Add to selector if it doesn't exist yet
  const selector = document.getElementById('sizeSelector');
  let optionExists = false;
  
  for (let i = 0; i < selector.options.length; i++) {
    if (selector.options[i].value === name) {
      optionExists = true;
      break;
    }
  }
  
  if (!optionExists) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = 'Custom';
    selector.appendChild(option);
  }
  
  // Select the custom option
  selector.value = name;
}

// Function to create a page
function createPage(type, pageNumber) {
  const page = document.createElement('div');
  page.className = 'rect';
  page.dataset.type = type; // 'cover', 'back', or 'regular'
  page.style.position = 'relative';
  page.style.background = '#ffffff';
  page.style.boxShadow = '0 8px 20px rgba(2,6,23,0.15)';
  page.style.userSelect = 'none';
  page.style.transition = 'width 0.4s ease, height 0.4s ease';
  page.style.width = '320px';
  page.style.height = '452px'; // A4 ratio initially
  page.style.overflow = 'hidden';
  
  const content = document.createElement('div');
  content.className = 'page-content';
  page.appendChild(content);
  
  // Create page margins indicator
  const marginIndicator = document.createElement('div');
  marginIndicator.className = 'page-margins';
  updateMarginIndicator(marginIndicator);
  page.appendChild(marginIndicator);
  
  // Add page label based on type
  const pageLabel = document.createElement('div');
  pageLabel.style.position = 'absolute';
  pageLabel.style.bottom = '8px';
  pageLabel.style.right = '12px';
  pageLabel.style.color = '#666';
  pageLabel.style.fontSize = '12px';
  pageLabel.style.fontWeight = '600';
  pageLabel.style.zIndex = '10';
  
  // Set label text based on page type
  if (type === 'cover') {
    pageLabel.textContent = 'COVER';
    pageLabel.style.color = '#3b82f6';
  } else if (type === 'back') {
    pageLabel.textContent = 'BACK';
    pageLabel.style.color = '#3b82f6';
  } else {
    pageLabel.textContent = pageNumber;
  }
  
  page.appendChild(pageLabel);
  
  return page;
}

// Function to update margin indicator
function updateMarginIndicator(indicator) {
  if (!indicator) return;
  
  indicator.style.top = margins.top + 'px';
  indicator.style.right = margins.right + 'px';
  indicator.style.bottom = margins.bottom + 'px';
  indicator.style.left = margins.left + 'px';
}

// Function to update all margin indicators
function updateAllMarginIndicators() {
  pages.forEach(page => {
    const indicator = page.querySelector('.page-margins');
    if (indicator) {
      updateMarginIndicator(indicator);
    }
  });
}

// Function to update rectangle size
function updateRectSize(key) {
  if (!pages[currentPageIndex]) return;
  
  let widthPx, heightPx;
  
  if (paperSizes[key].widthMM !== undefined) {
    widthPx = mmToPx(paperSizes[key].widthMM);
    heightPx = mmToPx(paperSizes[key].heightMM);
  } else if (paperSizes[key].widthIN !== undefined) {
    widthPx = inToPx(paperSizes[key].widthIN);
    heightPx = inToPx(paperSizes[key].heightIN);
  } else {
    widthPx = paperSizes[key].widthPX;
    heightPx = paperSizes[key].heightPX;
  }
  
  if (widthPx > maxWidthPx) {
    const scale = maxWidthPx / widthPx;
    widthPx = widthPx * scale;
    heightPx = heightPx * scale;
  }
  
  const page = pages[currentPageIndex];
  
  // Apply the correct dimensions based on orientation
  if (!isPortrait) {
    // Swap for landscape
    page.style.width = `${heightPx}px`;
    page.style.height = `${widthPx}px`;
  } else {
    page.style.width = `${widthPx}px`;
    page.style.height = `${heightPx}px`;
  }
  
  // Update rulers after size change
  updateRulers();
  
  // Update margin indicator
  const marginIndicator = page.querySelector('.page-margins');
  if (marginIndicator) {
    updateMarginIndicator(marginIndicator);
  }
}

// Function to update orientation
function updateOrientation() {
  if (!pages[currentPageIndex]) return;
  
  const page = pages[currentPageIndex];
  const width = page.style.width;
  const height = page.style.height;
  
  page.style.width = height;
  page.style.height = width;
  
  isPortrait = !isPortrait;
  
  // Update rulers after orientation change
  updateRulers();
  
  // Update margin indicator
  const marginIndicator = page.querySelector('.page-margins');
  if (marginIndicator) {
    updateMarginIndicator(marginIndicator);
  }
}

// Function to show a single page
function showPage(index) {
  const rectContainer = document.querySelector('.center-container');
  const pageNumberDisplay = document.getElementById('pageNumber');
  
  // Determine display mode
  if (multiPageDisplayMode === 'single') {
    // Single page mode
    rectContainer.innerHTML = '';
    currentPageIndex = index;
    rectContainer.appendChild(pages[currentPageIndex]);
    
    // Update page number display based on page type
    const pageType = pages[currentPageIndex].dataset.type;
    if (pageType === 'cover') {
      pageNumberDisplay.textContent = 'Cover Page';
    } else if (pageType === 'back') {
      pageNumberDisplay.textContent = 'Back Page';
    } else {
      pageNumberDisplay.textContent = `Page ${index + 1}`;
    }
    
    // Apply current size settings to new page
    updateRectSize(document.getElementById('sizeSelector').value);
    
  } else if (multiPageDisplayMode === 'double') {
    // Double page mode - show 2 pages side by side
    rectContainer.innerHTML = '';
    currentPageIndex = index;
    
    // Always show current page
    const mainPageContainer = document.createElement('div');
    mainPageContainer.style.margin = '0 10px';
    mainPageContainer.appendChild(pages[currentPageIndex]);
    rectContainer.appendChild(mainPageContainer);
    
    // Show next page if available
    if (index < pages.length - 1) {
      const secondPageContainer = document.createElement('div');
      secondPageContainer.style.margin = '0 10px';
      secondPageContainer.appendChild(pages[index + 1]);
      rectContainer.appendChild(secondPageContainer);
      pageNumberDisplay.textContent = `Pages ${index + 1}-${index + 2}`;
    } else {
      pageNumberDisplay.textContent = `Page ${index + 1}`;
    }
    
    // Apply current size settings
    updateRectSize(document.getElementById('sizeSelector').value);
    
  } else if (multiPageDisplayMode === 'all') {
    // Show all pages in a grid
    showAllPages();
    return;
  }
  
  // Deselect any element when changing pages
  deselectElement();
  
  // Update rulers
  updateRulers();
}

// Function to show all pages
function showAllPages() {
  const rectContainer = document.querySelector('.center-container');
  const pageNumberDisplay = document.getElementById('pageNumber');
  
  // Clear container
  rectContainer.innerHTML = '';
  rectContainer.className = 'center-container multi-page-container';
  
  // Add all pages as thumbnails
  pages.forEach((page, index) => {
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'page-thumbnail';
    
    if (index === currentPageIndex) {
      thumbnailContainer.classList.add('selected');
    }
    
    if (page.dataset.type === 'cover') {
      thumbnailContainer.classList.add('cover');
    } else if (page.dataset.type === 'back') {
      thumbnailContainer.classList.add('back');
    }
    
    // Create a clone of the page with reduced size
    const clone = page.cloneNode(true);
    const scale = 0.3; // 30% of original size
    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = 'top left';
    clone.style.width = page.style.width;
    clone.style.height = page.style.height;
    
    // Calculate container size based on page dimensions
    const width = parseInt(page.style.width) * scale;
    const height = parseInt(page.style.height) * scale;
    thumbnailContainer.style.width = width + 'px';
    thumbnailContainer.style.height = height + 'px';
    
    // Add page label
    const pageLabel = document.createElement('div');
    pageLabel.className = 'page-label';
    
    if (page.dataset.type === 'cover') {
      pageLabel.textContent = 'COVER';
    } else if (page.dataset.type === 'back') {
      pageLabel.textContent = 'BACK';
    } else {
      pageLabel.textContent = `Page ${index}`;
    }
    
    thumbnailContainer.appendChild(clone);
    thumbnailContainer.appendChild(pageLabel);
    
    // Add click handler to select page
    thumbnailContainer.addEventListener('click', () => {
      currentPageIndex = index;
      multiPageDisplayMode = 'single';
      showPage(index);
      rectContainer.className = 'center-container';
    });
    
    rectContainer.appendChild(thumbnailContainer);
  });
  
  pageNumberDisplay.textContent = 'All Pages';
  
  // Deselect any element
  deselectElement();
}

// Function to add a page
function addPage(type = 'regular', insertPosition = null) {
  const pageNumber = type === 'regular' ? pages.length + 1 : '';
  const newPage = createPage(type, pageNumber);
  
  // Insert at specified position or at the end
  if (insertPosition !== null && insertPosition >= 0 && insertPosition <= pages.length) {
    pages.splice(insertPosition, 0, newPage);
    currentPageIndex = insertPosition;
  } else {
    pages.push(newPage);
    currentPageIndex = pages.length - 1;
  }
  
  updatePageNumbers();
  showPage(currentPageIndex);
}

// Function to update page numbers
function updatePageNumbers() {
  let regularPageCount = 1;
  pages.forEach((page, i) => {
    const pageNumberLabel = page.querySelector('div:last-child');
    if (page.dataset.type === 'regular') {
      pageNumberLabel.textContent = regularPageCount++;
    }
  });
}

// Function to remove a page
function removePage(index) {
  if (pages.length <= 1) return; // Always keep at least one page
  
  const pageType = pages[index].dataset.type;
  
  // Don't remove cover or back if they're the only ones of their type
  if (pageType === 'cover' && pages.filter(p => p.dataset.type === 'cover').length <= 1) {
    alert('Cannot remove cover page - at least one is required');
    return;
  }
  
  if (pageType === 'back' && pages.filter(p => p.dataset.type === 'back').length <= 1) {
    alert('Cannot remove back page - at least one is required');
    return;
  }
  
  // Remove from array
  pages.splice(index, 1);
  
  // Adjust currentPageIndex if needed
  if (currentPageIndex >= pages.length) {
    currentPageIndex = pages.length - 1;
  }
  
  showPage(currentPageIndex);
  updatePageNumbers();
}

// Function to duplicate a page
function duplicatePage(index) {
  const originalPage = pages[index];
  const clone = originalPage.cloneNode(true);
  
  // Keep the same page type
  clone.dataset.type = originalPage.dataset.type;
  
  // Reset event listeners on cloned elements if needed
  const clonedElements = clone.querySelectorAll('.text-element');
  clonedElements.forEach(element => {
    makeElementDraggable(element);
  });
  
  pages.splice(index + 1, 0, clone);
  showPage(index + 1);
  updatePageNumbers();
}

// Function to add text element
function addTextElement(type) {
  if (!pages[currentPageIndex]) return;
  
  const pageContent = pages[currentPageIndex].querySelector('.page-content');
  const element = document.createElement('div');
  element.className = 'text-element';
  element.contentEditable = true;
  element.setAttribute('tabindex', '0');
  
  // Position in the center of the page
  element.style.top = '50px';
  element.style.left = '50px';
  
  switch(type) {
    case 'title':
      element.style.fontSize = '24px';
      element.style.fontWeight = 'bold';
      element.textContent = 'Title';
      break;
    case 'subtitle':
      element.style.fontSize = '18px';
      element.style.fontWeight = 'bold';
      element.textContent = 'Subtitle';
      break;
    case 'paragraph':
      element.style.fontSize = '14px';
      element.textContent = 'Add your text here';
      break;
    case 'image':
      element.textContent = 'Image Placeholder';
      element.style.width = '150px';
      element.style.height = '100px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      element.style.background = '#f0f0f0';
      element.contentEditable = false;
      break;
  }
  
  pageContent.appendChild(element);
  makeElementDraggable(element);
  
  // Select the newly added element
  selectElement(element);
}

// Function to create context menu for elements
function createElementContextMenu() {
  const menu = document.createElement('div');
  menu.className = 'element-context-menu';
  menu.id = 'elementContextMenu';
  menu.style.display = 'none';
  
  // Move button
  const moveBtn = document.createElement('button');
  moveBtn.className = 'context-menu-btn';
  moveBtn.innerHTML = '↕';
  moveBtn.title = 'Move';
  moveBtn.id = 'moveElementBtn';
  
  // Scale button
  const scaleBtn = document.createElement('button');
  scaleBtn.className = 'context-menu-btn';
  scaleBtn.innerHTML = '⤡';
  scaleBtn.title = 'Resize';
  scaleBtn.id = 'scaleElementBtn';
  
  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'context-menu-btn';
  editBtn.innerHTML = '✎';
  editBtn.title = 'Edit';
  editBtn.id = 'editElementBtn';
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'context-menu-btn';
  deleteBtn.innerHTML = '🗑';
  deleteBtn.title = 'Delete';
  deleteBtn.id = 'contextDeleteBtn';
  
  menu.appendChild(moveBtn);
  menu.appendChild(scaleBtn);
  menu.appendChild(editBtn);
  menu.appendChild(deleteBtn);
  
  document.body.appendChild(menu);
  
  // Event listeners
  moveBtn.addEventListener('click', handleMove);
  scaleBtn.addEventListener('click', handleResize);
  editBtn.addEventListener('click', handleEdit);
  deleteBtn.addEventListener('click', handleDelete);
}

// Function to position the context menu
function positionContextMenu() {
  if (!selectedElement) return;
  
  const menu = document.getElementById('elementContextMenu');
  const rect = selectedElement.getBoundingClientRect();
  
  menu.style.display = 'flex';
  menu.style.top = `${rect.top - 40}px`;
  menu.style.left = `${rect.left}px`;
}

// Handler functions for context menu
function handleMove() {
  if (!selectedElement) return;
  
  // Element already set up for dragging, just hide the menu
  document.getElementById('elementContextMenu').style.display = 'none';
}

function handleResize() {
  if (!selectedElement) return;
  
  // Implement resize mode - the element is already set up for resizing
  // Hide the context menu
  document.getElementById('elementContextMenu').style.display = 'none';
}

function handleEdit() {
  if (!selectedElement) return;
  
  // Focus the element for editing
  selectedElement.focus();
  
  // Hide the context menu
  document.getElementById('elementContextMenu').style.display = 'none';
}

function handleDelete() {
  if (!selectedElement || !selectedElement.parentNode) return;
  
  // Remove the element
  selectedElement.parentNode.removeChild(selectedElement);
  
  // Hide the context menu and deselect
  document.getElementById('elementContextMenu').style.display = 'none';
  deselectElement();
}

// Function to make element draggable and resizable
function makeElementDraggable(element) {
  let isDragging = false;
  let isResizing = false;
  let offsetX = 0, offsetY = 0;
  
  element.onmousedown = dragStart;
  
  function dragStart(e) {
    selectElement(element);
    
    const rect = element.getBoundingClientRect();
    const cornerSize = 12;
    const isInResizeCorner =
      e.clientX >= rect.right - cornerSize &&
      e.clientY >= rect.bottom - cornerSize;
    
    // Set mode based on where clicked
    if (isInResizeCorner) {
      isResizing = true;
    } else {
      isDragging = true;
      
      // Allow text edit when clicking directly on text
      if (e.target === element) {
        element.focus();
        isDragging = false;
        return;
      }
    }
    
    e.preventDefault();
    
    // Calculate offset for dragging
    if (isDragging) {
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    }
    
    // Set initial dimensions for resizing
    if (isResizing) {
      element.initialWidth = rect.width;
      element.initialHeight = rect.height;
      element.initialX = e.clientX;
      element.initialY = e.clientY;
    }
    
    document.onmousemove = dragMove;
    document.onmouseup = dragEnd;
  }
  
  function dragMove(e) {
    e.preventDefault();
    
    if (isDragging) {
      // Move operation
      const pageRect = element.parentElement.getBoundingClientRect();
      const x = e.clientX - pageRect.left - offsetX;
      const y = e.clientY - pageRect.top - offsetY;
      
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    } else if (isResizing) {
      // Resize operation
      const dx = e.clientX - element.initialX;
      const dy = e.clientY - element.initialY;
      
      const newWidth = Math.max(50, element.initialWidth + dx);
      const newHeight = Math.max(30, element.initialHeight + dy);
      
      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
    }
  }
  
  function dragEnd() {
    isDragging = false;
    isResizing = false;
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

// Function to select element
function selectElement(element) {
  // Deselect previously selected element
  if (selectedElement) {
    selectedElement.classList.remove('selected');
  }
  
  // Select new element
  selectedElement = element;
  selectedElement.classList.add('selected');
  
  // Show context menu
  positionContextMenu();
  
  // Show editor
  document.getElementById('elementEditor').style.display = 'block';
  document.getElementById('noElementSelected').style.display = 'none';
}

// Function to deselect element
function deselectElement() {
  if (selectedElement) {
    selectedElement.classList.remove('selected');
    selectedElement = null;
    
    // Hide context menu
    document.getElementById('elementContextMenu').style.display = 'none';
    
    // Hide editor
    document.getElementById('elementEditor').style.display = 'none';
    document.getElementById('noElementSelected').style.display = 'block';
  }
}

// Function to toggle left sidebar
function toggleLeftSidebar() {
  const sidebar = document.getElementById('leftSidebar');
  const hamburger = document.querySelector('#leftMenuBtn .hamburger-icon');
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('open');
}

// Function to toggle right sidebar
function toggleRightSidebar() {
  const sidebar = document.getElementById('rightSidebar');
  const hamburger = document.querySelector('#rightMenuBtn .hamburger-icon');
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('open');
}

// Export functions
function exportAsImage(format) {
  if (!pages[currentPageIndex]) return;
  
  const page = pages[currentPageIndex];
  
  // Use html2canvas to capture the page
  html2canvas(page, {
    scale: 2,
    backgroundColor: null
  }).then(canvas => {
    // Create a download link
    const link = document.createElement('a');
    
    if (format === 'png') {
      link.download = `layout-${currentPageIndex + 1}.png`;
      link.href = canvas.toDataURL('image/png');
    } else if (format === 'jpg') {
      link.download = `layout-${currentPageIndex + 1}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
    }
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// Export as PDF
function exportAsPDF() {
  // Using jspdf and html2canvas
  if (typeof jsPDF === 'undefined') {
    // Load jsPDF if not already loaded
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
      createPDF();
    };
    document.head.appendChild(script);
  } else {
    createPDF();
  }
}

// Function to create PDF
function createPDF() {
  if (typeof jsPDF === 'undefined') {
    alert('PDF library is still loading. Please try again in a moment.');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: isPortrait ? 'portrait' : 'landscape',
    unit: 'px'
  });
  
  // Process each page and add to PDF
  let processedPages = 0;
  
  function processPage(index) {
    if (index >= pages.length) {
      // All pages processed, save the PDF
      pdf.save('layout.pdf');
      return;
    }
    
    const page = pages[index];
    html2canvas(page, {
      scale: 2,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Add new page if not first page
      if (processedPages > 0) {
        pdf.addPage();
      }
      
      // Add image to page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Process next page
      processedPages++;
      processPage(index + 1);
    });
  }
  
  // Start processing from first page
  processPage(0);
}

// Export as HTML
function exportAsHTML() {
  // Create a simple HTML template
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Layout</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .page { position: relative; margin: 20px auto; page-break-after: always; }
    .page-content { position: relative; }
    .text-element { position: absolute; }
    @media print {
      .page { page-break-after: always; }
    }
  </style>
</head>
<body>
`;
  
  // Add each page
  pages.forEach((page, index) => {
    const width = page.style.width;
    const height = page.style.height;
    
    htmlContent += `<div class="page" style="width: ${width}; height: ${height};">
  <div class="page-content">
`;
    
    // Add elements
    const elements = page.querySelectorAll('.text-element');
    elements.forEach(element => {
      const style = element.style.cssText;
      const content = element.innerHTML;
      
      htmlContent += `    <div class="text-element" style="${style}">${content}</div>\n`;
    });
    
    htmlContent += `  </div>
</div>
`;
  });
  
  htmlContent += '</body>\n</html>';
  
  // Create download link
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'layout.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Function to show save layout modal
function showSaveLayoutModal() {
  document.getElementById('saveLayoutModal').style.display = 'flex';
  document.getElementById('layoutNameInput').focus();
}

// Function to hide modal
function hideModal() {
  document.getElementById('saveLayoutModal').style.display = 'none';
}

// Function to save layout
function saveLayout() {
  const name = document.getElementById('layoutNameInput').value.trim();
  if (!name) return;
  
  // Create a serializable representation of pages
  const layoutData = {
    name,
    date: new Date().toISOString(),
    pages: pages.map(page => {
      // Extract all elements on the page
      const elements = Array.from(page.querySelectorAll('.text-element')).map(el => {
        return {
          type: el.classList.contains('image') ? 'image' : 'text',
          content: el.innerHTML,
          style: {
            top: el.style.top,
            left: el.style.left,
            width: el.style.width,
            height: el.style.height,
            fontSize: el.style.fontSize,
            fontWeight: el.style.fontWeight,
            fontFamily: el.style.fontFamily,
            color: el.style.color,
            backgroundColor: el.style.backgroundColor
          }
        };
      });
      
      return {
        type: page.dataset.type,
        width: page.style.width,
        height: page.style.height,
        elements
      };
    }),
    isPortrait,
    margins,
    multiPageDisplayMode
  };
  
  // Add to saved layouts
  savedLayouts.push(layoutData);
  
  // Save to localStorage
  localStorage.setItem('paperSizeSelectorLayouts', JSON.stringify(savedLayouts));
  
  // Update UI
  updateSavedLayoutsList();
  hideModal();
}

// Function to load saved layouts
function loadSavedLayouts() {
  const saved = localStorage.getItem('paperSizeSelectorLayouts');
  if (saved) {
    try {
      savedLayouts = JSON.parse(saved);
      updateSavedLayoutsList();
    } catch (e) {
      console.error('Error loading saved layouts', e);
    }
  }
}

// Function to update saved layouts list
function updateSavedLayoutsList() {
  const container = document.getElementById('savedLayouts');
  container.innerHTML = '';
  
  if (savedLayouts.length === 0) {
    container.innerHTML = `
      <div class="layout-item" style="opacity: 0.6; font-style: italic;">
        No saved layouts
      </div>
    `;
    return;
  }
  
  savedLayouts.forEach((layout, index) => {
    const item = document.createElement('div');
    item.className = 'layout-item';
    
    const name = document.createElement('span');
    name.textContent = layout.name;
    
    const loadBtn = document.createElement('button');
    loadBtn.innerHTML = '⏏';
    loadBtn.title = 'Load layout';
    loadBtn.onclick = () => loadLayout(index);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete layout';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      savedLayouts.splice(index, 1);
      localStorage.setItem('paperSizeSelectorLayouts', JSON.stringify(savedLayouts));
      updateSavedLayoutsList();
    };
    
    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(loadBtn);
    buttonContainer.appendChild(deleteBtn);
    
    item.appendChild(name);
    item.appendChild(buttonContainer);
    container.appendChild(item);
  });
}

// Function to load layout
function loadLayout(layoutIndex) {
  const layout = savedLayouts[layoutIndex];
  if (!layout) return;
  
  // Clear current pages
  pages = [];
  
  // Load layout settings
  isPortrait = layout.isPortrait !== undefined ? layout.isPortrait : true;
  margins = layout.margins || { top: 20, right: 20, bottom: 20, left: 20 };
  multiPageDisplayMode = layout.multiPageDisplayMode || 'single';
  
  // Recreate pages from layout data
  layout.pages.forEach(pageData => {
    const newPage = createPage(pageData.type || 'regular', pages.length + 1);
    newPage.style.width = pageData.width;
    newPage.style.height = pageData.height;
    
    const pageContent = newPage.querySelector('.page-content');
    
    // Add elements
    pageData.elements.forEach(elData => {
      const element = document.createElement('div');
      element.className = 'text-element';
      if (elData.type === 'image') element.classList.add('image');
      element.contentEditable = true;
      element.innerHTML = elData.content;
      
      // Apply styles
      Object.entries(elData.style).forEach(([prop, value]) => {
        if (value) element.style[prop] = value;
      });
      
      pageContent.appendChild(element);
      makeElementDraggable(element);
    });
    
    pages.push(newPage);
  });
  
  // Update page numbers
  updatePageNumbers();
  
  // Show first page
  currentPageIndex = 0;
  showPage(0);
  
  // Toggle right sidebar
  if (document.getElementById('rightSidebar').classList.contains('open')) {
    toggleRightSidebar();
  }
}

// Function to import layout
function importLayout() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layout = JSON.parse(e.target.result);
        
        // Add to saved layouts
        savedLayouts.push(layout);
        
        // Save to localStorage
        localStorage.setItem('paperSizeSelectorLayouts', JSON.stringify(savedLayouts));
        
        // Update UI
        updateSavedLayoutsList();
        
        // Load the imported layout
        loadLayout(savedLayouts.length - 1);
        
      } catch (error) {
        alert('Error importing layout: Invalid file format');
        console.error(error);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Function to create color picker
function createColorPicker() {
  // Create container
  const elementEditor = document.getElementById('elementEditor');
  const colorSection = elementEditor.querySelector('h4').parentNode;
  
  // Create HSV color picker elements
  const hsvPicker = document.createElement('div');
  hsvPicker.className = 'hsv-picker';
  hsvPicker.style.display = 'none';
  
  hsvPicker.innerHTML = `
    <div class="hue-slider">
      <div class="color-slider-handle" id="hueHandle"></div>
    </div>
    <div class="saturation-slider" id="satSlider">
      <div class="color-slider-handle" id="satHandle"></div>
    </div>
    <div class="value-slider" id="valSlider">
      <div class="color-slider-handle" id="valHandle"></div>
    </div>
    <div class="color-preview" id="colorPreview"></div>
    <button class="sidebar-btn full-width" style="margin-top: 10px;" id="applyColorBtn">Apply Color</button>
  `;
  
  // Add advanced color picker button
  const advancedColorBtn = document.createElement('button');
  advancedColorBtn.className = 'sidebar-btn full-width';
  advancedColorBtn.textContent = 'Advanced Color';
  advancedColorBtn.style.marginTop = '10px';
  
  // Insert elements
  colorSection.appendChild(advancedColorBtn);
  colorSection.appendChild(hsvPicker);
  
  // Add font size input after the buttons
  const fontSizeSection = elementEditor.querySelector('.font-size-options').parentNode;
  const fontSizeInput = document.createElement('div');
  fontSizeInput.className = 'font-size-input';
  fontSizeInput.innerHTML = `
    <input type="number" id="fontSizeInput" min="1" max="100" value="16">
    <span>px</span>
  `;
  fontSizeSection.appendChild(fontSizeInput);
  
  // Add event listeners for HSV picker
  advancedColorBtn.addEventListener('click', () => {
    const picker = document.querySelector('.hsv-picker');
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    
    if (picker.style.display === 'block') {
      // Initialize with current color if element is selected
      if (selectedElement) {
        const color = selectedElement.style.color || '#000000';
        updateHSVFromHex(color);
      }
    }
  });
  
  // Hue slider interaction
  const hueSlider = document.querySelector('.hue-slider');
  const hueHandle = document.getElementById('hueHandle');
  
  hueSlider.addEventListener('mousedown', (e) => {
    const startDrag = (e) => {
      const rect = hueSlider.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      
      hsvState.h = Math.round(pos * 360);
      updateColorFromHSV();
      
      hueHandle.style.left = `${pos * 100}%`;
    };
    
    startDrag(e);
    
    const onMove = (e) => {
      startDrag(e);
      e.preventDefault();
    };
    
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  
  // Saturation slider interaction
  const satSlider = document.getElementById('satSlider');
  const satHandle = document.getElementById('satHandle');
  
  satSlider.addEventListener('mousedown', (e) => {
    const startDrag = (e) => {
      const rect = satSlider.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      
      hsvState.s = Math.round(pos * 100);
      updateColorFromHSV();
      
      satHandle.style.left = `${pos * 100}%`;
    };
    
    startDrag(e);
    
    const onMove = (e) => {
      startDrag(e);
      e.preventDefault();
    };
    
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  
  // Value slider interaction
  const valSlider = document.getElementById('valSlider');
  const valHandle = document.getElementById('valHandle');
  
  valSlider.addEventListener('mousedown', (e) => {
    const startDrag = (e) => {
      const rect = valSlider.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      
      hsvState.v = Math.round(pos * 100);
      updateColorFromHSV();
      
      valHandle.style.left = `${pos * 100}%`;
    };
    
    startDrag(e);
    
    const onMove = (e) => {
      startDrag(e);
      e.preventDefault();
    };
    
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  
  // Apply color button
  document.getElementById('applyColorBtn').addEventListener('click', () => {
    if (selectedElement) {
      const color = document.getElementById('colorPreview').style.backgroundColor;
      selectedElement.style.color = color;
    }
    
    // Hide the picker
    document.querySelector('.hsv-picker').style.display = 'none';
  });
  
  // Font size input
  const fontSizeInputEl = document.getElementById('fontSizeInput');
  
  fontSizeInputEl.addEventListener('change', () => {
    if (selectedElement) {
      const fontSize = parseInt(fontSizeInputEl.value);
      if (fontSize >= 1 && fontSize <= 100) {
        selectedElement.style.fontSize = `${fontSize}px`;
      }
    }
  });
  
  // Add event listener to update font size input when selecting an element
  document.addEventListener('click', (e) => {
    if (e.target.closest('.text-element')) {
      const el = e.target.closest('.text-element');
      const fontSize = parseInt(el.style.fontSize) || 16;
      fontSizeInputEl.value = fontSize;
    }
  });
  
  // Add custom margins editor
  addMarginsEditor();
  
  // Add page display mode selector
  addPageDisplayModeSelector();
  
  // Add custom font uploader
  addFontUploader();
  
  // Add export as HTML button
  const exportSection = document.querySelector('.sidebar-section h3:contains("Export")').parentNode;
  const exportButtons = exportSection.querySelector('.sidebar-buttons');
  
  const exportHtmlBtn = document.createElement('button');
  exportHtmlBtn.className = 'sidebar-btn';
  exportHtmlBtn.textContent = 'HTML';
  exportHtmlBtn.addEventListener('click', exportAsHTML);
  
  exportButtons.appendChild(exportHtmlBtn);
}

// Helper function for querySelector with :contains
Element.prototype.querySelector = function(selector) {
  return this.querySelector(selector);
};

// Function to convert HSV to RGB
function hsvToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  
  let r, g, b;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Function to convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Function to update color from HSV values
function updateColorFromHSV() {
  if (hsvState.updating) return;
  
  // Convert HSV to RGB
  const rgb = hsvToRgb(hsvState.h, hsvState.s, hsvState.v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  // Update sliders' background colors
  document.querySelector(':root').style.setProperty('--current-hue', `hsl(${hsvState.h}, 100%, 50%)`);
  document.querySelector(':root').style.setProperty('--current-color', `hsl(${hsvState.h}, ${hsvState.s}%, 50%)`);
  
  // Update color preview
  const preview = document.getElementById('colorPreview');
  preview.style.backgroundColor = hex;
}

// Function to update HSV from hex color
function updateHSVFromHex(hex) {
  hsvState.updating = true;
  
  // Default to black if no color provided
  if (!hex || hex === '') hex = '#000000';
  
  // Convert hex to RGB
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    // Convert RGB to HSV
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    // Calculate hue
    let h;
    if (delta === 0) {
      h = 0;
    } else if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    // Calculate saturation
    const s = max === 0 ? 0 : Math.round((delta / max) * 100);
    
    // Calculate value
    const v = Math.round((max / 255) * 100);
    
    // Update state
    hsvState.h = h;
    hsvState.s = s;
    hsvState.v = v;
    
    // Update UI
    document.getElementById('hueHandle').style.left = `${(h / 360) * 100}%`;
    document.getElementById('satHandle').style.left = `${s}%`;
    document.getElementById('valHandle').style.left = `${v}%`;
    
    // Update color preview and sliders
    updateColorFromHSV();
  }
  
  hsvState.updating = false;
}

// Function to add margins editor
function addMarginsEditor() {
  const leftSidebar = document.getElementById('leftSidebar');
  const pageSetupSection = leftSidebar.querySelector('.sidebar-section');
  
  // Create margins editor
  const marginsEditor = document.createElement('div');
  marginsEditor.innerHTML = `
    <h3>Page Margins</h3>
    <div class="margins-editor">
      <div class="margins-label margin-top-label">Top</div>
      <input type="number" id="margin-top" value="${margins.top}" min="0" max="100">
      <div></div>
      
      <div class="margins-label margin-left-label">Left</div>
      <div style="text-align:center;">Margins</div>
      <div class="margins-label margin-right-label">Right</div>
      
      <input type="number" id="margin-left" value="${margins.left}" min="0" max="100">
      <div></div>
      <input type="number" id="margin-right" value="${margins.right}" min="0" max="100">
      
      <div></div>
      <input type="number" id="margin-bottom" value="${margins.bottom}" min="0" max="100">
      <div></div>
      
      <div></div>
      <div class="margins-label margin-bottom-label">Bottom</div>
      <div></div>
    </div>
  `;
  
  // Insert after page setup section
  pageSetupSection.parentNode.insertBefore(marginsEditor, pageSetupSection.nextSibling);
  
  // Add event listeners for margin inputs
  document.getElementById('margin-top').addEventListener('change', (e) => {
    margins.top = parseInt(e.target.value);
    updateAllMarginIndicators();
  });
  
  document.getElementById('margin-right').addEventListener('change', (e) => {
    margins.right = parseInt(e.target.value);
    updateAllMarginIndicators();
  });
  
  document.getElementById('margin-bottom').addEventListener('change', (e) => {
    margins.bottom = parseInt(e.target.value);
    updateAllMarginIndicators();
  });
  
  document.getElementById('margin-left').addEventListener('change', (e) => {
    margins.left = parseInt(e.target.value);
    updateAllMarginIndicators();
  });
}

// Function to add page display mode selector
function addPageDisplayModeSelector() {
  const leftSidebar = document.getElementById('leftSidebar');
  const pagesSection = leftSidebar.querySelector('h3:contains("Pages")').parentNode;
  
  // Create display mode selector
  const displayModeSelector = document.createElement('div');
  displayModeSelector.innerHTML = `
    <h4>Display Mode</h4>
    <div class="page-layout-selector">
      <div class="page-layout-option active" data-mode="single">
        <div class="page-layout-preview">
          <span></span>
        </div>
        <div>Single Page</div>
      </div>
      <div class="page-layout-option" data-mode="double">
        <div class="page-layout-preview">
          <span></span>
          <span></span>
        </div>
        <div>Double Page</div>
      </div>
      <div class="page-layout-option" data-mode="all">
        <div class="page-layout-preview" style="display: grid; grid-template: 1fr 1fr / 1fr 1fr; gap: 2px;">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div>All Pages</div>
      </div>
    </div>
  `;
  
  // Insert before the buttons
  const pageButtons = pagesSection.querySelector('.sidebar-buttons');
  pagesSection.insertBefore(displayModeSelector, pageButtons);
  
  // Add event listeners for display mode options
  document.querySelectorAll('.page-layout-option').forEach(option => {
    option.addEventListener('click', () => {
      // Update active class
      document.querySelectorAll('.page-layout-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      
      // Update display mode
      multiPageDisplayMode = option.dataset.mode;
      
      // Update page display
      showPage(currentPageIndex);
    });
  });
}

// Function to add font uploader
function addFontUploader() {
  const leftSidebar = document.getElementById('leftSidebar');
  const fontFamilySelect = document.getElementById('fontFamilySelect');
  const fontSection = fontFamilySelect.parentNode;
  
  // Create font uploader button
  const fontUploader = document.createElement('button');
  fontUploader.className = 'sidebar-btn full-width font-upload-btn';
  fontUploader.style.marginTop = '10px';
  fontUploader.innerHTML = 'Import Font <input type="file" accept=".ttf,.otf,.woff,.woff2">';
  
  fontSection.appendChild(fontUploader);
  
  // Add event listener for font upload
  fontUploader.querySelector('input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
      const fontUrl = e.target.result;
      
      // Create a new style element with @font-face
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontUrl}') format('${getFormatFromFile(file.name)}');
        }
      `;
      document.head.appendChild(style);
      
      // Add to custom fonts
      customFonts[fontName] = fontUrl;
      
      // Add to font selector
      const option = document.createElement('option');
      option.value = fontName;
      option.textContent = fontName + ' (Custom)';
      fontFamilySelect.appendChild(option);
      
      // Select the new font
      fontFamilySelect.value = fontName;
      
      // Apply to selected element if exists
      if (selectedElement) {
        selectedElement.style.fontFamily = fontName;
      }
    };
    
    reader.readAsDataURL(file);
  });
}

// Helper function to determine font format from file extension
function getFormatFromFile(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  switch (ext) {
    case 'ttf': return 'truetype';
    case 'otf': return 'opentype';
    case 'woff': return 'woff';
    case 'woff2': return 'woff2';
    default: return 'truetype';
  }
}

// Function to load html2canvas library
function loadHtml2Canvas() {
  const html2canvasScript = document.createElement('script');
  html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
  document.head.appendChild(html2canvasScript);
}
