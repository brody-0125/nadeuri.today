'use client';

import { useTranslations } from 'next-intl';
import { AirQualityGrade, EnvironmentData } from '@/types';

interface EnvironmentBannerProps {
  environment?: EnvironmentData;
}

const GRADE_PRIORITY: Record<AirQualityGrade, number> = {
  좋음: 0,
  보통: 1,
  나쁨: 2,
  매우나쁨: 3,
};

const GRADE_STYLES: Record<AirQualityGrade, { text: string; badge: string }> = {
  좋음: {
    text: 'text-blue-500 dark:text-blue-400',
    badge: 'border-blue-500/20 bg-blue-500/10 dark:border-blue-400/30 dark:bg-blue-400/15',
  },
  보통: {
    text: 'text-green-600 dark:text-green-400',
    badge: 'border-green-600/20 bg-green-600/10 dark:border-green-400/30 dark:bg-green-400/15',
  },
  나쁨: {
    text: 'text-orange-500 dark:text-orange-400',
    badge: 'border-orange-500/20 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-400/15',
  },
  매우나쁨: {
    text: 'text-red-500 dark:text-red-400',
    badge: 'border-red-500/20 bg-red-500/10 dark:border-red-400/30 dark:bg-red-400/15',
  },
};

const GRADE_TRANSLATION_KEY: Record<AirQualityGrade, string> = {
  좋음: 'good',
  보통: 'moderate',
  나쁨: 'bad',
  매우나쁨: 'veryBad',
};

function getWorseGrade(pm10Grade: AirQualityGrade, pm25Grade: AirQualityGrade): AirQualityGrade {
  return GRADE_PRIORITY[pm10Grade] >= GRADE_PRIORITY[pm25Grade] ? pm10Grade : pm25Grade;
}

export default function EnvironmentBanner({ environment }: EnvironmentBannerProps) {
  const t = useTranslations('environment');

  if (!environment) {
    return null;
  }

  const backgroundGrade = getWorseGrade(environment.pm10_grade, environment.pm25_grade);
  const backgroundStyles = GRADE_STYLES[backgroundGrade];

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${backgroundStyles.badge}`}
      aria-label={t('airQuality')}
    >
      <p className="whitespace-nowrap text-[13px] font-medium text-text-primary sm:text-sm">
        {t('fineDust')}{' '}
        <span className="font-mono">PM10: {environment.pm10}</span>{' '}
        <span className={GRADE_STYLES[environment.pm10_grade].text}>
          {t(GRADE_TRANSLATION_KEY[environment.pm10_grade] as 'good' | 'moderate' | 'bad' | 'veryBad')}
        </span>
        <span className="px-2 text-text-secondary">·</span>
        <span className="font-mono">PM2.5: {environment.pm25}</span>{' '}
        <span className={GRADE_STYLES[environment.pm25_grade].text}>
          {t(GRADE_TRANSLATION_KEY[environment.pm25_grade] as 'good' | 'moderate' | 'bad' | 'veryBad')}
        </span>
      </p>
    </div>
  );
}
