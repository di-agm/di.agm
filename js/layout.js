(function(){
  // --- Units helpers ---
  const DPI = 96;
  const unitToPx = (val, unit) => {
    switch(unit){
      case 'in': return val * DPI;
      case 'cm': return val * DPI / 2.54;
      case 'mm': return val * DPI / 25.4;
      default: return val;
    }
  };
  const pxToUnit = (px, unit) => {
    switch(unit){
      case 'in': return px / DPI;
      case 'cm': return px * 2.54 / DPI;
      case 'mm': return px * 25.4 / DPI;
      default: return px;
    }
  };

  // --- State ---
  const state = {
    units: 'cm',
    pageSize: { w: 21, h: 29.7 }, // A4 default in cm
    margins: { top: 1, right: 1, bottom: 1, left: 1 },
    showRulers: true,
    snap: true,
    pages: [], // array of {id, kind:'normal'|'cover'|'back', elements:[]}
    currentIndex: 0,
    pagesShown: 2,
    customSizes: JSON.parse(localStorage.getItem('customSizes')||'[]'),
    fonts: [{ name:'System', css:'system-ui', loaded:true }],
  };

  const el = sel => document.querySelector(sel);
  const els = sel => Array.from(document.querySelectorAll(sel));

  // --- UI refs ---
  const drawer = el('#drawer');
  el('#hamburger').onclick = () => drawer.classList.toggle('open');

  const pagesView = el('#pagesView');
  const thumbs = el('#thumbs');
  const rulersX = el('#rulersX');

  // Presets
  const PRESETS = {
    'A4 (210×297 mm)': { unit:'mm', w:210, h:297 },
    'Letter (8.5×11 in)': { unit:'in', w:8.5, h:11 },
    'Legal (8.5×14 in)': { unit:'in', w:8.5, h:14 },
    'A5 (148×210 mm)': { unit:'mm', w:148, h:210 },
    'Tabloid (11×17 in)': { unit:'in', w:11, h:17 },
  };
  const presetSel = el('#presetSize');
  function refreshPresets(){
    presetSel.innerHTML = '';
    Object.entries(PRESETS).forEach(([name, sz])=>{
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name; presetSel.appendChild(opt);
    });
    state.customSizes.forEach(cs=>{
      const opt = document.createElement('option');
      opt.value = 'custom:'+cs.name; opt.textContent = `★ ${cs.name}`; presetSel.appendChild(opt);
    });
  }
  refreshPresets();

  // Initial pages
  function newPage(kind='normal'){
    return { id: crypto.randomUUID(), kind, elements: [] };
  }
  state.pages.push(newPage('cover'));
  state.pages.push(newPage('normal'));
  state.pages.push(newPage('back'));

  // --- Rendering ---
  function render(){
    // status
    el('#status').textContent = `Units: ${state.units} | Size: ${state.pageSize.w}×${state.pageSize.h} ${state.units} | Page ${state.currentIndex+1}/${state.pages.length}`;

    // Rulers
    rulersX.innerHTML = '';
    if(state.showRulers){
      const totalWpx = unitToPx(state.pageSize.w, state.units) * Math.min(state.pagesShown, pagesToShowCount());
      const topRuler = document.createElement('div'); topRuler.className='ruler'; topRuler.style.position='sticky'; topRuler.style.top='0'; topRuler.style.height='24px'; topRuler.style.width = (totalWpx+48)+'px';
      rulersX.appendChild(topRuler);
      // ticks every 1 unit
      const stepPx = unitToPx(1, state.units);
      for(let x=0; x<=totalWpx; x+=stepPx){
        const t = document.createElement('div'); t.className='tick'; t.style.left=(x+48)+'px'; t.style.height = (x% (stepPx*5) === 0)? '14px':'8px'; t.style.top = (x% (stepPx*5) === 0)? '0px':'6px'; topRuler.appendChild(t);
        if(x% (stepPx*5) === 0){
          const l = document.createElement('div'); l.className='tick label'; l.style.left=(x+52)+'px'; l.style.top='6px'; l.textContent = Math.round(pxToUnit(x, state.units)); topRuler.appendChild(l);
        }
      }
    }

    // Pages
    pagesView.innerHTML = '';
    const toShow = getVisiblePageIndices();
    toShow.forEach(idx=>{
      const page = state.pages[idx];
      const wpx = unitToPx(state.pageSize.w, state.units);
      const hpx = unitToPx(state.pageSize.h, state.units);
      const pageEl = document.createElement('div');
      pageEl.className = 'page';
      pageEl.dataset.pageId = page.id;
      pageEl.style.width = wpx+'px'; pageEl.style.height = hpx+'px';
      // Margin guides
      const mg = state.margins; 
      const mgEl = document.createElement('div'); mgEl.className='margin-guide';
      mgEl.style.left = unitToPx(mg.left, state.units)+'px';
      mgEl.style.top = unitToPx(mg.top, state.units)+'px';
      mgEl.style.right = unitToPx(mg.right, state.units)+'px';
      mgEl.style.bottom = unitToPx(mg.bottom, state.units)+'px';
      mgEl.style.borderColor = 'var(--guide)';
      pageEl.appendChild(mgEl);
      // Vertical ruler
      if(state.showRulers){
        const vr = document.createElement('div'); vr.className='ruler vertical'; pageEl.appendChild(vr);
        const stepPx = unitToPx(1, state.units);
        for(let y=0; y<=hpx; y+=stepPx){
          const t = document.createElement('div'); t.className='tick'; t.style.left='22px'; t.style.top=y+'px'; t.style.height = '1px'; t.style.width = (y%(stepPx*5)===0)?'12px':'6px'; vr.appendChild(t);
          if(y%(stepPx*5)===0){
            const l=document.createElement('div'); l.className='tick label'; l.style.left='2px'; l.style.top=(y+2)+'px'; l.textContent = Math.round(pxToUnit(y, state.units)); vr.appendChild(l);
          }
        }
      }
      // Elements
      page.elements.forEach(addElementDom.bind(null, pageEl));
      pageEl.addEventListener('pointerdown', (e)=>{ if(e.target===pageEl) deselect(); });
      pagesView.appendChild(pageEl);
    });

    // thumbs
    thumbs.innerHTML='';
    state.pages.forEach((p,i)=>{
      const th = document.createElement('div'); th.className='thumb'; th.textContent = i+1; th.onclick=()=>{ state.currentIndex = i; render(); refreshLayers(); };
      const b = document.createElement('div'); b.className='badge'; b.textContent = p.kind; th.appendChild(b);
      thumbs.appendChild(th);
    })

    refreshLayers();
  }

  function pagesToShowCount(){
    // cover and back must be alone
    const p = state.pages[state.currentIndex];
    if(!p) return 1;
    if(p.kind==='cover' || p.kind==='back') return 1;
    return parseInt(state.pagesShown,10)||1;
  }
  function getVisiblePageIndices(){
    const n = pagesToShowCount();
    const res=[state.currentIndex];
    // try to include next pages if available
    for(let k=1;k<n;k++){
      const idx = state.currentIndex + k;
      if(idx < state.pages.length-1){
        // don't include back in a spread
        if(state.pages[idx].kind==='back') break;
        res.push(idx);
      }
    }
    return res;
  }

  // --- Elements ---
  let selected = null; // {pageId, elId}

  function addElementDom(pageEl, elModel){
    const elDiv = document.createElement('div');
    elDiv.className = 'el'; elDiv.dataset.elId = elModel.id; elDiv.style.left = elModel.x+'px'; elDiv.style.top = elModel.y+'px'; elDiv.style.width = elModel.w+'px'; elDiv.style.height = elModel.h+'px';

    // content
    if(elModel.type==='text'){
      const c = document.createElement('div'); c.className='content';
      c.contentEditable = true; c.spellcheck = false; c.innerHTML = elModel.html || '';
      c.style.fontFamily = elModel.font || 'system-ui';
      c.style.fontSize = (elModel.textKind==='title'? '32px': elModel.textKind==='subtitle'?'22px':'14px');
      c.style.width='100%'; c.style.height='100%'; c.style.padding='6px';
      elDiv.appendChild(c);
    } else if(elModel.type==='image'){
      const ph = document.createElement('div'); ph.className='img-placeholder'; ph.style.width='100%'; ph.style.height='100%'; ph.style.display='grid'; ph.style.placeItems='center'; ph.textContent='Image';
      if(elModel.src){ ph.style.backgroundImage = `url(${elModel.src})`; ph.style.backgroundSize='cover'; ph.textContent=''; }
      elDiv.appendChild(ph);
    } else if(elModel.type==='shape'){
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      const p = shapePath(elModel);
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', p);
      path.setAttribute('stroke', elModel.stroke||'none');
      path.setAttribute('stroke-width', elModel.strokeW||0);
      // gradient support
      const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
      const gradId = 'g'+elModel.id;
      const lg = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
      lg.setAttribute('id', gradId);
      const ang = (elModel.gradAngle||0) * Math.PI/180;
      const x1 = 50 + Math.cos(ang+Math.PI)*50, y1 = 50 + Math.sin(ang+Math.PI)*50, x2 = 50 + Math.cos(ang)*50, y2 = 50 + Math.sin(ang)*50;
      lg.setAttribute('x1', x1+'%'); lg.setAttribute('y1', y1+'%'); lg.setAttribute('x2', x2+'%'); lg.setAttribute('y2', y2+'%');
      const s1 = document.createElementNS('http://www.w3.org/2000/svg','stop'); s1.setAttribute('offset','0%'); s1.setAttribute('stop-color', elModel.fill1||'#ffffff');
      const s2 = document.createElementNS('http://www.w3.org/2000/svg','stop'); s2.setAttribute('offset','100%'); s2.setAttribute('stop-color', elModel.fill2||elModel.fill1||'#ffffff');
      lg.appendChild(s1); lg.appendChild(s2); defs.appendChild(lg); svg.appendChild(defs);
      path.setAttribute('fill', `url(#${gradId})`);
      g.appendChild(path); svg.appendChild(g); elDiv.appendChild(svg);

      if(elModel.use==='textbox'){
        const t = document.createElement('div'); t.className='content'; t.contentEditable=true; t.style.position='absolute'; t.style.inset='0'; t.style.padding='6px'; t.style.fontFamily = elModel.font || 'system-ui';
        elDiv.appendChild(t);
      }
      if(elModel.use==='image'){
        const ph = document.createElement('div'); ph.className='img-placeholder'; ph.style.position='absolute'; ph.style.inset='0'; elDiv.appendChild(ph);
      }
    }

    // Selection and controls
    elDiv.addEventListener('pointerdown', (ev)=>{ ev.stopPropagation(); selectEl(pageEl, elDiv); });

    // Controls toolbar (hidden until selected)
    const ctr = document.createElement('div'); ctr.className='controls'; ctr.style.display='none';
    ctr.innerHTML = `
      <div class="cbtn" data-act="move" title="Move">⤢</div>
      <div class="cbtn" data-act="scale" title="Scale">⤡</div>
      <div class="cbtn" data-act="edit" title="Edit">✎</div>
      <div class="cbtn" data-act="delete" title="Delete">🗑️</div>
    `;
    elDiv.appendChild(ctr);

    // Resize handle (bottom-right)
    const h = document.createElement('div'); h.className='handle br'; elDiv.appendChild(h);

    // Drag/Resize logic
    makeDraggable(elDiv, h);

    pageEl.appendChild(elDiv);
  }

  function shapePath(m){
    // path in 0..w,0..h box using percentages in SVG viewbox. We'll map using element size automatically.
    // We'll build for a 100×100 box.
    const w=100, h=100, r=Math.min(w,h)/2;
    if(m.shape==='rect' || m.shape==='square') return `M0 0 H${w} V${h} H0 Z`;
    if(m.shape==='ellipse' || m.shape==='circle'){
      return `M ${w/2} 0 A ${w/2} ${h/2} 0 1 1 ${w/2-0.01} 0 Z`;
    }
    if(m.shape==='polygon'){
      const n = Math.max(3, m.sides|0||5); const cx=w/2, cy=h/2, rad = r;
      const pts = [];
      for(let i=0;i<n;i++){
        const a = -Math.PI/2 + i*2*Math.PI/n;
        pts.push([cx+rad*Math.cos(a), cy+rad*Math.sin(a)]);
      }
      return 'M '+pts.map(p=>p.join(' ')).join(' L ')+' Z';
    }
    if(m.shape==='star'){
      const n = Math.max(3, m.peaks|0||5), inner = (m.inner||50)/100; const cx=w/2, cy=h/2; const R=r, r2=r*inner;
      const pts=[]; for(let i=0;i<n;i++){
        const a = -Math.PI/2 + i*2*Math.PI/n;
        const a2 = a + Math.PI/n;
        pts.push([cx+R*Math.cos(a), cy+R*Math.sin(a)]);
        pts.push([cx+r2*Math.cos(a2), cy+r2*Math.sin(a2)]);
      }
      return 'M '+pts.map(p=>p.join(' ')).join(' L ')+' Z';
    }
    return `M0 0 H${w} V${h} H0 Z`;
  }

  function makeDraggable(elDiv, handle){
    let mode = null; // 'move' or 'scale'
    const ctr = elDiv.querySelector('.controls');

    const onMoveStart = (e)=>{ mode='move'; startDrag(e); };
    const onScaleStart = (e)=>{ mode='scale'; startDrag(e, true); };

    ctr.addEventListener('click', (e)=>{
      const act = e.target.dataset.act; if(!act) return;
      if(act==='move'){ mode='move'; }
      if(act==='scale'){ mode='scale'; elDiv.classList.add('scaling'); }
      if(act==='edit') editElement(elDiv);
      if(act==='delete'){ deleteElement(elDiv); }
    });

    handle.addEventListener('pointerdown', (e)=>{ mode='scale'; startDrag(e, true); });

    let startX, startY, startL, startT, startW, startH;
    function startDrag(e, isScale){
      e.preventDefault(); elDiv.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      const r = elDiv.getBoundingClientRect();
      startL = parseFloat(elDiv.style.left)||0; startT = parseFloat(elDiv.style.top)||0;
      startW = r.width; startH = r.height;
      elDiv.addEventListener('pointermove', onDrag);
      elDiv.addEventListener('pointerup', endDrag);
    }
    function onDrag(e){
      const dx = e.clientX-startX, dy = e.clientY-startY;
      if(mode==='move'){
        elDiv.style.left = (startL+dx)+'px';
        elDiv.style.top = (startT+dy)+'px';
      } else if(mode==='scale'){
        elDiv.style.width = Math.max(20, startW+dx)+'px';
        elDiv.style.height = Math.max(20, startH+dy)+'px';
      }
      updateModelFromDom(elDiv);
    }
    function endDrag(e){
      elDiv.releasePointerCapture(e.pointerId);
      elDiv.removeEventListener('pointermove', onDrag);
      elDiv.removeEventListener('pointerup', endDrag);
      elDiv.classList.remove('scaling');
    }
  }

  function selectEl(pageEl, elDiv){
    deselect();
    elDiv.classList.add('selected');
    const ctr = elDiv.querySelector('.controls'); ctr.style.display='flex';
    selected = { pageId: pageEl.dataset.pageId, elId: elDiv.dataset.elId };
    refreshLayers();
  }
  function deselect(){
    els('.el').forEach(x=>{ x.classList.remove('selected'); const c=x.querySelector('.controls'); if(c) c.style.display='none'; });
    selected = null; refreshLayers();
  }

  function updateModelFromDom(elDiv){
    const page = state.pages.find(p=>p.id===selected?.pageId);
    if(!page) return; const m = page.elements.find(e=>e.id===selected.elId); if(!m) return;
    m.x = parseFloat(elDiv.style.left)||0; m.y = parseFloat(elDiv.style.top)||0; m.w = parseFloat(elDiv.style.width)||m.w; m.h = parseFloat(elDiv.style.height)||m.h;
  }

  function deleteElement(elDiv){
    const page = state.pages.find(p=>p.id===selected?.pageId);
    if(!page) return; page.elements = page.elements.filter(e=> e.id!==selected.elId);
    render();
  }

  // --- Insert helpers ---
  function addText(kind){
    const pageEl = pagesView.querySelector('.page'); if(!pageEl) return;
    const page = state.pages.find(p=>p.id===pageEl.dataset.pageId);
    const m = { id: crypto.randomUUID(), type:'text', textKind: kind, x: 50, y: 50, w: 240, h: kind==='paragraph'?140:(kind==='subtitle'?80:60), html: kind==='title'? 'Title':'Subtitle', font: currentFontCSS() };
    page.elements.push(m); render();
  }
  function addImagePh(){
    const pageEl = pagesView.querySelector('.page'); if(!pageEl) return;
    const page = state.pages.find(p=>p.id===pageEl.dataset.pageId);
    const m = { id: crypto.randomUUID(), type:'image', x: 80, y: 80, w: 200, h: 140 };
    page.elements.push(m); render();
  }
  function addShape(){
    const pageEl = pagesView.querySelector('.page'); if(!pageEl) return;
    const page = state.pages.find(p=>p.id===pageEl.dataset.pageId);
    const st = el('#shapeType').value; const use = el('#shapeUse').value;
    const m = { id: crypto.randomUUID(), type:'shape', shape: st, use, x: 60, y: 60, w: 200, h: 200, sides: parseInt(el('#polySides').value,10)||5, peaks: parseInt(el('#starPeaks').value,10)||5, inner: parseInt(el('#starInner').value,10)||50, fill1:'#ffffff', fill2:'#ffffff', gradAngle:0, stroke:'#000000', strokeW:0, font: currentFontCSS() };
    page.elements.push(m); render();
  }

  // Edit element
  function editElement(elDiv){
    const page = state.pages.find(p=>p.id===selected?.pageId); if(!page) return;
    const m = page.elements.find(e=>e.id===selected.elId); if(!m) return;
    if(m.type==='text' || (m.type==='shape' && m.use==='textbox')){
      const dlg = el('#textEditDlg'); const ta = el('#textEditArea');
      ta.value = m.html || ''; dlg.showModal();
      el('#textEditOk').onclick = ()=>{ m.html = ta.value; dlg.close(); render(); };
    } else if(m.type==='image' || (m.type==='shape' && m.use==='image')){
      const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.onchange = ()=>{
        const f = inp.files[0]; const reader=new FileReader(); reader.onload = ()=>{ m.src = reader.result; render(); }; reader.readAsDataURL(f);
      }; inp.click();
    } else if(m.type==='shape' && m.use==='element'){
      // style handled in side panel
      alert('Use "Element Properties" to set gradient/stroke.');
    }
  }

  // Apply style to selected shape/text/image placeholder if supported
  el('#applyStyle').onclick = ()=>{
    if(!selected) return; const page = state.pages.find(p=>p.id===selected.pageId); const m = page?.elements.find(e=>e.id===selected.elId); if(!m) return;
    const f1 = el('#fillColor1').value, f2 = el('#fillColor2').value, ang = parseFloat(el('#gradAngle').value)||0;
    const sc = el('#strokeColor').value, sw = parseFloat(el('#strokeW').value)||0;
    if(m.type==='shape'){
      m.fill1=f1; m.fill2=f2; m.gradAngle=ang; m.stroke=sc; m.strokeW=sw;
    }
    if(m.type==='text' || (m.type==='shape' && m.use==='textbox')){
      m.font = currentFontCSS();
    }
    render();
  };

  // Layers list
  function refreshLayers(){
    const list = el('#layers'); list.innerHTML='';
    const page = state.pages[state.currentIndex]; if(!page) return;
    page.elements.forEach((it, idx)=>{
      const li = document.createElement('div'); li.className='layer-item';
      li.innerHTML = `<span class="name">${idx+1}. ${it.type}${it.type==='text'? ' ('+it.textKind+')':''}</span>`;
      const goto = document.createElement('button'); goto.className='btn'; goto.textContent='Select';
      goto.onclick=()=>{ // select element on DOM
        const pageEl = pagesView.querySelector(`.page[data-page-id="${page.id}"]`);
        const elDiv = pageEl?.querySelector(`.el[data-el-id="${it.id}"]`);
        if(elDiv) selectEl(pageEl, elDiv);
      };
      li.appendChild(goto); list.appendChild(li);
    });
  }
  el('#layerUp').onclick = ()=>{ if(!selected) return; const p = state.pages.find(x=>x.id===selected.pageId); const i = p.elements.findIndex(e=>e.id===selected.elId); if(i<0) return; if(i<p.elements.length-1){ const [it]=p.elements.splice(i,1); p.elements.splice(i+1,0,it); render(); } };
  el('#layerDown').onclick = ()=>{ if(!selected) return; const p = state.pages.find(x=>x.id===selected.pageId); const i = p.elements.findIndex(e=>e.id===selected.elId); if(i>0){ const [it]=p.elements.splice(i,1); p.elements.splice(i-1,0,it); render(); } };

  // Units & size controls
  el('#units').onchange = (e)=>{ state.units = e.target.value; syncSizeInputs(); render(); };
  function syncSizeInputs(){ el('#pageW').value = state.pageSize.w; el('#pageH').value = state.pageSize.h; el('#mTop').value=state.margins.top; el('#mRight').value=state.margins.right; el('#mBottom').value=state.margins.bottom; el('#mLeft').value=state.margins.left; }
  syncSizeInputs();

  presetSel.onchange = ()=>{
    const v = presetSel.value; if(v.startsWith('custom:')){
      const name = v.slice(7); const cs = state.customSizes.find(x=>x.name===name); if(cs){ state.units = cs.unit; el('#units').value = cs.unit; state.pageSize = { w: cs.w, h: cs.h }; syncSizeInputs(); render(); }
    } else {
      const pr = PRESETS[v]; if(pr){ state.units = pr.unit; el('#units').value = pr.unit; state.pageSize = { w: pr.w, h: pr.h }; syncSizeInputs(); render(); }
    }
  };
  el('#applySize').onclick = ()=>{ const w = parseFloat(el('#pageW').value), h = parseFloat(el('#pageH').value); if(w>0&&h>0){ state.pageSize={w,h}; render(); } };
  el('#saveCustomSize').onclick = ()=>{
    const name = el('#customName').value.trim(); if(!name) return alert('Name required');
    const cs = { name, unit: state.units, w: state.pageSize.w, h: state.pageSize.h };
    state.customSizes.push(cs); localStorage.setItem('customSizes', JSON.stringify(state.customSizes)); refreshPresets(); alert('Saved!');
  };

  el('#toggleRulers').onclick = ()=>{ state.showRulers = !state.showRulers; render(); };
  el('#applyMargins').onclick = ()=>{ state.margins = { top: +el('#mTop').value, right: +el('#mRight').value, bottom: +el('#mBottom').value, left: +el('#mLeft').value }; render(); };
  el('#toggleSnap').onclick = ()=>{ state.snap = !state.snap; el('#toggleSnap').style.background = state.snap? '#142a25': '#12152a'; };

  // Pages controls
  el('#addPage').onclick = ()=>{ state.pages.splice(state.pages.length-1, 0, newPage('normal')); state.currentIndex = Math.max(1, state.currentIndex); render(); };
  el('#addCover').onclick = ()=>{ if(state.pages[0].kind!=='cover') state.pages.unshift(newPage('cover')); render(); };
  el('#addBack').onclick = ()=>{ if(state.pages[state.pages.length-1].kind!=='back') state.pages.push(newPage('back')); render(); };
  el('#prevPage').onclick = ()=>{ state.currentIndex = Math.max(0, state.currentIndex-1); render(); };
  el('#nextPage').onclick = ()=>{ state.currentIndex = Math.min(state.pages.length-1, state.currentIndex+1); render(); };
  el('#pagesShown').onchange = (e)=>{ state.pagesShown = parseInt(e.target.value,10); render(); };

  // Insert buttons
  el('#addTitle').onclick = ()=> addText('title');
  el('#addSubtitle').onclick = ()=> addText('subtitle');
  el('#addParagraph').onclick = ()=> addText('paragraph');
  el('#addImage').onclick = ()=> addImagePh();
  el('#addShape').onclick = ()=> addShape();
  el('#shapeType').onchange = ()=>{
    const v = el('#shapeType').value; el('#polyInputs').style.display = v==='polygon'? 'flex':'none'; el('#starInputs').style.display = v==='star'? 'flex':'none';
  };

  // Font import
  const fontSelect = el('#fontSelect');
  function currentFontCSS(){ return fontSelect.value || 'system-ui'; }
  function addFontToList(name, css){ const opt = document.createElement('option'); opt.value = css; opt.textContent = name; fontSelect.appendChild(opt); }
  el('#fontFile').onchange = async (e)=>{
    const f = e.target.files[0]; if(!f) return; const blobUrl = URL.createObjectURL(f);
    const family = f.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '').replace(/[^a-z0-9\- ]/gi,' ');
    const css = `font-${Date.now()}`;
    const style = document.createElement('style');
    style.textContent = `@font-face{ font-family:"${css}"; src: url('${blobUrl}'); font-display: swap; }`;
    document.head.appendChild(style);
    addFontToList(family, css);
    fontSelect.value = css;
    alert('Font imported and ready! Select it in the Element Properties.');
  };

  // Element property bindings (font is applied when pressing Apply Style)

  // Export / Import
  el('#exportBtn').onclick = ()=>{
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='template.json'; a.click();
    URL.revokeObjectURL(url);
  };
  el('#importFile').onchange = (e)=>{
    const f = e.target.files[0]; if(!f) return; const reader = new FileReader();
    reader.onload = ()=>{ try { const s = JSON.parse(reader.result);
      // basic sanity; keep current fonts & customSizes
      const keepFonts = state.fonts; const keepSizes = state.customSizes;
      Object.assign(state, s);
      state.fonts = keepFonts; state.customSizes = keepSizes; refreshPresets(); render();
    } catch(err){ alert('Invalid template JSON'); } };
    reader.readAsText(f);
  };

  // Keyboard shortcuts: Esc to deselect, Delete to remove
  window.addEventListener('keydown', (e)=>{
    if(e.key==='Escape') deselect();
    if(e.key==='Delete' && selected){ const page = state.pages.find(p=>p.id===selected.pageId); page.elements = page.elements.filter(x=>x.id!==selected.elId); render(); }
  });

  // Initial render
  render();
})();
