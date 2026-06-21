import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number; filled?: boolean };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const Icon = {
  Search: ({ size = 14, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Close: ({ size = 14, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  Plus: ({ size = 14, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Heart: ({ size = 14, filled = false, ...p }: IconProps) => (
    <svg {...base(size)} fill={filled ? 'currentColor' : 'none'} strokeWidth="1.5" {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  ArrowUp: ({ size = 12, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.6" {...p}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  ),
  Hexagon: ({ size = 12, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M12 2 21 7v10l-9 5-9-5V7z" />
    </svg>
  ),
  Image: ({ size = 18, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.4" {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  ),
  Sparkles: ({ size = 14, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.4" {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  ),
  Cart: ({ size = 16, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M5 7h14l-1.2 11.3a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L5 7Z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </svg>
  ),
  User: ({ size = 16, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  ),
  Utensils: ({ size = 13, filled: _f, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v6M9 3v6" />
      <path d="M17 3c-1.8 0-3 2-3 5s1.2 5 3 5v8" />
    </svg>
  ),
  Cup: ({ size = 13, filled: _f, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M5 8h12l-1 11a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M17 11h2a2 2 0 0 1 0 4h-1.6" />
      <path d="M9 4c0 1 1 1.3 1 2.4S9 8 9 8M13 4c0 1 1 1.3 1 2.4S13 8 13 8" />
    </svg>
  ),
  Bookmark: ({ size = 13, filled = false, ...p }: IconProps) => (
    <svg {...base(size)} fill={filled ? 'currentColor' : 'none'} strokeWidth="1.5" {...p}>
      <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-3.5L6 21z" />
    </svg>
  ),
  Flame: ({ size = 16, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M12 3c1.5 3 4 4 4 8a4 4 0 0 1-8 0c0-1.6.5-2.5 1.5-3.5C9 9.5 9 7 12 3Z" />
      <path d="M10 17a3 3 0 0 0 4 0" />
    </svg>
  ),
  Drumstick: ({ size = 16, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M15.5 4a4.5 4.5 0 0 1 4.5 4.5c0 1.9-1.1 3-2.5 3.4l-7 7a2.5 2.5 0 1 1-3.4-3.4l7-7C14.5 7 13.5 6 13.5 4.5A.5.5 0 0 1 14 4Z" />
      <path d="M9 15l-2.5 2.5" />
    </svg>
  ),
  Wheat: ({ size = 16, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M12 21V5" />
      <path d="M12 14c-3 0-5-1.5-5-4 2.5 0 5 1.5 5 4Z" />
      <path d="M12 14c3 0 5-1.5 5-4-2.5 0-5 1.5-5 4Z" />
      <path d="M12 9c-2.5 0-4.5-1.3-4.5-3.5 2.2 0 4.5 1.3 4.5 3.5Z" />
      <path d="M12 9c2.5 0 4.5-1.3 4.5-3.5-2.2 0-4.5 1.3-4.5 3.5Z" />
    </svg>
  ),
  Droplet: ({ size = 16, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z" />
    </svg>
  ),
  Bean: ({ size = 16, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <ellipse cx="12" cy="12" rx="5.5" ry="8.5" transform="rotate(-30 12 12)" />
      <path d="M9.5 5.5c-1 4 1 8.5 5 11" />
    </svg>
  ),
  Trash: ({ size = 14, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  Info: ({ size = 14, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.5" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M12 12v4" />
    </svg>
  ),
  Camera: ({ size = 18, ...p }: IconProps) => (
    <svg {...base(size)} strokeWidth="1.4" {...p}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
};

export default Icon;
