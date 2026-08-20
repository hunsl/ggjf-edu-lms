-- 박덕수님 수료이력 복구/검증 SQL
-- Supabase SQL Editor에서 순서대로 실행

-- 1) 대상자/과정 확인
SELECT id, person_id, name, cid, enrollment_status, status_change_date, dropout_reason
FROM students
WHERE name ILIKE '%박덕수%'
ORDER BY id;

SELECT id, name, code, date_from, date_to
FROM courses
WHERE name ILIKE '%초등%피지컬%'
ORDER BY id;

SELECT id, name, code, date_from, date_to
FROM courses
WHERE name ILIKE '%AI%입문%'
ORDER BY id;

-- 2) person_id 기준 전체 이력 확인
-- 아래 params 값을 먼저 실제 값으로 바꿔 실행
WITH params AS (
  SELECT
    NULL::BIGINT  AS target_person_id,    -- 예: 123
    NULL::BIGINT  AS elementary_course_id, -- 예: 초등 피지컬 과정 id
    '박덕수'::TEXT AS target_name
)
SELECT s.id, s.person_id, s.name, s.cid, s.enrollment_status, s.accumulated_hours, s.status_change_date, s.dropout_reason
FROM students s
JOIN params p ON s.person_id = p.target_person_id
ORDER BY s.cid, s.id;

-- 3) 누락 시 복구 (초등피지컬 이력이 없을 때만 insert)
WITH params AS (
  SELECT
    NULL::BIGINT  AS target_person_id,    -- 예: 123
    NULL::BIGINT  AS elementary_course_id, -- 예: 초등 피지컬 과정 id
    '박덕수'::TEXT AS target_name,
    NULL::NUMERIC AS recovered_accumulated_hours -- 필요 시 실제 수료시간 입력
),
guard AS (
  SELECT
    1 / CASE
          WHEN target_person_id IS NOT NULL AND elementary_course_id IS NOT NULL THEN 1
          ELSE 0
        END AS params_check
  FROM params
),
existing AS (
  SELECT 1
  FROM students s
  JOIN params p ON s.person_id = p.target_person_id AND s.cid = p.elementary_course_id
  JOIN guard g ON TRUE
  LIMIT 1
),
source_row AS (
  SELECT s.*
  FROM students s
  JOIN params p ON s.person_id = p.target_person_id
  JOIN guard g ON TRUE
  ORDER BY s.id
  LIMIT 1
)
INSERT INTO students (
  cid, person_id, name, gender, birth, id_back, phone, phone2, addr_city, addr_detail,
  edu, major, career, cert, status, unemp, disabled, veteran,
  itv_date, itv_score, itv_grade, itv_pass, memo, rate,
  enrollment_status, accumulated_hours, status_change_date, dropout_reason, employer_name
)
SELECT
  p.elementary_course_id, p.target_person_id, p.target_name,
  s.gender, s.birth, s.id_back, s.phone, s.phone2, s.addr_city, s.addr_detail,
  s.edu, s.major, s.career, s.cert, s.status, s.unemp, s.disabled, s.veteran,
  s.itv_date, s.itv_score, s.itv_grade, s.itv_pass, s.memo, COALESCE(s.rate, 80),
  '수료',
  COALESCE(p.recovered_accumulated_hours, s.accumulated_hours),
  COALESCE(s.status_change_date, CURRENT_DATE::text),
  NULL, s.employer_name
FROM source_row s
JOIN params p ON TRUE
WHERE NOT EXISTS (SELECT 1 FROM existing);

-- 4) 복구 후 검증
WITH params AS (
  SELECT NULL::BIGINT AS target_person_id -- 예: 123
)
SELECT s.id, s.person_id, s.name, s.cid, s.enrollment_status, s.accumulated_hours, s.status_change_date
FROM students s
JOIN params p ON s.person_id = p.target_person_id
ORDER BY s.cid, s.id;

-- 5) 재발 방지 운영 점검용 조회
-- 중도탈락(이력보존) 처리된 항목 확인
SELECT id, person_id, name, cid, enrollment_status, status_change_date, dropout_reason
FROM students
WHERE dropout_reason ILIKE '%이력보존%'
ORDER BY id DESC;
