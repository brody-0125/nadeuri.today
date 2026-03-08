import { STATIONS } from '@/lib/stations';
import StationDetailClient from './StationDetailClient';

export function generateStaticParams() {
  return STATIONS.map((s) => ({ code: s.code }));
}

export default function StationPage({ params }: { params: { code: string } }) {
  return <StationDetailClient code={params.code} />;
}
