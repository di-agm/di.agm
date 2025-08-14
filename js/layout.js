// Layout.js - The main functionality for the paper layout designer
// This file has been adapted to work with Vite and React

// Variables
let pages = [];
let currentPageIndex = 0;
let isPortrait = true;
let selectedElement = null;
let savedLayouts = [];

// Helper function to find elements by text content
function querySelectorContains(selector, text) {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).find(el => el.textContent.includes(text));
}

// Create a page with the specified type
function createPage(pageType = 'regular', position = null) {
  const pageNumber = position !== null ? position + 1 : pages.length + 1;
  const page = document.createElement('div');
  page.className = 'rect';
  page.dataset.pageType = pageType;
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
  
  const pageNumberLabel = document.createElement('div');
  pageNumberLabel.style.position = 'absolute';
  pageNumberLabel.style.bottom = '8px';
  pageNumberLabel.style.right = '12px';
  pageNumberLabel.style.color = '#666';
  pageNumberLabel.style.fontSize = '12px';
  pageNumberLabel.style.fontWeight = '600';
  pageNumberLabel.style.zIndex = '10';
  
  // Set the appropriate label based on page type
  if (pageType === 'cover') {
    pageNumberLabel.textContent = 'Cover';
  } else if (pageType === 'back') {
    pageNumberLabel.textContent = 'Back Cover';
  } else {
    pageNumberLabel.textContent = pageNumber;
  }
  
  page.appendChild(pageNumberLabel);
  
  // Add margins indicator
  const margins = document.createElement('div');
  margins.className = 'page-margins';
  content.appendChild(margins);
  
  // If position is specified, insert at that position, otherwise add to end
  if (position !== null) {
    pages.splice(position, 0, page);
    updatePageNumbers();
  } else {
    pages.push(page);
  }
  
  return page;
}

// Update the page number labels
function updatePageNumbers() {
  pages.forEach((page, i) => {
    const pageType = page.dataset.pageType;
    const pageNumberLabel = page.querySelector('div:last-child');
    if (pageNumberLabel) {
      if (pageType === 'cover') {
        pageNumberLabel.textContent = 'Cover';
      } else if (pageType === 'back') {
        pageNumberLabel.textContent = 'Back Cover';
      } else {
        pageNumberLabel.textContent = i + 1;
      }
    }
  });
}

// Container for the page
const rectContainer = document.querySelector('.center-container');
const selector = document.getElementById('sizeSelector');
const orientationBtn = document.getElementById('orientationBtn');
const pageNumberDisplay = document.getElementById('pageNumber');

// Paper size definitions
const paperSizes = {
  a4: { widthMM: 210, heightMM: 297 },
  letter: { widthIN: 8.5, heightIN: 11 },
  tabloid: { widthIN: 11, heightIN: 17 }
};

// Function to add custom paper sizes
function addCustomPaperSize(name, width, height, unit = 'px') {
  paperSizes[name.toLowerCase()] = unit === 'mm'
    ? { widthMM: width, heightMM: height }
    : unit === 'in'
      ? { widthIN: width, heightIN: height }
      : { widthPX: width, heightPX: height };
}

// Conversion functions
function mmToPx(mm) { return mm * 3.78; }
function inToPx(inches) { return inches * 96; }

const maxWidthPx = 360;

// Update the rectangle size based on the selected paper
function updateRectSize(key) {
  if (!pages[currentPageIndex]) return;
  
  let widthPx, heightPx;
  if (key === 'a4') {
    widthPx = mmToPx(paperSizes.a4.widthMM);
    heightPx = mmToPx(paperSizes.a4.heightMM);
  } else if (key === 'letter') {
    widthPx = inToPx(paperSizes.letter.widthIN);
    heightPx = inToPx(paperSizes.letter.heightIN);
  } else if (key === 'tabloid') {
    widthPx = inToPx(paperSizes.tabloid.widthIN);
    heightPx = inToPx(paperSizes.tabloid.heightIN);
  } else if (paperSizes[key]) {
    // Custom size
    const customSize = paperSizes[key];
    if (customSize.widthMM && customSize.heightMM) {
      widthPx = mmToPx(customSize.widthMM);
      heightPx = mmToPx(customSize.heightMM);
    } else if (customSize.widthIN && customSize.heightIN) {
      widthPx = inToPx(customSize.widthIN);
      heightPx = inToPx(customSize.heightIN);
    } else {
      widthPx = customSize.widthPX;
      heightPx = customSize.heightPX;
    }
  } else {
    widthPx = mmToPx(paperSizes.a4.widthMM);
    heightPx = mmToPx(paperSizes.a4.heightMM);
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
  
  // Update margins indicator
  updateMarginsDisplay();
}

// Toggle between portrait and landscape orientation
function updateOrientation() {
  if (!pages[currentPageIndex]) return;
  
  const page = pages[currentPageIndex];
  const width = page.style.width;
  const height = page.style.height;
  
  page.style.width = height;
  page.style.height = width;
  
  isPortrait = !isPortrait;
  updateMarginsDisplay();
}

// Show the specified page
function showPage(index) {
  // Remove current page from display
  rectContainer.innerHTML = '';
  
  // Update current page index
  currentPageIndex = index;
  
  // Add selected page to container
  if (pages[currentPageIndex]) {
    rectContainer.appendChild(pages[currentPageIndex]);
    
    // Update page number display
    const pageType = pages[currentPageIndex].dataset.pageType;
    if (pageType === 'cover') {
      pageNumberDisplay.textContent = 'Cover Page';
    } else if (pageType === 'back') {
      pageNumberDisplay.textContent = 'Back Cover';
    } else {
      pageNumberDisplay.textContent = `Page ${index + 1}`;
    }
    
    // Apply current size settings to new page
    updateRectSize(selector.value);
    
    // Update rulers
    updateRulers();
  }
  
  // Deselect any element when changing pages
  deselectElement();
}

// Add a new page
function addPage(pageType = 'regular', position = null) {
  const newPage = createPage(pageType, position);
  if (position === null) {
    showPage(pages.length - 1);
  }
  return newPage;
}

// Remove the specified page
function removePage(index) {
  if (pages.length <= 1) return; // Always keep at least one page
  
  const pageType = pages[index].dataset.pageType;
  if (pageType === 'cover' || pageType === 'back') {
    // Don't delete cover or back pages
    alert('Cannot delete cover or back cover pages.');
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

// Duplicate the specified page
function duplicatePage(index) {
  const originalPage = pages[index];
  const clone = originalPage.cloneNode(true);
  
  // Reset event listeners on cloned elements
  const clonedElements = clone.querySelectorAll('.text-element');
  clonedElements.forEach(element => {
    makeElementDraggable(element);
  });
  
  pages.splice(index + 1, 0, clone);
  showPage(index + 1);
  updatePageNumbers();
}

// Add text element to the current page
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
  
  return element;
}

// Make an element draggable and resizable
function makeElementDraggable(element) {
  let offsetX = 0, offsetY = 0;
  
  element.onmousedown = dragStart;
  
  function dragStart(e) {
    selectElement(element);
    
    const rect = element.getBoundingClientRect();
    const cornerSize = 12;
    const isInResizeCorner =
      e.clientX >= rect.right - cornerSize &&
      e.clientY >= rect.bottom - cornerSize;
    
    if (isInResizeCorner) {
      // Start resizing
      e.preventDefault();
      document.onmousemove = resizeElement;
      document.onmouseup = dragEnd;
      return;
    }
    
    // Allow text edit when clicking
    if (e.target === element && element.contentEditable === 'true') {
      element.focus();
      return;
    }
    
    // Start dragging
    e.preventDefault();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.onmousemove = dragMove;
    document.onmouseup = dragEnd;
    
    // Show the context menu
    showContextMenu(element, e.clientX, e.clientY);
  }
  
  function dragMove(e) {
    e.preventDefault();
    
    const pageRect = element.parentElement.getBoundingClientRect();
    const x = e.clientX - pageRect.left - offsetX;
    const y = e.clientY - pageRect.top - offsetY;
    
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    // Update context menu position
    const contextMenu = document.querySelector('.element-context-menu');
    if (contextMenu) {
      contextMenu.style.top = `${e.clientY - 40}px`;
      contextMenu.style.left = `${e.clientX}px`;
    }
  }
  
  function resizeElement(e) {
    e.preventDefault();
    
    const pageRect = element.parentElement.getBoundingClientRect();
    const startX = parseInt(element.style.left) || 0;
    const startY = parseInt(element.style.top) || 0;
    
    const width = Math.max(50, e.clientX - pageRect.left - startX);
    const height = Math.max(30, e.clientY - pageRect.top - startY);
    
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  }
  
  function dragEnd() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

// Show context menu for the selected element
function showContextMenu(element, x, y) {
  // Remove any existing menu
  const existingMenu = document.querySelector('.element-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  // Create menu
  const menu = document.createElement('div');
  menu.className = 'element-context-menu';
  menu.style.top = `${y - 40}px`;
  menu.style.left = `${x}px`;
  
  // Move button
  const moveBtn = document.createElement('button');
  moveBtn.className = 'context-menu-btn';
  moveBtn.innerHTML = '✥';
  moveBtn.title = 'Move';
  moveBtn.onclick = () => {
    // Already in move mode by default
    menu.remove();
  };
  
  // Scale button
  const scaleBtn = document.createElement('button');
  scaleBtn.className = 'context-menu-btn';
  scaleBtn.innerHTML = '⤢';
  scaleBtn.title = 'Resize';
  scaleBtn.onclick = () => {
    menu.remove();
    // Simulate click on the bottom-right corner
    const rect = element.getBoundingClientRect();
    const clickEvent = new MouseEvent('mousedown', {
      bubbles: true,
      clientX: rect.right,
      clientY: rect.bottom
    });
    element.dispatchEvent(clickEvent);
  };
  
  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'context-menu-btn';
  editBtn.innerHTML = '✎';
  editBtn.title = 'Edit';
  editBtn.onclick = () => {
    if (element.contentEditable === 'true') {
      element.focus();
      // Place cursor at end of text
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    menu.remove();
  };
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'context-menu-btn';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Delete';
  deleteBtn.onclick = () => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
      deselectElement();
    }
    menu.remove();
  };
  
  menu.appendChild(moveBtn);
  menu.appendChild(scaleBtn);
  menu.appendChild(editBtn);
  menu.appendChild(deleteBtn);
  document.body.appendChild(menu);
  
  // Remove menu when clicking elsewhere
  document.addEventListener('click', function closeMenu(e) {
    if (!menu.contains(e.target) && e.target !== element) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}

// Select an element for editing
function selectElement(element) {
  // Deselect previously selected element
  if (selectedElement) {
    selectedElement.classList.remove('selected');
  }
  
  // Select new element
  selectedElement = element;
  selectedElement.classList.add('selected');
  
  // Show editor
  document.getElementById('elementEditor').style.display = 'block';
  document.getElementById('noElementSelected').style.display = 'none';
}

// Deselect the currently selected element
function deselectElement() {
  if (selectedElement) {
    selectedElement.classList.remove('selected');
    selectedElement = null;
    
    // Hide editor
    document.getElementById('elementEditor').style.display = 'none';
    document.getElementById('noElementSelected').style.display = 'block';
    
    // Remove context menu if visible
    const contextMenu = document.querySelector('.element-context-menu');
    if (contextMenu) {
      contextMenu.remove();
    }
  }
}

// Toggle sidebar visibility
function toggleLeftSidebar() {
  const sidebar = document.getElementById('leftSidebar');
  const hamburger = document.querySelector('#leftMenuBtn .hamburger-icon');
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('open');
}

function toggleRightSidebar() {
  const sidebar = document.getElementById('rightSidebar');
  const hamburger = document.querySelector('#rightMenuBtn .hamburger-icon');
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('open');
}

// Export page as image
function exportAsImage(format) {
  if (!pages[currentPageIndex]) return;
  
  const page = pages[currentPageIndex];
  
  // Use html2canvas to capture the page
  if (window.html2canvas) {
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
  } else {
    alert('html2canvas library not loaded. Please try again.');
  }
}

// Export as PDF
function exportAsPDF() {
  if (!window.jspdf || !window.html2canvas) {
    alert('PDF export libraries not loaded. Please try again.');
    return;
  }
  
  // Create a new PDF document
  const pdf = new window.jspdf.jsPDF();
  
  // Function to add pages to PDF
  const addPagesToPDF = async (pageIndex) => {
    if (pageIndex >= pages.length) {
      // All pages added, save the PDF
      pdf.save('layout.pdf');
      return;
    }
    
    const page = pages[pageIndex];
    
    try {
      // Convert page to canvas
      const canvas = await html2canvas(page, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Add new page to PDF (except for first page)
      if (pageIndex > 0) {
        pdf.addPage();
      }
      
      // Calculate dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const width = imgProps.width * ratio;
      const height = imgProps.height * ratio;
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;
      
      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', x, y, width, height);
      
      // Process next page
      addPagesToPDF(pageIndex + 1);
    } catch (error) {
      console.error('Error adding page to PDF:', error);
      alert('Error creating PDF. Please try again.');
    }
  };
  
  // Start adding pages to PDF
  addPagesToPDF(0);
}

// Export as HTML
function exportAsHTML() {
  // Create a new HTML document
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Layout</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    .page {
      position: relative;
      background: white;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      margin: 20px auto;
      overflow: hidden;
    }
    .page-content {
      position: relative;
    }
    .text-element {
      position: absolute;
    }
    @media print {
      .page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  ${pages.map((page, index) => {
    // Clone the page to avoid modifying the original
    const tempPage = page.cloneNode(true);
    
    // Get dimensions
    const width = tempPage.style.width;
    const height = tempPage.style.height;
    
    // Get page content
    const content = tempPage.querySelector('.page-content').innerHTML;
    
    return `
  <div class="page" style="width: ${width}; height: ${height};">
    <div class="page-content">
      ${content}
    </div>
  </div>`;
  }).join('')}
</body>
</html>
  `;
  
  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = 'layout.html';
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Show save layout modal
function showSaveLayoutModal() {
  document.getElementById('saveLayoutModal').style.display = 'flex';
  document.getElementById('layoutNameInput').focus();
}

// Hide modal
function hideModal() {
  document.getElementById('saveLayoutModal').style.display = 'none';
}

// Save layout
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
          content: el.innerText,
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
        width: page.style.width,
        height: page.style.height,
        pageType: page.dataset.pageType || 'regular',
        elements
      };
    })
  };
  
  // Add to saved layouts
  savedLayouts.push(layoutData);
  
  // Save to localStorage
  localStorage.setItem('paperSizeSelectorLayouts', JSON.stringify(savedLayouts));
  
  // Update UI
  updateSavedLayoutsList();
  hideModal();
}

// Load layout
function loadLayout(layoutIndex) {
  const layout = savedLayouts[layoutIndex];
  if (!layout) return;
  
  // Clear current pages
  pages = [];
  
  // Recreate pages from layout data
  layout.pages.forEach(pageData => {
    const newPage = createPage(pageData.pageType || 'regular');
    newPage.style.width = pageData.width;
    newPage.style.height = pageData.height;
    
    const pageContent = newPage.querySelector('.page-content');
    
    // Add elements
    pageData.elements.forEach(elData => {
      const element = document.createElement('div');
      element.className = 'text-element';
      if (elData.type === 'image') element.classList.add('image');
      element.contentEditable = elData.type === 'text' ? 'true' : 'false';
      element.innerText = elData.content;
      
      // Apply styles
      Object.entries(elData.style).forEach(([prop, value]) => {
        if (value) element.style[prop] = value;
      });
      
      pageContent.appendChild(element);
      makeElementDraggable(element);
    });
  });
  
  // Show first page
  if (pages.length > 0) {
    currentPageIndex = 0;
    showPage(0);
  }
  
  // Toggle right sidebar
  if (document.getElementById('rightSidebar').classList.contains('open')) {
    toggleRightSidebar();
  }
}

// Update saved layouts list
function updateSavedLayoutsList() {
  const container = document.getElementById('savedLayouts');
  if (!container) return;
  
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

// Import layout from file
function importLayout() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const layout = JSON.parse(event.target.result);
        savedLayouts.push(layout);
        localStorage.setItem('paperSizeSelectorLayouts', JSON.stringify(savedLayouts));
        updateSavedLayoutsList();
        alert('Layout imported successfully!');
      } catch (error) {
        alert('Error importing layout. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

// Export layout to file
function exportLayout(index) {
  if (!savedLayouts[index]) return;
  
  const layout = savedLayouts[index];
  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = `${layout.name.replace(/\s+/g, '_')}.json`;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Custom page size dialog
function showCustomSizeDialog() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('customSizeModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'customSizeModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Custom Page Size</h3>
        <div class="custom-size-inputs">
          <input type="number" id="customWidth" placeholder="Width">
          <select id="customUnit">
            <option value="mm">mm</option>
            <option value="in">inches</option>
            <option value="px">pixels</option>
          </select>
          <input type="number" id="customHeight" placeholder="Height">
        </div>
        <div class="modal-buttons">
          <button class="sidebar-btn" id="cancelCustomSizeBtn">Cancel</button>
          <button class="sidebar-btn" id="confirmCustomSizeBtn">Apply</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancelCustomSizeBtn').addEventListener('click', () => {
      modal.style.display = 'none';
      selector.value = selector.value === 'custom' ? 'a4' : selector.value;
    });
    
    document.getElementById('confirmCustomSizeBtn').addEventListener('click', () => {
      const width = parseFloat(document.getElementById('customWidth').value);
      const height = parseFloat(document.getElementById('customHeight').value);
      const unit = document.getElementById('customUnit').value;
      
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        alert('Please enter valid dimensions.');
        return;
      }
      
      // Add custom size
      const sizeName = 'custom';
      addCustomPaperSize(sizeName, width, height, unit);
      
      // Update size
      updateRectSize(sizeName);
      
      // Hide modal
      modal.style.display = 'none';
    });
  }
  
  // Show modal
  modal.style.display = 'flex';
  document.getElementById('customWidth').focus();
}

// Draw rulers around the page
function drawRulers() {
  const page = pages[currentPageIndex];
  if (!page) return;
  
  // Remove existing rulers
  const existingRulers = document.querySelectorAll('.ruler');
  existingRulers.forEach(ruler => ruler.remove());
  
  const pageRect = page.getBoundingClientRect();
  const centerContainer = document.querySelector('.center-container');
  const containerRect = centerContainer.getBoundingClientRect();
  
  // Create rulers
  const horizontalRuler = document.createElement('div');
  horizontalRuler.className = 'ruler ruler-h';
  horizontalRuler.style.width = `${pageRect.width}px`;
  horizontalRuler.style.left = `${pageRect.left - containerRect.left + 30}px`;
  horizontalRuler.style.top = `${pageRect.top - containerRect.top}px`;
  
  const verticalRuler = document.createElement('div');
  verticalRuler.className = 'ruler ruler-v';
  verticalRuler.style.height = `${pageRect.height}px`;
  verticalRuler.style.left = `${pageRect.left - containerRect.left}px`;
  verticalRuler.style.top = `${pageRect.top - containerRect.top + 20}px`;
  
  const cornerRuler = document.createElement('div');
  cornerRuler.className = 'ruler-corner';
  cornerRuler.style.left = `${pageRect.left - containerRect.left}px`;
  cornerRuler.style.top = `${pageRect.top - containerRect.top}px`;
  
  centerContainer.appendChild(horizontalRuler);
  centerContainer.appendChild(verticalRuler);
  centerContainer.appendChild(cornerRuler);
  
  // Add markers
  const markerSpacingPx = 50; // Pixels between markers
  const markerCountH = Math.floor(pageRect.width / markerSpacingPx);
  const markerCountV = Math.floor(pageRect.height / markerSpacingPx);
  
  // Add horizontal markers
  for (let i = 0; i <= markerCountH; i++) {
    const x = i * markerSpacingPx;
    
    // Add tick mark
    const tickMark = document.createElement('div');
    tickMark.className = `ruler-line h-line ${i % 2 === 0 ? 'major' : ''}`;
    tickMark.style.left = `${x}px`;
    horizontalRuler.appendChild(tickMark);
    
    // Add label for major ticks
    if (i % 2 === 0) {
      const label = document.createElement('div');
      label.className = 'ruler-marker h-marker';
      label.style.left = `${x}px`;
      label.textContent = `${i * 5}`;
      horizontalRuler.appendChild(label);
    }
  }
  
  // Add vertical markers
  for (let i = 0; i <= markerCountV; i++) {
    const y = i * markerSpacingPx;
    
    // Add tick mark
    const tickMark = document.createElement('div');
    tickMark.className = `ruler-line v-line ${i % 2 === 0 ? 'major' : ''}`;
    tickMark.style.top = `${y}px`;
    verticalRuler.appendChild(tickMark);
    
    // Add label for major ticks
    if (i % 2 === 0) {
      const label = document.createElement('div');
      label.className = 'ruler-marker v-marker';
      label.style.top = `${y + 5}px`;
      label.textContent = `${i * 5}`;
      verticalRuler.appendChild(label);
    }
  }
}

// Update rulers when page changes
function updateRulers() {
  // Remove and redraw rulers
  const rulersVisible = document.querySelector('.ruler') !== null;
  if (rulersVisible) {
    // Remove existing rulers
    const existingRulers = document.querySelectorAll('.ruler, .ruler-corner');
    existingRulers.forEach(ruler => ruler.remove());
    
    // Draw new rulers
    drawRulers();
  }
}

// Toggle rulers visibility
function toggleRulers() {
  const rulersVisible = document.querySelector('.ruler') !== null;
  if (rulersVisible) {
    // Hide rulers
    const existingRulers = document.querySelectorAll('.ruler, .ruler-corner');
    existingRulers.forEach(ruler => ruler.remove());
  } else {
    // Show rulers
    drawRulers();
  }
}

// Set margins for the current page
function setPageMargins(top, right, bottom, left) {
  const page = pages[currentPageIndex];
  if (!page) return;
  
  page.dataset.marginTop = top;
  page.dataset.marginRight = right;
  page.dataset.marginBottom = bottom;
  page.dataset.marginLeft = left;
  
  updateMarginsDisplay();
}

// Update margins display
function updateMarginsDisplay() {
  const page = pages[currentPageIndex];
  if (!page) return;
  
  const marginBox = page.querySelector('.page-margins');
  if (!marginBox) return;
  
  // Get margin values (default to 0)
  const top = parseInt(page.dataset.marginTop || 0);
  const right = parseInt(page.dataset.marginRight || 0);
  const bottom = parseInt(page.dataset.marginBottom || 0);
  const left = parseInt(page.dataset.marginLeft || 0);
  
  // Calculate inner dimensions
  const pageWidth = parseInt(page.style.width);
  const pageHeight = parseInt(page.style.height);
  const innerWidth = Math.max(20, pageWidth - left - right);
  const innerHeight = Math.max(20, pageHeight - top - bottom);
  
  // Set margin box dimensions
  marginBox.style.top = `${top}px`;
  marginBox.style.left = `${left}px`;
  marginBox.style.width = `${innerWidth}px`;
  marginBox.style.height = `${innerHeight}px`;
}

// Show margins dialog
function showMarginsDialog() {
  const page = pages[currentPageIndex];
  if (!page) return;
  
  // Get current margins
  const top = parseInt(page.dataset.marginTop || 0);
  const right = parseInt(page.dataset.marginRight || 0);
  const bottom = parseInt(page.dataset.marginBottom || 0);
  const left = parseInt(page.dataset.marginLeft || 0);
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('marginsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'marginsModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Page Margins</h3>
        <div class="margins-editor">
          <div class="margin-top">
            <div class="margins-label">Top</div>
            <input type="number" id="marginTop" min="0">
          </div>
          <div class="margin-left">
            <div class="margins-label">Left</div>
            <input type="number" id="marginLeft" min="0">
          </div>
          <div class="margin-right">
            <div class="margins-label">Right</div>
            <input type="number" id="marginRight" min="0">
          </div>
          <div class="margin-bottom">
            <div class="margins-label">Bottom</div>
            <input type="number" id="marginBottom" min="0">
          </div>
        </div>
        <div class="modal-buttons">
          <button class="sidebar-btn" id="cancelMarginsBtn">Cancel</button>
          <button class="sidebar-btn" id="confirmMarginsBtn">Apply</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancelMarginsBtn').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    document.getElementById('confirmMarginsBtn').addEventListener('click', () => {
      const newTop = parseInt(document.getElementById('marginTop').value) || 0;
      const newRight = parseInt(document.getElementById('marginRight').value) || 0;
      const newBottom = parseInt(document.getElementById('marginBottom').value) || 0;
      const newLeft = parseInt(document.getElementById('marginLeft').value) || 0;
      
      setPageMargins(newTop, newRight, newBottom, newLeft);
      modal.style.display = 'none';
    });
  }
  
  // Set current values
  document.getElementById('marginTop').value = top;
  document.getElementById('marginRight').value = right;
  document.getElementById('marginBottom').value = bottom;
  document.getElementById('marginLeft').value = left;
  
  // Show modal
  modal.style.display = 'flex';
}

// Upload custom font
function uploadFont() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.woff,.woff2,.ttf,.otf';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      // Generate a name for the font
      const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '');
      const fontUrl = event.target.result;
      
      // Create a style element to define the font
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url(${fontUrl}) format('${getFormat(file.name)}');
        }
      `;
      document.head.appendChild(style);
      
      // Add to font selector
      const fontSelector = document.getElementById('fontFamilySelect');
      const option = document.createElement('option');
      option.value = `'${fontName}', sans-serif`;
      option.textContent = fontName;
      fontSelector.appendChild(option);
      
      // Select the new font
      fontSelector.value = option.value;
      if (selectedElement) {
        selectedElement.style.fontFamily = option.value;
      }
    };
    reader.readAsDataURL(file);
  };
  
  input.click();
}

// Get font format based on file extension
function getFormat(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'woff2': return 'woff2';
    case 'woff': return 'woff';
    case 'ttf': return 'truetype';
    case 'otf': return 'opentype';
    default: return 'truetype';
  }
}

// Create HSV color picker
function createHSVColorPicker() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('hsvColorModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'hsvColorModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Color Picker</h3>
        <div class="hsv-picker">
          <div class="hue-slider">
            <div class="color-slider-handle" id="hueHandle" style="left: 0"></div>
          </div>
          <div class="saturation-slider">
            <div class="color-slider-handle" id="satHandle" style="left: 100%"></div>
          </div>
          <div class="value-slider">
            <div class="color-slider-handle" id="valHandle" style="left: 100%"></div>
          </div>
          <div class="color-preview" id="colorPreview"></div>
        </div>
        <div class="modal-buttons">
          <button class="sidebar-btn" id="cancelColorBtn">Cancel</button>
          <button class="sidebar-btn" id="confirmColorBtn">Apply</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize color picker state
    const state = {
      hue: 0,
      saturation: 100,
      value: 100,
      element: null
    };
    
    // Function to convert HSV to RGB
    function hsvToRgb(h, s, v) {
      h = h % 360;
      s = s / 100;
      v = v / 100;
      
      let c = v * s;
      let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      let m = v - c;
      
      let r, g, b;
      if (h < 60) {
        [r, g, b] = [c, x, 0];
      } else if (h < 120) {
        [r, g, b] = [x, c, 0];
      } else if (h < 180) {
        [r, g, b] = [0, c, x];
      } else if (h < 240) {
        [r, g, b] = [0, x, c];
      } else if (h < 300) {
        [r, g, b] = [x, 0, c];
      } else {
        [r, g, b] = [c, 0, x];
      }
      
      return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
      ];
    }
    
    // Function to update color display
    function updateColor() {
      const [r, g, b] = hsvToRgb(state.hue, state.saturation, state.value);
      const color = `rgb(${r}, ${g}, ${b})`;
      const hueColor = `hsl(${state.hue}, 100%, 50%)`;
      
      document.documentElement.style.setProperty('--current-hue', hueColor);
      document.documentElement.style.setProperty('--current-color', color);
      
      document.getElementById('colorPreview').style.backgroundColor = color;
      
      return color;
    }
    
    // Add event listeners for sliders
    const hueSlider = modal.querySelector('.hue-slider');
    const satSlider = modal.querySelector('.saturation-slider');
    const valSlider = modal.querySelector('.value-slider');
    const hueHandle = document.getElementById('hueHandle');
    const satHandle = document.getElementById('satHandle');
    const valHandle = document.getElementById('valHandle');
    
    function handleSliderDrag(slider, handle, property, maxValue) {
      let dragging = false;
      
      slider.addEventListener('mousedown', (e) => {
        dragging = true;
        updateSliderValue(e);
      });
      
      document.addEventListener('mousemove', (e) => {
        if (dragging) {
          updateSliderValue(e);
        }
      });
      
      document.addEventListener('mouseup', () => {
        dragging = false;
      });
      
      function updateSliderValue(e) {
        const rect = slider.getBoundingClientRect();
        let value = (e.clientX - rect.left) / rect.width;
        value = Math.max(0, Math.min(1, value));
        
        handle.style.left = `${value * 100}%`;
        state[property] = value * maxValue;
        updateColor();
      }
    }
    
    handleSliderDrag(hueSlider, hueHandle, 'hue', 360);
    handleSliderDrag(satSlider, satHandle, 'saturation', 100);
    handleSliderDrag(valSlider, valHandle, 'value', 100);
    
    // Set initial color
    updateColor();
    
    // Add event listeners for buttons
    document.getElementById('cancelColorBtn').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    document.getElementById('confirmColorBtn').addEventListener('click', () => {
      if (state.element) {
        const color = updateColor();
        state.element.style.color = color;
      }
      modal.style.display = 'none';
    });
    
    // Expose API to open color picker
    modal.openColorPicker = (element) => {
      state.element = element;
      
      // Try to parse current color if possible
      // For simplicity, we'll just reset to defaults
      state.hue = 0;
      state.saturation = 100;
      state.value = 100;
      
      hueHandle.style.left = '0%';
      satHandle.style.left = '100%';
      valHandle.style.left = '100%';
      
      updateColor();
      modal.style.display = 'flex';
    };
  }
  
  return modal;
}

// Show font size input dialog
function showFontSizeDialog() {
  if (!selectedElement) return;
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('fontSizeModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'fontSizeModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Font Size</h3>
        <div class="font-size-input">
          <input type="number" id="fontSizeInput" min="1" max="100" step="1">
          <span>px</span>
        </div>
        <div class="modal-buttons">
          <button class="sidebar-btn" id="cancelFontSizeBtn">Cancel</button>
          <button class="sidebar-btn" id="confirmFontSizeBtn">Apply</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancelFontSizeBtn').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    document.getElementById('confirmFontSizeBtn').addEventListener('click', () => {
      const fontSize = document.getElementById('fontSizeInput').value;
      if (selectedElement && fontSize >= 1 && fontSize <= 100) {
        selectedElement.style.fontSize = `${fontSize}px`;
      }
      modal.style.display = 'none';
    });
  }
  
  // Set current value
  const currentSize = parseInt(selectedElement.style.fontSize) || 16;
  document.getElementById('fontSizeInput').value = currentSize;
  
  // Show modal
  modal.style.display = 'flex';
}

// Switch between different page display modes
function setPageDisplayMode(mode) {
  // Remove current page from display
  rectContainer.innerHTML = '';
  
  // Update display mode
  switch (mode) {
    case 'single':
      // Single page display (default behavior)
      showPage(currentPageIndex);
      break;
      
    case 'double':
      // Show two pages side by side
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.gap = '20px';
      
      // Add current page and next page (if available)
      if (pages[currentPageIndex]) {
        container.appendChild(pages[currentPageIndex].cloneNode(true));
      }
      
      if (pages[currentPageIndex + 1]) {
        container.appendChild(pages[currentPageIndex + 1].cloneNode(true));
      }
      
      rectContainer.appendChild(container);
      break;
      
    case 'all':
      // Show all pages in grid view
      const multiContainer = document.createElement('div');
      multiContainer.className = 'multi-page-container';
      
      pages.forEach((page, index) => {
        const thumbnail = page.cloneNode(true);
        thumbnail.style.transform = 'scale(0.5)';
        thumbnail.style.transformOrigin = 'top left';
        
        const wrapper = document.createElement('div');
        wrapper.className = `page-thumbnail ${page.dataset.pageType || 'regular'}`;
        if (index === currentPageIndex) wrapper.classList.add('selected');
        
        wrapper.appendChild(thumbnail);
        
        const label = document.createElement('div');
        label.className = 'page-label';
        if (page.dataset.pageType === 'cover') {
          label.textContent = 'Cover';
        } else if (page.dataset.pageType === 'back') {
          label.textContent = 'Back Cover';
        } else {
          label.textContent = `Page ${index + 1}`;
        }
        wrapper.appendChild(label);
        
        wrapper.onclick = () => {
          currentPageIndex = index;
          showPage(index);
        };
        
        multiContainer.appendChild(wrapper);
      });
      
      rectContainer.appendChild(multiContainer);
      break;
  }
}

// Initialize event listeners
function initializeEventListeners() {
  // Page setup event listeners
  if (selector) {
    selector.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        showCustomSizeDialog();
      } else {
        updateRectSize(e.target.value);
      }
    });
  }

  if (orientationBtn) {
    orientationBtn.addEventListener('click', updateOrientation);
  }

  // Navigation event listeners
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPageIndex > 0) {
        showPage(currentPageIndex - 1);
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (currentPageIndex < pages.length - 1) {
        showPage(currentPageIndex + 1);
      }
    });
  }
  
  // Page management event listeners
  const addPageBtn = document.getElementById('addPageBtn');
  const removePageBtn = document.getElementById('removePageBtn');
  const duplicatePageBtn = document.getElementById('duplicatePageBtn');
  
  if (addPageBtn) {
    addPageBtn.addEventListener('click', () => addPage());
  }
  
  if (removePageBtn) {
    removePageBtn.addEventListener('click', () => removePage(currentPageIndex));
  }
  
  if (duplicatePageBtn) {
    duplicatePageBtn.addEventListener('click', () => duplicatePage(currentPageIndex));
  }
  
  // Menu toggle handlers
  const leftMenuBtn = document.getElementById('leftMenuBtn');
  const rightMenuBtn = document.getElementById('rightMenuBtn');
  
  if (leftMenuBtn) {
    leftMenuBtn.addEventListener('click', toggleLeftSidebar);
  }
  
  if (rightMenuBtn) {
    rightMenuBtn.addEventListener('click', toggleRightSidebar);
  }
  
  // Element addition handlers
  const addTitleBtn = document.getElementById('addTitleBtn');
  const addSubtitleBtn = document.getElementById('addSubtitleBtn');
  const addParagraphBtn = document.getElementById('addParagraphBtn');
  const addImageBtn = document.getElementById('addImageBtn');
  
  if (addTitleBtn) {
    addTitleBtn.addEventListener('click', () => addTextElement('title'));
  }
  
  if (addSubtitleBtn) {
    addSubtitleBtn.addEventListener('click', () => addTextElement('subtitle'));
  }
  
  if (addParagraphBtn) {
    addParagraphBtn.addEventListener('click', () => addTextElement('paragraph'));
  }
  
  if (addImageBtn) {
    addImageBtn.addEventListener('click', () => addTextElement('image'));
  }
  
  // Element editing handlers
  const deleteElementBtn = document.getElementById('deleteElementBtn');
  
  if (deleteElementBtn) {
    deleteElementBtn.addEventListener('click', () => {
      if (selectedElement && selectedElement.parentNode) {
        selectedElement.parentNode.removeChild(selectedElement);
        deselectElement();
      }
    });
  }
  
  // Color picker handlers
  const colorOptions = document.querySelectorAll('.color-option');
  
  if (colorOptions.length > 0) {
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        if (selectedElement) {
          selectedElement.style.color = option.dataset.color;
        }
      });
    });
  }
  
  // Font size handlers
  const sizeBtns = document.querySelectorAll('.size-btn');
  
  if (sizeBtns.length > 0) {
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (selectedElement) {
          selectedElement.style.fontSize = `${btn.dataset.size}px`;
        }
      });
    });
  }
  
  // Font family handler
  const fontFamilySelect = document.getElementById('fontFamilySelect');
  
  if (fontFamilySelect) {
    fontFamilySelect.addEventListener('change', (e) => {
      if (selectedElement) {
        selectedElement.style.fontFamily = e.target.value;
      }
    });
  }
  
  // Export handlers
  const exportPngBtn = document.getElementById('exportPngBtn');
  const exportJpgBtn = document.getElementById('exportJpgBtn');
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  
  if (exportPngBtn) {
    exportPngBtn.addEventListener('click', () => exportAsImage('png'));
  }
  
  if (exportJpgBtn) {
    exportJpgBtn.addEventListener('click', () => exportAsImage('jpg'));
  }
  
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', exportAsPDF);
  }
  
  // Save layout handlers
  const saveLayoutBtn = document.getElementById('saveLayoutBtn');
  const cancelSaveBtn = document.getElementById('cancelSaveBtn');
  const confirmSaveBtn = document.getElementById('confirmSaveBtn');
  
  if (saveLayoutBtn) {
    saveLayoutBtn.addEventListener('click', showSaveLayoutModal);
  }
  
  if (cancelSaveBtn) {
    cancelSaveBtn.addEventListener('click', hideModal);
  }
  
  if (confirmSaveBtn) {
    confirmSaveBtn.addEventListener('click', saveLayout);
  }
  
  // Import layout handler
  const importLayoutBtn = document.getElementById('importLayoutBtn');
  
  if (importLayoutBtn) {
    importLayoutBtn.addEventListener('click', importLayout);
  }
  
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

// Initialize the app
function initializeApp() {
  // Load saved layouts from localStorage
  const saved = localStorage.getItem('paperSizeSelectorLayouts');
  if (saved) {
    try {
      savedLayouts = JSON.parse(saved);
      updateSavedLayoutsList();
    } catch (e) {
      console.error('Error loading saved layouts', e);
    }
  }
  
  // Create initial pages
  addPage('cover', 0);    // Add cover as first page
  addPage('regular', 1);  // Add regular page as second page
  addPage('back', 2);     // Add back cover as last page
  
  // Show the cover page
  showPage(0);
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Make layout visible
  const layout = document.getElementById('layout');
  if (layout) {
    layout.style.display = 'flex';
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for module use
export { initializeApp };
