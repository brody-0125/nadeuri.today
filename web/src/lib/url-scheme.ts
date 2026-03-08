import { ExternalMapParams } from '@/types';

export function buildNaverMapUrl({ stationName }: ExternalMapParams): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(stationName + '역')}`;
}

export function buildKakaoMapUrl({ stationName }: ExternalMapParams): string {
  return `https://map.kakao.com/?q=${encodeURIComponent(stationName + '역')}`;
}

export function buildNaverDirectionsUrl({ stationName }: ExternalMapParams): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(stationName + '역')}`;
}

export function buildKakaoDirectionsUrl({ stationName, lat, lng }: ExternalMapParams): string {
  return `https://map.kakao.com/link/from/${encodeURIComponent(stationName + '역')},${lat},${lng}`;
}
