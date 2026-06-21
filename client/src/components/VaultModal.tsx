import { useEffect } from 'react';
import { FoodGlyph } from './FoodGlyph';
import { Icon } from './Icon';
import { fmt } from '../data/foods';
import type { Food } from '../types';

function VaultItem({ food, onRemove, onSelect }: {
  food: Food;
  onRemove: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="vmi-card" onClick={onSelect}>
      <button
        className="vmi-remove"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Remove ${food.name.split(',')[0]} from vault`}
      >
        <Icon.Close size={8} />
      </button>
      <FoodGlyph food={food} size={64} />
      <div className="vmi-name">{food.name.split(',')[0]}</div>
      <div className="vmi-macros">
        <span className="vmi-cal">{fmt.cal(food.cal)}</span>
        <span className="vmi-dot">·</span>
        <span>P{fmt.g(food.protein)}g</span>
        <span>C{fmt.g(food.carbs)}g</span>
        <span>F{fmt.g(food.fat)}g</span>
      </div>
      <div className="vmi-per">per 100g</div>
    </div>
  );
}

interface VaultModalProps {
  foods: Food[];
  favourites: string[];
  onToggleFav: (id: string) => void;
  onSelectFood: (food: Food) => void;
  onClose: () => void;
}

export function VaultModal({ foods, favourites, onToggleFav, onSelectFood, onClose }: VaultModalProps) {
  const favFoods = foods.filter((f) => favourites.includes(f.id));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="vault-overlay" onClick={onClose}>
      <div className="vault-modal" onClick={(e) => e.stopPropagation()}>

        <div className="vault-modal-header">
          <span className="vault-modal-title">
            <span className="vmt-v">v</span>
            <span className="vmt-dash">--</span>
            <span className="vmt-v">v</span>
            {' '}VAULT
          </span>
          <button className="vault-modal-close" onClick={onClose} aria-label="Close vault">
            <Icon.Close size={12} />
          </button>
        </div>

        {favFoods.length === 0 ? (
          <div className="vault-modal-empty">
            <span>No foods saved yet.</span>
            <span>Bookmark foods from search to add them here.</span>
          </div>
        ) : (
          <div className="vault-modal-grid">
            {favFoods.map((food) => (
              <VaultItem
                key={food.id}
                food={food}
                onRemove={() => onToggleFav(food.id)}
                onSelect={() => { onSelectFood(food); onClose(); }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
