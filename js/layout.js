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
  page.className = 'rect page-a4-initial'; 
  
  const content = document.createElement('div');
  content.className = 'page-content';
  page.appendChild(content);
  
  const pageNumberLabel = document.createElement('div');
  pageNumberLabel.className = 'page-number-label';
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

  page.style.setProperty('--page-width', `${widthPx}px`);
  page.style.setProperty('--page-height', `${heightPx}px`);

  page.classList.toggle('landscape', !isPortrait);
  
}

function updateOrientation() {
  if (!pages[currentPageIndex]) return;
  const page = pages[currentPageIndex];
  isPortrait = !isPortrait;
  page.classList.toggle('landscape', !isPortrait);
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

const rulers = [
    { className: 'page-ruler horizontal top', style: {} },
    { className: 'page-ruler horizontal bottom', style: { bottom: '0', top: 'auto' } },
    { className: 'page-ruler vertical left', style: {} },
    { className: 'page-ruler vertical right', style: { right: '0', left: 'auto' } }
];

rulers.forEach(rulerData => {
    const ruler = document.createElement('div');
    ruler.className = rulerData.className;
    // Apply special inline styles for positioning (though better in CSS)
    Object.assign(ruler.style, rulerData.style); 
    page.appendChild(ruler);
});

return page;

function toggleRulers() {
  rulersVisible = !rulersVisible;
  
  pages.forEach(page => {
    page.classList.toggle('has-rulers', rulersVisible);
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
    pageNumbersVisible = !pageNumbersVisible; // Toggle the state

    const toggleBtn = document.getElementById('togglePageNumbersBtn');
    if (toggleBtn) {
        toggleBtn.textContent = pageNumbersVisible ? 'Hide #' : 'Show #';
        toggleBtn.classList.toggle('active', pageNumbersVisible);
    }
    
    pages.forEach(page => {
        const pageNumberLabel = page.querySelector('.page-number-label'); // Assumes this class is set in createPage

        if (pageNumberLabel) {
            pageNumberLabel.classList.toggle('page-number-hidden', !pageNumbersVisible);
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
  // Dynamic positioning remains in JS
  hRuler.style.left = page.offsetLeft + "px";
  hRuler.style.top = (page.offsetTop - 25) + "px"; 
  page.parentElement.appendChild(hRuler);

  // Vertical ruler
  const vRuler = document.createElement("div");
  vRuler.className = "ruler vertical";
  vRuler.style.height = pageRect.height + "px";
  // Dynamic positioning remains in JS
  vRuler.style.top = page.offsetTop + "px";
  vRuler.style.left = (page.offsetLeft - 25) + "px"; 
  page.parentElement.appendChild(vRuler);

  // Tick spacing remains in JS
  const spacing = convertToPx(10, currentRulerUnit);
  const maxX = pageRect.width;
  const maxY = pageRect.height;

  // Horizontal ticks
  for (let x = 0; x <= maxX; x += spacing) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.left = x + "px";
    // Tick size calculation must remain in JS
    tick.style.height = (x % (spacing * 5) === 0) ? "10px" : "6px"; 
    hRuler.appendChild(tick);

    if (x % (spacing * 5) === 0) {
      const label = document.createElement("div");
      // Only dynamic position remains
      label.style.left = x + 2 + "px"; 
      label.textContent = Math.round(x / convertToPx(1, currentRulerUnit));
      hRuler.appendChild(label);
    }
  }

  for (let y = 0; y <= maxY; y += spacing) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.top = y + "px";
    // Tick size calculation must remain in JS
    tick.style.width = (y % (spacing * 5) === 0) ? "10px" : "6px";
    vRuler.appendChild(tick);

    if (y % (spacing * 5) === 0) {
      const label = document.createElement("div");
      // Only dynamic position remains
      label.style.top = y + "px"; 
      label.textContent = Math.round(y / convertToPx(1, currentRulerUnit));
      vRuler.appendChild(label);
    }
  }
}

function toggleRulers() {
  rulersVisible = !rulersVisible;
  drawRulers();
}

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

  switch(type) {
    case 'title':
      element.classList.add('title');
      element.textContent = 'Title';
      break;
    case 'subtitle':
      element.classList.add('subtitle');
      element.textContent = 'Subtitle';
      break;
    case 'paragraph':
      element.classList.add('paragraph');
      element.textContent = 'Add your text here';
      break;
    case 'image':
      element.classList.add('image-placeholder');
      element.textContent = 'Image Placeholder';
      element.contentEditable = false; 
      
      break;
  }
    
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
      break;

    case 'polygon': {
      let sides = parseInt(prompt("Enter number of sides:", "7"));
      if (isNaN(sides) || sides < 3) sides = 7; 
      const points = [];
      const radius = 40; 
      
      for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
        const x = 50 + radius * Math.cos(angle); 
        const y = 50 + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      
      shape = document.createElementNS(svgNS, "polygon");
      shape.setAttribute("points", points.join(" "));
      break;
    }

    case 'star': {
      let peaks = parseInt(prompt("Enter number of peaks:", "7"));
      if (isNaN(peaks) || peaks < 3) peaks = 7; 
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
      break;
    }
  }

  if (shape) {
    element.dataset.fillColor = shape.getAttribute('fill') || '#3b82f6'; 
    element.dataset.fillOpacity = 1.0;
    element.dataset.borderColor = shape.getAttribute('stroke') || '#1e3a8a';
    element.dataset.borderOpacity = 1.0;
    element.dataset.borderWidth = shape.getAttribute('stroke-width') || '4';

    svg.appendChild(shape);
    element.appendChild(svg);
  }

  pageContent.appendChild(element);
  makeElementDraggable(element);
  makeRotatable(element);
  selectElement(element);

  new ResizeObserver(() => {
    updateSelectedShapeStyle(); 
  }).observe(element);
}

function selectElement(element) {
    document.querySelectorAll('.text-element, .shape-element').forEach(el => {
        el.classList.remove('selected');
    });

    selectedElement = element;
    selectedElement.classList.add('selected'); 
  
    document.getElementById('textEditor').classList.remove('toolbar-visible');
    document.getElementById('shapeEditor').classList.remove('toolbar-visible');
    document.getElementById('noElementSelected').classList.remove('toolbar-visible');
    
    const textToolbar = document.getElementById('textToolbar');
    const shapeToolbar = document.getElementById('shapeToolbar');
    textToolbar.classList.remove('toolbar-visible');
    shapeToolbar.classList.remove('toolbar-visible');

    document.getElementById('noElementSelected').style.display = 'none';

    const rect = element.getBoundingClientRect();
    const containerRect = document.body.getBoundingClientRect();
    let toolbar;

    if (element.classList.contains('text-element')) {
        toolbar = textToolbar;
        document.getElementById('textEditor').classList.add('toolbar-visible');

        const fontSizeInput = document.getElementById('fontSizeInput');
        if (fontSizeInput) {
            fontSizeInput.value = parseInt(window.getComputedStyle(selectedElement).fontSize);
        }

    } else if (element.classList.contains('shape-element')) {
        toolbar = shapeToolbar;
        document.getElementById('shapeEditor').classList.add('toolbar-visible');
        
        initShapeEditor();
        loadShapeStateToControls();
    }

    if (toolbar) {
        toolbar.classList.add('toolbar-visible'); 
        
        toolbar.style.left = `${rect.left + rect.width / 2 - toolbar.offsetWidth / 2}px`;
        toolbar.style.top = `${rect.bottom - containerRect.top + 5}px`;
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

  textToolbar.classList.remove('toolbar-visible');
  shapeToolbar.classList.remove('toolbar-visible');

  const rect = targetElement.getBoundingClientRect();
  let toolbar;

  if (targetElement.classList.contains('text-element')) {
    toolbar = textToolbar;
  } else if (targetElement.classList.contains('shape-element')) {
    toolbar = shapeToolbar;
  }

  if (toolbar) {
    toolbar.classList.add('toolbar-visible'); 
    
    toolbar.style.top = window.scrollY + rect.bottom + 'px';
    toolbar.style.left = window.scrollX + rect.left + 'px';
  }
}

function deleteElement() {
  if (selectedElement) {
    selectedElement.remove();
    selectedElement = null;

    document.getElementById('textToolbar').classList.remove('toolbar-visible');
    document.getElementById('shapeToolbar').classList.remove('toolbar-visible');
    
    document.getElementById('textEditor').classList.remove('editor-visible');
    document.getElementById('shapeEditor').classList.remove('editor-visible');

    document.getElementById('noElementSelected').classList.add('editor-visible');
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
  let currentClass = alignments.find(a => selectedElement.classList.contains(`align-${a}`)) || 'left';
  
  let nextIndex = (alignments.indexOf(currentClass) + 1) % alignments.length;
  let nextAlignment = alignments[nextIndex];
  
  alignments.forEach(a => selectedElement.classList.remove(`align-${a}`));
  
  selectedElement.classList.add(`align-${nextAlignment}`);
}

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
    // No need to call showToolbar here if selectElement handles it
  } else if (
    !e.target.closest('#textEditor') &&
    !e.target.closest('#shapeEditor') &&
    !e.target.closest('#textToolbar') &&
    !e.target.closest('#shapeToolbar') &&
    !e.target.closest('.sidebar-btn') &&
    !e.target.closest('.modal')
  ) {
    // Replace inline style with class removal
    document.getElementById('textToolbar').classList.remove('toolbar-visible');
    document.getElementById('shapeToolbar').classList.remove('toolbar-visible');
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
    selectedElement = null;
  }
  
  document.getElementById('textEditor').classList.remove('editor-visible');
  document.getElementById('shapeEditor').classList.remove('editor-visible');
  document.getElementById('textToolbar').classList.remove('toolbar-visible');
  document.getElementById('shapeToolbar').classList.remove('toolbar-visible');
  document.getElementById('noElementSelected').classList.add('editor-visible');
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
    center.classList.add('cursor-grab');
    center.addEventListener("mousedown", startPan);
  });
}

function startPan(e) {
  isPanning = true;
  startX = e.pageX - center.offsetLeft;
  startY = e.pageY - center.offsetTop;
  scrollLeft = center.scrollLeft;
  scrollTop = center.scrollTop;
  //center.style.cursor = "grabbing";
  center.classList.add('cursor-grabbing');
  center.classList.remove('cursor-grab');
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
  //center.style.cursor = "grab";
  center.classList.add('cursor-grab');
  center.classList.remove('cursor-grabbing');
  center.removeEventListener("mousemove", panMove);
  center.removeEventListener("mouseup", endPan);
}

function exportAsImage(format) {
  if (!pages[currentPageIndex]) return;
  
  const page = pages[currentPageIndex];
  
  if (typeof html2canvas === 'undefined') {
    console.error("html2canvas library is not loaded.");
    return;
  }

  html2canvas(page, {
    scale: 2,
    backgroundColor: null
  }).then(canvas => {
    const link = document.createElement('a');
    
    if (format === 'png') {
      link.download = `layout-${currentPageIndex + 1}.png`;
      link.href = canvas.toDataURL('image/png');
    } else if (format === 'jpg') {
      link.download = `layout-${currentPageIndex + 1}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function exportAsPDF() {
  if (!pages[currentPageIndex]) return;
  const page = pages[currentPageIndex];

  if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
    console.error("html2canvas or jspdf library is not loaded.");
    return;
  }
  
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

function showSaveLayoutModal() {
  const modal = document.getElementById('saveLayoutModal');
  if (modal) {
    modal.classList.add('modal-visible');
    document.getElementById('layoutNameInput').focus();
  }
}

function hideModal() {
  const modal = document.getElementById('saveLayoutModal');
  if (modal) {
    modal.classList.remove('modal-visible');
  }
}

function saveLayout() {
  const name = document.getElementById('layoutNameInput').value.trim();
  if (!name) return;
  
  const layoutData = {
    name,
    date: new Date().toISOString(),
    pages: pages.map(page => {
      const elements = Array.from(page.querySelectorAll('.text-element, .shape-element')).map(el => {
        let elementData = {
          type: el.classList.contains('text-element') ? 'text' : 'shape',
          style: {
            top: el.style.top,
            left: el.style.left,
            width: el.style.width,
            height: el.style.height,
            transform: el.style.transform // Save rotation
          }
        };

        if (el.classList.contains('text-element')) {
          elementData.content = el.innerText;
          elementData.style = {
            ...elementData.style,
            fontSize: el.style.fontSize,
            fontWeight: el.style.fontWeight,
            fontFamily: el.style.fontFamily,
            color: el.style.color,
            backgroundColor: el.style.backgroundColor
          };
        } else if (el.classList.contains('shape-element')) {
          elementData.shapeType = el.querySelector('svg > *').tagName;
          elementData.shapeData = {
              fillColor: el.dataset.fillColor,
              fillOpacity: el.dataset.fillOpacity,
              borderColor: el.dataset.borderColor,
              borderOpacity: el.dataset.borderOpacity,
              borderWidth: el.dataset.borderWidth,
              points: el.querySelector('svg polygon') ? el.querySelector('svg polygon').getAttribute('points') : null
          };
        }

        return elementData;
      });
      
      return {
        width: page.style.width,
        height: page.style.height,
        elements
      };
    })
  };
  
  savedLayouts.push(layoutData);
  
  localStorage.setItem('paperSizeSelectorLayouts', JSON.stringify(savedLayouts));
  
  updateSavedLayoutsList();
  hideModal();
}

function loadLayout(layoutIndex) {
  const layout = savedLayouts[layoutIndex];
  if (!layout) return;
  
  pages = [];
  
  layout.pages.forEach(pageData => {
    const newPage = createPage(pages.length + 1);
    newPage.style.width = pageData.width;
    newPage.style.height = pageData.height;
    
    const pageContent = newPage.querySelector('.page-content');
    
    // Add elements
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
      } else {
        return; // Skip unknown element type
      }

      // Apply common styles
      Object.entries(elData.style).forEach(([prop, value]) => {
        if (value) element.style[prop] = value;
      });
      
      pageContent.appendChild(element);
      makeElementDraggable(element);
      makeRotatable(element);
      
      // Re-add click listener for selection
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(element);
      });
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

let shapeEditorListenersInitialized = false;

function hexToRgbA(hex, alpha) {
    let r = 0, g = 0, b = 0;
    // 3 or 6 digit hex parsing
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

    const svgShape = element.querySelector('svg > *');
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

// Save layout handlers
const saveLayoutBtn = document.getElementById('saveLayoutBtn');
const cancelSaveBtn = document.getElementById('cancelSaveBtn');
const confirmSaveBtn = document.getElementById('confirmSaveBtn');
const importLayoutBtn = document.getElementById('importLayoutBtn');

if (saveLayoutBtn) saveLayoutBtn.addEventListener('click', showSaveLayoutModal);
if (cancelSaveBtn) cancelSaveBtn.addEventListener('click', hideModal);
if (confirmSaveBtn) confirmSaveBtn.addEventListener('click', saveLayout);

if (importLayoutBtn) importLayoutBtn.addEventListener('click', () => {
  console.log('File import would be implemented here with a file picker dialog');
});

document.addEventListener('DOMContentLoaded', () => {
    if (pages.length === 0) {
      addPage();
    }
    loadSavedLayouts();
    
    if (typeof html2canvas === 'undefined') {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      document.head.appendChild(html2canvasScript);
    }
});
