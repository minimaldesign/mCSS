import { useState, useMemo } from 'preact/hooks';

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

function generateCSS(state) {
  const { cols, rows, colSizes, rowSizes, gap, items, settings } = state;
  const lines = [];

  const colTemplate = colSizes.every(s => s === '1fr')
    ? `repeat(${cols}, 1fr)`
    : colSizes.join(' ');
  const rowTemplate = rowSizes.every(s => s === '1fr')
    ? `repeat(${rows}, 1fr)`
    : rowSizes.join(' ');

  if (settings.useShorthand && !settings.useTemplateAreas) {
    lines.push('.grid {');
    lines.push('  display: grid;');
    lines.push(`  gap: ${gap};`);
    lines.push(`  grid: ${rowTemplate} / ${colTemplate};`);
  } else if (settings.useTemplateAreas) {
    const areaGrid = buildTemplateAreas(items, cols, rows);
    lines.push('.grid {');
    lines.push('  display: grid;');
    lines.push(`  gap: ${gap};`);
    lines.push('  grid-template-areas:');
    areaGrid.forEach((row, i) => {
      const suffix = i === areaGrid.length - 1 ? ';' : '';
      lines.push(`    "${row.join(' ')}"${suffix}`);
    });
    lines.push(`  grid-template-columns: ${colTemplate};`);
    lines.push(`  grid-template-rows: ${rowTemplate};`);
  } else {
    lines.push('.grid {');
    lines.push('  display: grid;');
    lines.push(`  gap: ${gap};`);
    lines.push(`  grid-template-columns: ${colTemplate};`);
    lines.push(`  grid-template-rows: ${rowTemplate};`);
  }

  if (settings.useShorthand) {
    const pi = buildPlaceItems(settings);
    const pc = buildPlaceContent(settings);
    if (pi) lines.push(`  place-items: ${pi};`);
    if (pc) lines.push(`  place-content: ${pc};`);
  } else {
    if (settings.justifyItems) lines.push(`  justify-items: ${settings.justifyItems};`);
    if (settings.alignItems) lines.push(`  align-items: ${settings.alignItems};`);
    if (settings.justifyContent) lines.push(`  justify-content: ${settings.justifyContent};`);
    if (settings.alignContent) lines.push(`  align-content: ${settings.alignContent};`);
  }
  if (settings.gridAutoFlow) lines.push(`  grid-auto-flow: ${settings.gridAutoFlow};`);

  lines.push('}');

  items.forEach((item) => {
    const itemLines = [];
    if (settings.useTemplateAreas) {
      itemLines.push(`  grid-area: area${item.id};`);
    } else {
      const colRule = getPlacementRule(item.colStart, item.colEnd, 'col');
      const rowRule = getPlacementRule(item.rowStart, item.rowEnd, 'row');
      if (colRule) itemLines.push(`  grid-column: ${colRule};`);
      if (rowRule) itemLines.push(`  grid-row: ${rowRule};`);
    }
    if (itemLines.length) {
      lines.push('');
      lines.push(`.grid-item-${item.id} {`);
      itemLines.forEach(l => lines.push(l));
      lines.push('}');
    }
  });

  return lines.join('\n');
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

function buildTemplateAreas(items, cols, rows) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill('.'));
  items.forEach((item) => {
    const name = `area${item.id}`;
    const cs = (item.colStart || 1) - 1;
    const ce = (item.colEnd || cs + 2) - 1;
    const rs = (item.rowStart || 1) - 1;
    const re = (item.rowEnd || rs + 2) - 1;
    for (let r = rs; r < re && r < rows; r++) {
      for (let c = cs; c < ce && c < cols; c++) {
        grid[r][c] = name;
      }
    }
  });
  return grid;
}

function buildPlaceItems(settings) {
  const a = settings.alignItems;
  const j = settings.justifyItems;
  if (!a && !j) return null;
  if (a === j) return a;
  return `${a || 'stretch'} ${j || 'stretch'}`;
}

function buildPlaceContent(settings) {
  const a = settings.alignContent;
  const j = settings.justifyContent;
  if (!a && !j) return null;
  if (a === j) return a;
  return `${a || 'stretch'} ${j || 'stretch'}`;
}

function generateHTML(items) {
  const lines = ['<ul class="grid">'];
  items.forEach((item) => {
    const label = getItemLabel(item.id - 1);
    const attrs = [];
    if (item.colStart || item.colEnd) {
      const rule = getPlacementRule(item.colStart, item.colEnd);
      if (rule) attrs.push(`style="grid-column: ${rule}"`);
    }
    lines.push(`  <li class="grid-item-${item.id}">${label}</li>`);
  });
  lines.push('</ul>');
  return lines.join('\n');
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

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: colSizes.join(' '),
    gridTemplateRows: rowSizes.join(' '),
    gap,
  };

  if (settings.justifyItems) gridStyle.justifyItems = settings.justifyItems;
  if (settings.alignItems) gridStyle.alignItems = settings.alignItems;
  if (settings.justifyContent) gridStyle.justifyContent = settings.justifyContent;
  if (settings.alignContent) gridStyle.alignContent = settings.alignContent;
  if (settings.gridAutoFlow) gridStyle.gridAutoFlow = settings.gridAutoFlow;

  const cssCode = useMemo(
    () => generateCSS({ cols, rows, colSizes, rowSizes, gap, items, settings }),
    [cols, rows, colSizes, rowSizes, items, settings]
  );

  const htmlCode = useMemo(
    () => generateHTML(items),
    [items]
  );

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

  function getItemStyle(item) {
    const s = {};
    if (item.colStart) s.gridColumnStart = item.colStart;
    if (item.colEnd) s.gridColumnEnd = item.colEnd;
    if (item.rowStart) s.gridRowStart = item.rowStart;
    if (item.rowEnd) s.gridRowEnd = item.rowEnd;
    return s;
  }

  return (
    <div class="gridDemo">
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

        <ul class="gridDemo_main_grid" style={gridStyle}>
          {items.map((item, i) => (
            <li
              key={item.id}
              class={`gridDemo_item grid-item-${item.id}`}
              style={getItemStyle(item)}
            >
              {getItemLabel(item.id - 1)}
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
          ))}
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
          <p class="gridDemo_settings_title">Settings</p>
        </div>
      </div>
    </div>
  );
}
