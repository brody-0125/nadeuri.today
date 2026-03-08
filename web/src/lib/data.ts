import { LatestData } from '@/types';
import { generateMockData } from './mock-data';
import { fetchFromOpenData } from './opendata';

export type DataMode = 'latest' | 'mock' | 'opendata';

const STORAGE_KEY_MODE = 'nadeuri-data-mode';
const STORAGE_KEY_API_KEY = 'nadeuri-opendata-api-key';

/** 프로덕션 기본값은 'latest' (수집 데이터), 개발 환경에서만 mock/opendata 전환 가능 */
const DEFAULT_MODE: DataMode = process.env.NODE_ENV === 'development' ? 'mock' : 'latest';

export function getDataMode(): DataMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  return (localStorage.getItem(STORAGE_KEY_MODE) as DataMode) || DEFAULT_MODE;
}

export function setDataMode(mode: DataMode) {
  localStorage.setItem(STORAGE_KEY_MODE, mode);
}

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
}

export function setApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY_API_KEY, key);
}

/** 캐시: 반복 호출 방지용 5분 캐시 */
let cache: { data: LatestData; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5분

async function fetchWithCache(fetcher: () => Promise<LatestData>): Promise<LatestData> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.data;
  }
  const data = await fetcher();
  cache = { data, fetchedAt: Date.now() };
  return data;
}

async function fetchLatestJson(): Promise<LatestData> {
  const res = await fetch('/data/latest.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('수집 데이터를 불러오지 못했습니다. 잠시 후 새로고침 해보세요.');
  }
  return res.json();
}

export async function fetchLatest(): Promise<LatestData> {
  const mode = getDataMode();

  if (mode === 'mock') {
    return generateMockData();
  }

  if (mode === 'opendata') {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('열린데이터 광장 API 인증키를 입력해주세요.');
    }
    return fetchWithCache(() => fetchFromOpenData(apiKey));
  }

  // latest 모드: 수집된 data/latest.json
  return fetchWithCache(fetchLatestJson);
}

export function clearCache() {
  cache = null;
}
