'use client';

import { useEffect, useRef, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export default function SearchInput({ value, onChange, compact }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocalValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(next);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (timerRef.current) clearTimeout(timerRef.current);
      onChange(localValue);
    }
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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
          className="block w-full rounded-md border border-border bg-bg py-2 pl-10 pr-10 font-sans text-text-primary transition-colors placeholder:text-text-secondary focus:border-border-strong focus:outline-none focus:ring-0"
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="검색어 지우기"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
          </button>
        )}
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
        className="block h-[52px] w-full rounded-xl border-2 border-border bg-surface pl-12 pr-4 font-sans text-lg text-text-primary shadow-xs outline-none transition-colors placeholder:text-text-secondary/60 focus:border-status-operating focus:ring-0"
      />
    </div>
  );
}
