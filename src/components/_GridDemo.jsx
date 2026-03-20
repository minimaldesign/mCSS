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

  if (settings.useShorthand && !settings.useTemplateAreas) {
    container.grid = `${rowTemplate} / ${colTemplate}`;
  } else if (settings.useTemplateAreas) {
    const areaGrid = buildTemplateAreas(items, cols, rows);
    container['grid-template-areas'] = areaGrid
      .map(row => `"${row.join(' ')}"`)
      .join(' ');
    container['grid-template-columns'] = colTemplate;
    container['grid-template-rows'] = rowTemplate;
  } else {
    container['grid-template-columns'] = colTemplate;
    container['grid-template-rows'] = rowTemplate;
  }

  if (settings.useShorthand) {
    const pi = buildPlaceShorthand(settings.alignItems, settings.justifyItems);
    const pc = buildPlaceShorthand(settings.alignContent, settings.justifyContent);
    if (pi) container['place-items'] = pi;
    if (pc) container['place-content'] = pc;
  } else {
    if (settings.justifyItems) container['justify-items'] = settings.justifyItems;
    if (settings.alignItems) container['align-items'] = settings.alignItems;
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
      if (colRule) props['grid-column'] = colRule;
      if (rowRule) props['grid-row'] = rowRule;
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

function buildTemplateAreas(items, cols, rows) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill('.'));
  let autoIdx = 0;

  items.forEach((item) => {
    const name = `area${item.id}`;
    const hasPlacement = item.colStart || item.colEnd || item.rowStart || item.rowEnd;

    if (hasPlacement) {
      const cs = (item.colStart || 1) - 1;
      const ce = (item.colEnd || cs + 2) - 1;
      const rs = (item.rowStart || 1) - 1;
      const re = (item.rowEnd || rs + 2) - 1;
      for (let r = rs; r < re && r < rows; r++) {
        for (let c = cs; c < ce && c < cols; c++) {
          grid[r][c] = name;
        }
      }
    } else {
      while (autoIdx < cols * rows) {
        const r = Math.floor(autoIdx / cols);
        const c = autoIdx % cols;
        if (grid[r][c] === '.') {
          grid[r][c] = name;
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
function propsToCSS(gridProps) {
  const lines = ['.grid {'];
  for (const [prop, val] of Object.entries(gridProps.container)) {
    if (prop === 'grid-template-areas') {
      const areas = val.split('" "').map(s => s.replace(/"/g, ''));
      lines.push('  grid-template-areas:');
      areas.forEach((row, i) => {
        const suffix = i === areas.length - 1 ? ';' : '';
        lines.push(`    "${row}"${suffix}`);
      });
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

/** Convert CSS-property map → inline style object (for the live grid). */
function propsToStyle(cssProps) {
  const style = {};
  for (const [prop, val] of Object.entries(cssProps)) {
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[camel] = val;
  }
  return style;
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

  const gridStyle = useMemo(() => propsToStyle(gridProps.container), [gridProps]);

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

  function getItemStyle(item) {
    const match = gridProps.itemProps.find(ip => ip.id === item.id);
    return match ? propsToStyle(match.props) : {};
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
