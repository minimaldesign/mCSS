import { useRef, useEffect, useState } from 'preact/hooks';

function oklabToLinearRGB(L, a, b) {
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;
  return [
    +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

function linearToSRGB(val) {
  return val <= 0.0031308
    ? 12.92 * val
    : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
}

function oklchToOklab(L, C, H) {
  const hRad = (H * Math.PI) / 180;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

function isOutOfGamut(L, C, H) {
  const [labL, labA, labB] = oklchToOklab(L, C, H);
  const rgb = oklabToLinearRGB(labL, labA, labB);
  const r = linearToSRGB(rgb[0]);
  const g = linearToSRGB(rgb[1]);
  const b = linearToSRGB(rgb[2]);
  const epsilon = 0.00001;
  return (
    r < -epsilon || r > 1 + epsilon ||
    g < -epsilon || g > 1 + epsilon ||
    b < -epsilon || b > 1 + epsilon
  );
}

export default function ColorPickerOklch() {
  const [hue, setHue] = useState(242);
  const [lightness, setLightness] = useState(0.59);
  const [chroma, setChroma] = useState(0.13);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const colorString = `oklch(${lightness} ${chroma} ${hue.toFixed(2)})`;
  const outOfGamut = isOutOfGamut(lightness, chroma, hue);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = canvas.width / 2;
    for (let angle = 0; angle < 360; angle++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, ((angle - 90) * Math.PI) / 180, ((angle + 1 - 90) * Math.PI) / 180);
      ctx.closePath();
      ctx.fillStyle = `oklch(${lightness} ${chroma} ${angle})`;
      ctx.fill();
    }
  }, [lightness, chroma]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function computeHue(e) {
      const rect = canvas.getBoundingClientRect();
      const dx = e.clientX - rect.left - canvas.width / 2;
      const dy = e.clientY - rect.top - canvas.height / 2;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;
      setHue(angle);
    }

    const onDown = (e) => {
      dragging.current = true;
      computeHue(e);
    };
    const onMove = (e) => {
      if (dragging.current) computeHue(e);
    };
    const onUp = () => {
      dragging.current = false;
    };

    canvas.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      canvas.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  function getMarkerStyle() {
    const size = containerRef.current?.offsetWidth ?? 220;
    const cx = size / 2;
    const radius = cx * 0.9;
    const angle = ((hue - 90) * Math.PI) / 180;
    return {
      left: cx + radius * Math.cos(angle) + 'px',
      top: cx + radius * Math.sin(angle) + 'px',
    };
  }

  return (
    <div class="colorPickerOklch">
      <div class="control-group">
        <div class="control-label" />
        <div class="color-wheel-container" ref={containerRef}>
          <canvas class="color-wheel" ref={canvasRef} width={200} height={200} />
          <div class="color-wheel-center">
            <div>
              <div class="caption">Hue</div>
              <div>{hue.toFixed(2)}&deg;</div>
            </div>
          </div>
          <div class="hue-marker" style={getMarkerStyle()} />
        </div>
      </div>

      <div class="sliders">
        <div class="control-group">
          <div class="control-label">
            <span>Lightness</span>
            <span>{lightness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={lightness}
            onInput={(e) => setLightness(parseFloat(e.target.value))}
          />
        </div>

        <div class="control-group">
          <div class="control-label">
            <span>Chroma</span>
            <span>{chroma.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={chroma}
            onInput={(e) => setChroma(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div class="color-display" style={{ backgroundColor: colorString }}>
        <div class={`gamut-warning${outOfGamut ? ' show' : ''}`}>
          ⚠️ Gamut correction
        </div>
      </div>
      <pre class="color-value">{`.elem {\n  ${colorString}\n}`}</pre>
    </div>
  );
}
