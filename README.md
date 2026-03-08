# 나들이 — 이동약자 실시간 안심 지도

서울 지하철 교통약자 편의시설(9종)의 실시간 가동 상태를 수집·저장·표시하는 정적 웹 서비스입니다.
1~9호선 및 신분당선 300개 이상 역의 접근성 시설 현황을 모니터링합니다.

🔗 **https://nadeuri.today**

## 수집 대상 시설

| 시설 | 유형 | 갱신주기 |
|------|------|----------|
| 엘리베이터 | 실시간 | 15분 |
| 에스컬레이터 | 실시간 | 15분 |
| 무빙워크 | 실시간 | 15분 |
| 휠체어리프트 | 실시간 | 15분 |
| 안전발판 | 실시간 | 15분 |
| 장애인화장실 | 정적 | 일 1회 |
| 수어영상전화기 | 정적 | 일 1회 |
| 휠체어급속충전기 | 정적 | 일 1회 |
| 교통약자도우미 | 정적 | 일 1회 |

환경 데이터(대기질 — PM10, PM2.5)도 매시간 수집합니다.

## 기술 스택

- **데이터 수집**: Node.js (ES Modules) + GitHub Actions (cron)
- **프론트엔드**: Next.js 14 (Static Export) + TypeScript + Tailwind CSS
- **호스팅**: GitHub Pages
- **데이터 소스**: 서울시 열린데이터광장 API

## 데이터 파이프라인

```
서울시 열린데이터광장 API
  → GitHub Actions (cron)
    → Node.js 수집 스크립트
      → data/YYYY-MM-DD/HH-MM/*.json
        → build-latest.js
          → data/latest.json
            → Next.js 정적 사이트 (GitHub Pages)
```

| 워크플로우 | 주기 | 설명 |
|-----------|------|------|
| `collect-realtime.yml` | 15분 | 실시간 시설 상태 수집 |
| `collect-static.yml` | 일 1회 | 정적 시설 정보 수집 |
| `collect-environment.yml` | 매시간 | 대기질 데이터 수집 |
| `deploy.yml` | push 시 | GitHub Pages 배포 |
| `cleanup.yml` | 일 1회 | 7일 이상 경과 데이터 정리 |

## 로컬 개발

```bash
# 웹 개발 서버
cd web && npm install
npm run dev
```

### 데이터 수집 (선택)

```bash
cd scripts && npm install

# 환경변수 설정
echo "SEOUL_API_KEY=your_key_here" > .env

# 수집 실행
npm run collect              # 실시간 시설 수집
npm run collect-static       # 정적 시설 수집
npm run build-latest         # data/latest.json 생성
npm run validate             # 데이터 무결성 검증
```

### 프로덕션 빌드

```bash
cd web && npm run build  # 정적 내보내기 → web/out/
```

### 환경변수

| 변수 | 용도 | 위치 |
|------|------|------|
| `SEOUL_API_KEY` | 서울시 열린데이터광장 API 키 | `scripts/.env` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 사이트 키 | `web/.env` |
| `NEXT_PUBLIC_GAS_URL` | Google Apps Script 배포 URL | `web/.env` |

## 프로젝트 구조

```
├── .github/workflows/     # GitHub Actions (수집 자동화·배포·정리)
├── scripts/               # Node.js 수집 스크립트 (ES Modules)
│   ├── api/               #   시설별 API 모듈 (elevator.js, escalator.js, …)
│   └── config/            #   API 엔드포인트 설정
├── data/                  # 수집 데이터 (YYYY-MM-DD/HH-MM/)
├── web/                   # Next.js 프론트엔드
│   └── src/
│       ├── app/           #   App Router 페이지 (메인, 역 상세, 소개, 아카이브, 노선)
│       ├── components/    #   UI 컴포넌트
│       ├── lib/           #   데이터·검색·테마 유틸리티
│       └── types/         #   TypeScript 타입 정의
└── CLAUDE.md              # Claude Code 가이드
```

## 라이선스

MIT
