    let pages = [];
    let currentPageIndex = 0;
    let isPortrait = true;
    let selectedElement = null;
    let savedLayouts = [];

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

    function addCustomPaperSize(name, width, height, unit = 'px') {
      paperSizes[name.toLowerCase()] = unit === 'mm'
        ? { widthMM: width, heightMM: height }
        : unit === 'in'
          ? { widthIN: width, heightIN: height }
          : { widthPX: width, heightPX: height };
    }
    
    // Example usage:
    addCustomPaperSize('MyPoster', 500, 700, 'px');
    console.log(paperSizes);

    function mmToPx(mm) { return mm * 3.78; }
    function inToPx(inches) { return inches * 96; }

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

    const pageSizeSelector = document.getElementById('pageSizeSelector');
    const customSizeInputs = document.getElementById('customSizeInputs');
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    const applyCustomSizeBtn = document.getElementById('applyCustomSize');
    
    pageSizeSelector.addEventListener('change', () => {
      if (pageSizeSelector.value === 'Custom') {
        customSizeInputs.style.display = 'block';
      } else {
        customSizeInputs.style.display = 'none';
        applyPageSize(pageSizeSelector.value); // existing function for standard sizes
      }
    });
    
    applyCustomSizeBtn.addEventListener('click', () => {
      const width = parseInt(customWidth.value, 10);
      const height = parseInt(customHeight.value, 10);
      if (!width || !height) return;
    
      const page = pages[currentPageIndex];
      page.style.width = width + 'px';
      page.style.height = height + 'px';
    });

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
      const clonedElements = clone.querySelectorAll('.text-element');
      clonedElements.forEach(element => {
        makeElementDraggable(element);
      });
      pages.splice(index + 1, 0, clone);
      showPage(index + 1);
      updatePageNumbers();
    }
    
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
      selectElement(element);
    }
    
    function selectElement(element) {
      if (selectedElement) {
        selectedElement.classList.remove('selected');
      }
      selectedElement = element;
      document.querySelectorAll('.text-element').forEach(el => el.classList.remove('selected'));
      selectedElement.classList.add('selected');
      const toolbar = document.getElementById('elementToolbar');
      const rect = element.getBoundingClientRect();
      const containerRect = document.body.getBoundingClientRect();
      toolbar.style.left = `${rect.left + rect.width/2 - toolbar.offsetWidth/2}px`;
      toolbar.style.top = `${rect.bottom - containerRect.top + 5}px`;
      toolbar.style.display = 'flex';
      document.getElementById('elementEditor').style.display = 'block';
      document.getElementById('noElementSelected').style.display = 'none';
      const fontSizeInput = document.getElementById('fontSizeInput');
      if (fontSizeInput) fontSizeInput.value = parseInt(window.getComputedStyle(selectedElement).fontSize);
      const fontFamilySelect = document.getElementById('fontFamilySelect');
      if (fontFamilySelect) fontFamilySelect.value = selectedElement.style.fontFamily || '';
      const colorInput = document.getElementById('colorPickerInput');
      if (colorInput) colorInput.value = selectedElement.style.color || '#000000';}

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

    function deselectElement() {
      if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
        document.getElementById('elementEditor').style.display = 'none';
        document.getElementById('noElementSelected').style.display = 'block';
      }
      document.getElementById('elementToolbar').style.display = 'none';
    }

    document.querySelectorAll('#elementToolbar .toolbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!selectedElement) return;
        const action = btn.dataset.action;
        if (action === 'delete') {
          selectedElement.remove();
          deselectElement();
        }
        if (action === 'edit') {
          // Toggle edit mode
          const isEditing = selectedElement.contentEditable === "true";
          selectedElement.contentEditable = !isEditing;
          if (!isEditing) {
            // Enable editing
            selectedElement.focus();
          } else {
            // Disable editing (back to drag mode)
            selectedElement.blur();
          }
        }
     });
    });

document.addEventListener('click', (e) => {
  const toolbar = document.getElementById('elementToolbar');
  if (!toolbar) {
    console.error('Toolbar element not found');
    return;
  }

  if (e.target.closest('.text-element')) {
    // Show the toolbar when a text-element is clicked
    toolbar.style.display = 'flex'; // use flex if it contains multiple icons
    // Position the toolbar under the clicked element
    const rect = e.target.getBoundingClientRect();
    toolbar.style.position = 'absolute';
    toolbar.style.top = window.scrollY + rect.bottom + 'px';
    toolbar.style.left = window.scrollX + rect.left + 'px';
  } 
  else if (!e.target.closest('#elementEditor') &&
           !e.target.closest('#elementToolbar') &&
           !e.target.closest('.sidebar-btn')) {
    // Hide the toolbar when clicking outside
    toolbar.style.display = 'none';
    if (typeof deselectElement === 'function') {
      deselectElement();
    }
  }
});

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
      // This is a placeholder for PDF export functionality
      // In a real implementation, you would use a library like jsPDF
      alert('PDF export requires additional libraries. This is a placeholder.');
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
    
    // Handle click outside elements to deselect
    document.addEventListener('click', (e) => {
      const clickedElement = e.target.closest('.text-element');
      const toolbar = document.getElementById('elementToolbar');
    
      if (clickedElement) {
        // If the same element is already selected → keep selected
        if (selectedElement === clickedElement) {
          return;
        }
        // Use the main selectElement function
        selectElement(clickedElement);
      } else if (
        !e.target.closest('#elementEditor') &&
        !e.target.closest('#elementToolbar') &&
        !e.target.closest('.sidebar-btn')
      ) {
        // Clicked outside → deselect
        deselectElement();
      }
    });

    document.getElementById('btnDelete').addEventListener('click', () => {
      if (selectedElement) {
        selectedElement.remove();
        document.getElementById('elementToolbar').style.display = 'none';
      }
    });

    document.getElementById('btnEdit').addEventListener('click', () => {
      if (!selectedElement) return;
      // Toggle edit mode
      const isEditing = selectedElement.contentEditable === "true";
      selectedElement.contentEditable = !isEditing;
      if (!isEditing) {
        selectedElement.focus(); // go into edit mode
      } else {
        selectedElement.blur();  // exit edit mode
      }
    });

    document.getElementById('btnScale').addEventListener('click', () => {
      if (!selectedElement) return;
      const isResizable = selectedElement.style.resize === 'both';
      if (isResizable) {
        // Disable scaling
        selectedElement.style.resize = 'none';
        selectedElement.style.overflow = 'hidden';
      } else {
        // Enable scaling
        selectedElement.style.resize = 'both';
        selectedElement.style.overflow = 'auto';
      }
    });

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
   
    const deleteBtn = document.getElementById('deleteElementBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (selectedElement && selectedElement.parentNode) {
          selectedElement.parentNode.removeChild(selectedElement);
          deselectElement();
        }
      });
    }

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
        if (!isNaN(size) && size >= 1 && size <= 100) {
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
