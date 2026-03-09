'use client';

import Link from 'next/link';

export default function ArchivePage() {
  return (
    <>
      <nav className="bg-surface-cream border-b border-border-cream" aria-label="상단 탐색">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">subway</span>
            <span className="font-serif font-bold text-xl text-text-main tracking-tight">나들이</span>
          </Link>
          <Link href="/" className="text-sm text-text-muted hover:text-primary transition-colors flex items-center gap-1">
            대시보드로 돌아가기
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
          <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">inventory_2</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-text-main mb-3">데이터 아카이브</h1>
        <p className="font-serif text-lg text-text-muted italic mb-8">준비 중</p>
        <div className="bg-surface-cream border border-border-cream rounded-lg p-8 text-left max-w-md mx-auto">
          <p className="text-text-main text-sm leading-relaxed">
            과거 이동편의시설 운행 기록을 조회할 수 있는 기능이 곧 제공될 예정입니다. 고장 이력, 가동률 추이 등 데이터를 투명하게 공개합니다.
          </p>
        </div>
      </main>
    </>
  );
}
