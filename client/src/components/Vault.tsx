import { useState, useEffect, useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { FoodGlyph } from './FoodGlyph';
import { Icon } from './Icon';
import { fmt } from '../data/foods';
import type { Food } from '../types';

function calcMobileLimit(width: number) {
  // Each item: 72px card + 8px gap. Total padding: 24px. One slot reserved for button.
  return Math.max(1, Math.floor((width - 16) / 80) - 1);
}

function useMobileLayout() {
  const [state, setState] = useState(() => ({
    isMobile: window.innerWidth < 640,
    limit: calcMobileLimit(window.innerWidth),
  }));
  useEffect(() => {
    const handler = () => setState({
      isMobile: window.innerWidth < 640,
      limit: calcMobileLimit(window.innerWidth),
    });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return state;
}

function VaultCard({ food, onRemove }: { food: Food; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `vault:${food.id}`,
    data: { food },
  });

  return (
    <div
      ref={setNodeRef}
      className={`vault-card${isDragging ? ' vault-card--dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <button
        className="vault-card-remove"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Remove from vault"
      >
        <Icon.Close size={7} />
      </button>
      <FoodGlyph food={food} size={44} />
      <span className="vault-card-name">{food.name.split(',')[0]}</span>
      <span className="vault-card-cal">{fmt.cal(food.cal)}</span>
    </div>
  );
}

interface VaultProps {
  foods: Food[];
  favourites: string[];
  onToggleFav: (id: string) => void;
  onSelectFood: (food: Food) => void;
}

export function Vault({ foods, favourites, onToggleFav }: VaultProps) {
  const [open, setOpen] = useState(false);
  const vaultRef = useRef<HTMLDivElement>(null);
  const { isMobile, limit } = useMobileLayout();
  const favFoods = foods.filter((f) => favourites.includes(f.id));

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: 'vault-drop',
    data: { type: 'vault' },
  });

  // Merge click-outside ref and dnd-kit drop ref
  const setRefs = (el: HTMLDivElement | null) => {
    (vaultRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    setDropRef(el);
  };

  // On mobile: cap visible cards so button stays on-screen without scrolling
  const visibleFoods = isMobile ? favFoods.slice(0, limit) : favFoods;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (vaultRef.current && !vaultRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  const classes = [
    'vault',
    open ? 'vault--open' : '',
    isOver ? 'vault--drop-target' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={setRefs}>
      {favFoods.length === 0 ? (
        <div className="vault-empty">
          <span>No saved foods.</span>
          <span>Bookmark from search to add here.</span>
        </div>
      ) : (
        <div className="vault-grid">
          {visibleFoods.map((food) => (
            <VaultCard key={food.id} food={food} onRemove={() => onToggleFav(food.id)} />
          ))}
          <button
            className="vault-open-btn"
            onClick={() => setOpen((o) => !o)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {open ? 'close' : 'open\nvault'}
          </button>
        </div>
      )}

      {open && (
        <div className="vault-dropdown">
          {favFoods.map((food) => (
            <VaultCard key={food.id} food={food} onRemove={() => onToggleFav(food.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Vault;
