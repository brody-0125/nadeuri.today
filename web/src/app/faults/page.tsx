import type { Metadata } from 'next';
import FaultsClient from './FaultsClient';

export const metadata: Metadata = {
  title: '현재 고장 역',
  description:
    '서울 지하철 엘리베이터, 에스컬레이터 등 현재 고장·점검 중인 역의 편의시설 상태를 확인하세요.',
  alternates: { canonical: '/faults/' },
  openGraph: {
    title: '현재 고장 역 | 나들이',
    description:
      '서울 지하철 엘리베이터, 에스컬레이터 등 현재 고장·점검 중인 역의 편의시설 상태를 확인하세요.',
    url: '/faults/',
  },
};

export default function FaultsPage() {
  return <FaultsClient />;
}
