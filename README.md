# 경기북부 직업교육 학사관리시스템

경기도일자리재단 북부사업본부 직업교육 훈련과정 학사관리 시스템 (2026)

## 🚀 주요 기능

| 탭 | 기능 |
|---|---|
| 📊 대시보드 | KPI 현황, 위험 훈련생 목록, 과정별 진행상황 |
| 📚 과정 현황 | 과정 CRUD, PDF 첨부, 링크 관리, 카테고리 필터 |
| 👥 훈련생 관리 | 훈련생 CRUD, 엑셀 일괄 업로드/내보내기, 면접 점수 |
| 👨‍🏫 강사 관리 | 강사 CRUD, 담당 과정 연결, 연락처 관리 |
| 🏫 강의실 관리 | 강의실 CRUD, 월간 캘린더, 예약 일정, 중복 감지 |
| ✅ 출결 관리 | **QR 코드 출석** + 수동 입력, 실시간 WebSocket 동기화 |
| 🎓 수료 관리 | 출석률 기반 자동 판정, 수동 조정, 수료율 통계 |
| 📄 증명서 발급 | 수료증 + 수강증명서 PDF 인쇄 |
| 💾 데이터 관리 | 엑셀 백업, JSON 내보내기, 데이터 초기화 |

## 📱 QR 출석 방식

1. 담당자가 **출결 관리** 탭에서 과정·날짜·입실/퇴실 선택
2. QR 코드가 화면에 표시됨 (강단 스크린에 띄우기)
3. 학생이 스마트폰으로 QR 스캔 → 체크인 페이지 이동
4. 학번 또는 이름 입력 → 출결 DB에 자동 저장
5. 담당자 화면에 **실시간 반영** (WebSocket 구독)

> 모바일 체크인 URL 예시:  
> `https://hunsl.github.io/ggjf-edu-lms/?mode=checkin&c=JY-01&d=2026-03-02&type=in`

## 🛠️ 배포 방법

### GitHub Pages (권장)

```bash
# 1. 이 저장소를 Fork 또는 Clone
# 2. index.html을 저장소 루트에 유지
# 3. GitHub Settings → Pages → Source: main branch / root
# 4. 배포 완료: https://<username>.github.io/<repo>/
```

### Supabase 설정

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. `schema.sql` 을 Supabase SQL Editor에서 실행
3. `index.html` 상단의 `SB_URL` 과 `SB_KEY` 를 본인 프로젝트 값으로 교체

```javascript
const SB_URL = "https://YOUR-PROJECT.supabase.co";
const SB_KEY = "YOUR-ANON-KEY";
```

4. **Database → Replication** 에서 `students`, `courses`, `attendance` 테이블 Realtime 활성화

### 기본 계정

| 계정 | 비밀번호 | 역할 |
|---|---|---|
| 관리자 | `gjf2026` | admin (계정 관리 포함) |
| 담당자 | `gjf1234` | staff |

> ⚠️ 운영 전 반드시 비밀번호를 변경하세요.

## 📋 기술 스택

- **Frontend**: React 18 (CDN), Babel Standalone
- **Backend**: Supabase (PostgreSQL + Realtime WebSocket)
- **라이브러리**: SheetJS (xlsx), api.qrserver.com (QR 생성)
- **배포**: GitHub Pages (단일 HTML 파일)

## 📁 파일 구조

```
ggjf-edu-lms/
├── index.html              ← 메인 앱 (단일 HTML 배포 파일)
├── 경기북부_학사관리_v3.jsx  ← JSX 소스 (개발용)
├── schema.sql              ← Supabase DB 스키마
└── README.md
```