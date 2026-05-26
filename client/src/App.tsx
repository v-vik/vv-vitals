import { useState, useMemo, useCallback, useRef, type RefObject } from 'react';
import { Nav } from './components/Nav';
import { FilterBar, BrowseColumn } from './components/FilterBar';
import { HeroSearch } from './components/HeroSearch';
import { ResultsGrid } from './components/ResultsGrid';
import { AIPanel } from './components/AIPanel';
import { Cart } from './components/Cart';
import { FoodModal } from './components/FoodModal';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { FOOD_DB, INITIAL_PLAN, INITIAL_FAVOURITES, DAILY_CAL_GOAL, planTotals } from './data/foods';
import type { Food, PlanGroup, ViewMode } from './types';

export default function App() {
  const db = FOOD_DB;

  const [plan, setPlan] = useState<PlanGroup[]>(INITIAL_PLAN);
  const [favourites, setFavourites] = useState<string[]>(INITIAL_FAVOURITES);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('food');
  const [modalFood, setModalFood] = useState<Food | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [defaultGroupId, setDefaultGroupId] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [cartOpen, setCartOpen] = useState(true);

  const searchRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const { message: toast, showToast } = useToast();

  // "/" focuses the search input
  useKeyboardShortcut('/', useCallback((e) => {
    e.preventDefault();
    searchRef.current?.focus();
  }, []));

  const openFood = useCallback((food: Food, rect: DOMRect | null = null, groupId: string | null = null) => {
    setModalFood(food);
    setOriginRect(rect);
    setDefaultGroupId(groupId);
  }, []);

  const closeModal = useCallback(() => {
    setModalFood(null);
    setOriginRect(null);
    setDefaultGroupId(null);
  }, []);

  const addItemToPlan = useCallback(
    ({ foodId, grams, groupId }: { foodId: string; grams: number; groupId: string | null }) => {
      const food = db.find((f) => f.id === foodId);
      setPlan((p) => {
        let target = groupId;
        let next = [...p];
        if (!target) {
          if (next.length > 0) {
            target = next[next.length - 1].id;
          } else {
            target = 'g-' + Date.now();
            next.push({ id: target, name: 'Snack', items: [] });
          }
        }
        next = next.map((g) =>
          g.id === target
            ? { ...g, items: [...g.items, { id: 'i-' + Date.now() + Math.random(), foodId, grams }] }
            : g
        );
        return next;
      });
      const groupName = plan.find((g) => g.id === groupId)?.name;
      showToast(`Added ${food?.name?.split(',')[0]}${groupName ? ' to ' + groupName : ''}`);
      closeModal();
    },
    [db, plan, showToast, closeModal]
  );

  const addManyToPlan = useCallback(
    (items: { food: Food; grams: number }[]) => {
      setPlan((p) => {
        let next = [...p];
        let targetId: string;
        if (next.length > 0) {
          targetId = next[next.length - 1].id;
        } else {
          targetId = 'g-' + Date.now();
          next.push({ id: targetId, name: 'Snack', items: [] });
        }
        next = next.map((g) =>
          g.id === targetId
            ? {
                ...g,
                items: [
                  ...g.items,
                  ...items.map(({ food, grams }) => ({
                    id: 'i-' + Date.now() + Math.random(),
                    foodId: food.id,
                    grams,
                  })),
                ],
              }
            : g
        );
        return next;
      });
      showToast(`Added ${items.length} item${items.length > 1 ? 's' : ''}`);
    },
    [showToast]
  );

  const toggleFav = useCallback((foodId: string) => {
    setFavourites((f) => {
      if (f.includes(foodId)) {
        showToast('Removed from favourites');
        return f.filter((x) => x !== foodId);
      }
      showToast('Saved to favourites');
      return [...f, foodId];
    });
  }, [showToast]);

  // AI Describe — mocked: matches first word against DB, falls back to Big Mac
  const onAnalyse = useCallback((text: string) => {
    if (!text.trim() || analysing) return;
    setAnalysing(true);
    setTimeout(() => {
      const q = text.toLowerCase();
      let pick = db.find((f) => q.includes(f.name.split(',')[0].toLowerCase().split(' ')[0]));
      if (!pick) pick = db.find((f) => f.id === 'big-mac') ?? db[0];
      openFood({
        ...pick,
        name: text.length > 80 ? pick.name : text,
        source: 'AI estimate',
        estimated: true,
      });
      setAnalysing(false);
    }, 1100);
  }, [analysing, db, openFood]);

  const totals = useMemo(() => planTotals(plan, db), [plan, db]);

  const counts = useMemo(() => ({
    food: db.filter((f) => f.category !== 'Beverage').length,
    drink: db.filter((f) => f.category === 'Beverage').length,
    favourite: favourites.length,
  }), [db, favourites]);

  return (
    <div className={`app${cartOpen ? ' cart-is-open' : ' cart-is-collapsed'}`}>
      <Nav
        cartCount={totals.items}
        cartOpen={cartOpen}
        onCartClick={() => setCartOpen((o) => !o)}
      />

      <FilterBar totals={totals} goal={DAILY_CAL_GOAL} />

      <main className="page">
        <div className="grid">
          <div className="left-col">
            <div className="left-col-row">
              <BrowseColumn view={view} setView={setView} counts={counts} />
              <div className="left-col-main">
                <HeroSearch
                  query={query}
                  setQuery={setQuery}
                  inputRef={searchRef}
                  onAnalyse={onAnalyse}
                  analysing={analysing}
                />
                <AIPanel db={db} onAddMany={addManyToPlan} />
                <ResultsGrid
                  db={db}
                  query={query}
                  view={view}
                  favourites={favourites}
                  onPickFood={(food, rect) => openFood(food, rect)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Cart
        db={db}
        plan={plan}
        setPlan={setPlan}
        goal={DAILY_CAL_GOAL}
        open={cartOpen}
        onOpenFood={(food, rect) => openFood(food, rect)}
        onAddToGroup={(group) => {
          searchRef.current?.focus();
          showToast(`Search a food to add to ${group.name}`);
          setDefaultGroupId(group.id);
        }}
      />

      {modalFood && (
        <FoodModal
          food={modalFood}
          db={db}
          plan={plan}
          onClose={closeModal}
          onAdd={addItemToPlan}
          defaultGroupId={defaultGroupId}
          originRect={originRect}
          isFav={favourites.includes(modalFood.id)}
          onToggleFav={() => toggleFav(modalFood.id)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
