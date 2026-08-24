-- 박덕수님 수료이력 복구/검증 SQL
-- Supabase SQL Editor에서 위에서부터 순서대로 실행
-- 초등피지컬 행이 없으면 수료 상태로 추가하고, AI입문 행은 그대로 둡니다.

-- 1) 대상자/과정 확인
SELECT id, person_id, name, cid, enrollment_status, status_change_date, dropout_reason
FROM students
WHERE name ILIKE '%박덕수%'
ORDER BY id;

SELECT id, name, code, date_from, date_to
FROM courses
WHERE name ILIKE '%초등%피지컬%' OR name ILIKE '%피지컬%코딩%'
ORDER BY id;

SELECT id, name, code, date_from, date_to
FROM courses
WHERE name ILIKE '%AI%입문%' OR name ILIKE '%데이터 분석 실무 입문%'
ORDER BY id;

-- 2) person_id가 비어 있으면 자기 id로 채움
UPDATE students
SET person_id = id
WHERE name ILIKE '%박덕수%' AND person_id IS NULL;

-- 3) 초등피지컬 이력이 없을 때만 수료 행 추가
--    출석률·누적시간은 0으로 두고 상태만 수료로 살립니다.
WITH source_row AS (
  SELECT *
  FROM students
  WHERE name ILIKE '%박덕수%'
  ORDER BY id
  LIMIT 1
),
elem AS (
  SELECT id
  FROM courses
  WHERE name ILIKE '%초등%피지컬%' OR name ILIKE '%피지컬%코딩%'
  ORDER BY id
  LIMIT 1
)
INSERT INTO students (
  cid, person_id, name, gender, birth, id_back, phone, phone2, addr_city, addr_detail,
  edu, major, career, cert, status, unemp, disabled, veteran,
  itv_date, itv_score, itv_grade, itv_pass, memo, rate,
  enrollment_status, accumulated_hours, status_change_date, dropout_reason, employer_name
)
SELECT
  e.id,
  COALESCE(s.person_id, s.id),
  s.name,
  s.gender, s.birth, s.id_back, s.phone, s.phone2, s.addr_city, s.addr_detail,
  s.edu, s.major, s.career, s.cert, s.status, s.unemp, s.disabled, s.veteran,
  s.itv_date, s.itv_score, s.itv_grade, s.itv_pass, s.memo,
  0,
  '수료',
  0,
  COALESCE(s.status_change_date, CURRENT_DATE::text),
  NULL,
  s.employer_name
FROM source_row s
CROSS JOIN elem e
WHERE NOT EXISTS (
  SELECT 1
  FROM students x
  WHERE COALESCE(x.person_id, x.id) = COALESCE(s.person_id, s.id)
    AND x.cid = e.id
);

-- 4) 복구 후 검증 — 박덕수가 과정별로 보여야 함
--    초등피지컬: 수료 / AI입문: 재학중(또는 현재 상태)
SELECT s.id, s.person_id, s.name, c.name AS course_name, c.code,
       s.enrollment_status, s.accumulated_hours, s.status_change_date
FROM students s
LEFT JOIN courses c ON c.id = s.cid
WHERE s.name ILIKE '%박덕수%'
ORDER BY s.cid, s.id;

-- 5) 재발 방지 운영 점검용 조회
SELECT id, person_id, name, cid, enrollment_status, status_change_date, dropout_reason
FROM students
WHERE dropout_reason ILIKE '%이력보존%'
ORDER BY id DESC;
