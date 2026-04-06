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
