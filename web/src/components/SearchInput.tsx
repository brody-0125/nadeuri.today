'use client';

import { useEffect, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export default function SearchInput({ value, onChange, compact }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(localValue);
    }
  };

  const handleSubmit = () => {
    onChange(localValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  if (compact) {
    return (
      <div className="relative w-full group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary transition-colors group-focus-within:text-status-operating">
          <span className="material-symbols-outlined text-xl" aria-hidden="true">search</span>
        </div>
        <input
          type="search"
          role="searchbox"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="역 이름을 입력하세요 (예: 강남, 서울역)"
          aria-label="지하철역 검색"
          className="block w-full rounded-md border border-border bg-bg py-2 pl-10 pr-20 font-sans text-text-primary transition-colors placeholder:text-text-secondary focus:border-border-strong focus:outline-none focus:ring-0"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1">
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary"
              aria-label="검색어 지우기"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
            </button>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:text-status-operating transition-colors"
            aria-label="검색"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-2xl text-text-secondary transition-colors group-focus-within:text-status-operating" aria-hidden="true">
          search
        </span>
      </div>
      <input
        type="search"
        role="searchbox"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="역 이름을 입력하세요 (예: 강남, 서울역)"
        aria-label="지하철역 검색"
        className="block h-[52px] w-full rounded-xl border-2 border-border bg-surface pl-12 pr-14 font-sans text-lg text-text-primary shadow-xs outline-none transition-colors placeholder:text-text-secondary/60 focus:border-status-operating focus:ring-0"
      />
      <button
        type="submit"
        onClick={handleSubmit}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-secondary hover:text-status-operating transition-colors"
        aria-label="검색"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
      </button>
    </div>
  );
}
