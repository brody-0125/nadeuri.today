'use client';

import { StationMeta } from '@/types';
import {
  buildNaverMapUrl,
  buildKakaoMapUrl,
  buildNaverDirectionsUrl,
  buildKakaoDirectionsUrl,
} from '@/lib/url-scheme';

interface ExternalMapLinksProps {
  station: StationMeta;
}

export default function ExternalMapLinks({ station }: ExternalMapLinksProps) {
  const params = {
    stationName: station.name,
    lat: station.lat,
    lng: station.lng,
  };

  return (
    <div className="space-y-4">
      {/* 길찾기 Primary CTA */}
      <div role="group" aria-label="길찾기">
        <div className="space-y-3">
          <a
            href={buildNaverDirectionsUrl(params)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-status-operating text-white rounded-lg text-sm font-semibold hover:bg-status-operating/90 transition-colors min-h-[56px]"
            aria-label={`네이버 지도에서 ${station.name}역 길찾기 열기 (외부 앱)`}
          >
            <span className="material-symbols-outlined text-base">directions</span>
            네이버 지도로 길찾기
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
          <a
            href={buildKakaoDirectionsUrl(params)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-status-operating text-white rounded-lg text-sm font-semibold hover:bg-status-operating/90 transition-colors min-h-[56px]"
            aria-label={`카카오맵에서 ${station.name}역 길찾기 열기 (외부 앱)`}
          >
            <span className="material-symbols-outlined text-base">directions</span>
            카카오맵으로 길찾기
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>

      {/* 지도보기 Secondary */}
      <div role="group" aria-label="지도에서 보기">
        <div className="flex gap-3">
          <a
            href={buildNaverMapUrl(params)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-border rounded-lg text-sm text-text-secondary hover:border-text-primary transition-colors min-h-[44px]"
            aria-label={`네이버 지도에서 ${station.name}역 보기 (외부 앱)`}
          >
            네이버 지도
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
          <a
            href={buildKakaoMapUrl(params)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-border rounded-lg text-sm text-text-secondary hover:border-text-primary transition-colors min-h-[44px]"
            aria-label={`카카오맵에서 ${station.name}역 보기 (외부 앱)`}
          >
            카카오맵
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
}
