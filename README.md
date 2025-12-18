# DesignPatternProject_web

Java Swing으로 구현된 **강의실 예약/물품 대여 시스템**을 **React 기반 웹**으로 단계적으로 이식하는 프로젝트입니다.  
현재 웹은 백엔드 없이 동작하며(브라우저 로컬 저장), 시연 가능한 흐름을 우선 구현했습니다.

- 원본(기존): `app/` (Java Swing)
- 웹(신규): `web-frontend/` (Vite + React + TypeScript + Tailwind)

## 웹 구현 기능(요약)

### 인증/계정
- 로그인: 학번/비밀번호 로그인
- 회원가입 입력 검증
  - 아이디(학번): 숫자만
  - 실명: 한글/영문만(숫자 불가, IME 조합 입력 지원)
  - 비밀번호: 한글 입력 불가
- 권한
  - 학생: 강의실 예약, 물품 대여, 내역 조회/취소/반납
  - 관리자: `/admin`, `/admin/tools` 접근 가능 (role 기반 보호)

### 강의실 예약
- 강의실 목록/필터(크기, 설비, 사용 가능 여부)
- 날짜 선택 + **1시간 단위 타임테이블(08:00~22:00)**로 시간 선택
- 이미 예약된 시간은 비활성(선택 불가)
- 동일 강의실/동일 날짜 기준 시간 겹침(Overlap) 검증

### 물품 대여
- 기간 선택(시작/종료)
- 재고(stock) 기반 대여 가능 여부 체크
- 대여 취소/반납 처리

### 관리자 기능
- 강의실/물품 추가
- 강의실 활성(available) 토글
- 강의실/물품 삭제
- 전체 예약 리스트 열람

## 데이터 저장(백엔드 없음)
웹 데이터는 브라우저에 저장됩니다.

- 저장소: **IndexedDB** (`dku-room-booker`)
- 저장되는 데이터: `users`, `rooms`, `items`, `reservations`
- 기존 `localStorage` 사용자 데이터(`dku-room-booker:users`)가 있으면 최초 1회 자동으로 가져옵니다.

초기화(데이터 리셋)가 필요하면 브라우저 DevTools에서 **Application → Storage/IndexedDB**에서 사이트 데이터 삭제를 사용하세요.

## 실행 방법(웹 프런트)

### 개발 서버
```bash
cd web-frontend
npm install
npm run dev
```

PowerShell 실행 정책으로 `npm.ps1`이 막히는 경우:
```powershell
cd web-frontend
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```

기본 접속: `http://127.0.0.1:5173`

### 빌드/프리뷰
```bash
cd web-frontend
npm run build
npm run preview
```

## 테스트 계정
- 관리자
  - `99999999` / `99999999`
  - `9999` / `9999`
- 학생(예시)
  - `20250001` / `20250001`

## 웹 코드 구조(핵심 파일)

- 라우팅 엔트리: `web-frontend/src/App.tsx`
- 전역 상태: `web-frontend/src/state/AppState.tsx`
- 가짜 API(브라우저 저장): `web-frontend/src/services/fakeApi.ts`
- IndexedDB KV 유틸: `web-frontend/src/services/idbKV.ts`
- 도메인 타입: `web-frontend/src/types.ts`
- 레이아웃: `web-frontend/src/components/Layout.tsx`
- 날짜/시간(타임테이블) 선택: `web-frontend/src/components/DateTimePicker.tsx`
- 페이지
  - 랜딩: `web-frontend/src/pages/LandingPage.tsx`
  - 로그인/회원가입: `web-frontend/src/pages/LoginPage.tsx`, `web-frontend/src/pages/SignupPage.tsx`
  - 강의실 예약: `web-frontend/src/pages/RoomsPage.tsx`
  - 내 예약/대여: `web-frontend/src/pages/ReservationsPage.tsx`
  - 관리자 홈/도구: `web-frontend/src/pages/HomePage.tsx`, `web-frontend/src/pages/AdminPage.tsx`
  - 공지사항: `web-frontend/src/pages/NoticesPage.tsx`

## 다음 작업(아이디어)
- 주/일 단위 타임라인 뷰(강의실별 캘린더 확장)
- 예약 상세(메모/목적) 수정 및 UX 개선
- 관리자 전용 예약 취소/강제 반납 처리
- 실제 백엔드(DB/API) 연동 시 `fakeApi`를 API 클라이언트로 교체

## 메모
- Git의 `LF will be replaced by CRLF` 경고는 Windows 줄바꿈 변환 안내이며 보통 무시해도 됩니다.
