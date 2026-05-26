import { Icon } from './Icon';
import { fmt } from '../data/foods';
import type { Totals, ViewMode } from '../types';

interface FilterBarProps {
  totals: Totals;
  goal: number;
}

export function FilterBar({ totals, goal }: FilterBarProps) {
  const stats = [
    { label: 'Cal', value: fmt.cal(totals.cal), unit: '', accent: true, Icon: Icon.Flame },
    { label: 'Protein', value: fmt.g(totals.protein), unit: 'g', Icon: Icon.Drumstick },
    { label: 'Carbs', value: fmt.g(totals.carbs), unit: 'g', Icon: Icon.Wheat },
    { label: 'Fat', value: fmt.g(totals.fat), unit: 'g', Icon: Icon.Droplet },
    { label: 'Caffeine', value: String(Math.round(totals.caffeine)), unit: 'mg', Icon: Icon.Bean },
  ];

  return (
    <div className="subnav">
      <div className="filter-bar">
        <div className="fav-bar-inner fav-bar-inner--stats">
          <span className="day-stats-label">Today</span>
          <div className="day-stats" aria-label="Today's totals">
            {stats.map((s) => (
              <div key={s.label} className={`day-stat${s.accent ? ' day-stat--accent' : ''}`}>
                <span className="day-stat-icon">
                  <s.Icon size={16} />
                </span>
                <span className="day-stat-text">
                  <span className="day-stat-label">{s.label}</span>
                  <span className="day-stat-value">
                    {s.value}
                    <span className="day-stat-unit">{s.unit}</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BrowseColumnProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  counts: { food: number; drink: number; favourite: number };
}

export function BrowseColumn({ view, setView, counts }: BrowseColumnProps) {
  const tabs: { id: ViewMode; label: string; IconComp: typeof Icon.Utensils; count: number }[] = [
    { id: 'food', label: 'Food', IconComp: Icon.Utensils, count: counts.food },
    { id: 'drink', label: 'Drink', IconComp: Icon.Cup, count: counts.drink },
    { id: 'favourite', label: 'Favourite', IconComp: Icon.Heart, count: counts.favourite },
  ];

  return (
    <aside className="browse-col" aria-label="Browse">
      <span className="browse-col-label">Browse</span>
      <div className="browse-col-tabs" role="tablist">
        {tabs.map((t) => {
          const active = view === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              className={`browse-col-tab${active ? ' active' : ''}`}
              onClick={() => setView(t.id)}
            >
              <span className="browse-col-tab-icon">
                <t.IconComp size={18} filled={t.id === 'favourite' && active} />
              </span>
              <span className="browse-col-tab-label">{t.label}</span>
              <span className="browse-col-tab-count">{t.count}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
