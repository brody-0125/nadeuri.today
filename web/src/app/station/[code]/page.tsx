import type { Metadata } from 'next';
import { STATIONS, getStation } from '@/lib/stations';
import { BreadcrumbJsonLd } from 'next-seo';
import StationDetailClient from './StationDetailClient';

const LINE_NAMES: Record<string, string> = {
  '1': '1호선', '2': '2호선', '3': '3호선', '4': '4호선',
  '5': '5호선', '6': '6호선', '7': '7호선', '8': '8호선', '9': '9호선',
  S: '우이신설선',
};

function stationLabel(name: string): string {
  return name.endsWith('역') ? name : `${name}역`;
}

export function generateStaticParams() {
  return STATIONS.map((s) => ({ code: s.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const station = getStation(code);

  if (!station) {
    return { title: '존재하지 않는 역' };
  }

  const lineText = station.lines.map((l) => LINE_NAMES[l] ?? `${l}호선`).join(' · ');
  const title = `${stationLabel(station.name)} 편의시설 현황`;
  const description = `${stationLabel(station.name)}(${lineText}) 엘리베이터, 에스컬레이터 등 교통약자 편의시설의 실시간 운행 상태를 확인하세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/station/${code}/`,
    },
    openGraph: {
      title: `${stationLabel(station.name)} 편의시설 현황 | 나들이`,
      description,
      url: `/station/${code}/`,
    },
  };
}

export default async function StationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const station = getStation(code);
  const stationName = station?.name ?? code;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: '홈', item: 'https://nadeuri.today/' },
          {
            name: `${stationLabel(stationName)}`,
            item: `https://nadeuri.today/station/${code}/`,
          },
        ]}
      />
      <StationDetailClient code={code} />
    </>
  );
}
