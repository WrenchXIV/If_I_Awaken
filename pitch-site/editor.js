/* ================================================================
   PITCH SITE · EDITOR
   Activated via ?edit=1, hash #edit, or Shift+E.
   Capabilities:
     - Drag-to-reorder blocks (within their sortable parent)
     - Inline text editing with floating font/color/align toolbar
     - Click-to-annotate (pinned notes on any element)
     - Mobile / tablet / desktop preview
     - Undo / redo (Cmd+Z / Cmd+Shift+Z)
     - Export as HTML or JSON patch
   State is persisted in localStorage; restored on edit-mode load.
   ================================================================ */

(function () {
  const STORE_KEY = 'iia-editor-v1';

  // ----- ACTIVATION -------------------------------------------------
  const params = new URLSearchParams(location.search);
  const initialEdit =
    params.get('edit') === '1' ||
    location.hash === '#edit' ||
    sessionStorage.getItem('iia-edit-on') === '1';

  let state = loadState();
  let undoStack = [];
  let redoStack = [];
  let currentTool = 'move';  // move | text | annotate
  let selectedBlock = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { blocks: {}, order: {}, notes: [], styles: {}, device: 'desktop' };
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ----- BUILD TOOLBAR ---------------------------------------------

  function buildToolbar() {
    const bar = document.createElement('div');
    bar.id = 'ed-toolbar';
    bar.className = 'ed-only flex';
    bar.innerHTML = `
      <span class="ed-tag">EDIT</span>
      <div class="ed-group">
        <button class="ed-btn" data-tool="move" title="Move blocks (V)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 1v10M1 6h10M3 3l6 6M9 3l-6 6"/></svg>
          <span class="label">MOVE</span>
        </button>
        <button class="ed-btn" data-tool="text" title="Edit text (T)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3V2h8v1M6 2v8M4 10h4"/></svg>
          <span class="label">TEXT</span>
        </button>
        <button class="ed-btn" data-tool="annotate" title="Annotate (N)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6" cy="6" r="4.5"/><circle cx="6" cy="6" r="1"/></svg>
          <span class="label">NOTE</span>
        </button>
      </div>
      <span class="ed-sep"></span>
      <div class="ed-group" id="ed-devices">
        <button class="ed-btn" data-device="desktop" title="Desktop">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="1.5" y="2" width="11" height="8" rx="1"/><path d="M5 11h4M7 10v1"/></svg>
          <span class="label">DESKTOP</span>
        </button>
        <button class="ed-btn" data-device="tablet" title="Tablet">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="1.5" width="8" height="11" rx="1"/><path d="M6 11h2"/></svg>
          <span class="label">TABLET</span>
        </button>
        <button class="ed-btn" data-device="mobile" title="Mobile">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="4" y="1.5" width="6" height="11" rx="1"/><path d="M6.5 11h1"/></svg>
          <span class="label">MOBILE</span>
        </button>
      </div>
      <span class="ed-sep"></span>
      <button class="ed-btn" id="ed-undo" title="Undo (Cmd+Z)">↶ UNDO</button>
      <button class="ed-btn" id="ed-redo" title="Redo (Shift+Cmd+Z)">↷ REDO</button>
      <span class="ed-spacer"></span>
      <button class="ed-btn" id="ed-notes-list">NOTES (<span id="ed-notes-count">0</span>)</button>
      <button class="ed-btn" id="ed-help">?</button>
      <button class="ed-btn" id="ed-export">EXPORT ↓</button>
      <button class="ed-btn" id="ed-reset" title="Discard all edits">RESET</button>
      <button class="ed-btn" id="ed-exit">EXIT</button>
    `;
    document.body.appendChild(bar);
  }

  // ----- FLOATING TEXT TOOLBAR -------------------------------------

  function buildTextToolbar() {
    const tb = document.createElement('div');
    tb.id = 'ed-text-toolbar';
    tb.innerHTML = `
      <select id="tb-size" title="Font size">
        <option value="">SIZE</option>
        <option value="11px">11</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="22px">22</option>
        <option value="28px">28</option>
        <option value="36px">36</option>
        <option value="48px">48</option>
        <option value="64px">64</option>
        <option value="80px">80</option>
      </select>
      <span class="ed-tb-sep"></span>
      <button data-cmd="bold" title="Bold (Cmd+B)"><b>B</b></button>
      <button data-cmd="italic" title="Italic (Cmd+I)"><i>I</i></button>
      <button data-cmd="underline" title="Underline">U</button>
      <span class="ed-tb-sep"></span>
      <button data-align="left" title="Align left">⇤</button>
      <button data-align="center" title="Align center">↔</button>
      <button data-align="right" title="Align right">⇥</button>
      <span class="ed-tb-sep"></span>
      <input type="color" id="tb-color" title="Text color" value="#F2EDE2">
      <button data-color-clear title="Clear color">×col</button>
    `;
    document.body.appendChild(tb);
    bindTextToolbar(tb);
    return tb;
  }

  function bindTextToolbar(tb) {
    tb.addEventListener('mousedown', e => e.preventDefault()); // keep selection
    tb.querySelectorAll('[data-cmd]').forEach(b => {
      b.addEventListener('click', () => {
        document.execCommand(b.dataset.cmd, false, null);
        pushUndoSnapshot();
      });
    });
    tb.querySelectorAll('[data-align]').forEach(b => {
      b.addEventListener('click', () => {
        document.execCommand('justify' + b.dataset.align.charAt(0).toUpperCase() + b.dataset.align.slice(1), false, null);
        pushUndoSnapshot();
      });
    });
    tb.querySelector('#tb-size').addEventListener('change', e => {
      applyToSelection(node => {
        if (node.style) node.style.fontSize = e.target.value;
      });
      pushUndoSnapshot();
    });
    tb.querySelector('#tb-color').addEventListener('input', e => {
      document.execCommand('foreColor', false, e.target.value);
      pushUndoSnapshot();
    });
    tb.querySelector('[data-color-clear]').addEventListener('click', () => {
      document.execCommand('removeFormat', false, null);
      pushUndoSnapshot();
    });
  }

  function applyToSelection(fn) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const span = document.createElement('span');
    span.appendChild(range.extractContents());
    fn(span);
    range.insertNode(span);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function positionTextToolbarForSelection() {
    const tb = document.getElementById('ed-text-toolbar');
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      tb.classList.remove('show');
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) {
      tb.classList.remove('show');
      return;
    }
    tb.classList.add('show');
    tb.style.left = Math.max(8, rect.left + rect.width / 2 - tb.offsetWidth / 2 + window.scrollX) + 'px';
    tb.style.top = Math.max(8, rect.top - tb.offsetHeight - 10 + window.scrollY) + 'px';
  }

  // ----- BLOCK INFRASTRUCTURE --------------------------------------

  function markBlocks() {
    // Auto-mark common content elements as blocks if not already marked
    const blockSelectors = [
      '.slide-pad > .eyebrow',
      '.slide-pad > h1', '.slide-pad > h2', '.slide-pad > h3',
      '.slide-pad > p',
      '.slide-pad > .lede',
      '.slide-pad > .sub',
      '.aud-card', '.prod-card', '.fr-card', '.opp-card',
      '.j-card', '.event', '.econ-cell', '.build-cell',
      '.bigstat', '.cast', '.pullquote',
      '.stat-call', '.album-links a',
    ];
    blockSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('block')) el.classList.add('block');
        if (!el.dataset.blockId) el.dataset.blockId = generateBlockId(el);
      });
    });

    // Ensure every .block has an id
    document.querySelectorAll('.block').forEach(el => {
      if (!el.dataset.blockId) el.dataset.blockId = generateBlockId(el);
    });
  }

  function generateBlockId(el) {
    const slide = el.closest('.slide');
    const slideId = slide ? slide.id : 'root';
    const tag = el.tagName.toLowerCase();
    const cls = (el.className || '').split(/\s+/)[0] || tag;
    const sibs = Array.from(el.parentNode.children).filter(s => s.classList && s.classList.contains('block'));
    const idx = sibs.indexOf(el);
    return slideId + '-' + cls + '-' + idx;
  }

  // ----- DRAG & DROP -----------------------------------------------

  let dragSrc = null;

  function enableDrag() {
    document.querySelectorAll('.block').forEach(b => {
      b.draggable = false;  // will be set true only on mousedown over handle
    });
    document.body.addEventListener('mousedown', onMouseDown, true);
    document.body.addEventListener('dragstart', onDragStart, true);
    document.body.addEventListener('dragover', onDragOver, true);
    document.body.addEventListener('dragleave', onDragLeave, true);
    document.body.addEventListener('drop', onDrop, true);
    document.body.addEventListener('dragend', onDragEnd, true);
  }

  function onMouseDown(e) {
    if (document.body.dataset.tool !== 'move') return;
    const block = e.target.closest('.block');
    if (!block) return;
    // Only the ::before handle starts drag — check if click is at the handle position
    const rect = block.getBoundingClientRect();
    const inHandleX = e.clientX < rect.left;  // handle sits in negative left
    const inHandleY = e.clientY >= rect.top - 4 && e.clientY <= rect.top + 26;
    if (inHandleX && inHandleY) {
      block.draggable = true;
      // Selection
      document.querySelectorAll('.block.selected').forEach(b => b.classList.remove('selected'));
      block.classList.add('selected');
      selectedBlock = block;
    }
  }

  function onDragStart(e) {
    const block = e.target.closest('.block');
    if (!block || !block.draggable) return;
    dragSrc = block;
    block.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', block.dataset.blockId);
  }

  function onDragOver(e) {
    if (!dragSrc) return;
    const block = e.target.closest('.block');
    if (!block || block === dragSrc) return;
    if (block.parentNode !== dragSrc.parentNode) return;  // only within same parent
    e.preventDefault();
    document.querySelectorAll('.drop-target').forEach(t => t.classList.remove('drop-target'));
    block.classList.add('drop-target');
  }

  function onDragLeave(e) {
    const block = e.target.closest('.block');
    if (block) block.classList.remove('drop-target');
  }

  function onDrop(e) {
    if (!dragSrc) return;
    const block = e.target.closest('.block');
    if (!block || block === dragSrc) return;
    if (block.parentNode !== dragSrc.parentNode) return;
    e.preventDefault();
    const rect = block.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    pushUndoSnapshot();
    if (before) block.parentNode.insertBefore(dragSrc, block);
    else block.parentNode.insertBefore(dragSrc, block.nextSibling);
    block.classList.remove('drop-target');
    saveOrder(dragSrc.parentNode);
  }

  function onDragEnd(e) {
    if (dragSrc) dragSrc.classList.remove('dragging');
    document.querySelectorAll('.drop-target').forEach(t => t.classList.remove('drop-target'));
    document.querySelectorAll('.block').forEach(b => b.draggable = false);
    dragSrc = null;
  }

  function saveOrder(parent) {
    const order = Array.from(parent.children)
      .filter(c => c.classList && c.classList.contains('block'))
      .map(c => c.dataset.blockId);
    const parentKey = parentKeyOf(parent);
    state.order[parentKey] = order;
    saveState();
  }

  function parentKeyOf(el) {
    const slide = el.closest('.slide');
    const slideId = slide ? slide.id : 'root';
    // simple selector path
    let path = el.tagName.toLowerCase();
    if (el.className) path += '.' + el.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    return slideId + '|' + path;
  }

  // Apply saved order on load
  function applySavedOrder() {
    Object.keys(state.order).forEach(parentKey => {
      const [slideId, sel] = parentKey.split('|');
      const slide = document.getElementById(slideId);
      if (!slide) return;
      const parent = slide.querySelector('.' + sel.split('.').slice(1).join('.').replace(/\./g, ' .').trim()) ||
                     slide.querySelector(sel.split('.')[0]);
      // Above is fragile; alternate approach below
    });
    // Robust approach: re-scan all blocks and reorder per stored order
    document.querySelectorAll('.slide').forEach(slide => {
      const blocks = slide.querySelectorAll('.block');
      const parents = new Set();
      blocks.forEach(b => parents.add(b.parentNode));
      parents.forEach(parent => {
        const parentKey = parentKeyOf(parent);
        const savedOrder = state.order[parentKey];
        if (!savedOrder) return;
        const map = {};
        Array.from(parent.children).forEach(c => {
          if (c.dataset && c.dataset.blockId) map[c.dataset.blockId] = c;
        });
        savedOrder.forEach(id => {
          if (map[id]) parent.appendChild(map[id]);
        });
      });
    });
  }

  // ----- TEXT EDITING ----------------------------------------------

  function enableText() {
    // Make all text-bearing blocks editable
    document.querySelectorAll('.block').forEach(b => {
      if (!b.querySelector('.block')) {
        // leaf block — directly editable
        b.contentEditable = 'true';
      }
    });
    // Also enable inline editing on common text elements not marked as blocks
    document.querySelectorAll('h1, h2, h3, p:not(:has(.block)), .lede, .sub, .eyebrow, .cast-row span, .stat-call .l').forEach(el => {
      if (el.closest('.block')) return;
      el.contentEditable = 'true';
    });
    document.addEventListener('input', onTextInput, true);
    document.addEventListener('mouseup', onSelectionChange);
    document.addEventListener('keyup', onSelectionChange);
  }

  function onSelectionChange() {
    if (document.body.dataset.tool !== 'text') return;
    positionTextToolbarForSelection();
  }

  let inputDebounce;
  function onTextInput(e) {
    if (document.body.dataset.tool !== 'text') return;
    const el = e.target.closest('[contenteditable="true"]');
    if (!el) return;
    clearTimeout(inputDebounce);
    inputDebounce = setTimeout(() => {
      const id = el.dataset.blockId || generateBlockId(el);
      if (!el.dataset.blockId) el.dataset.blockId = id;
      state.blocks[id] = { html: el.innerHTML };
      saveState();
    }, 350);
  }

  function applySavedText() {
    Object.keys(state.blocks).forEach(id => {
      const el = document.querySelector('[data-block-id="' + id + '"]');
      if (el && state.blocks[id].html != null) el.innerHTML = state.blocks[id].html;
    });
  }

  // ----- ANNOTATIONS -----------------------------------------------

  function enableAnnotate() {
    document.body.addEventListener('click', onAnnotateClick, true);
  }

  function onAnnotateClick(e) {
    if (document.body.dataset.tool !== 'annotate') return;
    if (e.target.closest('#ed-toolbar') ||
        e.target.closest('.ed-note-bubble') ||
        e.target.closest('.ed-pin') ||
        e.target.closest('.ed-modal-bg') ||
        e.target.closest('#ed-text-toolbar') ||
        e.target.closest('#vsw')) return;
    e.preventDefault();
    e.stopPropagation();
    const slide = e.target.closest('.slide');
    const slideId = slide ? slide.id : 'root';
    const slideRect = slide ? slide.getBoundingClientRect() : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    const xPct = ((e.clientX - slideRect.left) / slideRect.width) * 100;
    const yPct = ((e.clientY - slideRect.top) / slideRect.height) * 100;
    const note = {
      id: 'n' + Date.now(),
      slide: slideId,
      slideTitle: slide ? (slide.dataset.chapter || slideId) : 'page',
      x: xPct, y: yPct,
      text: '',
      target: shortSelector(e.target),
      at: new Date().toISOString(),
    };
    state.notes.push(note);
    saveState();
    renderPins();
    updateNotesCount();
    setTimeout(() => openNoteBubble(note.id, true), 50);
  }

  function shortSelector(el) {
    if (el.id) return '#' + el.id;
    let s = el.tagName.toLowerCase();
    const cls = (el.className || '').toString().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    return s;
  }

  function renderPins() {
    // Remove existing
    document.querySelectorAll('.ed-pin').forEach(p => p.remove());
    state.notes.forEach((n, i) => {
      const slide = document.getElementById(n.slide);
      if (!slide) return;
      const pin = document.createElement('div');
      pin.className = 'ed-pin ed-only';
      pin.textContent = String(i + 1);
      pin.dataset.noteId = n.id;
      pin.style.left = n.x + '%';
      pin.style.top = n.y + '%';
      pin.addEventListener('click', e => {
        e.stopPropagation();
        openNoteBubble(n.id);
      });
      slide.style.position = slide.style.position || 'relative';
      slide.appendChild(pin);
    });
  }

  function openNoteBubble(noteId, focusOnOpen) {
    document.querySelectorAll('.ed-note-bubble').forEach(b => b.remove());
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return;
    const slide = document.getElementById(note.slide);
    if (!slide) return;
    const idx = state.notes.findIndex(n => n.id === noteId);
    const bubble = document.createElement('div');
    bubble.className = 'ed-note-bubble';
    bubble.innerHTML = `
      <div class="nb-h">
        <span>NOTE ${String(idx + 1).padStart(2, '0')} · ${note.slideTitle}</span>
        <div>
          <button data-action="delete" title="Delete note">🗑</button>
          <button data-action="close" title="Close">×</button>
        </div>
      </div>
      <textarea placeholder="What about this part?">${note.text || ''}</textarea>
      <div class="nb-meta">${note.target} · ${new Date(note.at).toLocaleString()}</div>
    `;
    const slideRect = slide.getBoundingClientRect();
    bubble.style.left = Math.min(slideRect.left + slide.clientWidth * note.x / 100 + 20, window.innerWidth - 320) + 'px';
    bubble.style.top = (slideRect.top + window.scrollY + slide.clientHeight * note.y / 100 + 20) + 'px';
    document.body.appendChild(bubble);
    const ta = bubble.querySelector('textarea');
    if (focusOnOpen) ta.focus();
    ta.addEventListener('input', () => {
      const n = state.notes.find(x => x.id === noteId);
      if (n) { n.text = ta.value; saveState(); }
    });
    bubble.querySelector('[data-action="close"]').addEventListener('click', () => bubble.remove());
    bubble.querySelector('[data-action="delete"]').addEventListener('click', () => {
      state.notes = state.notes.filter(n => n.id !== noteId);
      saveState();
      bubble.remove();
      renderPins();
      updateNotesCount();
    });
    // close on outside click
    setTimeout(() => {
      const off = e => {
        if (!bubble.contains(e.target) && !e.target.closest('.ed-pin')) {
          bubble.remove();
          document.removeEventListener('click', off, true);
        }
      };
      document.addEventListener('click', off, true);
    }, 100);
  }

  function updateNotesCount() {
    const c = document.getElementById('ed-notes-count');
    if (c) c.textContent = String(state.notes.length);
  }

  // ----- UNDO / REDO -----------------------------------------------

  function snapshot() {
    return {
      html: document.getElementById('deck').innerHTML,
      state: JSON.parse(JSON.stringify(state)),
    };
  }
  function pushUndoSnapshot() {
    if (undoStack.length > 50) undoStack.shift();
    undoStack.push(snapshot());
    redoStack = [];
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    const s = undoStack.pop();
    document.getElementById('deck').innerHTML = s.html;
    state = s.state;
    saveState();
    afterRestore();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    const s = redoStack.pop();
    document.getElementById('deck').innerHTML = s.html;
    state = s.state;
    saveState();
    afterRestore();
  }
  function afterRestore() {
    markBlocks();
    renderPins();
    if (document.body.dataset.tool === 'text') enableText();
  }

  // ----- EXPORT ----------------------------------------------------

  function showExportModal() {
    showModal(`
      <h2>Export your changes</h2>
      <p>Two ways to ship what you've edited. Pick whichever's easier.</p>
      <div class="row">
        <button class="ed-btn" id="x-html">↓ DOWNLOAD MODIFIED HTML</button>
        <button class="ed-btn" id="x-json">↓ DOWNLOAD JSON PATCH</button>
      </div>
      <p style="margin-top: 22px; font-size: 12px;">
        <strong>HTML:</strong> a complete <code>index.html</code> with your edits baked in. Drop it in <code>pitch-site/</code> in the repo to publish.<br><br>
        <strong>JSON:</strong> just the diff — text changes, block order, colors, notes. Send it to me and I'll apply it.
      </p>
      ${state.notes.length ? `
      <p style="margin-top: 22px; font-size: 12px;">Also: <button class="ed-btn" id="x-notes" style="display:inline-flex;">↓ NOTES.MD</button> — a markdown file of all ${state.notes.length} annotation${state.notes.length === 1 ? '' : 's'}.</p>
      ` : ''}
    `);
    document.getElementById('x-html').addEventListener('click', exportHtml);
    document.getElementById('x-json').addEventListener('click', exportJson);
    const xn = document.getElementById('x-notes');
    if (xn) xn.addEventListener('click', exportNotesMd);
  }

  function exportHtml() {
    // Get the live, edited DOM. Strip editor chrome and contenteditable.
    const doc = document.documentElement.cloneNode(true);
    doc.querySelectorAll('#ed-toolbar, #ed-text-toolbar, .ed-pin, .ed-note-bubble, .ed-modal-bg, link[href*="editor.css"], script[src*="editor.js"]').forEach(n => n.remove());
    doc.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
    doc.querySelectorAll('.block').forEach(n => {
      n.classList.remove('selected', 'dragging');
      n.removeAttribute('draggable');
    });
    doc.querySelectorAll('body').forEach(b => {
      b.classList.remove('edit-mode');
      b.removeAttribute('data-tool');
      b.removeAttribute('data-device');
    });
    const html = '<!DOCTYPE html>\n' + doc.outerHTML;
    download('index.html', html, 'text/html');
  }

  function exportJson() {
    const patch = {
      version: 1,
      exportedAt: new Date().toISOString(),
      blocks: state.blocks,
      order: state.order,
      notes: state.notes,
      styles: state.styles,
    };
    download('pitch-edits.json', JSON.stringify(patch, null, 2), 'application/json');
  }

  function exportNotesMd() {
    const md = ['# Pitch site · annotations', '', `_Exported ${new Date().toLocaleString()}_`, ''];
    // Group by slide
    const bySlide = {};
    state.notes.forEach((n, i) => {
      const key = n.slideTitle || n.slide;
      bySlide[key] = bySlide[key] || [];
      bySlide[key].push({ ...n, num: i + 1 });
    });
    Object.keys(bySlide).forEach(slide => {
      md.push('## ' + slide);
      md.push('');
      bySlide[slide].forEach(n => {
        md.push(`**Note ${String(n.num).padStart(2, '0')}** · \`${n.target}\``);
        md.push('');
        md.push(n.text ? n.text : '_(empty)_');
        md.push('');
      });
    });
    download('pitch-notes.md', md.join('\n'), 'text/markdown');
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }

  // ----- MODAL HELPERS ---------------------------------------------

  function showModal(htmlContent) {
    closeModal();
    const bg = document.createElement('div');
    bg.className = 'ed-modal-bg show';
    bg.innerHTML = `<div class="ed-modal">${htmlContent}<div class="row" style="margin-top:20px;justify-content:flex-end;"><button class="ed-btn" id="ed-modal-close">CLOSE</button></div></div>`;
    document.body.appendChild(bg);
    bg.addEventListener('click', e => {
      if (e.target === bg) closeModal();
    });
    document.getElementById('ed-modal-close').addEventListener('click', closeModal);
  }
  function closeModal() {
    document.querySelectorAll('.ed-modal-bg').forEach(m => m.remove());
  }

  function showNotesList() {
    if (!state.notes.length) {
      showModal(`
        <h2>No notes yet</h2>
        <p>Click the <strong>NOTE</strong> tool, then click any part of any slide to drop a sticky note. The notes show up as numbered pins; all your notes can be exported together as markdown.</p>
      `);
      return;
    }
    let html = `<h2>All notes (${state.notes.length})</h2><div class="ed-notes-list">`;
    state.notes.forEach((n, i) => {
      html += `
        <div class="nl-item">
          <div class="nl-meta"><span>NOTE ${String(i + 1).padStart(2, '0')} · ${n.slideTitle}</span><a data-jump="${n.id}">JUMP →</a></div>
          <div>${n.text || '<em style="opacity:0.5;">(empty)</em>'}</div>
        </div>
      `;
    });
    html += `</div><div class="row" style="margin-top:14px;"><button class="ed-btn" id="ed-notes-export-md">↓ EXPORT AS MARKDOWN</button></div>`;
    showModal(html);
    document.getElementById('ed-notes-export-md').addEventListener('click', exportNotesMd);
    document.querySelectorAll('[data-jump]').forEach(a => {
      a.addEventListener('click', () => {
        const id = a.dataset.jump;
        const n = state.notes.find(x => x.id === id);
        if (n) {
          location.hash = '#' + n.slide;
          closeModal();
          setTimeout(() => openNoteBubble(id), 350);
        }
      });
    });
  }

  function showHelp() {
    showModal(`
      <h2>Editor help</h2>
      <p><strong>Tools</strong> (top-left of the toolbar):</p>
      <ul style="margin: 8px 0 14px 18px; font-size: 13px; line-height: 1.7;">
        <li><strong>MOVE</strong> · hover any block to see a red ⋮⋮ handle on its left. Drag to reorder within the same parent.</li>
        <li><strong>TEXT</strong> · click any text to edit. Highlight to get the floating toolbar (font size, bold, italic, color, alignment).</li>
        <li><strong>NOTE</strong> · cursor becomes a crosshair. Click anywhere to drop a numbered pin and write a note.</li>
      </ul>
      <p><strong>Device preview</strong>: desktop / tablet (820px) / mobile (390px).</p>
      <p><strong>Shortcuts</strong>: <kbd>V</kbd> Move · <kbd>T</kbd> Text · <kbd>N</kbd> Note · <kbd>Cmd+Z</kbd> Undo · <kbd>Shift+Cmd+Z</kbd> Redo · <kbd>Shift+E</kbd> Toggle edit mode · <kbd>Esc</kbd> Close modal</p>
      <p><strong>Export</strong>: HTML for me to drop in the repo, or JSON patch for me to apply. Notes also export as markdown.</p>
      <p style="opacity:0.6;font-size:12px;">All your edits live in localStorage until you Reset or change browsers. Closing this tab does not lose them.</p>
    `);
  }

  // ----- TOOL SWITCHING --------------------------------------------

  function setTool(tool) {
    currentTool = tool;
    document.body.dataset.tool = tool;
    document.querySelectorAll('#ed-toolbar [data-tool]').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
    // Toggle contentEditable
    if (tool === 'text') enableText();
    else document.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));
    document.getElementById('ed-text-toolbar').classList.remove('show');
  }

  function setDevice(device) {
    state.device = device;
    document.body.dataset.device = device;
    document.querySelectorAll('#ed-toolbar [data-device]').forEach(b => {
      b.classList.toggle('active', b.dataset.device === device);
    });
    saveState();
  }

  // ----- ENTRY -----------------------------------------------------

  function enterEditMode() {
    sessionStorage.setItem('iia-edit-on', '1');
    document.body.classList.add('edit-mode');
    buildToolbar();
    buildTextToolbar();
    markBlocks();
    applySavedOrder();
    applySavedText();
    setTool('move');
    setDevice(state.device || 'desktop');
    renderPins();
    updateNotesCount();
    enableDrag();
    enableAnnotate();
    bindToolbarButtons();
    bindKeys();
  }

  function exitEditMode() {
    sessionStorage.removeItem('iia-edit-on');
    location.href = location.pathname;
  }

  function resetAll() {
    if (!confirm('Discard all edits, annotations, and reorderings? This cannot be undone.')) return;
    localStorage.removeItem(STORE_KEY);
    location.reload();
  }

  function bindToolbarButtons() {
    document.querySelectorAll('#ed-toolbar [data-tool]').forEach(b => {
      b.addEventListener('click', () => setTool(b.dataset.tool));
    });
    document.querySelectorAll('#ed-toolbar [data-device]').forEach(b => {
      b.addEventListener('click', () => setDevice(b.dataset.device));
    });
    document.getElementById('ed-undo').addEventListener('click', undo);
    document.getElementById('ed-redo').addEventListener('click', redo);
    document.getElementById('ed-export').addEventListener('click', showExportModal);
    document.getElementById('ed-notes-list').addEventListener('click', showNotesList);
    document.getElementById('ed-help').addEventListener('click', showHelp);
    document.getElementById('ed-reset').addEventListener('click', resetAll);
    document.getElementById('ed-exit').addEventListener('click', exitEditMode);
  }

  function bindKeys() {
    document.addEventListener('keydown', e => {
      // Don't hijack typing in inputs/contenteditable
      const tag = (e.target.tagName || '').toUpperCase();
      const inEditable = e.target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      // Always-active
      if (e.key === 'Escape') { closeModal(); document.querySelectorAll('.ed-note-bubble').forEach(b => b.remove()); }
      // Cmd/Ctrl shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (inEditable) return;
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if (inEditable) return;
      if (e.key === 'v' || e.key === 'V') setTool('move');
      if (e.key === 't' || e.key === 'T') setTool('text');
      if (e.key === 'n' || e.key === 'N') setTool('annotate');
    });
  }

  // Global edit-mode toggle (works even when editor not yet loaded)
  document.addEventListener('keydown', e => {
    if (e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      const tag = (e.target.tagName || '').toUpperCase();
      if (e.target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      if (document.body.classList.contains('edit-mode')) exitEditMode();
      else {
        sessionStorage.setItem('iia-edit-on', '1');
        location.reload();
      }
    }
  });

  if (initialEdit) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enterEditMode);
    else enterEditMode();
  }
})();
