import type { Food } from '../types';

// Per-food monoline SVG paths (24×24 viewBox)
const FoodIcons: Record<string, React.ReactNode> = {
  'chobani-greek': (
    <g>
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <circle cx="9" cy="10" r="1.1" />
      <circle cx="13" cy="9" r="1.1" />
      <circle cx="16.3" cy="10.5" r="1" />
    </g>
  ),
  'rokeby-strawberry': (
    <g>
      <path d="M7 5h10l-1.2 14.2a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8Z" />
      <path d="M7.5 9.5h9" />
      <path d="M14 3l-2 5" />
    </g>
  ),
  'mixed-berries': (
    <g>
      <circle cx="8.5" cy="15" r="3.6" />
      <circle cx="15.5" cy="15" r="3.6" />
      <circle cx="12" cy="9.5" r="3.2" />
      <path d="M12 6.3V4M10.7 4.6 12 3.4l1.3 1.2" />
    </g>
  ),
  'chicken-breast': (
    <g>
      <path d="M15.5 4a4.5 4.5 0 0 1 4.5 4.5c0 1.9-1.1 3-2.5 3.4l-7 7a2.5 2.5 0 1 1-3.4-3.4l7-7C14.5 7 13.5 6 13.5 4.5A.5.5 0 0 1 14 4Z" />
      <path d="M9 15l-2 2" />
    </g>
  ),
  'brown-rice': (
    <g>
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <path d="M8.5 10.2c.6-.7 1-.7 1.4 0M11.3 9.3c.6-.7 1-.7 1.4 0M14.1 10.4c.6-.7 1-.7 1.4 0" />
    </g>
  ),
  'rolled-oats': (
    <g>
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <path d="M7.5 10.6h2.2M10.7 9.4h2.6M13.7 10.8h3" />
    </g>
  ),
  'almond-butter': (
    <g>
      <path d="M7 7h10v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1Z" />
      <path d="M6.5 4h11v3h-11z" />
      <path d="M9 13h6" />
    </g>
  ),
  banana: (
    <g>
      <path d="M5 14c0 4 3 6 7 6 5 0 8-3 8-8l-2 .5C18 16 14 18 10 17 6 16 5 12 5 14Z" />
      <path d="M18 6.5 20 5" />
    </g>
  ),
  'big-mac': (
    <g>
      <path d="M4 9a8 5 0 0 1 16 0Z" />
      <path d="M4 12h16" />
      <path d="M4 15h16" />
      <path d="M4 15a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4" />
      <path d="M8 6.5h.01M11 5.8h.01M14 6.2h.01M16.5 7h.01" />
    </g>
  ),
  salmon: (
    <g>
      <path d="M3 12c2-3 5-4.5 9-4.5s6.5 1.5 8.5 4.5c-2 3-4.5 4.5-8.5 4.5S5 15 3 12Z" />
      <path d="m20.5 12 2.5-2.5v5Z" />
      <circle cx="16.5" cy="11" r=".7" fill="currentColor" stroke="none" />
    </g>
  ),
  avocado: (
    <g>
      <path d="M12 3c-3 0-6 2.5-6 7s2 11 6 11 6-6.5 6-11-3-7-6-7Z" />
      <ellipse cx="12" cy="13" rx="2.4" ry="3.2" />
    </g>
  ),
  sourdough: (
    <g>
      <path d="M3 14a9 5.5 0 0 1 18 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M8 11.5l1.5-2M11.5 11l1.5-2M15 11.5l1.5-2" />
    </g>
  ),
  espresso: (
    <g>
      <path d="M5 10h12l-1 8.5a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8Z" />
      <path d="M17 12h1.5a2 2 0 0 1 0 4H16.5" />
      <path d="M9 5c0 1 1 1.3 1 2.3S9 8.7 9 8.7M13 5c0 1 1 1.3 1 2.3S13 8.7 13 8.7" />
    </g>
  ),
  'olive-oil': (
    <g>
      <path d="M10 3h4v3l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3Z" />
      <path d="M9 14h6" />
    </g>
  ),
  spinach: (
    <g>
      <path d="M5 12c0-5 3-8 8-8 4 0 7 2 7 6 0 5-3 9-8 9-4 0-7-3-7-7Z" />
      <path d="M6 19 18 5" />
      <path d="M9.5 14 11 12.5M12 11.5l1.5-1.5M14.5 9l1.5-1.5" />
    </g>
  ),
  eggs: (
    <g>
      <ellipse cx="9" cy="13" rx="4" ry="5.5" />
      <path d="M14.5 19c-1 0-2-.8-2-2 0-2 .8-3.6 2.5-4.5l1.5 1-1 1.5L17 16l-1.2 1.5L17 19Z" />
    </g>
  ),
  honey: (
    <g>
      <path d="M6 9h10v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1Z" />
      <path d="M5.5 6.5h11v2.5h-11z" />
      <path d="M14 3v4M13 4.5h2M13 5.8h2M13 7h2" />
    </g>
  ),
};

const categoryTint: Record<string, string> = {
  Beverage: 'nebula',
  Fruit: 'rose',
  Vegetable: 'nebula',
  Protein: 'burgundy',
  Grain: 'aurora',
  Dairy: 'parchment',
  Spread: 'aurora',
  Fat: 'claret',
  Sweetener: 'rose',
  'Fast Food': 'burgundy',
};

interface FoodGlyphProps {
  food: Food;
  size?: number;
  className?: string;
}

export function FoodGlyph({ food, size = 32, className = '' }: FoodGlyphProps) {
  const stripped = food.name
    .replace(/^(rokeby farms|chobani|atlantic|extra virgin|baby|raw|whole|cavendish|hass)\s*/i, '')
    .trim();
  const initial = (
    stripped.match(/[A-Za-z]/)?.[0] ??
    food.name.match(/[A-Za-z]/)?.[0] ??
    '·'
  ).toUpperCase();

  const iconShape = FoodIcons[food.id];
  const tint = categoryTint[food.category] ?? 'burgundy';
  const iconPx = Math.round(size * 0.62);

  return (
    <span
      className={`food-glyph food-glyph--${tint}${iconShape ? ' food-glyph--icon' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.56) }}
      aria-hidden="true"
      title={food.category}
    >
      {iconShape ? (
        <svg
          width={iconPx}
          height={iconPx}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {iconShape}
        </svg>
      ) : (
        initial
      )}
    </span>
  );
}

export default FoodGlyph;
