let pages = [];
let currentPageIndex = 0;
let isPortrait = true;
let selectedElement = null;
let savedLayouts = [];
let rulersVisible = false;
let currentRulerUnit = "px"; // px, pt, mm, cm, in
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

function togglePageNumbers() {
  pageNumbersVisible = !pageNumbersVisible;
  pages.forEach(page => {
    const pageNumberLabel = page.querySelector('div:last-child');
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
    
  element.style.resize = 'both';
  element.style.overflow = 'auto';

  pageContent.appendChild(element);
  makeElementDraggable(element);
  makeRotatable(element);
  selectElement(element);
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
      shape.setAttribute("fill", "#ddd");
      break;

    case 'polygon': {
      let sides = parseInt(prompt("Enter number of sides:", "7"));
      if (isNaN(sides) || sides < 3) sides = 7; // default
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
        const x = 50 + 40 * Math.cos(angle);
        const y = 50 + 40 * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      shape = document.createElementNS(svgNS, "polygon");
      shape.setAttribute("points", points.join(" "));
      shape.setAttribute("fill", "#ddd");
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
      shape.setAttribute("fill", "#ddd");
      break;
    }
  }

  if (shape) {
    svg.appendChild(shape);
    element.appendChild(svg);
  }

  element.style.resize = 'both';
  element.style.overflow = 'hidden';

  pageContent.appendChild(element);
  makeElementDraggable(element);
  makeRotatable(element);
  selectElement(element);
}

function selectElement(element) {
  // Clear previous selection
  document.querySelectorAll('.text-element, .shape-element').forEach(el =>
    el.classList.remove('selected')
  );

  // Update selectedElement
  selectedElement = element;
  selectedElement.classList.add('selected');

  // Hide all editors and toolbars by default
  document.getElementById('textEditor').style.display = 'none';
  document.getElementById('shapeEditor').style.display = 'none';
  document.getElementById('noElementSelected').style.display = 'none';

  const textToolbar = document.getElementById('textToolbar');
  const shapeToolbar = document.getElementById('shapeToolbar');
  textToolbar.style.display = 'none';
  shapeToolbar.style.display = 'none';

  // Position toolbar under the element
  const rect = element.getBoundingClientRect();
  const containerRect = document.body.getBoundingClientRect();
  let toolbar;

  if (element.classList.contains('text-element')) {
    toolbar = textToolbar;
    document.getElementById('textEditor').style.display = 'block';

    // update text controls
    const fontSizeInput = document.getElementById('fontSizeInput');
    if (fontSizeInput) {
      fontSizeInput.value = parseInt(window.getComputedStyle(selectedElement).fontSize);
    }
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    if (fontFamilySelect) {
      fontFamilySelect.value = selectedElement.style.fontFamily || '';
    }
    const colorInput = document.getElementById('colorPickerInput');
    if (colorInput) {
      colorInput.value = selectedElement.style.color || '#000000';
    }

  } else if (element.classList.contains('shape-element')) {
    toolbar = shapeToolbar;
    document.getElementById('shapeEditor').style.display = 'block';
  }

  if (toolbar) {
    toolbar.style.left = `${rect.left + rect.width / 2 - toolbar.offsetWidth / 2}px`;
    toolbar.style.top = `${rect.bottom - containerRect.top + 5}px`;
    toolbar.style.display = 'flex';
  }
}

function makeElementDraggable(el) {
  let offsetX = 0, offsetY = 0, isDragging = false;
  el.addEventListener('mousedown', (e) => {
      // If the element is resizable and the user clicked on the resize handle, skip dragging
      if (getComputedStyle(el).resize !== "none") {
        const rect = el.getBoundingClientRect();
        const resizeHandleSize = 16; // px size for the corner region
    
        // bottom-right corner = resize zone
        if (e.clientX > rect.right - resizeHandleSize && e.clientY > rect.bottom - resizeHandleSize) {
          return; // let the browser handle resizing
        }
      }
    
      e.preventDefault();
      isDragging = true;
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

  function onMouseMove(e) {
    if (!isDragging) return;
    const container = el.parentElement;
    const containerRect = container.getBoundingClientRect();
    let newLeft = e.clientX - containerRect.left - offsetX;
    let newTop = e.clientY - containerRect.top - offsetY;
    newLeft = Math.max(0, Math.min(newLeft, container.clientWidth - el.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, container.clientHeight - el.offsetHeight));
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
  }
  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
}

function showToolbar(targetElement) {
  const textToolbar = document.getElementById('textToolbar');
  const shapeToolbar = document.getElementById('shapeToolbar');
  if (!textToolbar || !shapeToolbar) return;

  // Hide both first
  textToolbar.style.display = 'none';
  shapeToolbar.style.display = 'none';

  const rect = targetElement.getBoundingClientRect();
  let toolbar;

  if (targetElement.classList.contains('text-element')) {
    toolbar = textToolbar;
  } else if (targetElement.classList.contains('shape-element')) {
    toolbar = shapeToolbar;
  }

  if (toolbar) {
    toolbar.style.display = 'flex';
    toolbar.style.position = 'absolute';
    toolbar.style.top = window.scrollY + rect.bottom + 'px';
    toolbar.style.left = window.scrollX + rect.left + 'px';
  }
}

function deleteElement() {
  if (selectedElement) {
    selectedElement.remove();
    selectedElement = null;
    document.getElementById('textToolbar').style.display = 'none';
    document.getElementById('shapeToolbar').style.display = 'none';
    document.getElementById('textEditor').style.display = 'none';
    document.getElementById('shapeEditor').style.display = 'none';
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

// Toolbar button listeners
['textToolbar', 'shapeToolbar'].forEach(toolbarId => {
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
    showToolbar(clickedElement);
  } else if (
    !e.target.closest('#textEditor') &&
    !e.target.closest('#shapeEditor') &&
    !e.target.closest('#textToolbar') &&
    !e.target.closest('#shapeToolbar') &&
    !e.target.closest('.sidebar-btn')
  ) {
    document.getElementById('textToolbar').style.display = 'none';
    document.getElementById('shapeToolbar').style.display = 'none';
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

/*/ Direct button hooks
document.getElementById('btnDelete').addEventListener('click', deleteElement);
document.getElementById('btnEdit').addEventListener('click', toggleEdit);
document.getElementById('btnAlign').addEventListener('click', alignElement);*/

function deselectElement() {
  if (selectedElement) {
    selectedElement.classList.remove('selected');
    selectedElement = null;
  }
  document.getElementById('textEditor').style.display = 'none';
  document.getElementById('shapeEditor').style.display = 'none';
  document.getElementById('noElementSelected').style.display = 'block';
  document.getElementById('textToolbar').style.display = 'none';
  document.getElementById('shapeToolbar').style.display = 'none';
}

// Toggle sidebar functions
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

document.getElementById("zoomInBtn").addEventListener("click", () => {
  zoomLevel *= 1.1;
  pages[currentPageIndex].style.transform = `scale(${zoomLevel})`;
});

document.getElementById("zoomOutBtn").addEventListener("click", () => {
  zoomLevel /= 1.1;
  pages[currentPageIndex].style.transform = `scale(${zoomLevel})`;
});

document.getElementById("handBtn").addEventListener("click", () => {
  center.style.cursor = "grab";
  center.addEventListener("mousedown", startPan);
});

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

function exportAsPDF() {
  if (!pages[currentPageIndex]) return;
  const page = pages[currentPageIndex];

  html2canvas(page).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`layout-${currentPageIndex + 1}.pdf`);
  });
}

// Layout saving and loading functions
function showSaveLayoutModal() {
  document.getElementById('saveLayoutModal').style.display = 'flex';
  document.getElementById('layoutNameInput').focus();
}

function hideModal() {
  document.getElementById('saveLayoutModal').style.display = 'none';
}

function saveLayout() {
  const name = document.getElementById('layoutNameInput').value.trim();
  if (!name) return;
  
  // Create a serializable representation of pages
  const layoutData = {
    name,
    date: new Date().toISOString(),
    pages: pages.map(page => {
      // Extract all elements on the page
      const elements = Array.from(page.querySelectorAll('.text-element, .shape-element')).map(el => {
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

function loadLayout(layoutIndex) {
  const layout = savedLayouts[layoutIndex];
  if (!layout) return;
  
  // Clear current pages
  pages = [];
  
  // Recreate pages from layout data
  layout.pages.forEach(pageData => {
    const newPage = createPage(pages.length + 1);
    newPage.style.width = pageData.width;
    newPage.style.height = pageData.height;
    
    const pageContent = newPage.querySelector('.page-content');
    
    // Add elements
    pageData.elements.forEach(elData => {
      const element = document.createElement('div');
      element.className = 'text-element';
      if (elData.type === 'image') element.classList.add('image');
      element.contentEditable = true;
      element.innerText = elData.content;
      
      // Apply styles
      Object.entries(elData.style).forEach(([prop, value]) => {
        if (value) element.style[prop] = value;
      });
      
      pageContent.appendChild(element);
        makeElementDraggable(element);
    });
    
    pages.push(newPage);
  });
  
  // Show first page
  currentPageIndex = 0;
  showPage(0);
  
  // Toggle right sidebar
  if (document.getElementById('rightSidebar').classList.contains('open')) {
    toggleRightSidebar();
  }
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

// Load saved layouts from localStorage
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

// Event Listeners
selector.addEventListener('change', (e) => {
  updateRectSize(e.target.value);
});

orientationBtn.addEventListener('click', () => {
  updateOrientation();
});

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

document.getElementById('addPageBtn').addEventListener('click', addPage);
document.getElementById('removePageBtn').addEventListener('click', () => removePage(currentPageIndex));
document.getElementById('duplicatePageBtn').addEventListener('click', () => duplicatePage(currentPageIndex));

// Add menu toggle handlers
document.getElementById('leftMenuBtn').addEventListener('click', toggleLeftSidebar);
document.getElementById('rightMenuBtn').addEventListener('click', toggleRightSidebar);

// Element addition handlers
document.getElementById('addTitleBtn').addEventListener('click', () => addTextElement('title'));
document.getElementById('addSubtitleBtn').addEventListener('click', () => addTextElement('subtitle'));
document.getElementById('addParagraphBtn').addEventListener('click', () => addTextElement('paragraph'));
document.getElementById('addImageBtn').addEventListener('click', () => addTextElement('image'));

document.getElementById('addCircleBtn').addEventListener('click', () => addShapeElement('circle'));
document.getElementById('addPolygonBtn').addEventListener('click', () => addShapeElement('polygon'));
document.getElementById('addStarBtn').addEventListener('click', () => addShapeElement('star'));

// Color picker handlers
const fontColorInput = document.getElementById('fontColorInput');

fontColorInput.addEventListener('input', () => {
  if (selectedElement) {
    selectedElement.style.color = fontColorInput.value;
  }
});

// Font size handlers
const fontSizeInput = document.getElementById('fontSizeInput');

fontSizeInput.addEventListener('input', () => {
  if (selectedElement) {
    let size = parseInt(fontSizeInput.value, 10);
    if (!isNaN(size) && size >= 1 && size <= 1000) {
      selectedElement.style.fontSize = size + 'px';
    }
  }
});

// Font family handler
document.getElementById('fontFamilySelect').addEventListener('change', (e) => {
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

document.getElementById('fontFileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadCustomFont(file);
});

// Button handlers
document.getElementById('toggleRulersBtn').addEventListener('click', toggleRulers);
document.getElementById('toggleMarginsBtn').addEventListener('click', toggleMargins);
document.getElementById('togglePageNumbersBtn').addEventListener('click', togglePageNumbers);

// Export handlers
document.getElementById('exportPngBtn').addEventListener('click', () => exportAsImage('png'));
document.getElementById('exportJpgBtn').addEventListener('click', () => exportAsImage('jpg'));
document.getElementById('exportPdfBtn').addEventListener('click', exportAsPDF);

// Save layout handlers
document.getElementById('saveLayoutBtn').addEventListener('click', showSaveLayoutModal);
document.getElementById('cancelSaveBtn').addEventListener('click', hideModal);
document.getElementById('confirmSaveBtn').addEventListener('click', saveLayout);

// Import layout handlers
document.getElementById('importLayoutBtn').addEventListener('click', () => {
  // This would typically open a file picker
  // For simplicity, we'll just show a message
  alert('File import would be implemented here with a file picker dialog');
});

// Initialize with first page and load saved layouts
addPage();
loadSavedLayouts();

// Add html2canvas library for image export
const html2canvasScript = document.createElement('script');
html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
document.head.appendChild(html2canvasScript);
