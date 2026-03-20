import { useState, useMemo, useRef } from 'preact/hooks';

const ITEM_LABELS = [
  'One', 'Two', 'Three', 'Four', 'Five', 'Six',
  'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
  'Twenty-one', 'Twenty-two', 'Twenty-three', 'Twenty-four', 'Twenty-five',
  'Twenty-six', 'Twenty-seven', 'Twenty-eight', 'Twenty-nine', 'Thirty',
  'Thirty-one', 'Thirty-two', 'Thirty-three', 'Thirty-four', 'Thirty-five',
  'Thirty-six', 'Thirty-seven', 'Thirty-eight', 'Thirty-nine', 'Forty',
  'Forty-one', 'Forty-two', 'Forty-three', 'Forty-four', 'Forty-five',
  'Forty-six', 'Forty-seven', 'Forty-eight', 'Forty-nine', 'Fifty',
];

/** Reorder: min pointer movement (px) before drag activates — avoids ghost + layout updates on accidental clicks. */
const REORDER_DRAG_ACTIVATION_PX = 8;

/**
 * When mapping cursor position to a grid track, the snap boundary between track i and i+1 is
 * a blend of the two track centers. Weight on the *next* center — higher = snap happens later
 * (cursor must move further into the target cell). 0.75 ≈ “~25% into the target” vs midpoint snap.
 */
const TRACK_SNAP_NEXT_CENTER_WEIGHT = 0.75;

function getItemLabel(index) {
  return ITEM_LABELS[index] || `Item ${index + 1}`;
}

function createDefaultItems(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    colStart: null,
    colEnd: null,
    rowStart: null,
    rowEnd: null,
  }));
}

/**
 * Single source of truth: builds CSS property maps for the grid container
 * and each item. Used by BOTH the inline styles and the code-block display.
 */
function buildGridProps(state) {
  const { cols, rows, colSizes, rowSizes, gap, items, settings } = state;

  const colTemplate = colSizes.every(s => s === '1fr')
    ? `repeat(${cols}, 1fr)`
    : colSizes.join(' ');
  const rowTemplate = rowSizes.every(s => s === '1fr')
    ? `repeat(${rows}, 1fr)`
    : rowSizes.join(' ');

  const container = { display: 'grid', gap };

  const columnFlow = settings.gridAutoFlow === 'column' || settings.gridAutoFlow === 'column dense';

  if (settings.useShorthand && settings.useTemplateAreas) {
    const areaGrid = buildTemplateAreas(items, cols, rows, columnFlow);
    const rowParts = areaGrid.map((row, i) =>
      `"${row.join(' ')}" ${rowSizes[i] || '1fr'}`
    );
    container['grid-template'] = `${rowParts.join(' ')} / ${colSizes.join(' ')}`;
  } else if (settings.useShorthand) {
    container.grid = `${rowTemplate} / ${colTemplate}`;
  } else if (settings.useTemplateAreas) {
    const areaGrid = buildTemplateAreas(items, cols, rows, columnFlow);
    container['grid-template-areas'] = areaGrid
      .map(row => `"${row.join(' ')}"`)
      .join(' ');
    container['grid-template-columns'] = colTemplate;
    container['grid-template-rows'] = rowTemplate;
  } else {
    container['grid-template-columns'] = colTemplate;
    container['grid-template-rows'] = rowTemplate;
  }

  if (settings.useShorthand && settings.alignItems && settings.justifyItems) {
    const pi = buildPlaceShorthand(settings.alignItems, settings.justifyItems);
    if (pi) container['place-items'] = pi;
  } else {
    if (settings.justifyItems) container['justify-items'] = settings.justifyItems;
    if (settings.alignItems) container['align-items'] = settings.alignItems;
  }

  if (settings.useShorthand && settings.alignContent && settings.justifyContent) {
    const pc = buildPlaceShorthand(settings.alignContent, settings.justifyContent);
    if (pc) container['place-content'] = pc;
  } else {
    if (settings.justifyContent) container['justify-content'] = settings.justifyContent;
    if (settings.alignContent) container['align-content'] = settings.alignContent;
  }
  if (settings.gridAutoFlow) container['grid-auto-flow'] = settings.gridAutoFlow;

  const itemProps = items.map(item => {
    const props = {};
    if (settings.useTemplateAreas) {
      props['grid-area'] = `area${item.id}`;
    } else {
      const colRule = getPlacementRule(item.colStart, item.colEnd);
      const rowRule = getPlacementRule(item.rowStart, item.rowEnd);
      if (settings.useShorthand && colRule && rowRule) {
        const rs = item.rowStart || 'auto';
        const cs = item.colStart || 'auto';
        const re = item.rowEnd || 'auto';
        const ce = item.colEnd || 'auto';
        props['grid-area'] = `${rs} / ${cs} / ${re} / ${ce}`;
      } else {
        if (colRule) props['grid-column'] = colRule;
        if (rowRule) props['grid-row'] = rowRule;
      }
    }
    return { id: item.id, props };
  });

  return { container, itemProps };
}

function getPlacementRule(start, end) {
  if (!start && !end) return null;
  const s = start || 'auto';
  const e = end || 'auto';
  if (s === 'auto' && e !== 'auto') {
    const span = e - 1;
    if (span > 1) return `span ${span}`;
    return null;
  }
  if (s !== 'auto' && e !== 'auto') return `${s} / ${e}`;
  if (s !== 'auto') return `${s}`;
  return null;
}

function buildTemplateAreas(items, cols, rows, columnFlow) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill('.'));
  const totalCells = cols * rows;
  let autoIdx = 0;

  function placeArea(name, cs, ce, rs, re) {
    for (let r = rs; r < re && r < rows; r++) {
      for (let c = cs; c < ce && c < cols; c++) {
        grid[r][c] = name;
      }
    }
  }

  function regionFree(cs, ce, rs, re) {
    for (let r = rs; r < re && r < rows; r++) {
      for (let c = cs; c < ce && c < cols; c++) {
        if (c >= cols || grid[r][c] !== '.') return false;
      }
    }
    return true;
  }

  function autoCellAt(idx) {
    if (columnFlow) {
      return { c: Math.floor(idx / rows), r: idx % rows };
    }
    return { r: Math.floor(idx / cols), c: idx % cols };
  }

  items.forEach(item => {
    const name = `area${item.id}`;
    const posCol = !!item.colStart;
    const posRow = !!item.rowStart;
    const cSpan = posCol
      ? (item.colEnd || item.colStart + 1) - item.colStart
      : (item.colEnd ? item.colEnd - 1 : 1);
    const rSpan = posRow
      ? (item.rowEnd || item.rowStart + 1) - item.rowStart
      : (item.rowEnd ? item.rowEnd - 1 : 1);

    if (posCol && posRow) {
      const cs = item.colStart - 1;
      const rs = item.rowStart - 1;
      placeArea(name, cs, cs + cSpan, rs, rs + rSpan);
    } else if (posCol && !posRow) {
      const cs = item.colStart - 1;
      for (let r = 0; r < rows; r++) {
        if (regionFree(cs, cs + cSpan, r, r + rSpan)) {
          placeArea(name, cs, cs + cSpan, r, r + rSpan);
          break;
        }
      }
    } else if (posRow && !posCol) {
      const rs = item.rowStart - 1;
      for (let c = 0; c < cols; c++) {
        if (regionFree(c, c + cSpan, rs, rs + rSpan)) {
          placeArea(name, c, c + cSpan, rs, rs + rSpan);
          break;
        }
      }
    } else {
      while (autoIdx < totalCells) {
        const { r, c } = autoCellAt(autoIdx);
        if (c + cSpan <= cols && r + rSpan <= rows && regionFree(c, c + cSpan, r, r + rSpan)) {
          placeArea(name, c, c + cSpan, r, r + rSpan);
          autoIdx++;
          break;
        }
        autoIdx++;
      }
    }
  });

  return grid;
}

function buildPlaceShorthand(align, justify) {
  if (!align && !justify) return null;
  if (align === justify) return align;
  return `${align || 'stretch'} ${justify || 'stretch'}`;
}

/** Convert CSS-property map → CSS code string (for the code block). */
function formatMultilineArea(prop, val, indent) {
  if (prop === 'grid-template-areas') {
    const areas = val.split('" "').map(s => s.replace(/"/g, ''));
    const out = [`${indent}grid-template-areas:`];
    areas.forEach((row, i) => {
      const suffix = i === areas.length - 1 ? ';' : '';
      out.push(`${indent}  "${row}"${suffix}`);
    });
    return out;
  }
  if (prop === 'grid-template') {
    const slashIdx = val.lastIndexOf(' / ');
    const rowsPart = val.slice(0, slashIdx);
    const colsPart = val.slice(slashIdx + 3);
    const rowMatches = [...rowsPart.matchAll(/"[^"]*"\s*[^"]*/g)].map(m => m[0].trim());
    const out = [`${indent}grid-template:`];
    rowMatches.forEach(r => out.push(`${indent}  ${r}`));
    out.push(`${indent}  / ${colsPart};`);
    return out;
  }
  return null;
}

function propsToCSS(gridProps) {
  const lines = ['.grid {'];
  for (const [prop, val] of Object.entries(gridProps.container)) {
    const multi = formatMultilineArea(prop, val, '  ');
    if (multi) {
      lines.push(...multi);
    } else {
      lines.push(`  ${prop}: ${val};`);
    }
  }
  lines.push('}');

  gridProps.itemProps.forEach(({ id, props }) => {
    const entries = Object.entries(props);
    if (entries.length) {
      lines.push('');
      lines.push(`.grid-item-${id} {`);
      entries.forEach(([p, v]) => lines.push(`  ${p}: ${v};`));
      lines.push('}');
    }
  });

  return lines.join('\n');
}

/** Convert CSS-property map → real CSS rule string for a given selector. */
function propsToRule(selector, cssProps) {
  const decls = Object.entries(cssProps).map(([prop, val]) => {
    const multi = formatMultilineArea(prop, val, '  ');
    if (multi) return multi.join('\n');
    return `  ${prop}: ${val};`;
  });
  return `${selector} {\n${decls.join('\n')}\n}`;
}

/** Build complete stylesheet applied to the live grid (uses real class names). */
function buildLiveStylesheet(gridProps) {
  const rules = [propsToRule('.gridDemo_main_grid', gridProps.container)];
  gridProps.itemProps.forEach(({ id, props }) => {
    if (Object.keys(props).length) {
      rules.push(propsToRule(`.gridDemo_main_grid .grid-item-${id}`, props));
    }
  });
  return rules.join('\n');
}

function generateHTML(items) {
  const lines = ['<ul class="grid">'];
  items.forEach((item) => {
    lines.push(`  <li class="grid-item-${item.id}">${getItemLabel(item.id - 1)}</li>`);
  });
  lines.push('</ul>');
  return lines.join('\n');
}

function SettingsDropdown({ label, value, options, onChange }) {
  return (
    <div class="gridDemo_settings_field">
      <label class="gridDemo_settings_label">{label}</label>
      <select
        class="gridDemo_settings_select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Not selected</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function GridDemo() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [colSizes, setColSizes] = useState(() => Array(3).fill('1fr'));
  const [rowSizes, setRowSizes] = useState(() => Array(3).fill('1fr'));
  const [items, setItems] = useState(() => createDefaultItems(9));
  const [activeTab, setActiveTab] = useState('css');
  const [settings, setSettings] = useState({
    useShorthand: false,
    useTemplateAreas: false,
    justifyItems: '',
    alignItems: '',
    justifyContent: '',
    alignContent: '',
    gridAutoFlow: '',
  });

  const gap = '20px';

  const gridProps = useMemo(
    () => buildGridProps({ cols, rows, colSizes, rowSizes, gap, items, settings }),
    [cols, rows, colSizes, rowSizes, items, settings]
  );

  const liveCSS = useMemo(() => buildLiveStylesheet(gridProps), [gridProps]);

  const cssCode = useMemo(() => propsToCSS(gridProps), [gridProps]);

  const htmlCode = useMemo(() => generateHTML(items), [items]);

  function addColumn() {
    setCols(c => c + 1);
    setColSizes(s => [...s, '1fr']);
  }

  function removeColumn() {
    if (cols <= 1) return;
    const newCols = cols - 1;
    setCols(newCols);
    setColSizes(s => s.slice(0, newCols));
    setItems(prev => prev.map(item => {
      const patched = { ...item };
      if (patched.colStart && patched.colStart > newCols) patched.colStart = newCols;
      if (patched.colEnd && patched.colEnd > newCols + 1) patched.colEnd = newCols + 1;
      return patched;
    }));
  }

  function addRow() {
    setRows(r => r + 1);
    setRowSizes(s => [...s, '1fr']);
  }

  function removeRow() {
    if (rows <= 1) return;
    const newRows = rows - 1;
    setRows(newRows);
    setRowSizes(s => s.slice(0, newRows));
    setItems(prev => prev.map(item => {
      const patched = { ...item };
      if (patched.rowStart && patched.rowStart > newRows) patched.rowStart = newRows;
      if (patched.rowEnd && patched.rowEnd > newRows + 1) patched.rowEnd = newRows + 1;
      return patched;
    }));
  }

  function addItem() {
    const nextId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const totalCells = cols * rows;
    if (items.length >= totalCells) addRow();
    setItems(prev => [...prev, {
      id: nextId,
      colStart: null, colEnd: null,
      rowStart: null, rowEnd: null,
    }]);
  }

  function removeItem() {
    if (items.length <= 1) return;
    setItems(prev => prev.slice(0, -1));
  }

  const gridRef = useRef(null);
  const dragState = useRef(null);
  const reorderRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  function getTrackLines() {
    const el = gridRef.current;
    if (!el) return { colLines: [], rowLines: [] };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const colTracks = cs.gridTemplateColumns.split(' ').map(parseFloat);
    const rowTracks = cs.gridTemplateRows.split(' ').map(parseFloat);
    const colGap = parseFloat(cs.columnGap) || 0;
    const rowGap = parseFloat(cs.rowGap) || 0;

    const colLines = [rect.left];
    let cx = rect.left;
    for (let i = 0; i < colTracks.length; i++) {
      cx += colTracks[i];
      colLines.push(cx);
      if (i < colTracks.length - 1) cx += colGap;
    }

    const rowLines = [rect.top];
    let ry = rect.top;
    for (let i = 0; i < rowTracks.length; i++) {
      ry += rowTracks[i];
      rowLines.push(ry);
      if (i < rowTracks.length - 1) ry += rowGap;
    }

    return { colLines, rowLines };
  }

  function findNearestLine(lines, pos) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < lines.length; i++) {
      const d = Math.abs(lines[i] - pos);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best + 1;
  }

  function resolveItemPosition(itemId, trackLines) {
    const el = gridRef.current;
    if (!el) return { col: 1, colEnd: 2, row: 1, rowEnd: 2 };
    const li = el.querySelector(`.grid-item-${itemId}`);
    if (!li) return { col: 1, colEnd: 2, row: 1, rowEnd: 2 };
    const rect = li.getBoundingClientRect();
    const { colLines, rowLines } = trackLines;
    return {
      col: findNearestLine(colLines, rect.left),
      colEnd: findNearestLine(colLines, rect.right),
      row: findNearestLine(rowLines, rect.top),
      rowEnd: findNearestLine(rowLines, rect.bottom),
    };
  }

  function onHandlePointerDown(e, itemId, edge) {
    e.preventDefault();
    e.stopPropagation();

    const boundaries = getTrackLines();
    const actual = resolveItemPosition(itemId, boundaries);

    const columnFlow = settings.gridAutoFlow === 'column' || settings.gridAutoFlow === 'column dense';

    const li = gridRef.current.querySelector(`.grid-item-${itemId}`);
    const liRect = li.getBoundingClientRect();

    dragState.current = {
      itemId,
      edge,
      boundaries,
      columnFlow,
      origCol: actual.col,
      origColEnd: actual.colEnd,
      origRow: actual.row,
      origRowEnd: actual.rowEnd,
      ghost: null,
    };
    setDraggingId(itemId);

    const touchesCol = edge === 'right' || edge === 'left' ||
      edge === 'top-right' || edge === 'top-left' ||
      edge === 'bottom-right' || edge === 'bottom-left';
    const touchesRow = edge === 'top' || edge === 'bottom' ||
      edge === 'top-right' || edge === 'top-left' ||
      edge === 'bottom-right' || edge === 'bottom-left';
    const isRight = edge === 'right' || edge === 'top-right' || edge === 'bottom-right';
    const isLeft = edge === 'left' || edge === 'top-left' || edge === 'bottom-left';
    const isBottom = edge === 'bottom' || edge === 'bottom-left' || edge === 'bottom-right';
    const isTop = edge === 'top' || edge === 'top-left' || edge === 'top-right';

    const onMove = (ev) => {
      const ds = dragState.current;
      if (!ds) return;
      const { colLines, rowLines } = ds.boundaries;

      if (!ds.ghost) {
        const ghost = li.cloneNode(true);
        ghost.className = 'gridDemo_item gridDemo_ghost';
        ghost.style.cssText = `
          position: fixed;
          width: ${liRect.width}px;
          height: ${liRect.height}px;
          left: ${liRect.left}px;
          top: ${liRect.top}px;
          pointer-events: none;
          z-index: 100;
          margin: 0;
        `;
        document.body.appendChild(ghost);
        ds.ghost = ghost;
      }

      // Resize ghost to follow the pointer on the dragged edge(s)
      const g = ds.ghost;
      let gLeft = liRect.left, gRight = liRect.right;
      let gTop = liRect.top, gBottom = liRect.bottom;
      if (isRight) gRight = Math.max(gLeft + 20, ev.clientX);
      if (isLeft) gLeft = Math.min(gRight - 20, ev.clientX);
      if (isBottom) gBottom = Math.max(gTop + 20, ev.clientY);
      if (isTop) gTop = Math.min(gBottom - 20, ev.clientY);
      g.style.left = gLeft + 'px';
      g.style.top = gTop + 'px';
      g.style.width = (gRight - gLeft) + 'px';
      g.style.height = (gBottom - gTop) + 'px';

      setItems(prev => prev.map(item => {
        if (item.id !== ds.itemId) return item;
        const patched = { ...item };

        if (touchesCol) {
          const cs = item.colStart || ds.origCol;
          const ce = item.colEnd || ds.origColEnd;
          if (isRight) {
            patched.colStart = cs;
            patched.colEnd = Math.max(cs + 1, findNearestLine(colLines, ev.clientX));
          }
          if (isLeft) {
            patched.colEnd = ce;
            patched.colStart = Math.min(ce - 1, Math.max(1, findNearestLine(colLines, ev.clientX)));
          }
        }

        if (touchesRow) {
          const rs = item.rowStart || ds.origRow;
          const re = item.rowEnd || ds.origRowEnd;
          if (isBottom) {
            patched.rowStart = rs;
            patched.rowEnd = Math.max(rs + 1, findNearestLine(rowLines, ev.clientY));
          }
          if (isTop) {
            patched.rowEnd = re;
            patched.rowStart = Math.min(re - 1, Math.max(1, findNearestLine(rowLines, ev.clientY)));
          }
        }

        // Pin the cross-axis to prevent auto-placement jumps.
        // In row flow, explicit row without column → item jumps to col 1.
        // In column flow, explicit column without row → item jumps to row 1.
        if (touchesRow && !touchesCol && !ds.columnFlow) {
          patched.colStart = item.colStart || ds.origCol;
          patched.colEnd = item.colEnd || ds.origColEnd;
        }
        if (touchesCol && !touchesRow && ds.columnFlow) {
          patched.rowStart = item.rowStart || ds.origRow;
          patched.rowEnd = item.rowEnd || ds.origRowEnd;
        }

        return patched;
      }));
    };

    const onUp = () => {
      const ds = dragState.current;
      if (ds) {
        if (ds.ghost) ds.ghost.remove();
        setItems(prev => prev.map(item => {
          if (item.id !== ds.itemId) return item;
          const patched = { ...item };

          const colBackToOrig = patched.colStart === ds.origCol && patched.colEnd === ds.origColEnd;
          const rowBackToOrig = patched.rowStart === ds.origRow && patched.rowEnd === ds.origRowEnd;

          if (touchesCol && colBackToOrig) {
            patched.colStart = null;
            patched.colEnd = null;
          }
          if (touchesRow && rowBackToOrig) {
            patched.rowStart = null;
            patched.rowEnd = null;
          }

          const hasCol = patched.colStart !== null || patched.colEnd !== null;
          const hasRow = patched.rowStart !== null || patched.rowEnd !== null;

          // Pin cross-axis to prevent auto-placement jump
          if (hasRow && !hasCol && !ds.columnFlow) {
            patched.colStart = ds.origCol;
            patched.colEnd = ds.origColEnd;
          }
          if (hasCol && !hasRow && ds.columnFlow) {
            patched.rowStart = ds.origRow;
            patched.rowEnd = ds.origRowEnd;
          }

          return patched;
        }));
      }
      dragState.current = null;
      setDraggingId(null);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function findTrackAt(lines, pos) {
    const centers = [];
    for (let i = 0; i < lines.length - 1; i++) {
      centers.push((lines[i] + lines[i + 1]) / 2);
    }
    const wNext = TRACK_SNAP_NEXT_CENTER_WEIGHT;
    const wPrev = 1 - wNext;
    for (let i = 0; i < centers.length - 1; i++) {
      const boundary = centers[i] * wPrev + centers[i + 1] * wNext;
      if (pos < boundary) return i + 1;
    }
    return centers.length;
  }

  function onItemPointerDown(e, itemId) {
    if (dragState.current) return;
    if (e.target.closest('.gridDemo_btn') || e.target.closest('.gridDemo_handle')) return;
    e.preventDefault();

    const boundaries = getTrackLines();
    const actual = resolveItemPosition(itemId, boundaries);
    const colSpan = actual.colEnd - actual.col;
    const rowSpan = actual.rowEnd - actual.row;

    const li = gridRef.current.querySelector(`.grid-item-${itemId}`);
    const rect = li.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    reorderRef.current = {
      itemId,
      boundaries,
      colSpan,
      rowSpan,
      origCol: actual.col,
      origRow: actual.row,
      origItems: items.map(i => ({ ...i })),
      startX: e.clientX,
      startY: e.clientY,
      activated: false,
      ghost: null,
    };

    const onMove = (ev) => {
      const rs = reorderRef.current;
      if (!rs) return;

      const dx = ev.clientX - rs.startX;
      const dy = ev.clientY - rs.startY;

      if (!rs.activated) {
        if (Math.abs(dx) < REORDER_DRAG_ACTIVATION_PX && Math.abs(dy) < REORDER_DRAG_ACTIVATION_PX) return;
        rs.activated = true;
        setDraggingId(itemId);

        const ghost = li.cloneNode(true);
        ghost.className = 'gridDemo_item gridDemo_ghost';
        ghost.style.cssText = `
          position: fixed;
          width: ${rect.width}px;
          height: ${rect.height}px;
          left: ${ev.clientX - offsetX}px;
          top: ${ev.clientY - offsetY}px;
          pointer-events: none;
          z-index: 100;
          margin: 0;
        `;
        document.body.appendChild(ghost);
        rs.ghost = ghost;
      }

      if (rs.ghost) {
        rs.ghost.style.left = `${ev.clientX - offsetX}px`;
        rs.ghost.style.top = `${ev.clientY - offsetY}px`;
      }

      const { colLines, rowLines } = rs.boundaries;
      const targetCol = findTrackAt(colLines, ev.clientX);
      const targetRow = findTrackAt(rowLines, ev.clientY);
      const tce = targetCol + rs.colSpan;
      const tre = targetRow + rs.rowSpan;

      setItems(rs.origItems.map(item => {
        if (item.id === rs.itemId) {
          return { ...item, colStart: targetCol, colEnd: tce, rowStart: targetRow, rowEnd: tre };
        }
        if (item.colStart || item.rowStart) {
          const ics = item.colStart || 1;
          const ice = item.colEnd || ics + 1;
          const irs = item.rowStart || 1;
          const ire = item.rowEnd || irs + 1;
          if (ics < tce && ice > targetCol && irs < tre && ire > targetRow) {
            const cSpan = ice - ics;
            const rSpan = ire - irs;
            return {
              ...item,
              colStart: null,
              colEnd: cSpan > 1 ? cSpan + 1 : null,
              rowStart: null,
              rowEnd: rSpan > 1 ? rSpan + 1 : null,
            };
          }
        }
        return { ...item };
      }));
    };

    const onUp = () => {
      const rs = reorderRef.current;
      if (rs) {
        if (rs.ghost) rs.ghost.remove();
        if (rs.activated) {
          setItems(prev => prev.map(item => {
            if (item.id !== rs.itemId) return item;
            if (item.colStart === rs.origCol && item.rowStart === rs.origRow) {
              return { ...item, colStart: null, colEnd: null, rowStart: null, rowEnd: null };
            }
            return item;
          }));
        }
      }
      reorderRef.current = null;
      setDraggingId(null);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  const EDGES = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div class="gridDemo">
      <style dangerouslySetInnerHTML={{ __html: liveCSS }} />
      <div class="gridDemo_main">
        <div class="gridDemo_controls-col">
          <button
            class="gridDemo_btn"
            onClick={removeColumn}
            disabled={cols <= 1}
            title="Remove column"
          >−</button>
          <button
            class="gridDemo_btn"
            onClick={addColumn}
            title="Add column"
          >+</button>
        </div>

        <div class="gridDemo_controls-row">
          <button
            class="gridDemo_btn"
            onClick={removeRow}
            disabled={rows <= 1}
            title="Remove row"
          >−</button>
          <button
            class="gridDemo_btn"
            onClick={addRow}
            title="Add row"
          >+</button>
        </div>

        <ul
          class="gridDemo_main_grid"
          ref={gridRef}
        >
          {items.map((item, i) => {
            let cls = `gridDemo_item grid-item-${item.id}`;
            if (draggingId === item.id) cls += ' is-dragging';
            return (
            <li
              key={item.id}
              class={cls}
              onPointerDown={(e) => onItemPointerDown(e, item.id)}
            >
              {getItemLabel(item.id - 1)}
              {EDGES.map(edge => (
                <span
                  key={edge}
                  class={`gridDemo_handle gridDemo_handle-${edge}`}
                  onPointerDown={(e) => onHandlePointerDown(e, item.id, edge)}
                />
              ))}
              {i === items.length - 1 && (
                <span class="gridDemo_controls-item">
                  <button
                    class="gridDemo_btn gridDemo_btn-xs"
                    onClick={removeItem}
                    disabled={items.length <= 1}
                    title="Remove item"
                  >−</button>
                  <button
                    class="gridDemo_btn gridDemo_btn-xs"
                    onClick={addItem}
                    title="Add item"
                  >+</button>
                </span>
              )}
            </li>
            );
          })}
        </ul>
      </div>

      <div class="gridDemo_bottom">
        <div class="gridDemo_code">
          <div class="gridDemo_code_tabs">
            <button
              class={`gridDemo_code_tab${activeTab === 'css' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('css')}
            >
              CSS
            </button>
            <button
              class={`gridDemo_code_tab${activeTab === 'html' ? ' is-active' : ''}`}
              onClick={() => setActiveTab('html')}
            >
              HTML
            </button>
          </div>
          <pre class="gridDemo_code_block"><code>{activeTab === 'css' ? cssCode : htmlCode}</code></pre>
        </div>

        <div class="gridDemo_settings">
          <p class="gridDemo_settings_title">Code format</p>

          <label class="gridDemo_settings_check">
            <input
              type="checkbox"
              checked={settings.useShorthand}
              onChange={(e) => setSettings(s => ({ ...s, useShorthand: e.target.checked }))}
            />
            Use shorthand
          </label>

          <label class="gridDemo_settings_check">
            <input
              type="checkbox"
              checked={settings.useTemplateAreas}
              onChange={(e) => setSettings(s => ({ ...s, useTemplateAreas: e.target.checked }))}
            />
            Use template areas
          </label>

          <SettingsDropdown
            label="justify-items"
            value={settings.justifyItems}
            options={['start', 'end', 'center', 'stretch', 'baseline']}
            onChange={(v) => setSettings(s => ({ ...s, justifyItems: v }))}
          />
          <SettingsDropdown
            label="align-items"
            value={settings.alignItems}
            options={['start', 'end', 'center', 'stretch', 'baseline']}
            onChange={(v) => setSettings(s => ({ ...s, alignItems: v }))}
          />
          <SettingsDropdown
            label="justify-content"
            value={settings.justifyContent}
            options={['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly']}
            onChange={(v) => setSettings(s => ({ ...s, justifyContent: v }))}
          />
          <SettingsDropdown
            label="align-content"
            value={settings.alignContent}
            options={['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly']}
            onChange={(v) => setSettings(s => ({ ...s, alignContent: v }))}
          />
          <SettingsDropdown
            label="grid-auto-flow"
            value={settings.gridAutoFlow}
            options={['row', 'column', 'dense', 'row dense', 'column dense']}
            onChange={(v) => setSettings(s => ({ ...s, gridAutoFlow: v }))}
          />
        </div>
      </div>
    </div>
  );
}
