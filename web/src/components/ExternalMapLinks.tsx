'use client';

import { useTranslations } from 'next-intl';
import { StationMeta } from '@/types';
import {
  buildNaverDirectionsUrl,
  buildKakaoDirectionsUrl,
} from '@/lib/url-scheme';

interface ExternalMapLinksProps {
  station: StationMeta;
}

export default function ExternalMapLinks({ station }: ExternalMapLinksProps) {
  const t = useTranslations('maps');

  const params = {
    stationName: station.name,
    lat: station.lat,
    lng: station.lng,
  };

  return (
    <div role="group" aria-label={t('directions')}>
      <div className="flex gap-3">
        <a
          href={buildNaverDirectionsUrl(params)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-border rounded-lg text-sm text-text-secondary hover:border-text-primary transition-colors min-h-[44px]"
          aria-label={t('naverAriaLabel', { name: station.name })}
        >
          {t('naver')}
          <span className="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
        </a>
        <a
          href={buildKakaoDirectionsUrl(params)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-border rounded-lg text-sm text-text-secondary hover:border-text-primary transition-colors min-h-[44px]"
          aria-label={t('kakaoAriaLabel', { name: station.name })}
        >
          {t('kakao')}
          <span className="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
        </a>
      </div>
    </div>
  );
}
