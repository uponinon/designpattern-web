# DesignPatternProject_web

Java Swing으로 구현된 **강의실 예약/물품 대여 시스템**을, DB 연결 없이도 동작하는 **React 기반 웹 포트폴리오**로 단계적으로 이식하는 프로젝트입니다.

- 원본(기존): `app/` (Java Swing)
- 웹(신규): `web-frontend/` (Vite + React + TypeScript + Tailwind)

## 현재 진행 상황(요약)

### 1) Git / 브랜치
- 원격 저장소: `https://github.com/uponinon/designpattern-web.git`
- 브랜치 운영 방식
  - `main`: 안정 버전
  - `webtest`: 웹 프런트 초기 구현(뼈대 + 더미 기능)
  - `feature`: GitHub에서 생성한 브랜치(현재 로컬에서 체크아웃 가능)

원격 브랜치로 올리기:
```bash
git push -u origin webtest:webtest
```
PR은 “main에 합칠까요?” 절차이며, **머지 전까지는 main에 영향이 없습니다.** PR을 열어두고 `webtest`에 커밋을 추가 푸시하면 PR이 자동 업데이트됩니다.

### 2) 웹 프런트(React) 기본 세팅 완료
- 생성 위치: `web-frontend/`
- 기술 스택: Vite + React + TS + Tailwind (v3.4)
- 라우팅/레이아웃/페이지 기본 구성 완료
- 더미 데이터 기반으로 Swing 핵심 흐름 일부를 웹에서 재현

### 3) 구현된 기능(더미/가짜 API 기반)
- 강의실 예약
  - 강의실 목록/필터
  - 예약 생성(날짜/시간 입력)
  - 같은 강의실/같은 날짜에 시간 겹침(Overlap) 검증
- 물품 대여
  - 물품 선택 및 기간 입력
  - 재고(stock) 기반 대여 가능 여부 체크
- 내 예약/대여
  - 내 목록 조회
  - 강의실 예약 취소
  - 물품 반납 처리
- 관리자(현재는 접근 제어 없음: 개선 필요)
  - 강의실/물품 추가
  - 강의실 활성(available) 토글
  - 강의실/물품 삭제
  - 전체 예약 리스트 열람

## 실행 방법

### 1) Node / npm PATH 이슈(Windows)
Node 설치 직후 터미널에서 `npm`이 인식되지 않으면, 아래 중 하나를 사용하세요.

- 새 터미널 열기 → `node -v`, `npm -v` 확인
- CMD에서 임시 PATH 설정:
```bat
set "PATH=C:\Program Files\nodejs;%PATH%"
```
- PowerShell에서 임시 PATH 설정:
```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

### 2) 개발 서버
```bash
cd web-frontend
npm install
npm run dev
```

빌드 확인:
```bash
npm run build
```

## 웹 코드 구조(핵심 파일)

- 라우팅 엔트리: `web-frontend/src/App.tsx`
- 전역 상태(더미 데이터/액션): `web-frontend/src/state/AppState.tsx`
- 가짜 API(in-memory DB): `web-frontend/src/services/fakeApi.ts`
- 도메인 타입: `web-frontend/src/types.ts`
- 레이아웃/상단 사용자 전환: `web-frontend/src/components/Layout.tsx`
- 페이지
  - 홈: `web-frontend/src/pages/HomePage.tsx`
  - 강의실 예약: `web-frontend/src/pages/RoomsPage.tsx`
  - 내 예약/대여: `web-frontend/src/pages/ReservationsPage.tsx`
  - 관리자: `web-frontend/src/pages/AdminPage.tsx`

## Swing 기능 대비 체크리스트(다음 구현 우선순위)

Swing 소스 기준으로 웹에서 추가로 구현하면 좋은 핵심 기능(우선순위 순):

1) **타임라인/캘린더 뷰(주/일 단위)**
- Swing: `app/ui/Main/RoomTimelinePanel.java`
- 웹: 선택한 강의실에 대해 날짜 헤더 + 시간 슬롯을 보여주고, 슬롯 클릭 → 예약 생성 흐름으로 연결

2) **로그인 화면/권한 분리(학생 vs 관리자)**
- Swing: `LoginPanel`, `AdminPanelMain`
- 웹: `/admin` 접근 제한, 사용자 role 기반 UI/액션 제한

3) **예약 상세/메모(eventName) 및 수정 흐름**
- Swing: 예약 팝업/내 예약 패널
- 웹: 예약 상세 모달, 수정/취소/반납 UX

4) **물품 대여 기간/정책 강화**
- Swing: `rentalPeriod` 개념
- 웹: 기간 제한, 반납 기한 표시, 연체 상태(선택)

5) **데이터 영속화(선택)**
- DB 없이 진행 시: `localStorage` 저장으로 새로고침 후에도 유지
- 추후 백엔드 연결 시: `fakeApi`를 실제 API 클라이언트로 교체

## Codex(이 도구)로 이어서 작업하는 방법

Codex는 세션이 바뀌면 대화 내용을 자동으로 “기억”하지 못할 수 있습니다.
대신 이 README를 **프로젝트 컨텍스트 저장소**로 사용하면, 다음에 바로 이어서 작업할 수 있습니다.

다음에 Codex에게 이렇게 요청하세요:

> `README.md`를 읽고, 지금까지 구현된 React 웹(더미 API 기반)에서 다음 우선순위 기능(예: 타임라인/캘린더 뷰 + 관리자 접근 제한)을 구현해줘.

필요하면 함께 알려줄 정보:
- 현재 작업 브랜치 이름
- 원하는 다음 기능(예: “RoomTimelinePanel과 같은 주간 타임라인부터”) 
- UI 선호(일/주, 시간 슬롯 단위 30분/1시간 등)

---

## 메모
- Git에서 `LF will be replaced by CRLF` 경고는 Windows 줄바꿈 변환 안내이며 보통 무시해도 됩니다. (팀 규칙에 맞게 `.gitattributes`로 고정 가능)
