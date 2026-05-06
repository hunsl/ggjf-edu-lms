-- ============================================================
-- 경기북부 학사관리 시스템 - Supabase 초기 설정 SQL
-- Supabase 대시보드 → SQL Editor 에서 전체 실행하세요.
-- ============================================================

-- ── 증명서 발급이력 테이블 ──────────────────────────────────
-- 발급번호와 이력을 여러 기기/사용자 간에 공유하기 위해 사용합니다.
CREATE TABLE IF NOT EXISTS cert_issuances (
  id           TEXT        PRIMARY KEY,
  student_id   INTEGER,
  student_name TEXT,
  course_id    INTEGER,
  course_name  TEXT,
  doc_type     TEXT,        -- 'cert' | 'attend' | 'parti'
  cert_no      TEXT,
  full_no      TEXT,
  issue_date   TEXT,
  issued_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화 (필요 시 정책 추가)
ALTER TABLE cert_issuances ENABLE ROW LEVEL SECURITY;

-- anon 키로 읽기/쓰기 허용 (관리자 전용 내부 시스템)
CREATE POLICY IF NOT EXISTS "cert_issuances_all" ON cert_issuances
  FOR ALL USING (true) WITH CHECK (true);

-- ── 훈련생 테이블 신규 컬럼 추가 (기존 DB 마이그레이션) ────────
-- enrollment_status: 재학중 / 수료 / 중도탈락 / 조기취업
-- accumulated_hours: 누적 훈련시간 (출결 기록 기반)
-- status_change_date: 상태 변경일 (조기취업/중도탈락 시 활용)
-- dropout_reason: 중도탈락 사유
-- employer_name: 취업처명
ALTER TABLE students ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT '재학중';
ALTER TABLE students ADD COLUMN IF NOT EXISTS accumulated_hours NUMERIC DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status_change_date TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS dropout_reason TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS employer_name TEXT;

-- ── 강사 테이블 신규 컬럼 추가 (기존 DB 마이그레이션) ────────
-- category: 경기도 강사 / 외부 강사 구분
-- hourly_rate: 시간당 강사료 단가
-- custom_dates: 강사별 과정별 커스텀 수업일 (JSON: {"courseId": ["2026-04-01","2026-04-10"]})
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '경기도 강사';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 0;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS custom_dates JSONB DEFAULT '{}';
