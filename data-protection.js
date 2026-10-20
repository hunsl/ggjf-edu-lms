/* Application-side safeguards. Database access rules must be managed separately. */
(function (root) {
  'use strict';
  const message = '데이터 보호 모드가 켜져 있습니다. 삭제·초기화는 중지되었습니다. 백업과 변경 내역을 확인한 뒤 처리해 주세요.';
  function error(detail = message) {
    return { code: 'DATA_PROTECTION', message: detail };
  }
  function guardMutation(method, table, filter = '', body = {}) {
    if (method === 'DELETE') return error();
    if (table === 'accounts' && method !== 'GET') return error('계정 변경은 데이터 보호 점검 후 사용할 수 있습니다.');
    if (method === 'PATCH') {
      // A missing or query-only filter can update the whole table.
      const params = new URLSearchParams(filter);
      const selectors = [...params.entries()].filter(([key]) => !['select', 'order', 'limit', 'offset'].includes(key));
      if (!selectors.length) return error('저장 대상이 지정되지 않아 변경을 중지했습니다.');
      if (['students', 'courses'].includes(table) && !/^eq\.[1-9]\d*$/.test(params.get('id') || '')) {
        return error('훈련생·과정의 일괄 변경을 중지했습니다. 개별 기록을 선택해 수정해 주세요.');
      }
      if (table === 'courses' && Object.hasOwn(body, 'pdf_data') && !body.pdf_data) {
        return error('기존 첨부파일을 빈 값으로 덮어쓰는 저장을 중지했습니다.');
      }
    }
    return null;
  }
  function attachmentFields(course) {
    // List responses intentionally omit pdf_data. Saving an unrelated field
    // must not serialize a missing attachment as an empty string.
    if (!course.pdfData || (course.id && course._pdfChanged !== true)) return {};
    return { pdf_name: course.pdfName || '', pdf_data: course.pdfData };
  }
  const protection = Object.freeze({ enabled: true, message, error, guardMutation, attachmentFields });
  root.LMSDataProtection = protection;
  if (typeof module !== 'undefined' && module.exports) module.exports = protection;
})(globalThis);
