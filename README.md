# Nexdo (Todo List)

React + TypeScript + Vite 기반 투두/프로젝트 관리 UI입니다.

## 로컬 실행

### 요구사항
- Node.js `^20.19.0 || >=22.12.0` (Vite 7 요구사항)
- npm (lockfile 기준으로 `npm install` / `npm ci` 사용)

### 설치
```bash
npm install
```

### 개발 서버 (디버깅용, 비-미니파이 에러 메시지)
```bash
npm run dev
```
- 기본 접속: `http://localhost:5173`

### 프로덕션 빌드/프리뷰 (배포 환경과 최대한 동일)
```bash
npm run build
npm run preview
```
- 기본 접속: `http://localhost:4173`

### 품질 체크
```bash
npm run lint
```

## 디버깅 팁
- 배포 환경에서 `Minified React error #...`가 나오면 로컬에서 `npm run dev`로 재현하면 풀 에러/스택을 확인할 수 있습니다.
- 라우팅/렌더링 중 예외가 발생하면 `errorElement`로 커스텀 에러 페이지(`src/pages/ErrorPage.tsx`)가 표시됩니다.

## 데이터 저장
- 현재 데이터는 브라우저 `localStorage`에 저장됩니다.
  - `nexdo-tasks`
  - `nexdo-projects`
