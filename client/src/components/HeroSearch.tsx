import { type RefObject } from 'react';
import { Icon } from './Icon';

interface HeroSearchProps {
  query: string;
  setQuery: (q: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  onAnalyse: (text: string) => void;
  analysing: boolean;
}

export function HeroSearch({ query, setQuery, inputRef, onAnalyse, analysing }: HeroSearchProps) {
  const hasText = query.trim().length > 0;

  const submit = () => {
    if (hasText && !analysing) onAnalyse(query);
  };

  return (
    <div className="hero-search">
      <div className="hero-search-wrap">
        <span className="search-icon">
          <Icon.Search size={18} />
        </span>
        <input
          ref={inputRef}
          className="hero-input"
          placeholder="What did you eat? Search the database — or describe it for AI…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
        <div className="hero-search-actions">
          {hasText && (
            <button
              className={`hero-ai-btn${analysing ? ' pulse' : ''}`}
              onClick={submit}
              disabled={analysing}
              title="Describe with AI — ⌘↵"
            >
              <Icon.Sparkles size={13} />
              <span>{analysing ? 'Analysing…' : 'Describe with AI'}</span>
            </button>
          )}
          {query ? (
            <button className="clear" aria-label="Clear search" onClick={() => setQuery('')}>
              <Icon.Close size={14} />
            </button>
          ) : (
            <span className="kbd">/</span>
          )}
        </div>
      </div>
      <div className="hero-search-hint">
        <span>
          <strong>Tip</strong> — free-text it ("two poached eggs on sourdough"), hit{' '}
          <kbd>⌘↵</kbd>, and AI estimates the macros.
        </span>
      </div>
    </div>
  );
}

export default HeroSearch;
