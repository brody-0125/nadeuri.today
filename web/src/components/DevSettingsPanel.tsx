'use client';

import { useState, useEffect } from 'react';
import { DataMode, getDataMode, setDataMode, getApiKey, setApiKey, clearCache } from '@/lib/data';

export default function DevSettingsPanel({ onSettingsChange }: { onSettingsChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DataMode>('latest');
  const [key, setKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setMode(getDataMode());
    setKey(getApiKey());
  }, []);

  const handleModeChange = (newMode: DataMode) => {
    setMode(newMode);
    setDataMode(newMode);
    clearCache();
    onSettingsChange();
  };

  const modeButton = (value: DataMode, label: string) => (
    <button
      onClick={() => handleModeChange(value)}
      className={`flex-1 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
        mode === value
          ? 'bg-status-operating text-white'
          : 'bg-bg text-text-secondary border border-border-cream hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );

  const handleKeySave = () => {
    setApiKey(key);
    clearCache();
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
    if (mode === 'opendata') {
      onSettingsChange();
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full bg-text-primary text-white shadow-lg flex items-center justify-center hover:bg-text-primary/80 transition-colors"
          aria-label="개발자 설정"
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">settings</span>
        </button>
      )}

      {open && (
        <div className="bg-surface border border-border rounded-lg shadow-lg p-5 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-text-primary">개발자 설정</h3>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label="닫기"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-2">데이터 소스</label>
              <div className="flex gap-2">
                {modeButton('latest', '수집 데이터')}
                {modeButton('mock', 'Mock')}
                {modeButton('opendata', '열린데이터')}
              </div>
            </div>

            {mode === 'opendata' && (
              <div>
                <label htmlFor="api-key-input" className="text-sm font-medium text-text-primary block mb-2">
                  서울 열린데이터 광장 API 인증키
                </label>
                <div className="flex gap-2">
                  <input
                    id="api-key-input"
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="인증키 입력"
                    className="flex-1 px-3 py-2 text-sm border border-border-cream rounded-sm bg-bg text-text-primary placeholder:text-text-secondary focus:outline-2 focus:outline-status-operating focus:outline-offset-1 font-mono"
                  />
                  <button
                    onClick={handleKeySave}
                    className="px-3 py-2 bg-status-operating text-white text-sm font-medium rounded-sm hover:bg-status-operating/80 transition-colors shrink-0"
                  >
                    {keySaved ? '저장됨' : '저장'}
                  </button>
                </div>
                <p className="text-xs text-text-secondary mt-1.5">
                  <a
                    href="https://data.seoul.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-status-operating hover:underline"
                  >
                    data.seoul.go.kr
                  </a>
                  {' '}에서 발급받은 인증키
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  API: SeoulMetroFaciInfo · 5분 캐시 적용
                </p>
              </div>
            )}

            {mode === 'latest' && (
              <p className="text-xs text-text-secondary bg-bg rounded-sm p-3">
                GitHub Actions로 수집된 data/latest.json을 사용합니다. 프로덕션 기본값.
              </p>
            )}

            {mode === 'mock' && (
              <p className="text-xs text-text-secondary bg-bg rounded-sm p-3">
                랜덤 생성된 Mock 데이터로 UI를 확인합니다. 새로고침하면 데이터가 바뀝니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
