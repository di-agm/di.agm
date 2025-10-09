let pages = [];
let currentPageIndex = 0;
let isPortrait = true;
let selectedElement = null;
let savedLayouts = [];
let rulersVisible = false;
let marginsVisible = false;
let pageNumbersVisible = true;
let zoomLevel = 1;
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;

function createPage(pageNumber) {
  const page = document.createElement('div');
  page.className = 'rect';
  page.style.position = 'relative';
  page.style.background = '#ffffff';
  page.style.boxShadow = '0 8px 20px rgba(2,6,23,0.15)';
  page.style.userSelect = 'none';
  page.style.transition = 'width 0.4s ease, height 0.4s ease';
  page.style.width = '374px';
  page.style.height = '529px'; // A4 ratio initially
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
  pageNumberLabel.textContent = pageNumber;
  page.appendChild(pageNumberLabel);

  return page;
}

const rectContainer = document.querySelector('.center-container');
const selector = document.getElementById('sizeSelector');
const orientationBtn = document.getElementById('orientationBtn');
const pageNumberDisplay = document.getElementById('pageNumber');

const paperSizes = {
  a4: { widthMM: 210, heightMM: 297 },
  letter: { widthIN: 8.5, heightIN: 11 },
  tabloid: { widthIN: 11, heightIN: 17 }
};

const maxWidthPx = 360;

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
  } else {
    widthPx = mmToPx(paperSizes.a4.widthMM);
    heightPx = mmToPx(paperSizes.a4.heightMM);
  }

  if (widthPx > maxWidthPx) {
    const scale = maxWidthPx / widthPx;
    widthPx = widthPx * scale;
    heightPx = heightPx * scale;
}

  const pageElement = pages[currentPageIndex];
  pageElement.style.width = `${widthPx}px`;
  pageElement.style.height = `${heightPx}px`;

if (rulersVisible) drawRulers();
window.addEventListener("resize", () => {
  if (rulersVisible) drawRulers();
});
  
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
}

function updateOrientation() {
  if (!pages[currentPageIndex]) return;
  
  const page = pages[currentPageIndex];
  const width = page.style.width;
  const height = page.style.height;
  
  page.style.width = height;
  page.style.height = width;
  
  isPortrait = !isPortrait;
}

function showPage(index) {
  rectContainer.innerHTML = '';
  currentPageIndex = index;
  rectContainer.appendChild(pages[currentPageIndex]);
  pageNumberDisplay.textContent = `Page ${index + 1}`;
  updateRectSize(selector.value);
  deselectElement();
}

function updatePageNumbers() {
  pages.forEach((page, i) => {
    const pageNumberLabel = page.querySelector('div:last-child');
    if (pageNumberLabel) {
      pageNumberLabel.textContent = i + 1;
    }
  });
}

function addPage() {
  const newPage = createPage(pages.length + 1);
  pages.push(newPage);
  showPage(pages.length - 1);
}

function removePage(index) {
  if (pages.length <= 1) return;
  pages.splice(index, 1);
  if (currentPageIndex >= pages.length) {
    currentPageIndex = pages.length - 1;
  }
  showPage(currentPageIndex);
  updatePageNumbers();
}

function duplicatePage(index) {
  const originalPage = pages[index];
  const clone = originalPage.cloneNode(true);
  const clonedElements = clone.querySelectorAll('.text-element, .shape-element');
  clonedElements.forEach(element => {
    makeElementDraggable(element);
    makeRotatable(element); // Ensure rotation handler is re-added
    // Re-select handler
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(element);
    });
  });
  pages.splice(index + 1, 0, clone);
  showPage(index + 1);
  updatePageNumbers();
}

function toggleRulers() {
  rulersVisible = !rulersVisible;
  pages.forEach(page => {
    if (rulersVisible) {
      // Add rulers if not already present
      if (!page.querySelector('.page-ruler.horizontal.top')) {
        const top = document.createElement('div');
        top.className = 'page-ruler horizontal top';
        page.appendChild(top);
      }
      if (!page.querySelector('.page-ruler.horizontal.bottom')) {
        const bottom = document.createElement('div');
        bottom.className = 'page-ruler horizontal bottom';
        bottom.style.bottom = '0';
        bottom.style.top = 'auto';
        page.appendChild(bottom);
      }
      if (!page.querySelector('.page-ruler.vertical.left')) {
        const left = document.createElement('div');
        left.className = 'page-ruler vertical left';
        page.appendChild(left);
      }
      if (!page.querySelector('.page-ruler.vertical.right')) {
        const right = document.createElement('div');
        right.className = 'page-ruler vertical right';
        right.style.right = '0';
        right.style.left = 'auto';
        page.appendChild(right);
      }
    } else {
      page.querySelectorAll('.page-ruler').forEach(r => r.remove());
    }
  });
}

function toggleMargins() {
  marginsVisible = !marginsVisible;
  pages.forEach(page => {
    if (marginsVisible) {
      if (!page.querySelector('.page-margins')) {
        const margins = document.createElement('div');
        margins.className = 'page-margins';
        page.appendChild(margins);
      }
    } else {
      const margins = page.querySelector('.page-margins');
      if (margins) margins.remove();
    }
  });
}

// layout.js

function togglePageNumbers() {
    pageNumbersVisible = !pageNumbersVisible; // Toggle the state

    const toggleBtn = document.getElementById('togglePageNumbersBtn');
    if (toggleBtn) {
        toggleBtn.textContent = pageNumbersVisible ? '#P':'#P';
        toggleBtn.classList.toggle('active', pageNumbersVisible);
    }
    
    pages.forEach(page => {
        // Get the page-content container
        const pageContent = page.querySelector('.page-content');
        if (!pageContent) return;
        const pageNumberLabel = page.querySelector('[style*="bottom: 8px;"][style*="right: 12px;"]');

        if (pageNumberLabel) {
            pageNumberLabel.style.display = pageNumbersVisible ? 'block' : 'none';
        } 
    });
}
function drawRulers() {
  document.querySelectorAll(".ruler").forEach(r => r.remove());
  if (!rulersVisible) return;

  const page = pages[currentPageIndex];
  if (!page) return;

  const pageRect = page.getBoundingClientRect();

  // Horizontal ruler
  const hRuler = document.createElement("div");
  hRuler.className = "ruler horizontal";
  hRuler.style.width = pageRect.width + "px";
  hRuler.style.left = page.offsetLeft + "px";
  hRuler.style.top = (page.offsetTop - 25) + "px"; // 20px ruler + 2px gap
  page.parentElement.appendChild(hRuler);

  // Vertical ruler
  const vRuler = document.createElement("div");
  vRuler.className = "ruler vertical";
  vRuler.style.height = pageRect.height + "px";
  vRuler.style.top = page.offsetTop + "px";
  vRuler.style.left = (page.offsetLeft - 25) + "px"; // 20px ruler + 2px gap
  page.parentElement.appendChild(vRuler);

  // Tick spacing: every 50px in current unit
  const spacing = convertToPx(10, currentRulerUnit); // minor ticks every 10 units
  const maxX = pageRect.width;
  const maxY = pageRect.height;

  // Horizontal ticks
  for (let x = 0; x <= maxX; x += spacing) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.left = x + "px";
    tick.style.height = (x % (spacing * 5) === 0) ? "10px" : "6px"; // longer tick every 5
    hRuler.appendChild(tick);

    if (x % (spacing * 5) === 0) {
      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.left = x + 2 + "px";
      label.style.bottom = "10px";
      label.textContent = Math.round(x / convertToPx(1, currentRulerUnit));
      hRuler.appendChild(label);
    }
  }

  // Vertical ticks
  for (let y = 0; y <= maxY; y += spacing) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.top = y + "px";
    tick.style.width = (y % (spacing * 5) === 0) ? "10px" : "6px";
    vRuler.appendChild(tick);

    if (y % (spacing * 5) === 0) {
      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.top = y + "px";
      label.style.right = "12px";
      label.textContent = Math.round(y / convertToPx(1, currentRulerUnit));
      vRuler.appendChild(label);
    }
  }
}

function toggleRulers() {
  rulersVisible = !rulersVisible;
  drawRulers();
}

// Re-draw rulers when page changes
const oldShowPage = showPage;
showPage = function(index) {
  oldShowPage(index);
  if (rulersVisible) drawRulers();
};

function addTextElement(type) {
  if (!pages[currentPageIndex]) return;
  
  const pageContent = pages[currentPageIndex].querySelector('.page-content');
  const element = document.createElement('div');
  element.className = 'text-element';
  element.contentEditable = true;
  element.setAttribute('tabindex', '0');
  element.style.top = '50px';
  element.style.left = '50px';
  element.style.position = 'absolute';

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
  }
    
  element.style.resize = 'both';
  element.style.overflow = 'auto';

  pageContent.appendChild(element);
  makeElementDraggable(element);
  makeRotatable(element);
  selectElement(element);
}

  function addImageElement() {
    if (!pages[currentPageIndex]) { addPage(); }
    
    const pageContent = pages[currentPageIndex].querySelector('.page-content');
    
    const container = document.createElement('div');
    container.className = 'image-element-container';
    container.style.top = '50px';
    container.style.left = '50px';
    container.style.position = 'absolute';
    container.style.width = '150px'; 
    container.style.height = '100px';
    
    const element = document.createElement('img');
    element.className = 'image-element';
    element.src = DEFAULT_IMAGE_SRC;
    element.alt = 'User-defined image';
    element.crossOrigin = "anonymous";
    
    container.appendChild(element);
    container.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(container); // Select the container, not the image
    });

    pageContent.appendChild(container);
    makeElementDraggable(container);
    selectElement(container);
}

function updateImageSource(newSrc) {
    if (selectedElement && selectedElement.classList.contains('image-element-container')) {
        const img = selectedElement.querySelector('.image-element');
        if (img) {
            img.src = newSrc;
        }
    }
}

function addShapeElement(type) {
  if (!pages[currentPageIndex]) return;

  const pageContent = pages[currentPageIndex].querySelector('.page-content');
  const element = document.createElement('div');
  element.className = 'shape-element';
  element.setAttribute('tabindex', '0');
  element.style.top = '50px';
  element.style.left = '50px';
  element.style.position = 'absolute';
  element.style.width = '100px';
  element.style.height = '100px';
  element.style.resize = 'both';
  element.style.overflow = 'auto';

  // Create an SVG to hold the shape
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 100 100");

  let shape;

  switch(type) {
    case 'circle':
      shape = document.createElementNS(svgNS, "circle");
      shape.setAttribute("cx", "50");
      shape.setAttribute("cy", "50");
      shape.setAttribute("r", "40");
      shape.setAttribute("fill", "#3b82f6"); // Default blue fill
      shape.setAttribute("stroke", "#1e3a8a"); // Default dark blue border
      shape.setAttribute("stroke-width", "4"); // Default border width
      break;

    case 'polygon': {
      let sides = parseInt(prompt("Enter number of sides:", "7"));
      if (isNaN(sides) || sides < 3) sides = 7; // default
      const points = [];
      
      // FIX: A polygon uses a single radius, not alternating radii like a star.
      const radius = 40; // Use a consistent radius (e.g., 40, to match your star's outer radius)
      
      for (let i = 0; i < sides; i++) {
        // Keeps the top point flat by starting the angle correctly
        const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
        
        // Use the consistent radius for all points
        const x = 50 + radius * Math.cos(angle); 
        const y = 50 + radius * Math.sin(angle);
        
        points.push(`${x},${y}`);
      }
      
      shape = document.createElementNS(svgNS, "polygon");
      shape.setAttribute("points", points.join(" "));
      shape.setAttribute("fill", "#3b82f6");
      shape.setAttribute("stroke", "#1e3a8a");
      shape.setAttribute("stroke-width", "4");
      break;
    }

    case 'star': {
      let peaks = parseInt(prompt("Enter number of peaks:", "7"));
      if (isNaN(peaks) || peaks < 3) peaks = 7; // default
      const points = [];
      const outerRadius = 40;
      const innerRadius = 20;
      for (let i = 0; i < 2 * peaks; i++) {
        const angle = (Math.PI * i) / peaks - Math.PI / 2;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = 50 + r * Math.cos(angle);
        const y = 50 + r * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      shape = document.createElementNS(svgNS, "polygon");
      shape.setAttribute("points", points.join(" "));
      shape.setAttribute("fill", "#3b82f6");
      shape.setAttribute("stroke", "#1e3a8a");
      shape.setAttribute("stroke-width", "4");
      break;
    }
  }

  if (shape) {
    // Store style properties on the container element for persistence
    element.dataset.fillColor = shape.getAttribute('fill');
    element.dataset.fillOpacity = 1.0;
    element.dataset.borderColor = shape.getAttribute('stroke');
    element.dataset.borderOpacity = 1.0;
    element.dataset.borderWidth = shape.getAttribute('stroke-width');

    svg.appendChild(shape);
    element.appendChild(svg);
  }

  element.style.zIndex = '1';
  
  pageContent.appendChild(element);
  makeElementDraggable(element);
  makeRotatable(element);
  selectElement(element);

  // Re-apply style when element is resized (to ensure SVG scale/transform updates)
  new ResizeObserver(() => {
    updateSelectedShapeStyle(); 
  }).observe(element);
}

function selectElement(element) {
    if (!document.getElementById('editorCanvas').contains(element)) return;

    document.querySelectorAll('.text-element, .shape-element, .image-element-container').forEach(el => {
        el.classList.remove('selected');
        el.style.border = 'none';
        el.style.outline = 'none';
        el.style.padding = '0'; 
        if (el.classList.contains('shape-element')) {
            el.style.boxShadow = 'none';
        }
    });

    if (element.id === 'editorCanvas' || element.id === 'pagesContainer') {
        deselectElement();
        return;
    }

    selectedElement = element;
    selectedElement.classList.add('selected');
    
    if (selectedElement.classList.contains('image-element-container') || selectedElement.classList.contains('text-element')) {
        selectedElement.style.border = '2px dashed #3B82F6';
        selectedElement.style.outline = '1px solid #ffffff';
        selectedElement.style.padding = '2px';
    }

    document.getElementById('textEditor').style.display = 'none';
    document.getElementById('shapeEditor').style.display = 'none';
    document.getElementById('imageEditor').style.display = 'none'; 
    document.getElementById('noElementSelected').style.display = 'none';

    const textToolbar = document.getElementById('textToolbar');
    const shapeToolbar = document.getElementById('shapeToolbar');
    const imageToolbar = document.getElementById('imageToolbar');

    textToolbar.style.display = 'none';
    shapeToolbar.style.display = 'none';
    imageToolbar.style.display = 'none';

    let toolbar;
    if (element.classList.contains('text-element')) {
        toolbar = textToolbar;
        document.getElementById('textEditor').style.display = 'block';
        const fontSizeInput = document.getElementById('fontSizeInput');
        if (fontSizeInput) fontSizeInput.value = parseInt(window.getComputedStyle(selectedElement).fontSize);
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        if (fontFamilySelect) fontFamilySelect.value = selectedElement.style.fontFamily || '';
        const colorInput = document.getElementById('colorPickerInput');
        if (colorInput) colorInput.value = selectedElement.style.color || '#000000';

    } else if (element.classList.contains('shape-element')) {
        toolbar = shapeToolbar;
        document.getElementById('shapeEditor').style.display = 'block';
    
    } else if (element.classList.contains('image-element-container')) { 
        toolbar = imageToolbar;
        document.getElementById('imageEditor').style.display = 'block';
        
        const img = selectedElement.querySelector('.image-element');
        const imageUrlInput = document.getElementById('imageUrlInput');
        if (imageUrlInput && img) {
            imageUrlInput.value = img.src;
        }
    }


    if (toolbar) {
        const rect = element.getBoundingClientRect();
        toolbar.style.left = `${rect.left + rect.width / 2 - toolbar.offsetWidth / 2}px`;
        toolbar.style.top = `${rect.bottom + 5}px`;
        toolbar.style.display = 'flex';
    } else {
        document.getElementById('noElementSelected').style.display = 'block';
    }
}

function makeElementDraggable(element) { 
    element.addEventListener('mousedown', (e) => {
        if (!e.target.classList.contains('text-element') && !e.target.classList.contains('image-element-container')) return; 

        e.stopPropagation();
        let shiftX = e.clientX - element.getBoundingClientRect().left;
        let shiftY = e.clientY - element.getBoundingClientRect().top;
        
        function moveAt(pageX, pageY) {
            element.style.left = (pageX - shiftX) + 'px';
            element.style.top = (pageY - shiftY) + 'px';
        }
        
        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        
        element.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            element.onmouseup = null;
        };
    });
    element.ondragstart = function() { return false; }; 
}
function makeRotatable(element) { /* Placeholder for rotation logic */ }
function showPage(index) { 
    pages.forEach((page, i) => {
        page.style.display = (i === index) ? 'flex' : 'none';
    });
    if (pages[index]) pages[index].style.display = 'block';
}

function deleteElement() {
    if (selectedElement) {
        selectedElement.remove();
        selectedElement = null;
        
        document.getElementById('textToolbar').style.display = 'none';
        document.getElementById('shapeToolbar').style.display = 'none';
        document.getElementById('imageToolbar').style.display = 'none'; 
      
        document.getElementById('textEditor').style.display = 'none';
        document.getElementById('shapeEditor').style.display = 'none';
        document.getElementById('imageEditor').style.display = 'none'; 
      
        document.getElementById('noElementSelected').style.display = 'block';
    }
}

function toggleEdit() {
  if (!selectedElement) return;
  const isEditing = selectedElement.contentEditable === "true";
  selectedElement.contentEditable = !isEditing;
  if (!isEditing) {
    selectedElement.focus();
  } else {
    selectedElement.blur();
  }
}

function alignElement() {
  if (!selectedElement) return;
  const alignments = ['left', 'center', 'right', 'justify'];
  let current = selectedElement.style.textAlign || 'left';
  let nextIndex = (alignments.indexOf(current) + 1) % alignments.length;
  selectedElement.style.textAlign = alignments[nextIndex];
}

['textToolbar', 'shapeToolbar', 'imageToolbar'].forEach(toolbarId => {
  const toolbar = document.getElementById(toolbarId);
  if (!toolbar) return;

  toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'delete') deleteElement();
      if (action === 'edit') toggleEdit();
      if (action === 'align') alignElement();
    });
  });
});

// Handle clicks on elements and outside
document.addEventListener('click', (e) => {
  const clickedElement = e.target.closest('.text-element, .shape-element');

  if (clickedElement) {
    if (selectedElement !== clickedElement) {
      selectElement(clickedElement);
    }
    // No need to call showToolbar here if selectElement handles it
  } else if (
    !e.target.closest('#textEditor') &&
    !e.target.closest('#shapeEditor') &&
    !e.target.closest('#imageEditor') &&
    !e.target.closest('#textToolbar') &&
    !e.target.closest('#shapeToolbar') &&
    !e.target.closest('#imageToolbar') &&
    !e.target.closest('.sidebar-btn') &&
    !e.target.closest('.modal') // Don't deselect if clicking modal
  ) {
    document.getElementById('textToolbar').style.display = 'none';
    document.getElementById('shapeToolbar').style.display = 'none';
    document.getElementById('imageToolbar').style.display = 'none';
    deselectElement();
  }
});

function makeRotatable(el) {
  let rotating = false;

  el.addEventListener('mousedown', (e) => {
    if (!e.altKey) return; // tip: require holding Alt (or Shift) so normal drag still works

    e.preventDefault();
    rotating = true;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    function onMouseMove(ev) {
      if (!rotating) return;

      const dx = ev.clientX - centerX;
      const dy = ev.clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // preserve other transforms
      const existing = el.style.transform.replace(/rotate\([^)]*\)/, '');
      el.style.transform = `${existing} rotate(${angle}deg)`;
    }

    function onMouseUp() {
      rotating = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function deselectElement() {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        
        if (selectedElement.classList.contains('text-element') || selectedElement.classList.contains('image-element')) {
            selectedElement.style.border = 'none';
            selectedElement.style.outline = 'none';
        }
        
        if (selectedElement.classList.contains('shape-element')) {
            selectedElement.style.boxShadow = 'none';
            selectedElement.style.border = 'none';
        }

        selectedElement = null;
    }
    
    document.getElementById('textEditor').style.display = 'none';
    document.getElementById('shapeEditor').style.display = 'none';
    document.getElementById('imageEditor').style.display = 'none'; // MODIFICATION 1: Hide image editor
    
    document.getElementById('noElementSelected').style.display = 'block';
    
    document.getElementById('textToolbar').style.display = 'none';
    document.getElementById('shapeToolbar').style.display = 'none';
    document.getElementById('imageToolbar').style.display = 'none'; // MODIFICATION 2: Hide image toolbar
}

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
//Zoom
const center = document.querySelector(".center-container");

// Check if buttons exist before adding listeners
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const handBtn = document.getElementById("handBtn");

if (zoomInBtn) {
  zoomInBtn.addEventListener("click", () => {
    zoomLevel *= 1.1;
    if (pages[currentPageIndex]) pages[currentPageIndex].style.transform = `scale(${zoomLevel})`;
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener("click", () => {
    zoomLevel /= 1.1;
    if (pages[currentPageIndex]) pages[currentPageIndex].style.transform = `scale(${zoomLevel})`;
  });
}

if (handBtn) {
  handBtn.addEventListener("click", () => {
    center.style.cursor = "grab";
    center.addEventListener("mousedown", startPan);
  });
}

function startPan(e) {
  isPanning = true;
  startX = e.pageX - center.offsetLeft;
  startY = e.pageY - center.offsetTop;
  scrollLeft = center.scrollLeft;
  scrollTop = center.scrollTop;
  center.style.cursor = "grabbing";
  center.addEventListener("mousemove", panMove);
  center.addEventListener("mouseup", endPan);
}

function panMove(e) {
  if (!isPanning) return;
  const x = e.pageX - center.offsetLeft;
  const y = e.pageY - center.offsetTop;
  center.scrollLeft = scrollLeft - (x - startX);
  center.scrollTop = scrollTop - (y - startY);
}

function endPan() {
  isPanning = false;
  center.style.cursor = "grab";
  center.removeEventListener("mousemove", panMove);
  center.removeEventListener("mouseup", endPan);
}

async function exportAsImage(format) {
    if (pages.length === 0) return;

    const target = pages[currentPageIndex]; 
    
    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;

    target.scrollIntoView({ block: 'start' });

    try {
        const canvas = await html2canvas(target, {
            // CRITICAL FIX: Enable CORS for external images
            useCORS: true, 
            logging: true,
            allowTaint: true,
            backgroundColor: null, 
            scale: 2 
        });

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, format === 'jpg' ? 0.9 : 1.0);

        const link = document.createElement('a');
        link.download = `layout_page_${currentPageIndex + 1}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error("Error during image export. This is usually due to the image host not allowing CORS.", error);
    } finally {
        window.scrollTo(originalScrollX, originalScrollY);
    }
}

async function exportAsPDF() {
    if (pages.length === 0 || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        console.log("PDF export dependencies not loaded or no pages.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const target = pages[currentPageIndex];
    const originalScrollY = window.scrollY;
    target.scrollIntoView({ block: 'start' });

    try {
        const canvas = await html2canvas(target, {
            useCORS: true, 
            scale: 2
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; 
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`layout_page_${currentPageIndex + 1}.pdf`);

    } catch (error) {
        console.error("Error during PDF export:", error);
    } finally {
        window.scrollTo(originalScrollX, originalScrollY);
    }
}

// Layout saving and loading functions
function showSaveLayoutModal() {
  const modal = document.getElementById('saveLayoutModal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('layoutNameInput').focus();
  }
}

function hideModal() {
  const modal = document.getElementById('saveLayoutModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveLayout() {
    const layoutData = {
        name: document.getElementById('layoutNameInput').value || `Layout ${savedLayouts.length + 1}`,
        pages: pages.map(page => {
            const pageContent = page.querySelector('.page-content');
            
            const elementsData = Array.from(pageContent.children).map(element => {
                let elData = {
                    type: '',
                    content: '', // For text/image content
                    style: {}
                };

                const computedStyle = window.getComputedStyle(element);
                const stylesToSave = ['position', 'top', 'left', 'width', 'height', 'zIndex', 'transform', 'fontSize', 'fontWeight', 'color', 'backgroundColor', 'border', 'borderRadius', 'boxShadow', 'filter', 'opacity'];
                stylesToSave.forEach(prop => {
                    if (element.style[prop] || computedStyle[prop] !== 'none' || computedStyle[prop] !== 'auto') {
                         elData.style[prop] = element.style[prop] || computedStyle[prop];
                    }
                });

                if (element.classList.contains('text-element')) {
                    elData.type = 'text';
                    elData.content = element.innerText;
                } else if (element.classList.contains('shape-element')) {
                    elData.type = 'shape';
                    elData.shapeType = element.dataset.shapeType;
                    elData.shapeData = {
                        fillColor: element.dataset.fillColor,
                        fillOpacity: element.dataset.fillOpacity,
                        borderColor: element.dataset.borderColor,
                        borderOpacity: element.dataset.borderOpacity,
                        borderWidth: element.dataset.borderWidth,
                    };
                } else if (element.classList.contains('image-element')) {
                    elData.type = 'image';
                    elData.content = element.src; // Save the image URL in the content field
                }

                return elData.type ? elData : null;
            }).filter(d => d !== null); // Filter out any null/unknown elements

            return {
                width: page.style.width,
                height: page.style.height,
                elements: elementsData
            };
        })
    };
    
    console.log('Layout Data Saved:', layoutData);
    savedLayouts.push(layoutData);
    
    hideModal(); // Hide the save modal
}

function loadLayout(layoutIndex) {
    const layout = savedLayouts[layoutIndex];
    if (!layout) return;
    
    const container = document.getElementById('pagesContainer');
    if (container) container.innerHTML = '';
    
    pages = [];
    
    layout.pages.forEach(pageData => {
        const newPage = createPage(pages.length + 1);
        newPage.style.width = pageData.width;
        newPage.style.height = pageData.height;
        
        const pageContent = newPage.querySelector('.page-content');
        
        pageData.elements.forEach(elData => {
            let element;

            if (elData.type === 'text') {
                element = document.createElement('div');
                element.className = 'text-element';
                element.contentEditable = true;
                element.innerText = elData.content;
            } else if (elData.type === 'shape') {
                element = document.createElement('div');
                element.className = 'shape-element';
                element.contentEditable = false;
                
                const svgNS = "http://www.w3.org/2000/svg";
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("width", "100%");
                svg.setAttribute("height", "100%");
                svg.setAttribute("viewBox", "0 0 100 100");
                let shape;

                switch(elData.shapeType) {
                    case 'circle':
                        shape = document.createElementNS(svgNS, "circle");
                        shape.setAttribute("cx", "50");
                        shape.setAttribute("cy", "50");
                        shape.setAttribute("r", "40");
                        break;
                    case 'polygon':
                        shape = document.createElementNS(svgNS, "polygon");
                        if (elData.shapeData.points) {
                            shape.setAttribute("points", elData.shapeData.points);
                        }
                        break;
                }

                if (shape) {
                    svg.appendChild(shape);
                    element.appendChild(svg);
                }
                
                element.dataset.fillColor = elData.shapeData.fillColor;
                element.dataset.fillOpacity = elData.shapeData.fillOpacity;
                element.dataset.borderColor = elData.shapeData.borderColor;
                element.dataset.borderOpacity = elData.shapeData.borderOpacity;
                element.dataset.borderWidth = elData.shapeData.borderWidth;
                
                applyShapeStyle(element);
                
                new ResizeObserver(() => {
                    applyShapeStyle(element);
                }).observe(element);
            } else if (elData.type === 'image') { // <-- ADDED: Handle image element type
                element = document.createElement('img');
                element.className = 'image-element';
                element.contentEditable = false;
                element.src = elData.content; 
            } else {
                return; // Skip unknown element type
            }

            Object.entries(elData.style).forEach(([prop, value]) => {
                if (value) element.style[prop] = value;
            });
            
            pageContent.appendChild(element);
            makeElementDraggable(element);
            makeRotatable(element);
            
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                selectElement(element);
            });
        });
        
        if (container) container.appendChild(newPage); // Append new page to container
        pages.push(newPage);
    });
    
    currentPageIndex = 0;
    showPage(0);
}

let shapeEditorListenersInitialized = false;

function hexToRgbA(hex, alpha) {
    let r = 0, g = 0, b = 0;
    if (hex.length >= 4) {
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyShapeStyle(element = selectedElement) {
    if (!element || !element.classList.contains('shape-element')) return;

    const svgShape = element.querySelector('svg > *'); // Get the actual shape (circle, polygon, etc.)
    if (!svgShape) return;

    const fillColorHex = element.dataset.fillColor || '#000000';
    const fillOpacity = parseFloat(element.dataset.fillOpacity) || 1.0;
    
    const borderColorHex = element.dataset.borderColor || '#000000';
    const borderOpacity = parseFloat(element.dataset.borderOpacity) || 1.0;
    const borderWidth = parseFloat(element.dataset.borderWidth) || 0;

    const fillRgba = hexToRgbA(fillColorHex, fillOpacity);
    const borderRgba = hexToRgbA(borderColorHex, borderOpacity);

    svgShape.setAttribute('fill', fillRgba);
    svgShape.setAttribute('stroke', borderRgba);
    svgShape.setAttribute('stroke-width', borderWidth);
    svgShape.parentElement.style.transform = '';
    svgShape.parentElement.style.transformOrigin = '';
}

function updateSelectedShapeStyle() {
    if (!selectedElement || !selectedElement.classList.contains('shape-element')) return;

    const fillColorInput = document.getElementById('shape-fill-color');
    const fillOpacityInput = document.getElementById('shape-fill-opacity');
    const fillOpacityValueSpan = document.getElementById('fill-opacity-value');

    const borderColorInput = document.getElementById('shape-border-color');
    const borderOpacityInput = document.getElementById('shape-border-opacity');
    const borderOpacityValueSpan = document.getElementById('border-opacity-value');
    const borderWidthInput = document.getElementById('shape-border-width');

    const fillColorHex = fillColorInput.value;
    const fillOpacity = parseFloat(fillOpacityInput.value);
    
    const borderColorHex = borderColorInput.value;
    const borderOpacity = parseFloat(borderOpacityInput.value);
    const borderWidth = Math.max(0, parseFloat(borderWidthInput.value));

    selectedElement.dataset.fillColor = fillColorHex;
    selectedElement.dataset.fillOpacity = fillOpacity;
    selectedElement.dataset.borderColor = borderColorHex;
    selectedElement.dataset.borderOpacity = borderOpacity;
    selectedElement.dataset.borderWidth = borderWidth;
    
    applyShapeStyle(selectedElement);

    if (fillOpacityValueSpan) fillOpacityValueSpan.textContent = fillOpacity.toFixed(2);
    if (borderOpacityValueSpan) borderOpacityValueSpan.textContent = borderOpacity.toFixed(2);
}

function loadShapeStateToControls() {
    if (!selectedElement || !selectedElement.classList.contains('shape-element')) return;

    const fillColorInput = document.getElementById('shape-fill-color');
    const fillOpacityInput = document.getElementById('shape-fill-opacity');
    const borderWidthInput = document.getElementById('shape-border-width');
    const borderColorInput = document.getElementById('shape-border-color');
    const borderOpacityInput = document.getElementById('shape-border-opacity');

    fillColorInput.value = selectedElement.dataset.fillColor || '#3b82f6';
    fillOpacityInput.value = selectedElement.dataset.fillOpacity || 1.0;
    borderWidthInput.value = selectedElement.dataset.borderWidth || 4;
    borderColorInput.value = selectedElement.dataset.borderColor || '#1e3a8a';
    borderOpacityInput.value = selectedElement.dataset.borderOpacity || 1.0;
    
    updateSelectedShapeStyle();
}

function initShapeEditor() {
    if (shapeEditorListenersInitialized) return;

    const fillColorInput = document.getElementById('shape-fill-color');
    const fillOpacityInput = document.getElementById('shape-fill-opacity');
    const borderColorInput = document.getElementById('shape-border-color');
    const borderOpacityInput = document.getElementById('shape-border-opacity');
    const borderWidthInput = document.getElementById('shape-border-width');
    
    if (fillColorInput) {
        fillColorInput.addEventListener('input', updateSelectedShapeStyle);
    }
    if (fillOpacityInput) {
        fillOpacityInput.addEventListener('input', updateSelectedShapeStyle);
    }
    if (borderColorInput) {
        borderColorInput.addEventListener('input', updateSelectedShapeStyle);
    }
    if (borderOpacityInput) {
        borderOpacityInput.addEventListener('input', updateSelectedShapeStyle);
    }
    if (borderWidthInput) {
        borderWidthInput.addEventListener('input', updateSelectedShapeStyle);
        borderWidthInput.addEventListener('change', updateSelectedShapeStyle); 
    }
    
    shapeEditorListenersInitialized = true;
}

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

if (selector) {
  selector.addEventListener('change', (e) => {
    updateRectSize(e.target.value);
  });
}

if (orientationBtn) {
  orientationBtn.addEventListener('click', () => {
    updateOrientation();
  });
}

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const addPageBtn = document.getElementById('addPageBtn');
const removePageBtn = document.getElementById('removePageBtn');
const duplicatePageBtn = document.getElementById('duplicatePageBtn');

if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
  if (currentPageIndex > 0) {
    showPage(currentPageIndex - 1);
  }
});

if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
  if (currentPageIndex < pages.length - 1) {
    showPage(currentPageIndex + 1);
  }
});

if (addPageBtn) addPageBtn.addEventListener('click', addPage);
if (removePageBtn) removePageBtn.addEventListener('click', () => removePage(currentPageIndex));
if (duplicatePageBtn) duplicatePageBtn.addEventListener('click', () => duplicatePage(currentPageIndex));

const leftMenuBtn = document.getElementById('leftMenuBtn');
const rightMenuBtn = document.getElementById('rightMenuBtn');

if (leftMenuBtn) leftMenuBtn.addEventListener('click', toggleLeftSidebar);
if (rightMenuBtn) rightMenuBtn.addEventListener('click', toggleRightSidebar);

const addTitleBtn = document.getElementById('addTitleBtn');
const addSubtitleBtn = document.getElementById('addSubtitleBtn');
const addParagraphBtn = document.getElementById('addParagraphBtn');
const addImageBtn = document.getElementById('addImageBtn');

if (addTitleBtn) addTitleBtn.addEventListener('click', () => addTextElement('title'));
if (addSubtitleBtn) addSubtitleBtn.addEventListener('click', () => addTextElement('subtitle'));
if (addParagraphBtn) addParagraphBtn.addEventListener('click', () => addTextElement('paragraph'));
if (addImageBtn) addImageBtn.addEventListener('click', () => addTextElement('image'));

const addCircleBtn = document.getElementById('addCircleBtn');
const addPolygonBtn = document.getElementById('addPolygonBtn');
const addStarBtn = document.getElementById('addStarBtn');

if (addCircleBtn) addCircleBtn.addEventListener('click', () => addShapeElement('circle'));
if (addPolygonBtn) addPolygonBtn.addEventListener('click', () => addShapeElement('polygon'));
if (addStarBtn) addStarBtn.addEventListener('click', () => addShapeElement('star'));

const fontColorInput = document.getElementById('fontColorInput');

if (fontColorInput) fontColorInput.addEventListener('input', () => {
  if (selectedElement) {
    selectedElement.style.color = fontColorInput.value;
  }
});

const fontSizeInput = document.getElementById('fontSizeInput');

if (fontSizeInput) fontSizeInput.addEventListener('input', () => {
  if (selectedElement) {
    let size = parseInt(fontSizeInput.value, 10);
    if (!isNaN(size) && size >= 1 && size <= 1000) {
      selectedElement.style.fontSize = size + 'px';
    }
  }
});

const fontFamilySelect = document.getElementById('fontFamilySelect');
if (fontFamilySelect) fontFamilySelect.addEventListener('change', (e) => {
  if (selectedElement) {
    selectedElement.style.fontFamily = e.target.value;
  }
});

function loadCustomFont(file) {
  const url = URL.createObjectURL(file);
  const font = new FontFace("CustomFont", `url(${url})`);
  font.load().then((loadedFont) => {
    document.fonts.add(loadedFont);
    if (selectedElement) {
      selectedElement.style.fontFamily = "CustomFont";
    }
  });
}

const fontFileInput = document.getElementById('fontFileInput');
if (fontFileInput) fontFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadCustomFont(file);
});

const toggleRulersBtn = document.getElementById('toggleRulersBtn');
const toggleMarginsBtn = document.getElementById('toggleMarginsBtn');
const togglePageNumbersBtn = document.getElementById('togglePageNumbersBtn');

if (toggleRulersBtn) toggleRulersBtn.addEventListener('click', toggleRulers);
if (toggleMarginsBtn) toggleMarginsBtn.addEventListener('click', toggleMargins);
if (togglePageNumbersBtn) togglePageNumbersBtn.addEventListener('click', togglePageNumbers);

const exportPngBtn = document.getElementById('exportPngBtn');
const exportJpgBtn = document.getElementById('exportJpgBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');

if (exportPngBtn) exportPngBtn.addEventListener('click', () => exportAsImage('png'));
if (exportJpgBtn) exportJpgBtn.addEventListener('click', () => exportAsImage('jpg'));
if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportAsPDF);

const saveLayoutBtn = document.getElementById('saveLayoutBtn');
const cancelSaveBtn = document.getElementById('cancelSaveBtn');
const confirmSaveBtn = document.getElementById('confirmSaveBtn');
const importLayoutBtn = document.getElementById('importLayoutBtn');

if (saveLayoutBtn) saveLayoutBtn.addEventListener('click', showSaveLayoutModal);
if (cancelSaveBtn) cancelSaveBtn.addEventListener('click', hideModal);
if (confirmSaveBtn) confirmSaveBtn.addEventListener('click', saveLayout);

// Import layout handlers
if (importLayoutBtn) importLayoutBtn.addEventListener('click', () => {
  // This would typically open a file picker
  // For simplicity, we'll just show a message
  console.log('File import would be implemented here with a file picker dialog');
});

// Initialize with first page and load saved layouts
// Wrap this in a DOMContentLoaded check if this script is not deferred
document.addEventListener('DOMContentLoaded', () => {
    if (pages.length === 0) {
      addPage();
    }
    loadSavedLayouts();
    
    // Add html2canvas library for image export if not already present
    if (typeof html2canvas === 'undefined') {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      document.head.appendChild(html2canvasScript);
    }
});
