# 나들이 — 이동약자 실시간 안심 지도

서울 지하철 교통약자 편의시설(9종)의 실시간 가동 상태를 수집·저장·표시하는 정적 웹 서비스입니다.
1~9호선 및 신분당선 300개 이상 역의 접근성 시설 현황을 모니터링합니다.

**https://nadeuri.today**

## 수집 대상 시설

| 시설 | 유형 | 갱신주기 |
|------|------|----------|
| 엘리베이터 | 실시간 | 매시간 |
| 에스컬레이터 | 실시간 | 매시간 |
| 무빙워크 | 실시간 | 매시간 |
| 휠체어리프트 | 실시간 | 매시간 |
| 안전발판 | 실시간 | 매시간 |
| 장애인화장실 | 정적 | 일 1회 |
| 수어영상전화기 | 정적 | 일 1회 |
| 휠체어급속충전기 | 정적 | 일 1회 |
| 교통약자도우미 | 정적 | 일 1회 |

환경 데이터(대기질 — PM10, PM2.5)도 3시간마다 수집합니다.

## 기술 스택

- **데이터 수집**: Node.js 20 (ES Modules) + GitHub Actions (cron)
- **프론트엔드**: Next.js 14 (Static Export) + TypeScript + Tailwind CSS
- **호스팅**: GitHub Pages
- **데이터 소스**: 서울시 열린데이터광장 API

## 데이터 파이프라인

```
서울시 열린데이터광장 API
  → GitHub Actions (cron)
    → Node.js 수집 스크립트
      → data/realtime/*.json, data-static/*.json
        → build-latest.js
          → web/public/data/latest.json
            → Next.js 정적 사이트 (GitHub Pages)
```

| 워크플로우 | 주기 | 설명 |
|-----------|------|------|
| `collect-realtime.yml` | 매시간 (05:00~00:59 KST) | 실시간 시설 상태 수집 |
| `collect-static.yml` | 일 1회 (00:00 KST) | 정적 시설 정보 수집 |
| `collect-environment.yml` | 3시간 | 대기질 데이터 수집 |
| `deploy.yml` | push·수집 완료 시 | GitHub Pages 배포 |

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
npm run build-latest         # web/public/data/latest.json 생성
npm run validate             # 데이터 무결성 검증
```

### 자동 수집·병합 안전장치

- 실시간 수집 워크플로우·수집기·API 모듈·병합 도우미 코드가 main에 반영되면 실시간 수집을 즉시 실행합니다. 데이터 파일 변경은 이 push 트리거에서 제외하여 수집 PR 병합이 다시 수집을 호출하지 않도록 합니다. 정적·환경 수집은 기존 예약 및 수동 실행 방식을 유지합니다.
- 세 수집 워크플로우는 같은 concurrency 그룹에서 실행하며, 실제 실행 시 최신 main을 체크아웃합니다. GitHub는 실행 대기 작업을 하나만 유지하므로 동시에 여러 번 요청하면 이전 대기 작업이 취소될 수 있습니다.
- 수집 PR에는 각 수집기의 원본 데이터만 포함합니다. 공유 파일인 `web/public/data/latest.json`은 배포 시 병합된 main의 원본에서 다시 생성하고 검증합니다.
- 병합 가능한 CLEAN PR은 일반 squash 병합을 사용합니다. 검사·리뷰 등을 기다리는 PR만 auto-merge를 요청하며, 관리자 권한이나 보호 규칙 우회 옵션은 사용하지 않습니다.
- 약 2분 안에 실제 MERGED 상태를 확인하지 못하거나 충돌·권한 오류가 발생하면 수집 작업은 실패합니다. auto-merge 설정만으로 성공 처리하거나 새 데이터가 배포되었다고 표시하지 않습니다. 필요한 검사·리뷰를 해결하고 병합한 뒤 수집 또는 Deploy 워크플로우를 다시 실행하세요.
- `npm test --prefix scripts`로 병합 상태 회귀 테스트를 실행할 수 있습니다.

### 프로덕션 빌드

```bash
cd scripts && npm ci && npm run build-latest && npm run validate
cd ../web && npm ci && npm run build  # 정적 내보내기 → web/out/
```

### 환경변수

| 변수 | 용도 | 위치 |
|------|------|------|
| `SEOUL_API_KEY` | 서울시 열린데이터광장 API 키 | `scripts/.env` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 사이트 키 | `web/.env` |
| `NEXT_PUBLIC_GAS_URL` | Google Apps Script 배포 URL | `web/.env` |

## 프로젝트 구조

```
├── .github/workflows/     # GitHub Actions (수집 자동화·배포)
├── scripts/               # Node.js 수집 스크립트 (ES Modules)
│   ├── api/               #   시설별 API 모듈 (elevator.js, escalator.js, …)
│   └── config/            #   API 엔드포인트 설정
├── data/
│   └── realtime/          # 실시간 수집 데이터 (변경 시 덮어쓰기)
├── data-static/           # 정적 시설·대기질 데이터
├── web/                   # Next.js 프론트엔드
│   └── src/
│       ├── app/           #   App Router 페이지
│       │   ├── page.tsx          # 메인 (역 목록·검색·필터)
│       │   ├── station/[code]/   # 역 상세
│       │   ├── route/            # 노선별 보기
│       │   ├── archive/          # 아카이브
│       │   └── about/            # 소개
│       ├── components/    #   UI 컴포넌트
│       ├── lib/           #   데이터·검색·테마 유틸리티
│       └── types/         #   TypeScript 타입 정의
└── CLAUDE.md              # Claude Code 가이드
```

## 라이선스

MIT
