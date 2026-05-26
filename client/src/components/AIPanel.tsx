import { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { fmt } from '../data/foods';
import type { Food } from '../types';

interface AIPanelProps {
  db: Food[];
  onAddMany: (items: { food: Food; grams: number }[]) => void;
}

export function AIPanel({ db, onAddMany }: AIPanelProps) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [scanned, setScanned] = useState<Food[] | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const reset = () => {
    setImage(null);
    setScanned(null);
    setAdded(new Set());
  };

  const setImg = (url: string) => {
    setImage(url);
    setScanned(null);
    setAdded(new Set());
  };

  const onPaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items ?? [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) setImg(URL.createObjectURL(file));
        return;
      }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) setImg(URL.createObjectURL(f));
  };

  // Demo placeholder — real app would call the backend AI endpoint
  const usePlaceholder = () => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220'>
      <defs><pattern id='p' width='14' height='14' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
        <line x1='0' y1='0' x2='0' y2='14' stroke='#8B2635' stroke-width='4' opacity='0.25'/>
      </pattern></defs>
      <rect width='400' height='220' fill='#F7F0E0'/>
      <rect width='400' height='220' fill='url(%23p)'/>
      <text x='50%' y='50%' fill='#837E76' font-family='monospace' font-size='13' text-anchor='middle' dominant-baseline='middle'>menu screenshot placeholder</text>
    </svg>`;
    setImg('data:image/svg+xml;utf8,' + encodeURIComponent(svg));
  };

  const scan = () => {
    if (!image || loading) return;
    setLoading(true);
    setTimeout(() => {
      const picks = ['big-mac', 'espresso', 'sourdough']
        .map((id) => db.find((f) => f.id === id))
        .filter((f): f is Food => Boolean(f));
      setScanned(picks);
      setLoading(false);
    }, 1300);
  };

  useEffect(() => {
    window.addEventListener('paste', onPaste as EventListener);
    return () => window.removeEventListener('paste', onPaste as EventListener);
  }, []);

  return (
    <section className="scan-bar">
      <div
        className={`scan-bar-row${over ? ' over' : ''}${image ? ' has-image' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        {!image ? (
          <button className="scan-bar-trigger" onClick={usePlaceholder}>
            <span className="scan-bar-ico"><Icon.Image size={16} /></span>
            <span className="scan-bar-label">Scan a menu screenshot</span>
            <span className="scan-bar-hint">paste · drop · click — ⌘V</span>
          </button>
        ) : (
          <>
            <img src={image} alt="pasted preview" className="scan-bar-preview" />
            <div className="scan-bar-meta">
              <span className="scan-bar-label">Menu screenshot ready</span>
              <button className="scan-bar-reset" onClick={reset}>
                <Icon.Close size={11} /> Remove
              </button>
            </div>
            <button
              className={`btn btn-primary scan-bar-btn${loading ? ' pulse' : ''}`}
              onClick={scan}
              disabled={loading}
            >
              {loading ? 'Scanning…' : 'Scan menu'}
              {!loading && <Icon.ArrowUp size={12} />}
            </button>
          </>
        )}
      </div>

      {scanned && (
        <div className="scan-results">
          <div className="section-label" style={{ marginBottom: 8 }}>
            {scanned.length} items detected
          </div>
          <div className="scan-list">
            {scanned.map((f) => {
              const isAdded = added.has(f.id);
              const servingCal = f.cal * ((f.defaultServing) / 100);
              return (
                <div key={f.id} className={`scan-row${isAdded ? ' added' : ''}`}>
                  <div>
                    <div className="scan-name">{f.name}</div>
                    <div className="result-meta">{f.source} · est. per serving</div>
                  </div>
                  <div className="scan-cal">{fmt.cal(servingCal)} cal</div>
                  <button
                    className="scan-add"
                    onClick={() => {
                      onAddMany([{ food: f, grams: f.defaultServing }]);
                      setAdded((prev) => new Set([...prev, f.id]));
                    }}
                  >
                    {isAdded ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default AIPanel;
