import { useState, useEffect, useRef } from 'react';
import { FoodGlyph } from './FoodGlyph';
import { Icon } from './Icon';
import { computeMacros, groupCal, planTotals, fmt } from '../data/foods';
import type { Food, PlanGroup } from '../types';

interface CartProps {
  db: Food[];
  plan: PlanGroup[];
  setPlan: React.Dispatch<React.SetStateAction<PlanGroup[]>>;
  goal: number;
  open: boolean;
  onOpenFood: (food: Food, rect: DOMRect) => void;
  onAddToGroup: (group: PlanGroup) => void;
}

export function Cart({ db, plan, setPlan, goal, open, onOpenFood, onAddToGroup }: CartProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (creating) inputRef.current?.focus(); }, [creating]);
  useEffect(() => { if (renamingId) renameRef.current?.focus(); }, [renamingId]);

  const totals = planTotals(plan, db);

  const removeItem = (groupId: string, itemId: string) => {
    setPlan((p) =>
      p
        .map((g) =>
          g.id === groupId
            ? { ...g, items: g.items.filter((i) => i.id !== itemId) }
            : g
        )
        .filter((g) => g.items.length > 0)
    );
  };

  const createGroup = () => {
    const n = newName.trim();
    if (!n) { setCreating(false); return; }
    setPlan((p) => [...p, { id: 'g-' + Date.now(), name: n, items: [], saved: true }]);
    setNewName('');
    setCreating(false);
  };

  const beginRename = (group: PlanGroup) => {
    setRenamingId(group.id);
    setRenameDraft(group.name ?? '');
  };

  const commitRename = () => {
    const n = renameDraft.trim();
    if (!n) { setRenamingId(null); return; }
    setPlan((p) => p.map((g) => (g.id === renamingId ? { ...g, name: n, saved: true } : g)));
    setRenamingId(null);
    setRenameDraft('');
  };

  return (
    <aside
      className={`cart${open ? ' is-open' : ' is-collapsed'}`}
      role="complementary"
      aria-hidden={!open}
    >
      <header className="cart-header">
        <div className="cart-title-wrap">
          <h2 className="cart-title">Today's cart</h2>
          <span className="cart-sub">Your plan</span>
        </div>
        <span className="cart-count">
          {totals.items} {totals.items === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className="cart-progress">
        <div className="cart-progress-row">
          <span>Total today</span>
          <span><strong>{fmt.cal(totals.cal)}</strong> cal</span>
        </div>
      </div>

      <div className="plan-scroll">
        {plan.length === 0 && (
          <div className="plan-empty">Add foods to start planning your day</div>
        )}

        {plan.map((group) => {
          const gCal = groupCal(group, db);
          const isMeal = group.items.length > 1;
          const isSaved = !!group.saved;
          const isRenaming = renamingId === group.id;

          return (
            <div
              key={group.id}
              className={`cart-section${isMeal ? ' is-meal' : ' is-solo'}${isSaved ? ' is-saved' : ''}`}
            >
              {isMeal && isSaved && !isRenaming && (
                <div className="cart-section-header">
                  <span className="cart-section-label">
                    <Icon.Bookmark size={11} filled /> {group.name}
                  </span>
                  <span className="cart-section-cal">{fmt.cal(gCal)} cal</span>
                </div>
              )}

              {isMeal && isRenaming && (
                <div className="cart-section-rename">
                  <input
                    ref={renameRef}
                    className="input cart-section-rename-input"
                    placeholder="Name this meal (e.g. Breakfast)"
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') { setRenamingId(null); setRenameDraft(''); }
                    }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={commitRename}>Save</button>
                </div>
              )}

              {group.items.map((item) => {
                const food = db.find((f) => f.id === item.foodId);
                if (!food) return null;
                const m = computeMacros(food, item.grams);
                return (
                  <div
                    key={item.id}
                    className="cart-bubble"
                    onClick={(e) => onOpenFood(food, e.currentTarget.getBoundingClientRect())}
                  >
                    <FoodGlyph food={food} size={44} />
                    <div className="cart-bubble-body">
                      <h4 className="cart-bubble-name" title={food.name}>{food.name}</h4>
                      <div className="cart-bubble-meta">
                        <span>{item.grams}g</span>
                        <span className="dot">·</span>
                        <span>P <strong>{fmt.g(m.protein)}g</strong></span>
                        <span>C <strong>{fmt.g(m.carbs)}g</strong></span>
                        <span>F <strong>{fmt.g(m.fat)}g</strong></span>
                      </div>
                    </div>
                    <div className="cart-bubble-side">
                      <span className="cart-bubble-cal">
                        {fmt.cal(m.cal)}<span className="unit">CAL</span>
                      </span>
                      <button
                        className="cart-bubble-remove"
                        aria-label="Remove"
                        onClick={(e) => { e.stopPropagation(); removeItem(group.id, item.id); }}
                      >
                        <Icon.Close size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {isMeal && !isSaved && !isRenaming && (
                <button className="meal-save-inline" onClick={() => beginRename(group)}>
                  <Icon.Bookmark size={12} /> Save meal
                </button>
              )}
            </div>
          );
        })}

        {creating ? (
          <div className="new-group-row">
            <input
              ref={inputRef}
              className="input"
              placeholder="Name this meal (e.g. Dinner)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createGroup();
                if (e.key === 'Escape') { setCreating(false); setNewName(''); }
              }}
            />
            <button className="btn btn-primary" onClick={createGroup}>Add</button>
          </div>
        ) : (
          <button className="new-group-btn" onClick={() => setCreating(true)}>
            + Add new meal group
          </button>
        )}

        {plan.length > 0 && (
          <button className="cart-clear-btn" onClick={() => setPlan([])}>
            <Icon.Trash size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="totals">
        {[
          { label: 'Cal', value: fmt.cal(totals.cal) },
          { label: 'Protein', value: `${fmt.g(totals.protein)}`, unit: 'g' },
          { label: 'Carbs', value: `${fmt.g(totals.carbs)}`, unit: 'g' },
          { label: 'Fat', value: `${fmt.g(totals.fat)}`, unit: 'g' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="total-cell">
            <div className="total-label">{label}</div>
            <div className={`total-value${totals.items === 0 ? ' dim' : ''}`}>
              {value}
              {unit && <span className="total-unit">{unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Cart;
