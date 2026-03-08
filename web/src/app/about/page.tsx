'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function AboutPage() {
  return (
    <>
      {/* Navbar */}
      <nav className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-status-operating hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-3xl">subway</span>
            <span className="font-serif font-bold text-xl text-text-primary tracking-tight">나들이</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm text-text-secondary hover:text-status-operating transition-colors flex items-center gap-1">
              홈으로
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-status-operating/10 rounded-full mb-6">
            <span className="material-symbols-outlined text-status-operating text-3xl">handshake</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-3">
            데이터 출처 및 투명성
          </h1>
          <p className="font-serif text-lg text-text-secondary">투명하고 신뢰할 수 있는 정보를 제공해요</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-text-primary leading-relaxed">
          <p>
            나들이는 서울 지하철 실시간 API에 직접 연결해 엘리베이터와 에스컬레이터의 상태를 전달해요. 공공데이터를 쉽고 빠르게 확인할 수 있도록 도와드려요.
          </p>
          <p>
            나들이에서 보여드리는 모든 정보는{' '}
            <a
              href="https://data.seoul.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-status-operating font-medium hover:underline"
            >
              서울 열린 데이터 광장
            </a>
            에서 직접 가져와요. 공식 정부 데이터를 기반으로 하고 있어요.
          </p>
          <p>
            서버는 60초마다 최신 데이터를 확인해요. 엘리베이터가 고장 나거나 점검에 들어가면, 거의 실시간으로 반영돼요.
          </p>

          {/* System Status Card */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-operating" />
                <span className="text-sm font-medium text-text-primary">시스템 상태</span>
              </div>
              <span className="text-xs font-mono text-text-secondary">마지막 확인: 방금 전</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1">
                  <span className="material-symbols-outlined text-xs">settings</span>
                  출처
                </div>
                <p className="font-mono text-lg font-medium text-text-primary">서울 지하철</p>
                <span className="text-xs text-status-operating font-medium">공식 API</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1">
                  <span className="material-symbols-outlined text-xs">speed</span>
                  지연 시간
                </div>
                <p className="font-mono text-lg font-medium text-text-primary">&lt; 60s</p>
                <span className="text-xs text-status-operating font-medium">연결 안정적</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1">
                  갱신 주기
                </div>
                <p className="font-mono text-lg font-medium text-text-primary">60s</p>
                <span className="text-xs text-text-secondary">자동 갱신</span>
              </div>
            </div>
          </div>

          {/* Accuracy Note */}
          <div className="border-l-4 border-status-maintenance bg-status-maintenance-bg rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-status-maintenance text-base">warning</span>
              <span className="font-bold text-text-primary">정확성에 관한 안내</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              최대한 정확한 정보를 제공하려 노력하지만, 현장 상황이 더 빠르게 변할 수 있어요. 갑작스러운 장애는 시스템에 반영되기까지 몇 분이 걸릴 수 있어요. 불확실한 경우 역 직원에게 확인해 주세요.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center pb-8">
          <div className="flex justify-center gap-4 text-sm text-text-secondary">
            <span>나들이 프로젝트</span>
          </div>
        </footer>
      </main>
    </>
  );
}
