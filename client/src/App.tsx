import { useState, useMemo, useCallback, useRef, useEffect, type RefObject } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { searchOpenFoodFacts } from './lib/openFoodFacts';
import { Nav } from './components/Nav';
import { DayBar } from './components/DayBar';
import { MealSlot } from './components/MealSlot';
import { ResultsGrid } from './components/ResultsGrid';
import { AIPanel } from './components/AIPanel';
import { FoodModal } from './components/FoodModal';
import { HeroSearch } from './components/HeroSearch';
import { Toast } from './components/Toast';
import { FoodGlyph } from './components/FoodGlyph';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useDayPlan, computeDelta } from './hooks/useDayPlan';
import { FOOD_DB, INITIAL_FAVOURITES, ingredientToFood } from './data/foods';
import type { Food, MealSlotId, DragTarget, ViewMode } from './types';

// ── Drag overlay — ghost card while dragging ──────────────

function DragCard({ food }: { food: Food }) {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '0.5px solid var(--burgundy)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        width: 180,
        boxShadow: '0 20px 60px rgba(44,24,16,0.18)',
        opacity: 0.95,
        cursor: 'grabbing',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <FoodGlyph food={food} size={52} />
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 14,
        color: 'var(--parchment)',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {food.name.split(',')[0]}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--burgundy)' }}>
        {food.cal} cal · drag to equip
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────

const DEFAULT_DRAG_GRAMS = 150;

export default function App() {
  const [query, setQuery] = useState('');
  const [view] = useState<ViewMode>('food');
  const [favourites, setFavourites] = useState<string[]>(INITIAL_FAVOURITES);
  const [modalFood, setModalFood] = useState<Food | null>(null);
  const [analysing, setAnalysing] = useState(false);

  // API search state
  const [apiResults, setApiResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [knownFoods, setKnownFoods] = useState<Food[]>(FOOD_DB);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;

  // Drag state — lifted to root so DayBar can read it simultaneously
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  const [draggingFood, setDraggingFood] = useState<Food | null>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragGrams] = useState(DEFAULT_DRAG_GRAMS);

  const { slots, visibleSlots, dispatch, dayTotals } = useDayPlan(knownFoods);
  const { message: toast, showToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ── Search effect ─────────────────────────────
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setApiResults([]);
      setSearching(false);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      return;
    }
    setSearching(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchOpenFoodFacts(q);
        setApiResults(results);
        setKnownFoods((prev) => {
          const existingIds = new Set(prev.map((f) => f.id));
          const fresh = results.filter((f) => !existingIds.has(f.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
      } catch {
        setApiResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query]);

  // Display the API results when searching, local DB when idle
  const displayDb = query.trim().length >= 2 ? apiResults : FOOD_DB;

  // Keyboard shortcut: / focuses search
  useKeyboardShortcut('/', useCallback((e) => {
    e.preventDefault();
    searchRef.current?.focus();
  }, []));

  // ── Delta preview — computed for DayBar ───────
  const activeDelta = useMemo(() => {
    if (!draggingFood || !dragTarget) return null;
    return computeDelta(draggingFood, dragTarget, slots, dragGrams, knownFoods);
  }, [draggingFood, dragTarget, slots, dragGrams, knownFoods]);

  // ── DnD handlers ──────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const food = knownFoods.find((f) => f.id === event.active.id as string);
    if (food) setDraggingFood(food);
  }, [knownFoods]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const over = event.over;
    if (!over) { setDragTarget(null); return; }

    const data = over.data.current as Record<string, unknown> | undefined;
    if (!data) { setDragTarget(null); return; }

    if (data.type === 'slot') {
      setDragTarget({ type: 'slot', slotId: data.slotId as MealSlotId });
    } else if (data.type === 'ingredient') {
      setDragTarget({ type: 'ingredient', slotId: data.slotId as MealSlotId, itemId: data.itemId as string });
    } else {
      setDragTarget(null);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { over } = event;
    setDraggingFood(null);
    setDragTarget(null);

    if (!over || !draggingFood) return;

    const data = over.data.current as Record<string, unknown> | undefined;
    if (!data) return;

    const food = draggingFood;

    if (data.type === 'slot') {
      const slotId = data.slotId as MealSlotId;
      if (food.ingredients?.length) {
        const ingFoods = food.ingredients.map((ing) => ingredientToFood(ing, food.id));
        setKnownFoods((prev) => {
          const ids = new Set(prev.map((f) => f.id));
          const fresh = ingFoods.filter((f) => !ids.has(f.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
        food.ingredients.forEach((ing, i) => {
          dispatch({ type: 'ADD_TO_SLOT', slotId, food: ingFoods[i], grams: ing.grams });
        });
        showToast(`Added ${food.name.split(',')[0]} · ${food.ingredients.length} ingredients`);
      } else {
        dispatch({ type: 'ADD_TO_SLOT', slotId, food, grams: dragGrams });
        setKnownFoods((prev) => prev.find((f) => f.id === food.id) ? prev : [...prev, food]);
        showToast(`Added ${food.name.split(',')[0]}`);
      }
    } else if (data.type === 'ingredient') {
      const slotId = data.slotId as MealSlotId;
      const itemId = data.itemId as string;
      dispatch({ type: 'SWAP_INGREDIENT', slotId, itemId, food });
      setKnownFoods((prev) => prev.find((f) => f.id === food.id) ? prev : [...prev, food]);
      showToast(`Swapped for ${food.name.split(',')[0]}`);
    }
  }, [draggingFood, dispatch, dragGrams, showToast]);

  // ── Plan mutations ────────────────────────────

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

  const onAnalyse = useCallback((text: string) => {
    if (!text.trim() || analysing) return;
    setAnalysing(true);
    setTimeout(() => {
      const q = text.toLowerCase();
      let pick = FOOD_DB.find((f) => q.includes(f.name.split(',')[0].toLowerCase().split(' ')[0]));
      if (!pick) pick = FOOD_DB.find((f) => f.id === 'big-mac') ?? FOOD_DB[0];
      setModalFood({ ...pick, name: text.length > 80 ? pick.name : text, source: 'AI estimate', estimated: true });
      setAnalysing(false);
    }, 1100);
  }, [analysing]);

  const addManyToPlan = useCallback((items: { food: Food; grams: number }[]) => {
    const expanded = items.flatMap(({ food, grams }) =>
      food.ingredients?.length
        ? food.ingredients.map((ing) => ({ food: ingredientToFood(ing, food.id), grams: ing.grams }))
        : [{ food, grams }]
    );
    setKnownFoods((prev) => {
      const ids = new Set(prev.map((f) => f.id));
      const fresh = expanded.map((e) => e.food).filter((f) => !ids.has(f.id));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
    expanded.forEach(({ food, grams }) => {
      dispatch({ type: 'ADD_TO_SLOT', slotId: 'meal-1', food, grams });
    });
    showToast(`Added ${expanded.length} item${expanded.length > 1 ? 's' : ''} to Meal 1`);
  }, [dispatch, showToast]);

  // When FoodModal adds a food (fallback for AI panel results)
  const addItemFromModal = useCallback(
    ({ foodId, grams }: { foodId: string; grams: number; groupId: string | null }) => {
      const food = knownFoods.find((f) => f.id === foodId);
      if (!food) return;
      const targetSlot = slots.find((s) => s.items.length > 0)?.id ?? 'meal-1';
      if (food.ingredients?.length) {
        const ingFoods = food.ingredients.map((ing) => ingredientToFood(ing, food.id));
        setKnownFoods((prev) => {
          const ids = new Set(prev.map((f) => f.id));
          const fresh = ingFoods.filter((f) => !ids.has(f.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
        food.ingredients.forEach((ing, i) => {
          dispatch({ type: 'ADD_TO_SLOT', slotId: targetSlot, food: ingFoods[i], grams: ing.grams });
        });
        showToast(`Added ${food.name.split(',')[0]} · ${food.ingredients.length} ingredients`);
      } else {
        dispatch({ type: 'ADD_TO_SLOT', slotId: targetSlot, food, grams });
        showToast(`Added ${food.name.split(',')[0]}`);
      }
      setModalFood(null);
    },
    [knownFoods, slots, dispatch, showToast]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Nav />

      <DayBar totals={dayTotals} delta={activeDelta} />

      <div className="destiny-layout">
        {/* ── Three meal slots ── */}
        <div
          className="meal-slots"
          style={{ gridTemplateColumns: `repeat(${Math.min(visibleSlots.length, 3)}, minmax(0, 1fr))` }}
        >
          {visibleSlots.map((slot) => (
            <MealSlot
              key={slot.id}
              slot={slot}
              knownFoods={knownFoods}
              draggingFood={draggingFood}
              dragGrams={dragGrams}
              dayTotals={dayTotals}
              expanded={expandedSlotId === slot.id}
              onToggle={() => setExpandedSlotId((id) => id === slot.id ? null : slot.id)}
              onRemove={(itemId) => dispatch({ type: 'REMOVE_FROM_SLOT', slotId: slot.id, itemId })}
              onClear={() => dispatch({ type: 'CLEAR_SLOT', slotId: slot.id })}
            />
          ))}
        </div>

        {/* ── Search + results ── */}
        <div className="search-section">
          <HeroSearch
            query={query}
            setQuery={setQuery}
            inputRef={searchRef}
            onAnalyse={onAnalyse}
            analysing={analysing}
          />

          <div className="ai-block">
            <div className="ai-block-header">
              <h3 className="ai-block-title">AI analyse</h3>
              <span className="ai-block-sub">Describe or screenshot</span>
            </div>
            <AIPanel db={FOOD_DB} onAddMany={addManyToPlan} />
          </div>

          <ResultsGrid
            db={displayDb}
            query={query}
            view={view}
            favourites={favourites}
            searching={searching}
          />
        </div>
      </div>

      {/* Drag ghost overlay */}
      <DragOverlay dropAnimation={null}>
        {draggingFood ? <DragCard food={draggingFood} /> : null}
      </DragOverlay>

      {modalFood && (
        <FoodModal
          food={modalFood}
          db={knownFoods}
          plan={[]}
          onClose={() => setModalFood(null)}
          onAdd={addItemFromModal}
          defaultGroupId={null}
          originRect={null}
          isFav={favourites.includes(modalFood.id)}
          onToggleFav={() => toggleFav(modalFood.id)}
        />
      )}

      <Toast message={toast} />
    </DndContext>
  );
}
