'use client';

import { StationMeta } from '@/types';
import {
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
    <div role="group" aria-label="길찾기">
      <div className="flex gap-3">
        <a
          href={buildNaverDirectionsUrl(params)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-border rounded-lg text-sm text-text-secondary hover:border-text-primary transition-colors min-h-[44px]"
          aria-label={`네이버 지도에서 ${station.name}역 길찾기 열기 (외부 앱)`}
        >
          네이버 길찾기
          <span className="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
        </a>
        <a
          href={buildKakaoDirectionsUrl(params)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-border rounded-lg text-sm text-text-secondary hover:border-text-primary transition-colors min-h-[44px]"
          aria-label={`카카오맵에서 ${station.name}역 길찾기 열기 (외부 앱)`}
        >
          카카오 길찾기
          <span className="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
        </a>
      </div>
    </div>
  );
}
