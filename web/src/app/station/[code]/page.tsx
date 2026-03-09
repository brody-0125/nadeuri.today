import { STATIONS } from '@/lib/stations';
import StationDetailClient from './StationDetailClient';

export function generateStaticParams() {
  return STATIONS.map((s) => ({ code: s.code }));
}

export default async function StationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <StationDetailClient code={code} />;
}
