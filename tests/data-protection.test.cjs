const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const protection = require('../data-protection.js');
const source = fs.readFileSync(path.join(__dirname, '../app.jsx'), 'utf8');

test('deletes and unscoped/bulk student updates are blocked', () => {
  for (const table of ['students', 'courses', 'cert_issuances', 'room_bookings']) {
    assert.ok(protection.guardMutation('DELETE', table, 'id=eq.1'));
    assert.ok(protection.guardMutation('PATCH', table, '', {}));
    assert.ok(protection.guardMutation('PATCH', table, 'select=*', {}));
  }
  assert.ok(protection.guardMutation('PATCH', 'students', 'cid=eq.1', {enrollment_status:'중도탈락'}));
  assert.ok(protection.guardMutation('PATCH', 'students', 'id=in.(1,2)', {}));
  assert.equal(protection.guardMutation('PATCH', 'students', 'id=eq.1', {phone:'sample'}), null);
  assert.equal(protection.guardMutation('POST', 'attendance', '', [{student_id:1}]), null);
});

test('partial and unchanged course records cannot clear or re-send an old attachment', () => {
  for (const course of [{id:1}, {id:1,pdfData:''}, {id:1,pdfData:'old-pdf',pdfName:'old.pdf'}]) {
    assert.deepEqual(protection.attachmentFields(course), {});
  }
  assert.deepEqual(protection.attachmentFields({id:1,_pdfChanged:true,pdfData:'new-pdf',pdfName:'new.pdf'}), {pdf_name:'new.pdf',pdf_data:'new-pdf'});
  assert.deepEqual(protection.attachmentFields({_pdfChanged:true,pdfData:'new-pdf',pdfName:'new.pdf'}), {pdf_name:'new.pdf',pdf_data:'new-pdf'});
  assert.ok(protection.guardMutation('PATCH','courses','id=eq.1',{pdf_data:''}));
});

test('real course serialization preserves attachment fields omitted by the list query', () => {
  const context = vm.createContext({ DATA_PROTECTION: protection, toNum: v => Number(v) || null });
  vm.runInContext(source.slice(source.indexOf('const toCourse ='), source.indexOf('const toAccount =')), context);
  const patch = vm.runInContext('fromCourse(toCourse({id:1,name:"Renamed",pdf_name:"existing.pdf"}))', context);
  assert.equal(patch.name, 'Renamed');
  assert.equal(Object.hasOwn(patch, 'pdf_data'), false);
  assert.equal(Object.hasOwn(patch, 'pdf_name'), false);
});

test('failed full-course reads stop editing instead of saving a partial record', async () => {
  for (const sbGet of [async () => ({error:{message:'offline'}}), async () => { throw Error('offline'); }]) {
    let opened = 0, alerts = 0;
    const context = vm.createContext({ sbGet, toCourse: r => r, setIsNew() {}, setEdit() { opened++; }, alert() { alerts++; }, console:{warn() {}} });
    vm.runInContext(source.slice(source.indexOf('  const loadFullCourse ='), source.indexOf('  const previewPdf =')), context);
    await vm.runInContext('openEdit({id:1,pdfName:"existing.pdf"})', context);
    assert.equal(opened, 0);
    assert.equal(alerts, 1);
  }
});

function wrapperContext(protector = protection) {
  let calls=0;
  const context=vm.createContext({
    LMSDataProtection:protector, URLSearchParams,
    fetch:async()=>{calls++;return {ok:true,json:async()=>[{id:1}]};},
    H:{},API:'https://example.invalid/rest/v1',alert() {},console
  });
  const start=source.indexOf('const DATA_PROTECTION =');
  const end=source.indexOf('/* ── DB 컬럼');
  vm.runInContext(source.slice(start,end),context);
  return {context,run:code=>vm.runInContext(code,context),calls:()=>calls};
}

test('blocked mutations never reach the network',async()=>{
  const a=wrapperContext();
  assert.ok((await a.run('sbDelete("students", "id=eq.1")')).error);
  assert.ok((await a.run('sbUpdate("courses", "id=eq.1", {pdf_data:""})')).error);
  assert.ok((await a.run('sbUpdate("students", "cid=eq.1", {enrollment_status:"중도탈락"})')).error);
  assert.equal(a.calls(),0);
  assert.equal((await a.run('sbUpdate("students", "id=eq.1", {phone:"sample"})')).error,null);
  assert.equal(a.calls(),1);
});

test('missing protection script fails closed for all write wrappers',async()=>{
  const a=wrapperContext(null);
  for (const call of ['sbInsert("students", {})','sbUpsert("attendance", [])','sbUpdate("students","id=eq.1",{})','sbDelete("courses","id=eq.1")']) {
    assert.equal((await a.run(call)).error.code,'DATA_PROTECTION_UNAVAILABLE');
  }
  assert.equal(a.calls(),0);
});

test('destructive UI handlers no longer alter academic outcomes or local certificate history',()=>{
  const segment=source.slice(source.indexOf('  const deleteStudent = useCallback'),source.indexOf('  // ── 과정 CRUD'));
  assert.equal((segment.match(/stopDestructiveAction/g)||[]).length,3);
  assert.doesNotMatch(segment,/sbUpdate|setStudents|중도탈락/);
  assert.doesNotMatch(source,/현재 문서 종류의 발급이력을 모두 초기화하시겠습니까/);
  assert.doesNotMatch(source,/delete f\[badCol\]|const \{ cid, \.\.\.fallback \}/);
  assert.doesNotMatch(source,/현재 등록된 훈련생 데이터는 시스템 테스트용 샘플/);
});
