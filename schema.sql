-- ═══════════════════════════════════════════════════════════
-- 경기북부 직업교육 학사관리시스템 — Supabase DB 스키마
-- ═══════════════════════════════════════════════════════════
-- 실행 순서: Supabase Dashboard → SQL Editor → 아래 SQL 순서대로 실행

-- ──────────────────────────────────────────────────
-- 1. accounts (계정)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id    BIGSERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  role  TEXT NOT NULL DEFAULT 'staff',  -- 'admin' | 'staff'
  pw    TEXT NOT NULL
);

-- 기본 계정 — 반드시 배포 전에 비밀번호를 변경하고 해시 처리 권장
-- ⚠️  현재는 데모용 평문 저장 방식입니다.
--    운영 환경에서는 pgcrypto 등을 사용한 해시 저장을 권장합니다.
--    예: crypt('gjf2026', gen_salt('bf'))
INSERT INTO accounts (name, role, pw) VALUES
  ('관리자', 'admin', 'gjf2026'),
  ('담당자', 'staff',  'gjf1234')
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────
-- 2. courses (과정)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id              BIGSERIAL PRIMARY KEY,
  cat             TEXT NOT NULL,
  cc              TEXT NOT NULL DEFAULT '#EA580C',
  name            TEXT NOT NULL,
  code            TEXT UNIQUE NOT NULL,
  date_from       DATE,
  date_to         DATE,
  period          TEXT,
  method          TEXT NOT NULL DEFAULT '대면',
  hours           INT  NOT NULL DEFAULT 0,
  tgt             INT  NOT NULL DEFAULT 20,
  c_goal          INT  NOT NULL DEFAULT 18,
  e_goal          INT  NOT NULL DEFAULT 12,
  sched_days      TEXT,
  sched_time_from TIME,
  sched_time_to   TIME,
  notes           TEXT,
  pdf_name        TEXT,
  pdf_data        TEXT,
  links           JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_cat  ON courses(cat);

-- ──────────────────────────────────────────────────
-- 3. students (훈련생)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id          BIGSERIAL PRIMARY KEY,
  cid         BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name        TEXT   NOT NULL,
  gender      TEXT,
  birth       DATE,
  id_back     TEXT,
  phone       TEXT,
  phone_emer  TEXT,
  addr_city   TEXT,
  addr_dong   TEXT,
  edu         TEXT,
  major       TEXT,
  career      TEXT,
  certs       TEXT,
  itv_date    DATE,
  itv_score   INT,
  itv_grade   TEXT,
  itv_pass    BOOLEAN NOT NULL DEFAULT FALSE,
  memo        TEXT,
  rate        INT     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_cid  ON students(cid);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

-- ──────────────────────────────────────────────────
-- 4. attendance (출결)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id          BIGSERIAL PRIMARY KEY,
  student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  cid         BIGINT NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  date        DATE   NOT NULL,
  type        TEXT   NOT NULL,    -- 'in' | 'out'
  time        TIME   NOT NULL,
  status      TEXT   NOT NULL DEFAULT 'O',  -- 'O' 출석 | 'L' 지각 | 'A' 결석 | 'E' 외출
  via_qr      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date, type)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_cid     ON attendance(cid);
CREATE INDEX IF NOT EXISTS idx_attendance_date    ON attendance(date);

-- ──────────────────────────────────────────────────
-- 5. instructors (강사)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instructors (
  id        BIGSERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  type      TEXT NOT NULL DEFAULT '주강사',  -- '주강사' | '보조강사'
  subject   TEXT,
  phone     TEXT,
  email     TEXT,
  career    TEXT,
  cids      JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 6. rooms (강의실)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id        BIGSERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  addr      TEXT,
  capacity  INT  NOT NULL DEFAULT 20,
  equip     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- 7. bookings (강의실 예약)
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id        BIGSERIAL PRIMARY KEY,
  room_id   BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
  label     TEXT   NOT NULL,
  start     DATE   NOT NULL,
  "end"     DATE   NOT NULL,
  color     TEXT   NOT NULL DEFAULT '#EA580C',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start, "end");

-- ──────────────────────────────────────────────────
-- 8. RLS (Row Level Security) 정책
--    ⚠️ 아래 정책은 개발/데모용입니다.
--    운영 배포 전에 아래 지침에 따라 정책을 강화하세요:
--
--    [accounts] anon 사용자가 비밀번호를 읽지 못하도록:
--      - SELECT 는 service_role 만 허용
--      - 또는 Supabase Auth 로 마이그레이션 권장
--
--    [students/attendance] 로그인한 담당자만 쓰기 허용:
--      - USING (auth.role() = 'authenticated')
--
--    [bookings/rooms/instructors] 읽기는 공개, 쓰기는 인증 필요
-- ──────────────────────────────────────────────────
ALTER TABLE accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE students   ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;

-- 개발용: anon 역할에 전체 접근 허용 (운영 전 반드시 아래 정책 교체 필요)
CREATE POLICY "anon_all_accounts"   ON accounts   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_courses"    ON courses    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_students"   ON students   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_instructors" ON instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_rooms"      ON rooms      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_bookings"   ON bookings   FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────
-- 9. Realtime 활성화
-- ──────────────────────────────────────────────────
-- Supabase Dashboard → Database → Replication 에서 아래 테이블 활성화:
-- students, courses, attendance

-- ──────────────────────────────────────────────────
-- 10. 출석률 자동 업데이트 함수 (선택사항)
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_student_rate()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id BIGINT;
  v_cid        BIGINT;
  v_total      INT;
  v_present    INT;
  v_new_rate   INT;
BEGIN
  v_student_id := COALESCE(NEW.student_id, OLD.student_id);

  SELECT cid INTO v_cid FROM students WHERE id = v_student_id;

  -- 해당 과정의 총 수업일수 (attendance 기준)
  SELECT COUNT(DISTINCT date) INTO v_total
  FROM attendance
  WHERE cid = v_cid AND type = 'in';

  IF v_total = 0 THEN
    v_new_rate := 0;  -- 수업일이 없으면 출석률 0%
  ELSE
    SELECT COUNT(*) INTO v_present
    FROM attendance
    WHERE student_id = v_student_id AND type = 'in' AND status IN ('O','L');
    v_new_rate := ROUND(v_present::NUMERIC / v_total * 100);
  END IF;

  UPDATE students SET rate = v_new_rate WHERE id = v_student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_rate
AFTER INSERT OR UPDATE OR DELETE ON attendance
FOR EACH ROW EXECUTE FUNCTION update_student_rate();
