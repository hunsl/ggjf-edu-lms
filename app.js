var GgjfEduLms = (() => {
  const { useState, useMemo, useEffect, useRef, useCallback } = React;
  const _mem = {};
  const _probe = (storage) => {
    if (!storage || typeof storage.setItem !== "function") return false;
    try {
      const k = "__tp_probe__";
      storage.setItem(k, "1");
      const ok = storage.getItem(k) === "1";
      storage.removeItem(k);
      return ok;
    } catch {
      return false;
    }
  };
  const _sessionOk = typeof sessionStorage !== "undefined" ? _probe(sessionStorage) : false;
  const _localOk = typeof localStorage !== "undefined" ? _probe(localStorage) : false;
  const storageBlocked = !_sessionOk || !_localOk;
  const safeSession = {
    get: (k) => {
      if (!_sessionOk) return _mem["s_" + k] || null;
      try {
        return sessionStorage.getItem(k);
      } catch {
        return _mem["s_" + k] || null;
      }
    },
    set: (k, v) => {
      if (!_sessionOk) {
        _mem["s_" + k] = v;
        return;
      }
      try {
        sessionStorage.setItem(k, v);
      } catch {
        _mem["s_" + k] = v;
      }
    },
    remove: (k) => {
      if (!_sessionOk) {
        delete _mem["s_" + k];
        return;
      }
      try {
        sessionStorage.removeItem(k);
      } catch {
        delete _mem["s_" + k];
      }
    }
  };
  const safeLocal = {
    get: (k) => {
      if (!_localOk) return _mem["l_" + k] || null;
      try {
        return localStorage.getItem(k);
      } catch {
        return _mem["l_" + k] || null;
      }
    },
    set: (k, v) => {
      if (!_localOk) {
        _mem["l_" + k] = v;
        return;
      }
      try {
        localStorage.setItem(k, v);
      } catch {
        _mem["l_" + k] = v;
      }
    },
    remove: (k) => {
      if (!_localOk) {
        delete _mem["l_" + k];
        return;
      }
      try {
        localStorage.removeItem(k);
      } catch {
        delete _mem["l_" + k];
      }
    }
  };
  if (storageBlocked) {
    console.warn(
      "\u26A0\uFE0F [\uC2A4\uD1A0\uB9AC\uC9C0] \uBE0C\uB77C\uC6B0\uC800 \uCD94\uC801 \uBC29\uC9C0(Tracking Prevention)\uB85C \uC778\uD574",
      "localStorage/sessionStorage \uC811\uADFC\uC774 \uCC28\uB2E8\uB410\uC2B5\uB2C8\uB2E4.",
      "\uC778\uBA54\uBAA8\uB9AC \uBAA8\uB4DC\uB85C \uB3D9\uC791\uD569\uB2C8\uB2E4.",
      "\uB85C\uADF8\uC778 \uC138\uC158\uACFC \uAC10\uC0AC \uB85C\uADF8\uB294 \uD398\uC774\uC9C0 \uC0C8\uB85C\uACE0\uCE68 \uC2DC \uCD08\uAE30\uD654\uB429\uB2C8\uB2E4."
    );
  }
  const SB_URL = "https://vqkjakgbrsnsererwmma.supabase.co";
  const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa2pha2dicnNuc2VyZXJ3bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDA2MjIsImV4cCI6MjA4ODkxNjYyMn0.caGpzJdTcfT3CZTkJi2Mctte3nNvh3e6xTtFVaCfkiM";
  const API = `${SB_URL}/rest/v1`;
  const COURSE_LIST_SELECT = [
    "id",
    "cat",
    "cc",
    "name",
    "code",
    "date_from",
    "date_to",
    "period",
    "method",
    "hours",
    "tgt",
    "c_goal",
    "e_goal",
    "sched_days",
    "sched_time_from",
    "sched_time_to",
    "break_minutes",
    "include_break_in_hours",
    "notes",
    "pdf_name",
    "links"
  ].join(",");
  const ENABLE_REALTIME = false;
  const H = {
    "apikey": SB_KEY,
    "Authorization": `Bearer ${SB_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  const QR_TOKEN_SUFFIX = "2026GJF";
  const sbGet = async (table, params = "") => {
    const res = await fetch(`${API}/${table}?${params}`, { headers: H });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  };
  const sbInsert = async (table, body) => {
    const res = await fetch(`${API}/${table}`, {
      method: "POST",
      headers: H,
      body: JSON.stringify(Array.isArray(body) ? body : [body])
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data: Array.isArray(body) ? data : data[0], error: null };
  };
  const sbUpsert = async (table, body, conflictCols = "") => {
    const H2 = { ...H, "Prefer": "resolution=merge-duplicates,return=minimal" };
    const qp = conflictCols ? `?on_conflict=${encodeURIComponent(conflictCols)}` : "";
    const res = await fetch(`${API}/${table}${qp}`, {
      method: "POST",
      headers: H2,
      body: JSON.stringify(Array.isArray(body) ? body : [body])
    });
    if (!res.ok) {
      const data = await res.json();
      return { data: null, error: data };
    }
    return { data: null, error: null };
  };
  const fmtSaveError = (err) => {
    const msg = err?.message || JSON.stringify(err);
    if (msg.includes("schema cache") || msg.includes("Could not find")) {
      return `${msg}

\u{1F4A1} \uD574\uACB0 \uBC29\uBC95:
1. supabase-setup.sql\uC744 Supabase SQL Editor\uC5D0\uC11C \uB2E4\uC2DC \uC2E4\uD589\uD558\uC138\uC694.
2. \uADF8\uB798\uB3C4 \uC548 \uB418\uBA74 Supabase \uB300\uC2DC\uBCF4\uB4DC \u2192 \uC124\uC815(Settings) \u2192 API \u2192 Reload schema \uD074\uB9AD`;
    }
    return msg;
  };
  const sbUpdate = async (table, filter, body) => {
    const res = await fetch(`${API}/${table}?${filter}`, {
      method: "PATCH",
      headers: H,
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  };
  const sbDelete = async (table, filter) => {
    const res = await fetch(`${API}/${table}?${filter}`, {
      method: "DELETE",
      headers: H
    });
    if (!res.ok) {
      const e = await res.json();
      return { error: e };
    }
    return { error: null };
  };
  const sbStorageUpload = async (bucket, path, file) => {
    const res = await fetch(`${SB_URL}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` },
      body: file
    });
    if (!res.ok) {
      const e = await res.json();
      return { url: null, error: e };
    }
    const publicUrl = `${SB_URL}/storage/v1/object/public/${bucket}/${path}`;
    return { url: publicUrl, error: null };
  };
  const toNum = (v) => {
    const n = parseFloat(v);
    return isFinite(n) ? n : null;
  };
  const toStudent = (r) => r ? {
    id: Number(r.id),
    cid: Number(r.cid),
    name: r.name,
    gender: r.gender || "",
    birth: r.birth || "",
    idBack: r.id_back || "",
    phone: r.phone || "",
    phone2: r.phone2 || "",
    addrCity: r.addr_city || "",
    addrDetail: r.addr_detail || "",
    edu: r.edu || "",
    major: r.major || "",
    career: r.career || "",
    cert: r.cert || "",
    status: r.status || "\uBBF8\uCDE8\uC5C5",
    unemp: r.unemp || false,
    disabled: r.disabled || false,
    veteran: r.veteran || false,
    itvDate: r.itv_date || "",
    itvScore: r.itv_score || "",
    itvGrade: r.itv_grade || "",
    itvPass: r.itv_pass || false,
    memo: r.memo || "",
    rate: r.rate || 0,
    enrollmentStatus: r.enrollment_status || "\uC7AC\uD559\uC911",
    accumulatedHours: parseFloat(r.accumulated_hours) || 0,
    statusChangeDate: r.status_change_date || null,
    dropoutReason: r.dropout_reason || null,
    employerName: r.employer_name || null
  } : null;
  const excelDateToISO = (v) => {
    if (!v && v !== 0) return null;
    if (typeof v === "number") {
      const d = new Date(Math.round((v - 25569) * 86400 * 1e3));
      return d.toISOString().slice(0, 10);
    }
    const s = String(v).trim();
    if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    return s || null;
  };
  const fromStudent = (s) => {
    return {
      cid: s.cid ? Number(s.cid) : null,
      name: s.name,
      gender: s.gender || "",
      birth: excelDateToISO(s.birth),
      id_back: s.idBack || "",
      phone: s.phone || "",
      phone2: s.phone2 || "",
      addr_city: s.addrCity || "",
      addr_detail: s.addrDetail || "",
      edu: s.edu || "",
      major: s.major || "",
      career: s.career || "",
      cert: s.cert || "",
      status: s.status || "\uBBF8\uCDE8\uC5C5",
      unemp: !!s.unemp,
      disabled: !!s.disabled,
      veteran: !!s.veteran,
      itv_date: excelDateToISO(s.itvDate),
      itv_score: toNum(s.itvScore),
      itv_grade: s.itvGrade || "",
      itv_pass: !!s.itvPass,
      memo: s.memo || "",
      rate: toNum(s.rate) ?? 0,
      enrollment_status: s.enrollmentStatus || "\uC7AC\uD559\uC911",
      accumulated_hours: toNum(s.accumulatedHours) ?? 0,
      status_change_date: s.statusChangeDate || null,
      dropout_reason: s.dropoutReason || null,
      employer_name: s.employerName || null
    };
  };
  const toCourse = (r) => r ? {
    id: Number(r.id),
    cat: r.cat,
    cc: r.cc,
    name: r.name,
    code: r.code,
    dateFrom: r.date_from || "",
    dateTo: r.date_to || "",
    period: r.period || "",
    method: r.method || "\uB300\uBA74",
    hours: r.hours || 0,
    tgt: r.tgt || 20,
    cGoal: r.c_goal || 18,
    eGoal: r.e_goal || 12,
    schedDays: r.sched_days || "",
    schedTimeFrom: r.sched_time_from || "09:00",
    schedTimeTo: r.sched_time_to || "13:00",
    breakMinutes: toNum(r.break_minutes) ?? 60,
    includeBreakInHours: r.include_break_in_hours === true,
    notes: r.notes || "",
    pdfName: r.pdf_name || "",
    pdfData: r.pdf_data || "",
    links: r.links || []
  } : null;
  const fromCourse = (c) => ({
    cat: c.cat,
    cc: c.cc,
    name: c.name,
    code: c.code,
    date_from: c.dateFrom || null,
    date_to: c.dateTo || null,
    period: c.period || "",
    method: c.method,
    hours: c.hours || 0,
    tgt: c.tgt || 20,
    c_goal: c.cGoal || 18,
    e_goal: c.eGoal || 12,
    sched_days: c.schedDays || "",
    sched_time_from: c.schedTimeFrom || null,
    sched_time_to: c.schedTimeTo || null,
    break_minutes: toNum(c.breakMinutes) ?? 60,
    include_break_in_hours: c.includeBreakInHours === true,
    notes: c.notes || "",
    pdf_name: c.pdfName || "",
    pdf_data: c.pdfData || "",
    links: c.links || []
  });
  const toAccount = (r) => r ? {
    id: r.id,
    name: r.name || "",
    role: r.role || "staff",
    pw: r.pw || ""
  } : null;
  const fromAccount = (a) => ({
    name: a.name || "",
    role: a.role || "staff",
    pw: a.pw || ""
  });
  const toInstructor = (r) => r ? {
    id: r.id,
    name: r.name || "",
    type: r.type || "\uC8FC\uAC15\uC0AC",
    category: r.category || "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
    subject: r.subject || "",
    phone: r.phone || "",
    email: r.email || "",
    career: r.career || "",
    cert: r.cert || "",
    cids: r.cids || [],
    note: r.note || "",
    hourlyRate: r.hourly_rate || r.hourlyRate || 0,
    customDates: r.custom_dates || r.customDates || {}
  } : null;
  const fromInstructor = (i) => ({
    name: i.name || "",
    type: i.type || "\uC8FC\uAC15\uC0AC",
    category: i.category || "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
    subject: i.subject || "",
    phone: i.phone || "",
    email: i.email || "",
    career: i.career || "",
    cert: i.cert || "",
    cids: i.cids || [],
    note: i.note || "",
    hourly_rate: i.hourlyRate || 0,
    custom_dates: i.customDates || {}
  });
  const toRoom = (r) => r ? {
    id: r.id,
    floor: r.floor || 0,
    name: r.name || "",
    addr: r.addr || "",
    capacity: r.capacity || 20,
    equip: r.equip || ""
  } : null;
  const fromRoom = (r) => ({
    floor: r.floor || 0,
    name: r.name || "",
    addr: r.addr || "",
    capacity: r.capacity || 20,
    equip: r.equip || ""
  });
  const toBooking = (r) => r ? {
    id: r.id,
    roomId: Number(r.room_id),
    // ← Number() 추가 (Gantt 타입 불일치 버그 수정)
    courseId: Number(r.course_id),
    // ← Number() 추가
    label: r.label || "",
    start: r.start_date || "",
    end: r.end_date || "",
    color: r.color || "#EA580C"
  } : null;
  const fromBooking = (b) => ({
    room_id: b.roomId,
    course_id: b.courseId,
    label: b.label || "",
    start_date: b.start || "",
    end_date: b.end || "",
    color: b.color || "#EA580C"
  });
  const toOverride = (r) => r ? {
    id: r.id,
    courseId: Number(r.course_id),
    date: r.date,
    type: r.type,
    timeFrom: r.time_from || null,
    timeTo: r.time_to || null,
    hours: parseFloat(r.hours) || 0,
    reason: r.reason || ""
  } : null;
  const fromOverride = (o) => ({
    course_id: o.courseId,
    date: o.date,
    type: o.type,
    time_from: o.timeFrom || null,
    time_to: o.timeTo || null,
    hours: o.hours || 0,
    reason: o.reason || ""
  });
  const GStyle = () => /* @__PURE__ */ React.createElement("style", null, `
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    body, #root { font-family:'Pretendard',-apple-system,sans-serif; }
    ::-webkit-scrollbar { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background:#f1f5f9; }
    ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
    ::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
    input,select,button,textarea { font-family:inherit; }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes slideIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes ping     { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
    @keyframes scanLine { 0%{top:0} 50%{top:calc(100% - 3px)} 100%{top:0} }
    @keyframes checkIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes loginBg  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
    @keyframes tabSlide { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
    .page { animation: fadeUp .3s ease both; }
    @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
    @keyframes heroGlow { 0%,100%{box-shadow:0 8px 32px rgba(234,88,12,.30)} 50%{box-shadow:0 12px 48px rgba(234,88,12,.50)} }
    .kpi-card { transition: transform .2s ease, box-shadow .2s ease !important; cursor:default; }
    .kpi-card:hover { transform:translateY(-4px) scale(1.015) !important; box-shadow:0 14px 36px rgba(234,88,12,.20) !important; }
    .dash-hero { animation: fadeUp .45s ease both; }
    .row-hover:hover { background:#fff7ed !important; }
    .btn-nav { transition: all .15s; }
    .btn-nav:hover { background: rgba(255,255,255,.15) !important; }
    .drop-zone { transition: all .2s; }
    .drop-zone.drag-over { border-color:#EA580C !important; background:#fff7ed !important; transform:scale(1.01); }
    .course-card { transition: all .2s; }
    .course-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(234,88,12,.15) !important; }
    .checkin-row { animation: checkIn .4s ease both; }
    .tab-pill { transition: color .2s cubic-bezier(.4,0,.2,1), background .2s cubic-bezier(.4,0,.2,1), box-shadow .2s cubic-bezier(.4,0,.2,1); position:relative; }
    .tab-pill:hover:not(.tab-pill-active) { color:#EA580C !important; background:rgba(234,88,12,.07) !important; }
    .tab-pill-active { animation: tabSlide .2s ease both; }
    /* \u2500\u2500 \uBAA8\uBC14\uC77C \uC0AC\uC774\uB4DC\uBC14 \uC624\uBC84\uB808\uC774 \u2500\u2500 */
    .sidebar-overlay {
      display:none;
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.45);
      z-index:199;
      backdrop-filter:blur(2px);
    }
    .sidebar-overlay.active { display:block; animation: fadeIn .2s ease; }
    .app-sidebar {
      transition: transform .25s cubic-bezier(.4,0,.2,1), width .25s ease;
    }
    /* \u2500\u2500 \uBC18\uC751\uD615 \uB808\uC774\uC544\uC6C3 \u2500\u2500 */
    @media (max-width: 768px) {
      .app-sidebar {
        position: fixed !important;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 200;
        transform: translateX(-100%);
        width: 240px !important;
        box-shadow: 4px 0 32px rgba(0,0,0,.3) !important;
      }
      .app-sidebar.mobile-open {
        transform: translateX(0);
      }
      .app-main {
        width: 100% !important;
      }
      .section-head-wrap {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      .section-head-right {
        width: 100%;
        flex-wrap: wrap;
      }
      .modal-sheet {
        width: 100% !important;
        max-width: 100vw !important;
        max-height: 95dvh !important;
        border-radius: 20px 20px 0 0 !important;
        align-self: flex-end !important;
        margin: auto 0 0 0 !important;
      }
      .modal-backdrop {
        align-items: flex-end !important;
      }
      .resp-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .resp-grid-2 { grid-template-columns: 1fr !important; }
      .resp-grid-3 { grid-template-columns: 1fr !important; }
      .header-title-full { display: none; }
      .header-title-short { display: block !important; }
      .pi-banner-text { display: none; }
      .pi-banner-icon { display: inline !important; }
    }
    @media (min-width: 769px) {
      .header-title-short { display: none; }
      .mobile-menu-btn { display: none !important; }
    }
    /* \u2500\u2500 \uAC1C\uC120\uB41C \uD14C\uC774\uBE14 \uC2A4\uD0C0\uC77C \u2500\u2500 */
    .data-table { border-collapse: collapse; width: 100%; }
    .data-table th {
      background: #F8FAFC;
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: .5px;
      padding: 10px 12px;
      border-bottom: 1px solid #E2E8F0;
      white-space: nowrap;
    }
    .data-table td {
      padding: 10px 12px;
      font-size: 12px;
      color: #1E293B;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .data-table tbody tr:hover td { background: #FFF7ED; }
    /* \u2500\u2500 \uC785\uB825 \uD544\uB4DC \uD3EC\uCEE4\uC2A4 \uAC1C\uC120 \u2500\u2500 */
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #EA580C !important;
      box-shadow: 0 0 0 3px rgba(234,88,12,.1) !important;
    }
    /* \u2500\u2500 \uBC84\uD2BC \uD638\uBC84 \u2500\u2500 */
    button:active { transform: scale(.97); }
  `);
  const QRCanvas = ({ data, size = 200, color = "#000000", bgColor = "#ffffff", style = {} }) => {
    const canvasRef = useRef(null);
    const [libMissing, setLibMissing] = useState(false);
    useEffect(() => {
      if (!canvasRef.current || !data) return;
      if (typeof window.qrcode !== "function") {
        console.warn("QRCanvas: qrcode-generator \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uB85C\uB4DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. CDN\uC744 \uD655\uC778\uD558\uC138\uC694.");
        setLibMissing(true);
        return;
      }
      try {
        const qr = window.qrcode(0, "M");
        qr.addData(data);
        qr.make();
        const cells = qr.getModuleCount();
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + "px";
        canvas.style.height = size + "px";
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        const cellSize = size / cells;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = color;
        for (let r = 0; r < cells; r++) {
          for (let c = 0; c < cells; c++) {
            if (qr.isDark(r, c)) ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      } catch (e) {
        console.error("QR \uC0DD\uC131 \uC624\uB958:", e);
        setLibMissing(true);
      }
    }, [data, size, color, bgColor]);
    if (libMissing) return /* @__PURE__ */ React.createElement("div", { style: {
      width: size,
      height: size,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#F1F5F9",
      borderRadius: 8,
      fontSize: 11,
      color: "#64748B",
      textAlign: "center",
      padding: 8,
      ...style
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 28, marginBottom: 4 } }, "\u26A0\uFE0F"), "QR \uB77C\uC774\uBE0C\uB7EC\uB9AC \uB85C\uB4DC \uC2E4\uD328", /* @__PURE__ */ React.createElement("br", null), "\uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68 \uD558\uC138\uC694");
    return /* @__PURE__ */ React.createElement("canvas", { ref: canvasRef, style: { display: "block", borderRadius: 8, ...style } });
  };
  const T = {
    p: "#EA580C",
    pm: "#F97316",
    pl: "#FB923C",
    pbg: "#FFF7ED",
    sb: "#7C2D12",
    ok: "#059669",
    warn: "#D97706",
    danger: "#DC2626",
    info: "#2563EB",
    s: "#FFFFFF",
    s2: "#F8FAFC",
    s3: "#F1F5F9",
    bd: "#E2E8F0",
    tx: "#1E293B",
    mu: "#64748B"
  };
  let _holidaySet = /* @__PURE__ */ new Set();
  const loadHolidays = async () => {
    try {
      const cached = safeLocal.get("gjf_holidays");
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 864e5 && Array.isArray(data)) {
          _holidaySet = new Set(data);
          return;
        }
      }
    } catch {
    }
    try {
      const { data, error } = await sbGet("holidays", "select=date&order=date");
      if (!error && data) {
        const dates = data.map((r) => r.date);
        _holidaySet = new Set(dates);
        try {
          safeLocal.set("gjf_holidays", JSON.stringify({ data: dates, ts: Date.now() }));
        } catch {
        }
      }
    } catch (e) {
      console.warn("\uACF5\uD734\uC77C \uB85C\uB4DC \uC2E4\uD328:", e);
    }
  };
  const isHoliday = (dateStr) => _holidaySet.has(dateStr);
  const isCancelledOverride = (courseId, dateStr) => {
    const ovs = window._overridesRef?.current || [];
    if (!courseId || !dateStr) return false;
    return ovs.some((o) => o.courseId === Number(courseId) && o.date === dateStr && o.type === "cancelled");
  };
  const COURSES = [
    { id: 1, cat: "\uB298\uBD04\uAC15\uC0AC\uC591\uC131", cc: "#EA580C", name: "\uCD08\uB4F1 \uD53C\uC9C0\uCEEC \uCF54\uB529\uAC15\uC0AC \uC591\uC131", code: "NB-01", dateFrom: "2026-06-01", dateTo: "2026-07-31", period: "6~7\uC6D4", method: "\uBE14\uB80C\uB514\uB4DC", hours: 92, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "\uC6D4, \uD654, \uBAA9", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 2, cat: "\uB298\uBD04\uAC15\uC0AC\uC591\uC131", cc: "#D97706", name: "AI \uB525\uB7EC\uB2DD \uC804\uBB38\uAC15\uC0AC \uC591\uC131", code: "NB-02", dateFrom: "2026-06-01", dateTo: "2026-08-31", period: "6~8\uC6D4", method: "\uBE14\uB80C\uB514\uB4DC", hours: 104, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "\uC6D4, \uC218, \uAE08", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 3, cat: "\uB298\uBD04\uAC15\uC0AC\uC591\uC131", cc: "#16A34A", name: "\uB298\uBD04\uD559\uAD50 \uCC3D\uC758\uC735\uD569\uAD50\uC721\uAC15\uC0AC \uC591\uC131", code: "NB-03", dateFrom: "2026-04-01", dateTo: "2026-06-30", period: "4~6\uC6D4", method: "\uB300\uBA74", hours: 140, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "\uC6D4, \uD654, \uBAA9", schedTimeFrom: "09:00", schedTimeTo: "14:00" },
    { id: 4, cat: "\uC9C0\uC5ED\uC5F0\uACC4\xB7\uAE30\uC5EC", cc: "#C2410C", name: "ERP\xB7\uC9C0\uAC8C\uCC28 \uBB3C\uB958\uAD00\uB9AC \uC2E4\uBB34\uC790 \uC591\uC131", code: "JY-01", dateFrom: "2026-03-02", dateTo: "2026-05-29", period: "3~5\uC6D4", method: "\uB300\uBA74", hours: 182, tgt: 15, cGoal: 14, eGoal: 9, schedDays: "\uC6D4, \uD654, \uC218, \uBAA9, \uAE08", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 5, cat: "\uC9C0\uC5ED\uC5F0\uACC4\xB7\uAE30\uC5EC", cc: "#0891B2", name: "\uC2B9\uAC15\uAE30 \uC804\uBB38\uAC00 \uC591\uC131", code: "JY-02", dateFrom: "2026-05-04", dateTo: "2026-06-26", period: "5~6\uC6D4", method: "\uB300\uBA74", hours: 80, tgt: 15, cGoal: 14, eGoal: 9, schedDays: "\uC6D4, \uD654, \uBAA9, \uAE08", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 6, cat: "\uC9C0\uC5ED\uC5F0\uACC4\xB7\uAE30\uC5EC", cc: "#0D9488", name: "\uC911\uC7A5\uB144 \uAE30\uD68C\uAC15\uC0AC \uC591\uC131", code: "JY-03", dateFrom: "2026-05-01", dateTo: "2026-07-31", period: "5~7\uC6D4", method: "\uBE14\uB80C\uB514\uB4DC", hours: 83, tgt: 15, cGoal: 14, eGoal: 9, schedDays: "\uD654, \uBAA9", schedTimeFrom: "09:30", schedTimeTo: "13:30" },
    { id: 7, cat: "\uC9C0\uC5ED\uC5F0\uACC4\xB7\uAE30\uC5EC", cc: "#7C3AED", name: "\uBBF8\uC9C0\uC815 \uACF5\uBAA8\uACFC\uC815 (\uC9C0\uC5ED\uC5F0\uACC4)", code: "JY-04", dateFrom: "", dateTo: "", period: "-", method: "-", hours: 0, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 8, cat: "\uC0AC\uBB34\uBD84\uC57C", cc: "#9A3412", name: "\uD589\uC815\uD68C\uACC4 \uC0AC\uBB34 OA (1\uAE30)", code: "SM-01", dateFrom: "2026-03-02", dateTo: "2026-05-29", period: "3~5\uC6D4", method: "\uB300\uBA74", hours: 200, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "\uC6D4, \uD654, \uC218, \uBAA9, \uAE08", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 9, cat: "\uC0AC\uBB34\uBD84\uC57C", cc: "#BE185D", name: "\uD589\uC815\uD68C\uACC4 \uC0AC\uBB34 OA (2\uAE30)", code: "SM-02", dateFrom: "2026-07-01", dateTo: "2026-09-30", period: "7~9\uC6D4", method: "\uB300\uBA74", hours: 200, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "\uC6D4, \uD654, \uC218, \uBAA9, \uAE08", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 10, cat: "\uC2DD\uD488\uBD84\uC57C", cc: "#DC2626", name: "HACCP \uC804\uBB38\uC778\uB825 \uC591\uC131", code: "FD-01", dateFrom: "2026-04-01", dateTo: "2026-05-31", period: "4~5\uC6D4", method: "\uB300\uBA74", hours: 112, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "\uC6D4, \uD654, \uC218, \uBAA9", schedTimeFrom: "09:00", schedTimeTo: "14:00" },
    { id: 11, cat: "IT \uC2E0\uC9C1\uBB34", cc: "#F97316", name: "AI \uC2DC\uB300\uC758 \uCE90\uB9AD\uD130 \uD06C\uB9AC\uC5D0\uC774\uD130 \uC591\uC131", code: "IT-01", dateFrom: "2026-08-03", dateTo: "2026-09-30", period: "8~9\uC6D4", method: "\uBE44\uB300\uBA74", hours: 108, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "\uC6D4, \uC218, \uAE08", schedTimeFrom: "10:00", schedTimeTo: "14:00" },
    { id: 12, cat: "IT \uC2E0\uC9C1\uBB34", cc: "#2563EB", name: "\uBBF8\uC9C0\uC815 \uACF5\uBAA8\uACFC\uC815 (IT-A)", code: "IT-02", dateFrom: "", dateTo: "", period: "-", method: "-", hours: 0, tgt: 20, cGoal: 18, eGoal: 12, schedDays: "", schedTimeFrom: "09:00", schedTimeTo: "13:00" },
    { id: 13, cat: "IT \uC2E0\uC9C1\uBB34", cc: "#8B5CF6", name: "\uBBF8\uC9C0\uC815 \uACF5\uBAA8\uACFC\uC815 (IT-B)", code: "IT-03", dateFrom: "", dateTo: "", period: "-", method: "-", hours: 0, tgt: 15, cGoal: 14, eGoal: 9, schedDays: "", schedTimeFrom: "09:00", schedTimeTo: "13:00" }
  ];
  const SEED_STUDENTS = [
    {
      id: 1,
      cid: 4,
      name: "\uAE40\uBBFC\uC900",
      gender: "\uB0A8",
      birth: "1992-04-15",
      idBack: "1234567",
      phone: "010-1234-5678",
      phoneEmer: "010-9999-1111",
      addrCity: "\uC758\uC815\uBD80\uC2DC",
      addrDong: "\uBBFC\uB77D\uB3D9",
      edu: "\uB300\uC878",
      major: "\uAE30\uACC4\uACF5\uD559",
      career: "\uBB3C\uB958\uCC3D\uACE0 2\uB144",
      certs: "\uC9C0\uAC8C\uCC28 1\uC885",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: true,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-14",
      itvScore: 88,
      itvGrade: "A",
      itvPass: true,
      memo: "\uCDE8\uC5C5\uC758\uC9C0 \uB9E4\uC6B0 \uAC15\uD568. \uC9C0\uAC8C\uCC28 \uC790\uACA9 \uBCF4\uC720.",
      rate: 94
    },
    {
      id: 2,
      cid: 4,
      name: "\uC774\uC11C\uC5F0",
      gender: "\uC5EC",
      birth: "1997-07-22",
      idBack: "2345678",
      phone: "010-2345-6789",
      phoneEmer: "010-8888-2222",
      addrCity: "\uC591\uC8FC\uC2DC",
      addrDong: "\uD68C\uCC9C\uB3D9",
      edu: "\uB300\uC878",
      major: "\uACBD\uC601\uD559",
      career: "\uC5C6\uC74C",
      certs: "\uCEF4\uD4E8\uD130\uD65C\uC6A9\uB2A5\uB825 2\uAE09",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: false,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-14",
      itvScore: 72,
      itvGrade: "B",
      itvPass: true,
      memo: "\uACBD\uB825 \uC5C6\uC73C\uB098 \uD559\uC2B5 \uC758\uC9C0 \uB192\uC74C.",
      rate: 75
    },
    {
      id: 3,
      cid: 4,
      name: "\uBC15\uC9C0\uD6C8",
      gender: "\uB0A8",
      birth: "1990-01-30",
      idBack: "3456789",
      phone: "010-3456-7890",
      phoneEmer: "010-7777-3333",
      addrCity: "\uD3EC\uCC9C\uC2DC",
      addrDong: "\uC2E0\uC74D\uB3D9",
      edu: "\uACE0\uC878",
      major: "-",
      career: "\uC81C\uC870\uC5C5 5\uB144",
      certs: "\uC5C6\uC74C",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: true,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-15",
      itvScore: 65,
      itvGrade: "C",
      itvPass: true,
      memo: "\uC2E4\uC5C5\uAE09\uC5EC \uC218\uAE09 \uC911. \uCD9C\uC11D \uAD00\uB9AC \uC8FC\uC758.",
      rate: 62
    },
    {
      id: 4,
      cid: 4,
      name: "\uCD5C\uC218\uC544",
      gender: "\uC5EC",
      birth: "1999-11-05",
      idBack: "4567890",
      phone: "010-4567-8901",
      phoneEmer: "010-6666-4444",
      addrCity: "\uC758\uC815\uBD80\uC2DC",
      addrDong: "\uC6A9\uD604\uB3D9",
      edu: "\uB300\uC878",
      major: "\uAD50\uC721\uD559",
      career: "\uC5C6\uC74C",
      certs: "\uC815\uBCF4\uCC98\uB9AC\uAE30\uC0AC",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: false,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-15",
      itvScore: 95,
      itvGrade: "A+",
      itvPass: true,
      memo: "\uC131\uC2E4\uD558\uACE0 \uC801\uADF9\uC801. \uC6B0\uC218 \uD559\uC2B5\uC790 \uAE30\uB300.",
      rate: 97
    },
    {
      id: 5,
      cid: 4,
      name: "\uC815\uC6B0\uC9C4",
      gender: "\uB0A8",
      birth: "1995-08-14",
      idBack: "5678901",
      phone: "010-5678-9012",
      phoneEmer: "010-5555-5555",
      addrCity: "\uB0A8\uC591\uC8FC\uC2DC",
      addrDong: "\uD654\uB3C4\uC74D",
      edu: "\uB300\uC878",
      major: "\uC0B0\uC5C5\uACF5\uD559",
      career: "\uBB3C\uB958\uC5C5 1\uB144",
      certs: "ERP\uC815\uBCF4\uAD00\uB9AC\uC0AC",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: false,
      disabled: false,
      veteran: true,
      itvDate: "2026-02-16",
      itvScore: 83,
      itvGrade: "B+",
      itvPass: true,
      memo: "\uAD6D\uAC00\uC720\uACF5\uC790 \uC790\uB140. \uC774\uC218 \uC758\uC9C0 \uAC15\uD568.",
      rate: 88
    },
    {
      id: 6,
      cid: 8,
      name: "\uAC15\uB2E4\uC740",
      gender: "\uC5EC",
      birth: "1993-03-20",
      idBack: "6789012",
      phone: "010-6789-0123",
      phoneEmer: "010-4444-6666",
      addrCity: "\uC758\uC815\uBD80\uC2DC",
      addrDong: "\uAE08\uC624\uB3D9",
      edu: "\uB300\uC878",
      major: "\uD68C\uACC4\uD559",
      career: "\uC0AC\uBB34\uBCF4\uC870 3\uB144",
      certs: "\uC804\uC0B0\uC138\uBB34 2\uAE09",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: true,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-10",
      itvScore: 90,
      itvGrade: "A",
      itvPass: true,
      memo: "\uD68C\uACC4 \uACBD\uB825 \uBCF4\uC720. \uC989\uC2DC \uCDE8\uC5C5 \uAC00\uB2A5.",
      rate: 91
    },
    {
      id: 7,
      cid: 8,
      name: "\uC724\uC11C\uC900",
      gender: "\uB0A8",
      birth: "1996-12-08",
      idBack: "7890123",
      phone: "010-7890-1234",
      phoneEmer: "010-3333-7777",
      addrCity: "\uB3D9\uB450\uCC9C\uC2DC",
      addrDong: "\uC18C\uC694\uB3D9",
      edu: "\uACE0\uC878",
      major: "-",
      career: "\uD3B8\uC758\uC810 \uC544\uB974\uBC14\uC774\uD2B8 2\uB144",
      certs: "\uC5C6\uC74C",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: false,
      disabled: true,
      veteran: false,
      itvDate: "2026-02-10",
      itvScore: 70,
      itvGrade: "B",
      itvPass: true,
      memo: "\uC7A5\uC560 3\uAE09. \uBC30\uB824 \uD544\uC694.",
      rate: 78
    },
    {
      id: 8,
      cid: 1,
      name: "\uC784\uC9C0\uC218",
      gender: "\uC5EC",
      birth: "2000-06-17",
      idBack: "8901234",
      phone: "010-8901-2345",
      phoneEmer: "010-2222-8888",
      addrCity: "\uC591\uC8FC\uC2DC",
      addrDong: "\uBC31\uC11D\uC74D",
      edu: "\uB300\uC878",
      major: "\uCEF4\uD4E8\uD130\uAD50\uC721",
      career: "\uC5C6\uC74C",
      certs: "\uC815\uBCF4\uAD50\uC721\uC0AC 2\uAE09",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: false,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-18",
      itvScore: 98,
      itvGrade: "A+",
      itvPass: true,
      memo: "\uCF54\uB529 \uAD50\uC721 \uAD00\uC2EC \uB9E4\uC6B0 \uB192\uC74C.",
      rate: 100
    },
    {
      id: 9,
      cid: 1,
      name: "\uD55C\uC608\uB9B0",
      birth: "1988-09-11",
      gender: "\uC5EC",
      idBack: "9012345",
      phone: "010-9012-3456",
      phoneEmer: "010-1111-9999",
      addrCity: "\uC758\uC815\uBD80\uC2DC",
      addrDong: "\uD638\uC6D0\uB3D9",
      edu: "\uB300\uD559\uC6D0\uC878",
      major: "\uAD50\uC721\uACF5\uD559",
      career: "\uAC15\uC0AC 5\uB144",
      certs: "\uC9C1\uC5C5\uD6C8\uB828\uAD50\uC0AC 3\uAE09",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: false,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-18",
      itvScore: 87,
      itvGrade: "A",
      itvPass: true,
      memo: "\uAC15\uC0AC \uACBD\uB825 \uD48D\uBD80. \uCDE8\uC5C5 \uC5F0\uACC4 \uAE30\uB300.",
      rate: 83
    },
    {
      id: 10,
      cid: 10,
      name: "\uC624\uBBFC\uD601",
      gender: "\uB0A8",
      birth: "1994-02-25",
      idBack: "0123456",
      phone: "010-0123-4567",
      phoneEmer: "010-9876-0000",
      addrCity: "\uD3EC\uCC9C\uC2DC",
      addrDong: "\uAD70\uB0B4\uBA74",
      edu: "\uACE0\uC878",
      major: "-",
      career: "\uC2DD\uD488\uACF5\uC7A5 3\uB144",
      certs: "\uC2DD\uD488\uAE30\uC0AC",
      empType: "\uBBF8\uCDE8\uC5C5",
      unemployment: true,
      disabled: false,
      veteran: false,
      itvDate: "2026-02-20",
      itvScore: 60,
      itvGrade: "C",
      itvPass: true,
      memo: "HACCP \uC2E4\uBB34 \uACBD\uD5D8 \uC788\uC74C. \uACB0\uC11D \uC8FC\uC758.",
      rate: 55
    }
  ];
  const buildCourseDates = (course) => {
    const getLocalStr = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const dateFrom = course?.dateFrom ?? course?.date_from;
    const dateTo = course?.dateTo ?? course?.date_to;
    const schedDaysRaw = course?.schedDays ?? course?.sched_days;
    if (!dateFrom) return [getLocalStr(/* @__PURE__ */ new Date())];
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    if (start > today) return [String(dateFrom).slice(0, 10)];
    const endCandidate = dateTo ? new Date(dateTo) : today;
    endCandidate.setHours(0, 0, 0, 0);
    const end = new Date(Math.min(endCandidate.getTime(), today.getTime()));
    const DAY_MAP = { \uC77C: 0, \uC6D4: 1, \uD654: 2, \uC218: 3, \uBAA9: 4, \uAE08: 5, \uD1A0: 6 };
    const allowedDows = schedDaysRaw && String(schedDaysRaw).trim().length ? new Set(
      String(schedDaysRaw).split(",").map((s) => s.trim()).filter(Boolean).map((s) => /^[0-6]$/.test(s) ? Number(s) : DAY_MAP[s]).filter((d) => d !== void 0)
    ) : /* @__PURE__ */ new Set([1, 2, 3, 4, 5]);
    const out = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (allowedDows.has(d.getDay())) {
        const ds = getLocalStr(d);
        if (!isHoliday(ds) && !isCancelledOverride(course?.id, ds)) out.push(ds);
      }
    }
    return out.length ? out : [getLocalStr(today)];
  };
  const formatCoursePeriod = (c) => {
    if (!c?.dateFrom) return "\uAE30\uAC04 \uBBF8\uC815";
    const fmt = (d) => {
      const [y, m, day] = (d || "").split("-");
      return `${y}.${String(+m)}.${String(+day)}`;
    };
    return c.dateTo ? `${fmt(c.dateFrom)} ~ ${fmt(c.dateTo)}` : `${fmt(c.dateFrom)} ~`;
  };
  const shortCourseName = (name = "", maxLen = 13) => {
    if (!name) return "";
    const kiMatch = name.match(/\((\d+기)\)/);
    const ki = kiMatch ? ` (${kiMatch[1]})` : "";
    let short = name.replace(/\([^)]*\)/g, "").replace(/전문강사 양성|강사 양성|양성과정|양성|실무자|교육|과정/g, "").replace(/\s{2,}/g, " ").trim();
    if (short.length > maxLen) short = short.slice(0, maxLen) + "\u2026";
    return short + ki;
  };
  const Chip = ({ label, bg, color, size = 11 }) => /* @__PURE__ */ React.createElement("span", { style: {
    background: bg,
    color,
    fontSize: size,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 20,
    whiteSpace: "nowrap",
    letterSpacing: ".2px"
  } }, label);
  const CertChips = ({ text = "", maxShow = 0 }) => {
    const items = String(text).split(",").map((v) => v.trim()).filter(Boolean);
    if (items.length === 0) return /* @__PURE__ */ React.createElement("span", { style: { color: T.mu } }, "\u2014");
    const visible = maxShow > 0 ? items.slice(0, maxShow) : items;
    const extra = maxShow > 0 ? items.length - maxShow : 0;
    return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", flexWrap: "wrap", gap: 3 } }, visible.map((c) => /* @__PURE__ */ React.createElement(Chip, { key: c, label: c, bg: T.s3, color: T.mu, size: 10 })), extra > 0 && /* @__PURE__ */ React.createElement(Chip, { label: `+${extra}\uAC1C \uB354`, bg: T.pbg, color: T.p, size: 10 }));
  };
  const rateColor = (r) => r >= 80 ? T.ok : r >= 70 ? T.warn : T.danger;
  const RBar = ({ r, h = 5 }) => /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: h, background: T.bd, borderRadius: h, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    height: "100%",
    width: `${Math.min(r, 100)}%`,
    background: rateColor(r),
    borderRadius: h,
    transition: "width 1s ease"
  } }));
  const Card = ({ children, style = {} }) => /* @__PURE__ */ React.createElement("div", { style: {
    background: T.s,
    borderRadius: 14,
    border: `1px solid ${T.bd}`,
    boxShadow: "0 1px 3px rgba(0,0,0,.04),0 4px 16px rgba(15,118,110,.05)",
    ...style
  } }, children);
  const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) => {
    const base = {
      border: "none",
      borderRadius: 9,
      cursor: "pointer",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      transition: "all .15s",
      whiteSpace: "nowrap",
      ...style
    };
    const sizes = { sm: { padding: "5px 12px", fontSize: 11 }, md: { padding: "8px 16px", fontSize: 12 }, lg: { padding: "10px 20px", fontSize: 13 } };
    const vars = {
      primary: { background: `linear-gradient(135deg,${T.pm},${T.p})`, color: "#fff", boxShadow: "0 2px 8px rgba(234,88,12,.25)" },
      ghost: { background: T.s2, color: T.mu, border: `1px solid ${T.bd}` },
      danger: { background: "#FEF2F2", color: T.danger, border: "1px solid #FECACA" },
      outline: { background: "transparent", color: T.p, border: `1.5px solid ${T.p}` }
    };
    return /* @__PURE__ */ React.createElement("button", { onClick, disabled, style: {
      ...base,
      ...sizes[size],
      ...vars[variant],
      opacity: disabled ? 0.55 : 1,
      cursor: disabled ? "not-allowed" : base.cursor
    } }, children);
  };
  const Icon = ({ n, s = 16 }) => {
    const d = {
      dash: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" })),
      book: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }), /* @__PURE__ */ React.createElement("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" })),
      people: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "7", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }), /* @__PURE__ */ React.createElement("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })),
      cal: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "16", y1: "2", x2: "16", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "2", x2: "8", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "10", x2: "21", y2: "10" })),
      check: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), /* @__PURE__ */ React.createElement("polyline", { points: "22 4 12 14.01 9 11.01" })),
      award: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "8", r: "6" }), /* @__PURE__ */ React.createElement("path", { d: "M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" })),
      qr: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "5", height: "5" }), /* @__PURE__ */ React.createElement("rect", { x: "16", y: "3", width: "5", height: "5" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "16", width: "5", height: "5" }), /* @__PURE__ */ React.createElement("rect", { x: "10", y: "3", width: "2", height: "2" }), /* @__PURE__ */ React.createElement("rect", { x: "10", y: "10", width: "2", height: "2" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "10", width: "2", height: "2" }), /* @__PURE__ */ React.createElement("rect", { x: "16", y: "10", width: "5", height: "5" }), /* @__PURE__ */ React.createElement("rect", { x: "10", y: "16", width: "2", height: "5" })),
      upload: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("polyline", { points: "16 16 12 12 8 16" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "12", x2: "12", y2: "21" }), /* @__PURE__ */ React.createElement("path", { d: "M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" })),
      dl: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), /* @__PURE__ */ React.createElement("polyline", { points: "7 10 12 15 17 10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" })),
      search: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /* @__PURE__ */ React.createElement("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })),
      alert: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })),
      user: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "7", r: "4" })),
      bell: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }), /* @__PURE__ */ React.createElement("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })),
      plus: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" })),
      bars: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "6", x2: "21", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "12", x2: "21", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "18", x2: "21", y2: "18" })),
      x: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })),
      edit: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), /* @__PURE__ */ React.createElement("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })),
      grid: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "3", width: "7", height: "7" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "3", width: "7", height: "7" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "14", width: "7", height: "7" }), /* @__PURE__ */ React.createElement("rect", { x: "3", y: "14", width: "7", height: "7" })),
      list: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "6", x2: "21", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "12", x2: "21", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "18", x2: "21", y2: "18" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "6", x2: "3.01", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "12", x2: "3.01", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "3", y1: "18", x2: "3.01", y2: "18" })),
      phone: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" })),
      info: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })),
      filter: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" })),
      refresh: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("polyline", { points: "23 4 23 10 17 10" }), /* @__PURE__ */ React.createElement("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" }))
    };
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        width: s,
        height: s,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: { flexShrink: 0, display: "block" }
      },
      d[n] || null
    );
  };
  const SectionHead = ({ title, sub, right }) => /* @__PURE__ */ React.createElement("div", { className: "section-head-wrap", style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { borderLeft: `4px solid ${T.p}`, paddingLeft: 12, borderRadius: 1 } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: 20, fontWeight: 800, color: T.tx, letterSpacing: "-.3px" } }, title), sub && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 12, color: T.mu, marginTop: 3 } }, sub)), right && /* @__PURE__ */ React.createElement("div", { className: "section-head-right", style: { display: "flex", gap: 8 } }, right));
  const TEMPLATE_HEADERS = [
    "\uC774\uB984",
    "\uC131\uBCC4",
    "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638",
    "\uC5F0\uB77D\uCC98",
    "\uAC70\uC8FC\uC2DC",
    "\uCD5C\uC885\uD559\uB825",
    "\uC804\uACF5",
    "\uACBD\uB825",
    "\uC790\uACA9\uC99D",
    "\uCDE8\uC5C5\uD615\uD0DC",
    "\uC2E4\uC5C5\uAE09\uC5EC\uC218\uAE09",
    "\uC7A5\uC560\uC5EC\uBD80",
    "\uBCF4\uD6C8\uC5EC\uBD80",
    "\uBA74\uC811\uC77C\uC790",
    "\uBA74\uC811\uC810\uC218",
    "\uBA74\uC811\uB4F1\uAE09",
    "\uD569\uACA9\uC5EC\uBD80",
    "\uD2B9\uC774\uC0AC\uD56D",
    "\uACFC\uC815\uCF54\uB4DC"
  ];
  const TEMPLATE_EXAMPLE = [
    ["\uD64D\uAE38\uB3D9", "\uB0A8", "900101-1234567", "010-1234-5678", "\uC758\uC815\uBD80\uC2DC", "\uB300\uC878", "\uAE30\uACC4\uACF5\uD559", "\uBB3C\uB958\uCC3D\uACE0 2\uB144", "\uC9C0\uAC8C\uCC281\uC885", "\uBBF8\uCDE8\uC5C5", "Y", "N", "N", "2026-02-14", "88", "A", "Y", "\uCDE8\uC5C5\uC758\uC9C0 \uAC15\uD568", "JY-01"],
    ["\uAE40\uC601\uD76C", "\uC5EC", "950515-2345678", "010-9876-5432", "\uC591\uC8FC\uC2DC", "\uACE0\uC878", "-", "\uC5C6\uC74C", "\uC5C6\uC74C", "\uBBF8\uCDE8\uC5C5", "N", "N", "N", "2026-02-14", "75", "B", "Y", "\uC131\uC2E4\uD568", "SM-01"]
  ];
  const downloadTemplate = (courses) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_EXAMPLE]);
    ws["!cols"] = [6, 4, 11, 10, 13, 13, 8, 8, 7, 10, 14, 14, 7, 7, 5, 5, 11, 6, 5, 5, 20, 8].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "\uD6C8\uB828\uC0DD\uBA85\uB2E8");
    const wsRef = XLSX.utils.aoa_to_sheet([
      ["\uACFC\uC815\uCF54\uB4DC", "\uACFC\uC815\uBA85", "\uAD50\uC721\uAE30\uAC04", "\uBC29\uC2DD", "\uC2DC\uC218"],
      ...courses.map((c) => [c.code, c.name, formatCoursePeriod(c), c.method, c.hours])
    ]);
    wsRef["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 8 }, { wch: 6 }];
    XLSX.utils.book_append_sheet(wb, wsRef, "\uACFC\uC815\uCF54\uB4DC\uCC38\uACE0");
    const wsGuide = XLSX.utils.aoa_to_sheet([
      ["\uD56D\uBAA9", "\uC785\uB825\uAC12 \uC548\uB0B4"],
      ["\uC131\uBCC4", "\uB0A8 / \uC5EC"],
      ["\uCDE8\uC5C5\uD615\uD0DC", "\uBBF8\uCDE8\uC5C5 / \uC790\uC601\uC5C5(\uB9E4\uCD9C 1.5\uC5B5\uBBF8\uB9CC) / \uB2E8\uAE30\uADFC\uB85C(\uC8FC15\uC2DC\uAC04\uBBF8\uB9CC)"],
      ["\uC2E4\uC5C5\uAE09\uC5EC\uC218\uAE09", "Y / N"],
      ["\uC7A5\uC560\uC5EC\uBD80", "Y / N"],
      ["\uBCF4\uD6C8\uC5EC\uBD80", "Y / N"],
      ["\uD569\uACA9\uC5EC\uBD80", "Y / N"],
      ["\uBA74\uC811\uB4F1\uAE09", "A+ / A / B+ / B / C / \uD0C8\uB77D"]
    ]);
    wsGuide["!cols"] = [{ wch: 12 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, "\uC785\uB825\uC548\uB0B4");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/octet-stream" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "\uD6C8\uB828\uC0DD_\uB4F1\uB85D\uC591\uC2DD_2026.xlsx";
    a.click();
  };
  const isDropoutStudent = (s) => (s?.enrollmentStatus || "") === "\uC911\uB3C4\uD0C8\uB77D";
  const Dashboard = ({ students, courses }) => {
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrowStr = new Date(today.getTime() + 864e5).toISOString().slice(0, 10);
    const [instructors, setInstructors] = useState(SEED_INSTRUCTORS);
    const [dashRooms, setDashRooms] = useState(SEED_ROOMS);
    const [bookings, setBookings2] = useState([]);
    const [todayAtt, setTodayAtt] = useState({});
    const [loadTick, setLoadTick] = useState(0);
    useEffect(() => {
      let cancelled = false;
      const load = async () => {
        try {
          const [iRes, rRes, bRes] = await Promise.all([
            sbGet("instructors", "select=*&order=id"),
            sbGet("rooms", "select=*&order=id"),
            sbGet("room_bookings", "select=*&order=id")
          ]);
          if (!cancelled) {
            if (!iRes.error && iRes.data?.length) setInstructors(iRes.data.map(toInstructor));
            if (!rRes.error && rRes.data?.length) setDashRooms(rRes.data.map(toRoom));
            if (!bRes.error && bRes.data?.length) setBookings2(bRes.data.map(toBooking));
          }
        } catch {
        }
        try {
          const attRes = await sbGet("attendance", `select=student_id,status&date=eq.${todayStr}`);
          if (!cancelled && !attRes.error && attRes.data) {
            const sidToCid = {};
            students.forEach((s) => {
              sidToCid[s.id] = s.cid;
            });
            const map = {};
            attRes.data.forEach((r) => {
              const cid = sidToCid[r.student_id];
              if (!cid) return;
              if (!map[cid]) map[cid] = { present: 0, absent: 0 };
              if (r.status === "O") map[cid].present++;
              else if (r.status === "A") map[cid].absent++;
            });
            if (!cancelled) setTodayAtt(map);
          }
        } catch {
        }
      };
      load();
      const timer = setInterval(() => setLoadTick((t) => t + 1), 6e4);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }, [loadTick, students]);
    const DAY_MAP2 = { \uC77C: 0, \uC6D4: 1, \uD654: 2, \uC218: 3, \uBAA9: 4, \uAE08: 5, \uD1A0: 6 };
    const isTodayClass = (c) => {
      if (!c.dateFrom) return false;
      if (c.dateFrom > todayStr || c.dateTo && c.dateTo < todayStr) return false;
      if (!c.schedDays) return today.getDay() > 0 && today.getDay() < 6;
      const allowed = new Set(c.schedDays.split(",").map((s) => DAY_MAP2[s.trim()]).filter((d) => d !== void 0));
      return allowed.has(today.getDay());
    };
    const liveCourses = courses.filter(isTodayClass);
    const totalTgt = courses.reduce((a, b) => a + b.tgt, 0);
    const rateStudents = students.filter((s) => !isDropoutStudent(s));
    const avgRate = rateStudents.length ? (rateStudents.reduce((a, b) => a + Number(b.rate || 0), 0) / rateStudents.length).toFixed(1) : 0;
    const isRiskTarget = (s) => {
      const status = s.enrollmentStatus || "\uC7AC\uD559\uC911";
      if (["\uC218\uB8CC", "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC", "\uBBF8\uC218\uB8CC", "\uC911\uB3C4\uD0C8\uB77D"].includes(status)) return false;
      return Number(s.rate || 0) < 80;
    };
    const atRisk = students.filter(isRiskTarget);
    const completedCnt = students.filter((s) => ["\uC218\uB8CC", "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC"].includes(s.enrollmentStatus || "")).length;
    const earlyEmploymentCnt = students.filter((s) => (s.enrollmentStatus || "") === "\uC870\uAE30\uCDE8\uC5C5").length;
    const employedCnt = students.filter((s) => {
      const employment = getEffectiveEmploymentStatus(s);
      return employment !== "\uBBF8\uCDE8\uC5C5" || (s.enrollmentStatus || "") === "\uC870\uAE30\uCDE8\uC5C5";
    }).length;
    const employmentGoal = courses.reduce((a, b) => a + Number(b.eGoal || 0), 0);
    const completionGoal = courses.reduce((a, b) => a + Number(b.cGoal || 0), 0);
    const employmentRate = students.length ? Math.round(employedCnt / students.length * 100) : 0;
    const completionGoalRate = completionGoal ? Math.round(completedCnt / completionGoal * 100) : 0;
    const courseProgress = courses.map((c) => {
      const cs = students.filter((s) => s.cid === c.id);
      const enrolled = cs.length;
      const rateCs = cs.filter((s) => !isDropoutStudent(s));
      const avgR = rateCs.length ? Math.round(rateCs.reduce((a, b) => a + Number(b.rate || 0), 0) / rateCs.length) : 0;
      const isActive = c.dateFrom && c.dateFrom <= todayStr && (!c.dateTo || c.dateTo >= todayStr);
      const status = isActive ? "\uC9C4\uD589\uC911" : c.dateTo && c.dateTo < todayStr ? "\uC885\uB8CC" : "\uC608\uC815";
      return { ...c, enrolled, avgR, isActive, status };
    }).sort((a, b) => (a.dateFrom || "9").localeCompare(b.dateFrom || "9") || a.name.localeCompare(b.name));
    const activeCnt = courseProgress.filter((c) => c.isActive).length;
    const alerts = [];
    courses.filter((c) => c.dateFrom === tomorrowStr).forEach((c) => {
      const hasRoom = bookings.some((b) => b.courseId === c.id && b.start <= tomorrowStr && b.end >= tomorrowStr);
      if (!hasRoom) alerts.push({ level: "warn", msg: `\uB0B4\uC77C \uAC1C\uAC15 [${c.name}] \uACFC\uC815\uC5D0 \uBC30\uC815\uB41C \uAC15\uC758\uC2E4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.` });
    });
    liveCourses.forEach((c) => {
      const cs = students.filter((s) => s.cid === c.id && !isDropoutStudent(s));
      const att = todayAtt[c.id] || {};
      const confirmed = (att.present || 0) + (att.absent || 0);
      if (confirmed > 0 && cs.length > 0) {
        const presentPct = Math.round((att.present || 0) / cs.length * 100);
        if (presentPct < 50) {
          alerts.push({ level: "danger", msg: `[${c.name}] \uC624\uB298 \uCD9C\uC11D\uB960 \uBBF8\uB2EC(${presentPct}%) \u2014 \uBBF8\uCD9C\uC11D ${cs.length - (att.present || 0)}\uBA85` });
        }
      }
    });
    if (atRisk.length > 0) {
      alerts.push({ level: "info", msg: `\uB204\uC801 \uCD9C\uC11D\uB960 80% \uBBF8\uB9CC \uC218\uB8CC \uC704\uD5D8 \uD6C8\uB828\uC0DD ${atRisk.length}\uBA85` });
    }
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "dash-hero", style: {
      background: "linear-gradient(135deg,#7C2D12 0%,#9A3412 25%,#EA580C 60%,#F97316 100%)",
      borderRadius: 18,
      padding: "22px 28px",
      marginBottom: 20,
      position: "relative",
      overflow: "hidden",
      color: "#fff",
      boxShadow: "0 8px 32px rgba(234,88,12,.35)",
      animation: "heroGlow 4s ease-in-out infinite"
    } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)", pointerEvents: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: -50, right: 100, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.05)", pointerEvents: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: 2.5, opacity: 0.7, marginBottom: 5, textTransform: "uppercase" } }, "\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80 \uBD81\uBD80\uAD50\uC721\uD300"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 900, letterSpacing: "-.5px" } }, "\uC77C\uC77C \uC6B4\uC601 \uCEE8\uD2B8\uB864 \uD0C0\uC6CC"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, opacity: 0.8 } }, "\u{1F4C5} ", todayStr, " \uAE30\uC900"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, opacity: 0.8 } }, "\u{1F4DA} ", courses.length, "\uAC1C \uACFC\uC815 \uC6B4\uC601"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, opacity: 0.8 } }, "\u{1F465} \uD6C8\uB828\uC0DD ", students.length, "\uBA85"), liveCourses.length > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, background: "rgba(255,255,255,.2)", borderRadius: 20, padding: "1px 10px", fontWeight: 700 } }, "\uC624\uB298 ", liveCourses.length, "\uAC1C \uAC15\uC758 \uC9C4\uD589\uC911")))), /* @__PURE__ */ React.createElement(Card, { style: { padding: 22, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#22C55E",
      boxShadow: "0 0 0 3px #22C55E40",
      display: "inline-block",
      animation: "heroGlow 2s infinite"
    } }), "\uC624\uB298\uC758 \uB77C\uC774\uBE0C \uAC15\uC758 \uD604\uD669", /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", fontSize: 10, color: T.mu } }, "\uC2E4\uC2DC\uAC04 \xB7 1\uBD84\uB9C8\uB2E4 \uAC31\uC2E0")), liveCourses.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: T.mu, padding: "32px 0", fontSize: 13 } }, "\uC624\uB298(", todayStr, ") \uC9C4\uD589 \uC911\uC778 \uAC15\uC758\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.") : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 } }, liveCourses.map((c) => {
      const cs = students.filter((s) => s.cid === c.id && !isDropoutStudent(s));
      const total = cs.length;
      const att = todayAtt[c.id] || {};
      const present = att.present || 0;
      const absent = att.absent || 0;
      const unconfirmed = Math.max(0, total - present - absent);
      const pPct = total > 0 ? Math.round(present / total * 100) : 0;
      const courseInst = instructors.filter((i) => (i.cids || []).includes(c.id));
      const booking = bookings.find((b) => b.courseId === c.id && b.start <= todayStr && b.end >= todayStr);
      const room = booking ? dashRooms.find((r) => r.id === booking.roomId) : null;
      return /* @__PURE__ */ React.createElement("div", { key: c.id, style: {
        border: `1.5px solid ${c.cc}30`,
        borderRadius: 14,
        background: `linear-gradient(145deg,#fff,${c.cc}08)`,
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 4,
        height: "100%",
        background: c.cc,
        borderRadius: "14px 0 0 14px"
      } }), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.tx } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginTop: 1 } }, c.code)), c.schedTimeFrom && /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 11,
        fontWeight: 700,
        color: c.cc,
        background: `${c.cc}15`,
        borderRadius: 8,
        padding: "3px 9px",
        whiteSpace: "nowrap",
        marginLeft: 8
      } }, c.schedTimeFrom, " ~ ", c.schedTimeTo || "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu, display: "flex", alignItems: "center", gap: 3 } }, /* @__PURE__ */ React.createElement(Icon, { n: "people", s: 11 }), courseInst.length > 0 ? courseInst.map((i) => `${i.name} ${i.type}`).join(", ") : "\uAC15\uC0AC \uBBF8\uBC30\uC815"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu, display: "flex", alignItems: "center", gap: 3 } }, /* @__PURE__ */ React.createElement(Icon, { n: "book", s: 11 }), room ? room.name : "\uAC15\uC758\uC2E4 \uBBF8\uBC30\uC815")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 5, display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", null, "\uC624\uB298 \uCD9C\uACB0 \uD604\uD669 (", total, "\uBA85)"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, color: pPct >= 80 ? T.ok : pPct >= 60 ? T.warn : T.danger } }, pPct, "% \uCD9C\uC11D")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", height: 8, borderRadius: 6, overflow: "hidden", background: T.bd, marginBottom: 6 } }, present > 0 && /* @__PURE__ */ React.createElement("div", { style: { width: `${present / total * 100}%`, background: T.ok, transition: "width .4s" }, title: `\uCD9C\uC11D ${present}\uBA85` }), absent > 0 && /* @__PURE__ */ React.createElement("div", { style: { width: `${absent / total * 100}%`, background: T.danger, transition: "width .4s" }, title: `\uACB0\uC11D ${absent}\uBA85` }), unconfirmed > 0 && /* @__PURE__ */ React.createElement("div", { style: { width: `${unconfirmed / total * 100}%`, background: T.bd, transition: "width .4s" }, title: `\uBBF8\uD655\uC778 ${unconfirmed}\uBA85` })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, fontSize: 10 } }, [{ l: "\uCD9C\uC11D", v: present, c: T.ok }, { l: "\uACB0\uC11D", v: absent, c: T.danger }, { l: "\uBBF8\uD655\uC778", v: unconfirmed, c: T.mu }].map(({ l, v, c: col }) => /* @__PURE__ */ React.createElement("span", { key: l, style: { color: col, fontWeight: 700 } }, l, " ", v)))));
    }))), alerts.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 } }, alerts.map((al, i) => {
      const bg = al.level === "danger" ? "#FEF2F2" : al.level === "warn" ? "#FFFBEB" : "#EFF6FF";
      const border = al.level === "danger" ? "#FECACA" : al.level === "warn" ? "#FDE68A" : "#BFDBFE";
      const col = al.level === "danger" ? T.danger : al.level === "warn" ? "#D97706" : T.info;
      const icon = al.level === "danger" ? "alert" : al.level === "warn" ? "alert" : "info";
      return /* @__PURE__ */ React.createElement("div", { key: i, style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 16px",
        borderRadius: 10,
        background: bg,
        border: `1px solid ${border}`
      } }, /* @__PURE__ */ React.createElement(Icon, { n: icon, s: 15, style: { color: col, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: col, fontWeight: 600 } }, "\u26A0 ", al.msg));
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 16 } }, [
      { label: "\uCD1D \uBAA8\uC9D1 \uBAA9\uD45C", val: `${totalTgt}\uBA85`, sub: `${courses.length}\uAC1C \uACFC\uC815`, icon: "people", color: T.p },
      { label: "\uC774\uBC88\uB2EC \uC9C4\uD589\uC911", val: `${activeCnt}\uAC1C`, sub: "\uC6B4\uC601 \uACFC\uC815 \uC218", icon: "cal", color: T.ok },
      { label: "\uD3C9\uADE0 \uCD9C\uC11D\uB960", val: `${avgRate}%`, sub: "\uC804\uCCB4 \uD6C8\uB828\uC0DD", icon: "check", color: T.info },
      { label: "\uC218\uB8CC \uC704\uD5D8", val: `${atRisk.length}\uBA85`, sub: "\uCD9C\uC11D\uB960 80% \uBBF8\uB9CC", icon: "alert", color: T.danger },
      { label: "\uC218\uB8CC \uD655\uC815", val: `${completedCnt}\uBA85`, sub: `\uBAA9\uD45C \uB300\uBE44 ${completionGoalRate}%`, icon: "award", color: "#15803D" },
      { label: "\uCDE8\uC5C5/\uC608\uC815", val: `${employedCnt}\uBA85`, sub: `\uCDE8\uC5C5 \uBAA9\uD45C ${employmentGoal}\uBA85`, icon: "user", color: "#0369A1" },
      { label: "\uC870\uAE30\uCDE8\uC5C5", val: `${earlyEmploymentCnt}\uBA85`, sub: "\uC218\uB8CC \uC804 \uCDE8\uC5C5", icon: "check", color: "#7E22CE" },
      { label: "\uCDE8\uC5C5\uB960", val: `${employmentRate}%`, sub: "\uC804\uCCB4 \uD6C8\uB828\uC0DD \uAE30\uC900", icon: "dash", color: "#B45309" }
    ].map((k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      background: T.s,
      borderRadius: 12,
      border: `1.5px solid ${k.color}20`,
      boxShadow: `0 2px 8px ${k.color}12`,
      padding: "16px 18px",
      display: "flex",
      gap: 12,
      alignItems: "center",
      backgroundImage: `linear-gradient(145deg,#fff,${k.color}08)`
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 40,
      height: 40,
      borderRadius: 11,
      flexShrink: 0,
      background: `linear-gradient(135deg,${k.color}28,${k.color}15)`,
      color: k.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: k.icon, s: 20 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: T.tx, lineHeight: 1 } }, k.val), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginTop: 3 } }, k.label), k.sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: k.color, fontWeight: 700 } }, k.sub))))), atRisk.length > 0 && /* @__PURE__ */ React.createElement(Card, { style: { padding: 20, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, marginBottom: 12, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement(Icon, { n: "alert", s: 15 }), " \uC218\uB8CC \uC704\uD5D8 \uD6C8\uB828\uC0DD", /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", fontSize: 10, color: T.mu } }, "\uCD9C\uC11D\uB960 80% \uBBF8\uB9CC")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 } }, atRisk.sort((a, b) => a.rate - b.rate).map((s) => {
      const c = courses.find((x) => x.id === s.cid);
      return /* @__PURE__ */ React.createElement("div", { key: s.id, style: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "9px 11px",
        borderRadius: 8,
        background: s.rate < 70 ? "#FEF2F2" : "#FFFBEB",
        border: `1px solid ${s.rate < 70 ? "#FECACA" : "#FDE68A"}`
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 36,
        height: 36,
        borderRadius: 8,
        flexShrink: 0,
        background: s.rate < 70 ? "#FEE2E2" : "#FEF3C7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 900,
        color: s.rate < 70 ? T.danger : T.warn
      } }, s.rate), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, s.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c?.name)), /* @__PURE__ */ React.createElement(Chip, { label: s.rate < 70 ? "\uC704\uD5D8" : "\uC8FC\uC758", bg: s.rate < 70 ? "#FEE2E2" : "#FEF3C7", color: s.rate < 70 ? T.danger : T.warn }));
    }))), /* @__PURE__ */ React.createElement(Card, { style: { padding: 22, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement(Icon, { n: "cal", s: 15 }), " \uC804\uCCB4 \uAC1C\uC124 \uACFC\uC815 \uC9C4\uD589\uB960", /* @__PURE__ */ React.createElement("span", { style: {
      marginLeft: 6,
      fontSize: 11,
      fontWeight: 600,
      color: T.p,
      background: T.pbg,
      border: `1px solid #FDBA74`,
      borderRadius: 10,
      padding: "2px 8px"
    } }, "\uC9C4\uD589\uC911 ", activeCnt, "\uAC1C"), /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", fontSize: 10, color: T.mu } }, "\uAD50\uC721\uAE30\uAC04 \xB7 \uBAA8\uC9D1/\uD6C8\uB828\uC0DD \uC218")), courseProgress.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: T.mu, padding: "24px 0", fontSize: 13 } }, "\uB4F1\uB85D\uB41C \uACFC\uC815\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") : /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: `2px solid ${T.bd}` } }, ["\uBD84\uC57C", "\uACFC\uC815\uBA85", "\uAD50\uC721\uAE30\uAC04", "\uBAA8\uC9D1\uBAA9\uD45C", "\uB4F1\uB85D", "\uCD9C\uC11D\uB960", "\uAC15\uC0AC", "\uAC15\uC758\uC2E4", "\uC0C1\uD0DC"].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "7px 10px",
      textAlign: "left",
      fontSize: 10,
      color: T.mu,
      fontWeight: 700,
      whiteSpace: "nowrap"
    } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, courseProgress.map((c) => {
      const fillPct = c.tgt > 0 ? Math.min(100, Math.round(c.enrolled / c.tgt * 100)) : 0;
      const stColor = c.status === "\uC9C4\uD589\uC911" ? T.ok : c.status === "\uC885\uB8CC" ? T.mu : T.info;
      const stBg = c.status === "\uC9C4\uD589\uC911" ? "#F0FDF4" : c.status === "\uC885\uB8CC" ? T.s2 : "#EFF6FF";
      const courseInst = instructors.filter((i) => (i.cids || []).includes(c.id));
      const bk = bookings.find((b) => b.courseId === c.id && b.start <= todayStr && b.end >= todayStr);
      const roomName = bk ? dashRooms.find((r) => r.id === bk.roomId)?.name || "" : "";
      return /* @__PURE__ */ React.createElement("tr", { key: c.id, style: {
        borderBottom: `1px solid ${T.bd}`,
        background: c.isActive ? `${T.pbg}60` : "transparent"
      } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("span", { style: {
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: 2,
        background: c.cc,
        marginRight: 5
      } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, c.cat)), /* @__PURE__ */ React.createElement("td", { style: {
        padding: "9px 10px",
        fontWeight: 700,
        color: T.tx,
        maxWidth: 180,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, c.name, c.code && /* @__PURE__ */ React.createElement("span", { style: {
        marginLeft: 5,
        fontSize: 10,
        color: T.mu,
        background: T.s3,
        borderRadius: 4,
        padding: "1px 4px"
      } }, c.code)), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px", color: T.mu, whiteSpace: "nowrap", fontSize: 11 } }, formatCoursePeriod(c), c.schedTimeFrom && /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 10, color: T.mu } }, c.schedDays, " ", c.schedTimeFrom, "~", c.schedTimeTo)), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px", textAlign: "center" } }, c.tgt, "\uBA85"), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, color: fillPct >= 80 ? T.ok : fillPct >= 50 ? T.warn : T.danger } }, c.enrolled, "\uBA85"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 5, background: T.bd, borderRadius: 3, overflow: "hidden", minWidth: 36 } }, /* @__PURE__ */ React.createElement("div", { style: {
        height: "100%",
        width: `${fillPct}%`,
        background: fillPct >= 80 ? T.ok : fillPct >= 50 ? T.warn : T.danger,
        borderRadius: 3
      } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, fillPct, "%"))), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px", textAlign: "center" } }, c.enrolled > 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, color: c.avgR >= 80 ? T.ok : c.avgR >= 70 ? T.warn : T.danger } }, c.avgR, "%") : /* @__PURE__ */ React.createElement("span", { style: { color: T.mu } }, "\u2014")), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px", fontSize: 11, color: T.mu, whiteSpace: "nowrap" } }, courseInst.length > 0 ? courseInst.map((i) => i.name).join(", ") : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px", fontSize: 11, color: T.mu, whiteSpace: "nowrap" } }, roomName || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("span", { style: {
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 10,
        fontSize: 10,
        fontWeight: 700,
        color: stColor,
        background: stBg,
        border: `1px solid ${stColor}30`
      } }, c.status)));
    }))))));
  };
  const CAT_COLORS = {
    "\uB298\uBD04\uAC15\uC0AC\uC591\uC131": "#EA580C",
    "\uC9C0\uC5ED\uC5F0\uACC4\xB7\uAE30\uC5EC": "#C2410C",
    "\uC0AC\uBB34\uBD84\uC57C": "#9A3412",
    "\uC2DD\uD488\uBD84\uC57C": "#DC2626",
    "IT \uC2E0\uC9C1\uBB34": "#F97316"
  };
  const CAT_LIST = Object.keys(CAT_COLORS);
  const CourseModal = ({ course, onSave, onClose, isNew = false }) => {
    const empty = {
      cat: "\uB298\uBD04\uAC15\uC0AC\uC591\uC131",
      cc: "#EA580C",
      name: "",
      code: "",
      dateFrom: "",
      dateTo: "",
      period: "",
      method: "\uB300\uBA74",
      hours: 0,
      tgt: 20,
      cGoal: 18,
      eGoal: 12,
      schedDays: "",
      schedTimeFrom: "09:00",
      schedTimeTo: "13:00",
      breakMinutes: 60,
      includeBreakInHours: false,
      links: [],
      notes: "",
      pdfName: "",
      pdfData: ""
    };
    const [form, setForm] = useState(course ? {
      ...course,
      dateFrom: course.dateFrom || "",
      dateTo: course.dateTo || "",
      links: course.links || [],
      notes: course.notes || "",
      pdfName: course.pdfName || "",
      pdfData: course.pdfData || "",
      schedDays: course.schedDays || "",
      schedTimeFrom: course.schedTimeFrom || "09:00",
      schedTimeTo: course.schedTimeTo || "13:00",
      breakMinutes: toNum(course.breakMinutes) ?? 60,
      includeBreakInHours: course.includeBreakInHours === true
    } : empty);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    const pdfRef = useRef();
    const getNumericFieldValue = (key) => key === "breakMinutes" ? form[key] ?? "" : form[key] || "";
    const parseNumericFieldValue = (key, rawValue) => {
      if (rawValue === "") return key === "breakMinutes" ? "" : 0;
      return +rawValue;
    };
    const addLink = () => set("links", [...form.links || [], { label: "", url: "" }]);
    const updLink = (i, k, v) => set("links", form.links.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
    const delLink = (i) => set("links", form.links.filter((_, idx) => idx !== i));
    const PDF_MAX_BYTES = 10 * 1024 * 1024;
    const [pdfUploading, setPdfUploading] = useState(false);
    const onPdfUpload = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > PDF_MAX_BYTES) {
        alert("PDF \uC6A9\uB7C9\uC774 10MB\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4.");
        return;
      }
      setPdfUploading(true);
      const ext = f.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
      const uid = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString(36);
      const path = `syllabi/${uid}.${ext}`;
      const { url, error } = await sbStorageUpload("course-pdfs", path, f);
      setPdfUploading(false);
      if (error) {
        console.warn("Storage \uC5C5\uB85C\uB4DC \uC2E4\uD328 \u2014 Base64 \uD3F4\uBC31:", error);
        const r = new FileReader();
        r.onload = (ev) => {
          set("pdfData", ev.target.result);
          set("pdfName", f.name);
        };
        r.readAsDataURL(f);
        return;
      }
      set("pdfData", url);
      set("pdfName", f.name);
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 16,
        width: 560,
        maxWidth: "96vw",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,${T.sb},${T.p})`,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff" } }, isNew ? "\uACFC\uC815 \uCD94\uAC00" : "\uACFC\uC815 \uC218\uC815"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 2 } }, isNew ? "\uC0C8 \uAD50\uC721\uACFC\uC815 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694" : form.code)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 6 } }, "\uBD84\uC57C ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, CAT_LIST.map((cat) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: cat,
          type: "button",
          onClick: () => {
            set("cat", cat);
            set("cc", CAT_COLORS[cat]);
          },
          style: {
            padding: "6px 13px",
            borderRadius: 20,
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            transition: "all .15s",
            background: form.cat === cat ? CAT_COLORS[cat] : T.s3,
            color: form.cat === cat ? "#fff" : T.mu
          }
        },
        cat
      )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uACFC\uC815\uBA85 ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement("input", { value: form.name || "", onChange: (e) => set("name", e.target.value), placeholder: "\uC608) \uD589\uC815\uD68C\uACC4 \uC0AC\uBB34 OA \uACFC\uC815", style: inp })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uACFC\uC815\uCF54\uB4DC ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement("input", { value: form.code || "", onChange: (e) => set("code", e.target.value), placeholder: "SM-01", style: inp })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uAD50\uC721 \uC2DC\uC791\uC77C ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement("input", { type: "date", value: form.dateFrom || "", onChange: (e) => set("dateFrom", e.target.value), style: inp })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uAD50\uC721 \uC885\uB8CC\uC77C ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          value: form.dateTo || "",
          onChange: (e) => set("dateTo", e.target.value),
          style: { ...inp, borderColor: form.dateFrom && form.dateTo && form.dateTo < form.dateFrom ? T.danger : T.bd }
        }
      ))), (form.dateFrom || form.dateTo) && /* @__PURE__ */ React.createElement("div", { style: {
        padding: "7px 12px",
        borderRadius: 7,
        background: T.s2,
        border: `1px solid ${T.bd}`,
        fontSize: 11,
        color: T.mu,
        display: "flex",
        gap: 8,
        alignItems: "center"
      } }, "\u{1F4C5}", /* @__PURE__ */ React.createElement("span", { style: { color: T.tx, fontWeight: 600 } }, form.dateFrom || "\uBBF8\uC815", " ~ ", form.dateTo || "\uBBF8\uC815"), form.dateFrom && form.dateTo && form.dateTo >= form.dateFrom && (() => {
        const ms = new Date(form.dateTo) - new Date(form.dateFrom);
        const days = Math.round(ms / 864e5) + 1;
        const weeks = Math.round(days / 7);
        return /* @__PURE__ */ React.createElement("span", { style: { color: T.mu } }, "(\uCD1D ", days, "\uC77C \xB7 \uC57D ", weeks, "\uC8FC)");
      })(), form.dateFrom && form.dateTo && form.dateTo < form.dateFrom && /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "\u26A0\uFE0F \uC885\uB8CC\uC77C\uC774 \uC2DC\uC791\uC77C\uBCF4\uB2E4 \uBE60\uB985\uB2C8\uB2E4")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uAD50\uC721\uBC29\uC2DD"), /* @__PURE__ */ React.createElement("select", { value: form.method || "\uB300\uBA74", onChange: (e) => set("method", e.target.value), style: { ...inp, cursor: "pointer" } }, ["\uB300\uBA74", "\uBE44\uB300\uBA74", "\uBE14\uB80C\uB514\uB4DC", "-"].map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10 } }, [{ label: "\uCD1D \uC2DC\uC218", key: "hours", ph: "200" }, { label: "\uC26C\uB294\uC2DC\uAC04(\uBD84)", key: "breakMinutes", ph: "60" }, { label: "\uAD50\uC721\uBAA9\uD45C", key: "tgt", ph: "20" }, { label: "\uC218\uB8CC\uBAA9\uD45C", key: "cGoal", ph: "18" }, { label: "\uCDE8\uC5C5\uBAA9\uD45C", key: "eGoal", ph: "12" }].map(({ label, key, ph }) => /* @__PURE__ */ React.createElement("div", { key }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, label), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "number",
          value: getNumericFieldValue(key),
          onChange: (e) => set(key, parseNumericFieldValue(key, e.target.value)),
          placeholder: ph,
          style: inp
        }
      )))), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "12px 14px",
        borderRadius: 10,
        background: "#FFFBEB",
        border: "1px solid #FDE68A"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 10 } }, "\u{1F4CB} \uC218\uC5C5 \uC694\uC77C \xB7 \uC2DC\uAC04\uB300 ", /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400, color: T.mu } }, "\u2014 \uC218\uAC15\uC99D\uBA85\uC11C \u2465 \uC218\uAC15\uAE30\uAC04\uC5D0 \uC790\uB3D9 \uBC18\uC601")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "end" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uC218\uC5C5 \uC694\uC77C ", /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400 } }, "(\uC608: \uC6D4, \uD654, \uBAA9)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, ["\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"].map((d) => {
        const active = (form.schedDays || "").includes(d);
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: d,
            type: "button",
            onClick: () => {
              const arr = (form.schedDays || "").split(",").map((x) => x.trim()).filter(Boolean);
              const next = active ? arr.filter((x) => x !== d) : [...arr, d];
              const order = ["\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"];
              set("schedDays", next.sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(", "));
            },
            style: {
              width: 30,
              height: 30,
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              background: active ? "#EA580C" : T.s3,
              color: active ? "#fff" : T.mu
            }
          },
          d
        );
      }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uC218\uC5C5 \uC2DC\uC791"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "time",
          value: form.schedTimeFrom || "09:00",
          onChange: (e) => set("schedTimeFrom", e.target.value),
          style: { ...inp, width: 110, cursor: "pointer" }
        }
      )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uC218\uC5C5 \uC885\uB8CC"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "time",
          value: form.schedTimeTo || "13:00",
          onChange: (e) => set("schedTimeTo", e.target.value),
          style: { ...inp, width: 110, cursor: "pointer" }
        }
      ))), (form.period || form.schedDays || form.schedTimeFrom) && /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 9,
        fontSize: 11,
        color: "#92400E",
        background: "#FFFCE8",
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid #FDE68A"
      } }, /* @__PURE__ */ React.createElement("b", null, "\u2465 \uC218\uAC15\uAE30\uAC04 \uBBF8\uB9AC\uBCF4\uAE30:"), " ", form.dateFrom && form.dateTo ? `${form.dateFrom} ~ ${form.dateTo}` : form.dateFrom || form.dateTo || "(\uAE30\uAC04 \uBBF8\uC785\uB825)", form.schedDays ? ` / \uB9E4\uC8FC ${form.schedDays}` : "", form.schedTimeFrom && form.schedTimeTo ? ` ${form.schedTimeFrom} \u223C ${form.schedTimeTo}` : "", ` / \uD734\uC2DD ${form.breakMinutes ?? 60}\uBD84`)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          id: "includeBreakInHours",
          checked: form.includeBreakInHours === true,
          onChange: (e) => set("includeBreakInHours", e.target.checked),
          style: { width: 15, height: 15, cursor: "pointer" }
        }
      ), /* @__PURE__ */ React.createElement("label", { htmlFor: "includeBreakInHours", style: { fontSize: 12, fontWeight: 600, color: T.tx, cursor: "pointer" } }, "\uC218\uB8CC\uC2DC\uAC04 \uACC4\uC0B0 \uC2DC \uC26C\uB294\uC2DC\uAC04 \uD3EC\uD568"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, "(\uCCB4\uD06C \uC2DC: \uC26C\uB294\uC2DC\uAC04\uC774 \uC218\uC5C5\uC2DC\uAC04\uC5D0 \uD3EC\uD568\uB418\uC5B4 \uC218\uB8CC\uC2DC\uAC04\uC5D0 \uBC18\uC601\uB428)")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\u{1F4DD} \uCC38\uACE0\uC0AC\uD56D"), /* @__PURE__ */ React.createElement(
        "textarea",
        {
          value: form.notes || "",
          onChange: (e) => set("notes", e.target.value),
          placeholder: "\uACFC\uC815 \uC6B4\uC601 \uCC38\uACE0\uC0AC\uD56D, \uD2B9\uC774\uC0AC\uD56D \uB4F1 \uC790\uC720 \uAE30\uC7AC",
          rows: 2,
          style: { ...inp, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }
        }
      )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu } }, "\u{1F517} \uCC38\uACE0 \uB9C1\uD06C"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: addLink, style: {
        fontSize: 11,
        padding: "4px 10px",
        borderRadius: 6,
        border: `1px solid ${T.p}`,
        background: "transparent",
        color: T.p,
        cursor: "pointer",
        fontWeight: 600
      } }, "+ \uCD94\uAC00")), (form.links || []).length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.bd, textAlign: "center", padding: "10px 0" } }, "\uB9C1\uD06C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"), (form.links || []).map((lk, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 6, marginBottom: 6 } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          value: lk.label || "",
          onChange: (e) => updLink(i, "label", e.target.value),
          placeholder: "\uB9C1\uD06C \uC124\uBA85 (\uC608: \uAC15\uC758\uACC4\uD68D\uC11C)",
          style: { ...inp, fontSize: 11 }
        }
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          value: lk.url || "",
          onChange: (e) => updLink(i, "url", e.target.value),
          placeholder: "https://...",
          style: { ...inp, fontSize: 11 }
        }
      ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => delLink(i), style: {
        width: 30,
        height: 34,
        borderRadius: 6,
        border: "none",
        background: "#FEF2F2",
        color: T.danger,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 12 }))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 8 } }, "\u{1F4C4} \uAC15\uC758\uACC4\uD68D\uC11C / \uC218\uC5C5\uC77C\uC815\uD45C (PDF, \uCD5C\uB300 5MB)"), /* @__PURE__ */ React.createElement("input", { ref: pdfRef, type: "file", accept: ".pdf", style: { display: "none" }, onChange: onPdfUpload }), form.pdfData ? /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 8,
        background: T.pbg,
        border: `1px solid ${T.pl}50`
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20 } }, "\u{1F4D5}"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.p } }, form.pdfName), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, "\uC5C5\uB85C\uB4DC \uC644\uB8CC")), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "outline", onClick: () => {
        const w = window.open();
        w.document.write(`<iframe src="${form.pdfData}" style="width:100%;height:100vh;border:none;"/>`);
      } }, "\uBBF8\uB9AC\uBCF4\uAE30"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
        set("pdfData", "");
        set("pdfName", "");
      }, style: {
        width: 26,
        height: 26,
        borderRadius: 6,
        border: "none",
        background: "#FEF2F2",
        color: T.danger,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 12 }))) : /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => !pdfUploading && pdfRef.current.click(), style: {
        width: "100%",
        padding: "14px",
        borderRadius: 8,
        border: `2px dashed ${T.bd}`,
        background: T.s2,
        cursor: pdfUploading ? "not-allowed" : "pointer",
        fontSize: 12,
        color: T.mu,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "upload", s: 16 }), " ", pdfUploading ? "\uC5C5\uB85C\uB4DC \uC911\u2026" : "PDF \uD30C\uC77C \uC120\uD0DD (\uAC15\uC758\uACC4\uD68D\uC11C / \uC218\uC5C5\uC77C\uC815\uD45C)")), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 14px", borderRadius: 10, background: T.s2, border: `1px solid ${T.bd}`, borderLeft: `4px solid ${form.cc || T.p}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginBottom: 4 } }, "\uBBF8\uB9AC\uBCF4\uAE30"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx } }, form.name || "(\uACFC\uC815\uBA85 \uC5C6\uC74C)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginTop: 2 } }, form.code, " \xB7 ", formatCoursePeriod(form), " \xB7 ", form.method, " \xB7 ", form.hours || 0, "\uC2DC\uAC04 \xB7 \uD734\uC2DD ", form.breakMinutes ?? 60, "\uBD84"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "13px 22px", borderTop: `1px solid ${T.bd}`, display: "flex", justifyContent: "flex-end", gap: 8, background: T.s2 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { onClick: async () => {
        if (!form.name || !form.code) return alert("\uACFC\uC815\uBA85\uACFC \uACFC\uC815\uCF54\uB4DC\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.");
        await onSave({ ...form, id: form.id ? form.id : void 0 });
        onClose();
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), " ", isNew ? "\uCD94\uAC00" : "\uC800\uC7A5")))
    );
  };
  const CourseList = ({ courses, onAdd, onUpdate, onDelete }) => {
    const [cat, setCat] = useState("\uC804\uCCB4");
    const [editCourse, setEdit] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const cats = ["\uC804\uCCB4", ...new Set(courses.map((c) => c.cat))];
    const list = cat === "\uC804\uCCB4" ? courses : courses.filter((c) => c.cat === cat);
    const openNew = () => {
      setIsNew(true);
      setEdit({});
    };
    const loadFullCourse = async (c) => {
      if (!c?.id || c.pdfData) return c;
      try {
        const { data, error } = await sbGet("courses", `select=*&id=eq.${c.id}&limit=1`);
        if (!error && data?.[0]) return toCourse(data[0]);
      } catch (err) {
        console.warn("PDF \uB370\uC774\uD130 \uB85C\uB4DC \uC2E4\uD328:", err);
      }
      return c;
    };
    const openEdit = async (c) => {
      setIsNew(false);
      setEdit(await loadFullCourse(c));
    };
    const previewPdf = async (c) => {
      const full = await loadFullCourse(c);
      if (!full?.pdfData) return alert("\uCCA8\uBD80 PDF\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      const w = window.open();
      w.document.write(`<iframe src="${full.pdfData}" style="width:100%;height:100vh;border:none;"/>`);
    };
    const handleDelete = (c) => {
      if (!window.confirm(`"${c.name}" \uACFC\uC815\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?
\u203B \uD574\uB2F9 \uACFC\uC815 \uD6C8\uB828\uC0DD \uB370\uC774\uD130\uB294 \uC720\uC9C0\uB429\uB2C8\uB2E4.`)) return;
      onDelete(c.id);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, editCourse !== null && /* @__PURE__ */ React.createElement(
      CourseModal,
      {
        course: isNew ? null : editCourse,
        isNew,
        onSave: isNew ? onAdd : onUpdate,
        onClose: () => setEdit(null)
      }
    ), /* @__PURE__ */ React.createElement(
      SectionHead,
      {
        title: "\uACFC\uC815 \uD604\uD669",
        sub: `2026\uB144 \uACBD\uAE30\uBD81\uBD80 \uC9C1\uC5C5\uAD50\uC721 \xB7 \uCD1D ${courses.length}\uAC1C \uACFC\uC815`,
        right: /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: openNew }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 13 }), " \uACFC\uC815 \uCD94\uAC00")
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" } }, cats.map((c) => /* @__PURE__ */ React.createElement("button", { key: c, onClick: () => setCat(c), style: {
      padding: "6px 14px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      transition: "all .15s",
      background: cat === c ? T.p : T.s3,
      color: cat === c ? "#fff" : T.mu
    } }, c))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 } }, list.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.id, className: "course-card", style: {
      background: T.s,
      borderRadius: 12,
      padding: 18,
      border: `1px solid ${T.bd}`,
      borderLeft: `4px solid ${c.cc}`,
      boxShadow: "0 1px 4px rgba(0,0,0,.05)",
      position: "relative"
    } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 12, right: 12, display: "flex", gap: 5 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => openEdit(c), style: { width: 26, height: 26, borderRadius: 6, border: "none", background: T.pbg, color: T.p, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { n: "edit", s: 12 })), /* @__PURE__ */ React.createElement("button", { onClick: () => handleDelete(c), style: { width: 26, height: 26, borderRadius: 6, border: "none", background: "#FEF2F2", color: T.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 12 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingRight: 60 } }, /* @__PURE__ */ React.createElement(Chip, { label: c.cat, bg: `${c.cc}15`, color: c.cc }), /* @__PURE__ */ React.createElement(Chip, { label: c.method || "-", bg: T.s3, color: T.mu })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, lineHeight: 1.45, marginBottom: 3, paddingRight: 60 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginBottom: 10 } }, c.code, " \xB7 ", formatCoursePeriod(c), " \xB7 ", c.hours > 0 ? `${c.hours}\uC2DC\uAC04` : "\uBBF8\uC815", " \xB7 \uD734\uC2DD ", toNum(c.breakMinutes) ?? 60, "\uBD84", c.schedDays && /* @__PURE__ */ React.createElement("span", { style: { color: T.p, marginLeft: 6 } }, "\u{1F4C5} ", c.schedDays), c.schedTimeFrom && c.schedTimeTo && /* @__PURE__ */ React.createElement("span", { style: { color: T.mu, marginLeft: 4 } }, c.schedTimeFrom, "\u223C", c.schedTimeTo)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 12 } }, [{ l: "\uAD50\uC721\uBAA9\uD45C", v: c.tgt }, { l: "\uC218\uB8CC\uBAA9\uD45C", v: c.cGoal }, { l: "\uCDE8\uC5C5\uBAA9\uD45C", v: c.eGoal }].map(({ l, v }) => /* @__PURE__ */ React.createElement("div", { key: l, style: { textAlign: "center", padding: "7px 4px", background: T.s2, borderRadius: 6, border: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: T.tx } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: T.mu, marginTop: 1 } }, l)))), c.pdfName && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => previewPdf(c),
        style: {
          width: "100%",
          padding: "7px 10px",
          borderRadius: 7,
          border: `1px solid ${T.pl}60`,
          background: T.pbg,
          color: T.p,
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8
        }
      },
      /* @__PURE__ */ React.createElement("span", null, "\u{1F4D5}"),
      " ",
      c.pdfName || "\uCCA8\uBD80 PDF \uBBF8\uB9AC\uBCF4\uAE30"
    ), (c.links || []).filter((l) => l.url).length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, (c.links || []).filter((l) => l.url).map((lk, i) => /* @__PURE__ */ React.createElement(
      "a",
      {
        key: i,
        href: lk.url,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 8px",
          borderRadius: 6,
          background: T.s2,
          border: `1px solid ${T.bd}`,
          color: T.p,
          textDecoration: "none",
          fontSize: 11,
          fontWeight: 600
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { n: "info", s: 12 }),
      /* @__PURE__ */ React.createElement("span", { style: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, lk.label || lk.url),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: T.mu } }, "\u2197")
    ))), c.notes && /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 8,
      padding: "7px 10px",
      borderRadius: 7,
      background: T.s3,
      fontSize: 11,
      color: T.mu,
      lineHeight: 1.5
    } }, "\u{1F4DD} ", c.notes))), /* @__PURE__ */ React.createElement("div", { onClick: openNew, className: "course-card", style: {
      background: T.s2,
      borderRadius: 12,
      padding: 18,
      border: `2px dashed ${T.bd}`,
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minHeight: 180,
      transition: "all .2s"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: `${T.p}15`,
      color: T.p,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 20 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.mu } }, "\uC0C8 \uACFC\uC815 \uCD94\uAC00"))));
  };
  const StudentMgmt = ({ students, courses, onAdd, onEdit, onUpdate, onDelete, onNew, currentUser }) => {
    const [search, setSearch] = useState("");
    const [cFilter, setCFilter] = useState(0);
    const [enrollFilter, setEnrollFilter] = useState("all");
    const [empFilter, setEmpFilter] = useState("all");
    const [riskOnly, setRisk] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [tab, setTab] = useState("list");
    const fileRef = useRef();
    const [statusTarget, setStatusTarget] = useState(null);
    const [employmentTarget, setEmploymentTarget] = useState(null);
    const [attModal, setAttModal] = useState(null);
    const [attRecords, setAttRecords] = useState([]);
    const [attLoading, setAttLoading] = useState(false);
    const [studentDetailTab, setStudentDetailTab] = useState("profile");
    useEffect(() => {
      if (!attModal) {
        setAttRecords([]);
        return;
      }
      let cancelled = false;
      setAttLoading(true);
      const studentId = Number(attModal.id);
      if (!studentId) {
        setAttLoading(false);
        return;
      }
      const load = async () => {
        try {
          const { data, error } = await sbGet(
            "attendance",
            `select=date,check_in,check_out,status&student_id=eq.${studentId}&order=date.asc`
          );
          if (!cancelled) setAttRecords(error ? [] : data || []);
        } catch {
          if (!cancelled) setAttRecords([]);
        }
        if (!cancelled) setAttLoading(false);
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [attModal]);
    useEffect(() => {
      if (!attModal || !ENABLE_REALTIME) return;
      const studentId = Number(attModal.id);
      if (!studentId) return;
      let intentionallyClosed = false;
      let heartbeatId = null;
      let currentWs = null;
      let retryDelay = 2e3;
      let refCount = 0;
      const channel = `realtime:public:attendance`;
      const joinRef = String(++refCount);
      let subIds = [];
      const send = (obj) => {
        if (currentWs?.readyState === WebSocket.OPEN) currentWs.send(JSON.stringify(obj));
      };
      const connect = () => {
        if (intentionallyClosed) return;
        const ws = new WebSocket(
          `wss://${SB_URL.replace("https://", "")}/realtime/v1/websocket?apikey=${SB_KEY}&vsn=1.0.0`
        );
        currentWs = ws;
        ws.onopen = () => {
          retryDelay = 2e3;
          send({
            topic: channel,
            event: "phx_join",
            payload: {
              config: {
                broadcast: { self: false },
                presence: { key: "" },
                postgres_changes: [{
                  event: "*",
                  schema: "public",
                  table: "attendance",
                  filter: `student_id=eq.${studentId}`
                }]
              },
              access_token: SB_KEY
            },
            ref: joinRef,
            join_ref: joinRef
          });
          heartbeatId = setInterval(() => {
            send({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++refCount) });
          }, 25e3);
        };
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === "phx_reply" && msg.ref === joinRef) {
              subIds = (msg.payload?.response?.postgres_changes || []).map((c) => c.id);
              return;
            }
            if (msg.event === "postgres_changes" && msg.payload?.data) {
              const ids = msg.payload.ids || [];
              if (subIds.length > 0 && !ids.some((id) => subIds.includes(id))) return;
              const { type: evType, record: nr } = msg.payload.data;
              if ((evType === "INSERT" || evType === "UPDATE") && Number(nr?.student_id) === studentId) {
                setAttRecords((prev) => {
                  const idx = prev.findIndex((r) => r.date === nr.date);
                  const updated = { date: nr.date, check_in: nr.check_in, check_out: nr.check_out, status: nr.status };
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = updated;
                    return next;
                  }
                  return [...prev, updated].sort((a, b) => a.date.localeCompare(b.date));
                });
              } else if (evType === "DELETE" && Number(msg.payload.data?.old_record?.student_id) === studentId) {
                setAttRecords((prev) => prev.filter((r) => r.date !== msg.payload.data.old_record?.date));
              }
            }
          } catch {
          }
        };
        ws.onerror = () => {
        };
        ws.onclose = (ev) => {
          clearInterval(heartbeatId);
          heartbeatId = null;
          if (!intentionallyClosed) {
            setTimeout(connect, retryDelay);
            retryDelay = Math.min(retryDelay * 2, 3e4);
          }
        };
      };
      connect();
      return () => {
        intentionallyClosed = true;
        clearInterval(heartbeatId);
        heartbeatId = null;
        currentWs?.close();
      };
    }, [attModal]);
    const filtered = useMemo(() => students.filter((s) => {
      if (cFilter && s.cid !== cFilter) return false;
      if (enrollFilter !== "all" && (s.enrollmentStatus || "\uC7AC\uD559\uC911") !== enrollFilter) return false;
      if (empFilter !== "all" && getEffectiveEmploymentStatus(s) !== empFilter) return false;
      if (riskOnly && (isDropoutStudent(s) || s.rate >= 80)) return false;
      if (search && !s.name.includes(search) && !s.phone.includes(search)) return false;
      return true;
    }), [students, cFilter, enrollFilter, empFilter, riskOnly, search]);
    const studentSummary = useMemo(() => {
      const enrolled = {};
      const employment = {};
      students.forEach((s) => {
        const es = s.enrollmentStatus || "\uC7AC\uD559\uC911";
        const emp = getEffectiveEmploymentStatus(s);
        enrolled[es] = (enrolled[es] || 0) + 1;
        employment[emp] = (employment[emp] || 0) + 1;
      });
      const mismatch = students.filter((s) => (s.enrollmentStatus || "") === "\uC870\uAE30\uCDE8\uC5C5" && (s.status || "\uBBF8\uCDE8\uC5C5") !== "\uCDE8\uC5C5");
      return { enrolled, employment, mismatch };
    }, [students]);
    const syncEarlyEmployment = async () => {
      const targets = studentSummary.mismatch;
      if (targets.length === 0) return alert("\uBCF4\uC815\uD560 \uC870\uAE30\uCDE8\uC5C5 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
      if (!window.confirm(`\uC870\uAE30\uCDE8\uC5C5 ${targets.length}\uBA85\uC758 \uCDE8\uC5C5\uC5EC\uBD80\uB97C '\uCDE8\uC5C5'\uC73C\uB85C \uBCF4\uC815\uD560\uAE4C\uC694?`)) return;
      await Promise.all(targets.map((s) => onUpdate({ ...s, status: "\uCDE8\uC5C5" })));
      alert(`\u2705 ${targets.length}\uBA85 \uBCF4\uC815 \uC644\uB8CC`);
    };
    const parseFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        setPreview(rows);
        setTab("import");
      };
      reader.readAsArrayBuffer(file);
    };
    const onDrop = (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) parseFile(f);
    };
    const confirmImport = () => {
      if (!preview) return;
      const yn = (v) => String(v || "").trim().toUpperCase() === "Y";
      const toAdd = [];
      const toUpdate = [];
      preview.forEach((r, i) => {
        const code = r["\uACFC\uC815\uCF54\uB4DC"] || "";
        const c = courses.find((x) => x.code === code) || courses[0];
        const phone = String(r["\uC5F0\uB77D\uCC98"] || "").replace(/[^0-9]/g, "");
        let birth = r["\uC0DD\uB144\uC6D4\uC77C"] || "";
        let idBack = String(r["\uC8FC\uBBFC\uBC88\uD638\uB4B7\uC790\uB9AC"] || "");
        const idNum = String(r["\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638"] || "").replace(/[^0-9]/g, "");
        if (idNum.length >= 13) {
          const front6 = idNum.slice(0, 6);
          const back7 = idNum.slice(6, 13);
          const yy = front6.slice(0, 2), mm = front6.slice(2, 4), dd = front6.slice(4, 6);
          const f1 = back7[0] || "";
          const yyyy = f1 === "3" || f1 === "4" || f1 === "7" || f1 === "8" ? `20${yy}` : `19${yy}`;
          birth = `${yyyy}-${mm}-${dd}`;
          idBack = back7;
        }
        const base = {
          cid: c.id,
          name: r["\uC774\uB984"] || "",
          gender: r["\uC131\uBCC4"] || "",
          birth,
          idBack,
          phone,
          phone2: String(r["\uBE44\uC0C1\uC5F0\uB77D\uCC98"] || "").replace(/[^0-9]/g, ""),
          addrCity: r["\uAC70\uC8FC\uC2DC"] || r["\uAC70\uC8FC\uC2DC\uAD70"] || "",
          addrDetail: r["\uC0C1\uC138\uC8FC\uC18C"] || "",
          edu: r["\uCD5C\uC885\uD559\uB825"] || "",
          major: r["\uC804\uACF5"] || "",
          career: r["\uACBD\uB825"] || "",
          cert: r["\uC790\uACA9\uC99D"] || "",
          status: r["\uCDE8\uC5C5\uD615\uD0DC"] || "\uBBF8\uCDE8\uC5C5",
          unemp: yn(r["\uC2E4\uC5C5\uAE09\uC5EC\uC218\uAE09"]),
          disabled: yn(r["\uC7A5\uC560\uC5EC\uBD80"]),
          veteran: yn(r["\uBCF4\uD6C8\uC5EC\uBD80"]),
          itvDate: r["\uBA74\uC811\uC77C\uC790"] || r["\uBA74\uC811\uC77C"] || "",
          itvScore: r["\uBA74\uC811\uC810\uC218"] || "",
          itvGrade: r["\uBA74\uC811\uB4F1\uAE09"] || "",
          itvPass: yn(r["\uD569\uACA9\uC5EC\uBD80"]) || String(r["\uD569\uACA9\uC5EC\uBD80"] || "").trim() === "\uD569\uACA9",
          memo: r["\uD2B9\uC774\uC0AC\uD56D"] || ""
        };
        const existing = phone ? students.find((s) => s.phone && s.phone === phone) : null;
        if (existing) {
          toUpdate.push({ ...existing, ...base });
        } else {
          toAdd.push({ ...base, rate: 0 });
        }
      });
      if (toAdd.length > 0) onAdd(toAdd);
      if (toUpdate.length > 0 && onUpdate) toUpdate.forEach((s) => onUpdate(s));
      setPreview(null);
      setTab("list");
      const msg = [
        toAdd.length && `\uC2E0\uADDC ${toAdd.length}\uBA85 \uB4F1\uB85D`,
        toUpdate.length && `\uAE30\uC874 ${toUpdate.length}\uBA85 \uC5C5\uB370\uC774\uD2B8`
      ].filter(Boolean).join(" / ");
      alert(`\u2705 ${msg} \uC644\uB8CC`);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement(
      SectionHead,
      {
        title: "\uD6C8\uB828\uC0DD \uAD00\uB9AC",
        sub: "\uD6C8\uB828\uC0DD \uB4F1\uB85D, \uC774\uB825 \uC870\uD68C \uBC0F \uCD9C\uC11D \uD604\uD669",
        right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => downloadTemplate(courses) }, /* @__PURE__ */ React.createElement(Icon, { n: "dl", s: 13 }), " \uC591\uC2DD \uB2E4\uC6B4\uB85C\uB4DC"), /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => setTab(tab === "import" ? "list" : "import") }, /* @__PURE__ */ React.createElement(Icon, { n: "upload", s: 13 }), " ", tab === "import" ? "\uBAA9\uB85D\uC73C\uB85C" : "\uC5D1\uC140 \uC5C5\uB85C\uB4DC"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: onNew }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 13 }), " \uC2E0\uADDC \uB4F1\uB85D"))
      }
    ), tab === "import" ? /* @__PURE__ */ React.createElement("div", null, !preview && /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `drop-zone${dragging ? " drag-over" : ""}`,
        onDragOver: (e) => {
          e.preventDefault();
          setDragging(true);
        },
        onDragLeave: () => setDragging(false),
        onDrop,
        onClick: () => fileRef.current.click(),
        style: {
          padding: "48px 24px",
          textAlign: "center",
          cursor: "pointer",
          border: `2px dashed ${T.pl}`,
          borderRadius: 12,
          margin: 16
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "\u{1F4C2}"),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: T.tx, marginBottom: 6 } }, "\uC5D1\uC140 \uD30C\uC77C\uC744 \uC5EC\uAE30\uC5D0 \uB04C\uC5B4\uB2E4 \uB193\uC73C\uC138\uC694"),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.mu, marginBottom: 16 } }, "\uB610\uB294 \uD074\uB9AD\uD574\uC11C \uD30C\uC77C \uC120\uD0DD (.xlsx, .xls \uC9C0\uC6D0)"),
      /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: (e) => {
        e.stopPropagation();
        fileRef.current.click();
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "upload", s: 13 }), " \uD30C\uC77C \uC120\uD0DD"),
      /* @__PURE__ */ React.createElement(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: ".xlsx,.xls",
          style: { display: "none" },
          onChange: (e) => {
            if (e.target.files[0]) parseFile(e.target.files[0]);
          }
        }
      )
    ), /* @__PURE__ */ React.createElement("div", { style: {
      padding: "14px 20px",
      background: T.s2,
      borderTop: `1px solid ${T.bd}`,
      display: "flex",
      gap: 20,
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "info", s: 16 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.mu, flex: 1 } }, "\uC5D1\uC140 \uC591\uC2DD\uC740 ", /* @__PURE__ */ React.createElement("b", { style: { color: T.p } }, "\uC591\uC2DD \uB2E4\uC6B4\uB85C\uB4DC"), " \uBC84\uD2BC\uC5D0\uC11C \uBC1B\uC73C\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uD544\uC218 \uCEEC\uB7FC: ", /* @__PURE__ */ React.createElement("b", null, "\uC774\uB984, \uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638, \uC5F0\uB77D\uCC98, \uACFC\uC815\uCF54\uB4DC"), "\u3000(\uAD6C \uC591\uC2DD: \uC0DD\uB144\uC6D4\uC77C + \uC8FC\uBBFC\uBC88\uD638\uB4B7\uC790\uB9AC\uB3C4 \uD638\uD658)"), /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: downloadTemplate }, /* @__PURE__ */ React.createElement(Icon, { n: "dl", s: 12 }), " \uC591\uC2DD \uBC1B\uAE30"))), preview && /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "14px 18px",
      borderBottom: `1px solid ${T.bd}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 13, color: T.tx } }, "\u{1F4CB} \uC5C5\uB85C\uB4DC \uBBF8\uB9AC\uBCF4\uAE30"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: T.mu, marginLeft: 10 } }, preview.length, "\uBA85 \uD655\uC778")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => {
      setPreview(null);
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 12 }), " \uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: confirmImport }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 12 }), " ", preview.length, "\uBA85 \uB4F1\uB85D \uD655\uC815"))), /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2 } }, TEMPLATE_HEADERS.map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "9px 14px",
      textAlign: "left",
      fontSize: 11,
      color: T.mu,
      fontWeight: 700,
      borderBottom: `1px solid ${T.bd}`
    } }, h)), /* @__PURE__ */ React.createElement("th", { style: { padding: "9px 14px", fontSize: 11, color: T.mu, fontWeight: 700, borderBottom: `1px solid ${T.bd}` } }, "\uB9E4\uCE6D \uACFC\uC815"))), /* @__PURE__ */ React.createElement("tbody", null, preview.map((r, i) => {
      const c = courses.find((x) => x.code === r["\uACFC\uC815\uCF54\uB4DC"]);
      return /* @__PURE__ */ React.createElement("tr", { key: i, className: "row-hover", style: { borderBottom: `1px solid ${T.bd}` } }, TEMPLATE_HEADERS.map((h) => /* @__PURE__ */ React.createElement("td", { key: h, style: { padding: "10px 14px", fontSize: 12, color: T.tx } }, r[h] || "")), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 14px" } }, c ? /* @__PURE__ */ React.createElement(Chip, { label: shortCourseName(c.name), bg: `${c.cc}12`, color: c.cc }) : /* @__PURE__ */ React.createElement(Chip, { label: "\uACFC\uC815\uCF54\uB4DC \uC624\uB958", bg: "#FEF2F2", color: T.danger })));
    })))))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 12 } }, [
      { label: "\uC804\uCCB4 \uD6C8\uB828\uC0DD", value: students.length, color: T.p, sub: "\uB4F1\uB85D \uAE30\uC900" },
      { label: "\uC7AC\uD559\uC911", value: studentSummary.enrolled["\uC7AC\uD559\uC911"] || 0, color: "#1D4ED8", sub: "\uD604\uC7AC \uC218\uAC15" },
      { label: "\uC218\uB8CC/\uC608\uC815", value: (studentSummary.enrolled["\uC218\uB8CC"] || 0) + (studentSummary.enrolled["\uC218\uB8CC\uC608\uC815"] || 0), color: "#15803D", sub: "\uC218\uB8CC \uAD00\uB9AC" },
      { label: "\uCDE8\uC5C5/\uC608\uC815", value: (studentSummary.employment["\uCDE8\uC5C5"] || 0) + (studentSummary.employment["\uCDE8\uC5C5\uC608\uC815"] || 0), color: "#0369A1", sub: "\uCDE8\uC5C5\uC5EC\uBD80 \uAE30\uC900" },
      { label: "\uC870\uAE30\uCDE8\uC5C5 \uBCF4\uC815", value: studentSummary.mismatch.length, color: studentSummary.mismatch.length ? T.danger : T.ok, sub: "\uC0C1\uD0DC/\uCDE8\uC5C5 \uBD88\uC77C\uCE58" }
    ].map((k) => /* @__PURE__ */ React.createElement("div", { key: k.label, style: {
      border: `1px solid ${k.color}25`,
      borderRadius: 10,
      background: "#fff",
      padding: "11px 13px",
      display: "flex",
      alignItems: "center",
      gap: 10
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 34,
      height: 34,
      borderRadius: 8,
      background: `${k.color}14`,
      color: k.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      fontWeight: 900
    } }, k.value), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: T.tx } }, k.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, k.sub))))), /* @__PURE__ */ React.createElement(Card, { style: { padding: "13px 16px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: T.mu, pointerEvents: "none" } }, /* @__PURE__ */ React.createElement(Icon, { n: "search", s: 13 })), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: search,
        onChange: (e) => setSearch(e.target.value),
        placeholder: "\uC774\uB984\xB7\uC5F0\uB77D\uCC98 \uAC80\uC0C9",
        style: {
          paddingLeft: 28,
          paddingRight: 12,
          paddingTop: 7,
          paddingBottom: 7,
          border: `1px solid ${T.bd}`,
          borderRadius: 8,
          fontSize: 12,
          outline: "none",
          background: T.s2,
          width: 180,
          color: T.tx
        }
      }
    )), /* @__PURE__ */ React.createElement("select", { value: cFilter, onChange: (e) => setCFilter(+e.target.value), style: {
      padding: "7px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      background: T.s2,
      color: T.tx,
      cursor: "pointer"
    } }, /* @__PURE__ */ React.createElement("option", { value: 0 }, "\uC804\uCCB4 \uACFC\uC815"), courses.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, shortCourseName(c.name), " [", c.code, "]"))), /* @__PURE__ */ React.createElement("select", { value: enrollFilter, onChange: (e) => setEnrollFilter(e.target.value), style: {
      padding: "7px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      background: T.s2,
      color: T.tx,
      cursor: "pointer"
    } }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "\uC804\uCCB4 \uB4F1\uB85D\uC0C1\uD0DC"), ENROLLMENT_STATUSES.map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v))), /* @__PURE__ */ React.createElement("select", { value: empFilter, onChange: (e) => setEmpFilter(e.target.value), style: {
      padding: "7px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      background: T.s2,
      color: T.tx,
      cursor: "pointer"
    } }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "\uC804\uCCB4 \uCDE8\uC5C5\uC5EC\uBD80"), EMPLOYMENT_STATUSES.map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v))), /* @__PURE__ */ React.createElement("button", { onClick: () => setRisk(!riskOnly), style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "7px 13px",
      border: `1px solid ${riskOnly ? T.danger : T.bd}`,
      borderRadius: 8,
      background: riskOnly ? "#FEF2F2" : T.s2,
      color: riskOnly ? T.danger : T.mu,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      transition: "all .15s"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "alert", s: 13 }), " \uC704\uD5D8\uB9CC"), /* @__PURE__ */ React.createElement("button", { onClick: async () => {
      const count = await batchRecalculateAllHours(
        window._studentsRef?.current || students,
        window._coursesRef?.current || courses
      ).catch((e) => {
        console.error(e);
        return 0;
      });
      alert(`\uB204\uC801\uC2DC\uAC04 \uC7AC\uACC4\uC0B0 \uC644\uB8CC: ${count}\uBA85 \uC5C5\uB370\uC774\uD2B8`);
    }, style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "7px 13px",
      border: `1px solid #7C3AED`,
      borderRadius: 8,
      background: "#F5F3FF",
      color: "#7C3AED",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      transition: "all .15s"
    } }, "\u{1F504} \uB204\uC801\uC2DC\uAC04 \uC804\uCCB4 \uC7AC\uACC4\uC0B0"), studentSummary.mismatch.length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: syncEarlyEmployment, style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "7px 13px",
      border: `1px solid ${T.danger}`,
      borderRadius: 8,
      background: "#FEF2F2",
      color: T.danger,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 700
    } }, "\uC870\uAE30\uCDE8\uC5C5 \uCDE8\uC5C5\uC5EC\uBD80 \uBCF4\uC815 ", studentSummary.mismatch.length, "\uBA85"), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", fontSize: 12, color: T.mu, fontWeight: 600 } }, "\uCD1D ", filtered.length, "\uBA85")), /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 980 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2, borderBottom: `1px solid ${T.bd}` } }, [
      { h: "\uC774\uB984\xB7\uC131\uBCC4\xB7\uB098\uC774", align: "left" },
      { h: "\uACFC\uC815", align: "left" },
      { h: "\uAC70\uC8FC\uC9C0", align: "center" },
      { h: "\uC5F0\uB77D\uCC98", align: "center" },
      { h: "\uD559\uB825\xB7\uACBD\uB825", align: "left" },
      { h: "\uCDE8\uC57D\uACC4\uCE35", align: "center" },
      { h: "\uBA74\uC811", align: "center" },
      { h: "\uB4F1\uB85D\uC0C1\uD0DC", align: "center" },
      { h: "\uCDE8\uC5C5\uC5EC\uBD80", align: "center" },
      { h: "\uB204\uC801\uC2DC\uAC04", align: "center" },
      { h: "\uCD9C\uC11D\uB960", align: "center" },
      { h: "\uC0C1\uC138", align: "center" },
      { h: "", align: "center" }
    ].map(({ h, align }) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "10px 12px",
      textAlign: align,
      fontSize: 11,
      color: T.mu,
      fontWeight: 700,
      whiteSpace: "nowrap"
    } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, filtered.map((s) => {
      const c = courses.find((x) => x.id === s.cid);
      const hiddenRate = isDropoutStudent(s);
      const col = hiddenRate ? T.mu : rateColor(s.rate);
      const age = (() => {
        if (!s.birth) return "-";
        const b = new Date(s.birth), t = /* @__PURE__ */ new Date();
        let a = t.getFullYear() - b.getFullYear();
        if (t.getMonth() < b.getMonth() || t.getMonth() === b.getMonth() && t.getDate() < b.getDate()) a--;
        return `${a}\uC138`;
      })();
      const badges = [
        s.unemployment && { l: "\uC2E4\uC5C5\uAE09\uC5EC", bg: "#EFF6FF", c: "#2563EB" },
        s.disabled && { l: "\uC7A5\uC560", bg: "#F5F3FF", c: "#7C3AED" },
        s.veteran && { l: "\uBCF4\uD6C8", bg: "#ECFDF5", c: "#059669" }
      ].filter(Boolean);
      const gradeColor = (g) => g?.startsWith("A") ? T.ok : g?.startsWith("B") ? T.warn : T.danger;
      return /* @__PURE__ */ React.createElement("tr", { key: s.id, className: "row-hover", style: { borderBottom: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 32,
        height: 32,
        borderRadius: 9,
        flexShrink: 0,
        background: s.gender === "\uC5EC" ? "#FDF2F8" : "#EFF6FF",
        color: s.gender === "\uC5EC" ? "#BE185D" : "#1D4ED8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 900
      } }, s.name?.[0]), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, whiteSpace: "nowrap" } }, s.name, /* @__PURE__ */ React.createElement("span", { style: {
        marginLeft: 5,
        fontSize: 10,
        fontWeight: 600,
        color: s.gender === "\uC5EC" ? "#BE185D" : "#1D4ED8"
      } }, s.gender || "")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, age, " \xB7 ", s.birth || "-")))), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", maxWidth: 150 } }, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 11,
        fontWeight: 600,
        color: T.tx,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, c?.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, marginTop: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: c?.cc, fontWeight: 700 } }, c?.code), /* @__PURE__ */ React.createElement("span", { style: { color: T.mu, marginLeft: 4 } }, formatCoursePeriod(c)))), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: T.tx, whiteSpace: "nowrap" } }, s.addrCity || s.addr?.split(" ")[0] || "-")), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.tx, whiteSpace: "nowrap" } }, s.phone || "-")), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: T.tx } }, s.edu || "-"), s.major && s.major !== "-" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, s.major), s.career && s.career !== "\uC5C6\uC74C" && /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 10,
        color: T.p,
        marginTop: 2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: 120
      } }, s.career)), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" } }, badges.length > 0 ? badges.map((b) => /* @__PURE__ */ React.createElement(Chip, { key: b.l, label: b.l, bg: b.bg, color: b.c, size: 10 })) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.bd } }, "\u2014"))), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, s.itvScore ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 13,
        fontWeight: 800,
        color: gradeColor(s.itvGrade)
      } }, s.itvGrade), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, s.itvScore, "\uC810")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 2 } }, /* @__PURE__ */ React.createElement(
        Chip,
        {
          label: s.itvPass ? "\uD569\uACA9" : "\uBD88\uD569\uACA9",
          bg: s.itvPass ? T.pbg : "#FEF2F2",
          color: s.itvPass ? T.p : T.danger,
          size: 10
        }
      ))) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.bd } }, "\uBBF8\uC785\uB825")), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, (() => {
        const es = s.enrollmentStatus || "\uC7AC\uD559\uC911";
        const sc = STATUS_COLORS[es] || { bg: T.s3, color: T.mu };
        return /* @__PURE__ */ React.createElement(Chip, { label: es, bg: sc.bg, color: sc.color, size: 11 });
      })()), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, (() => {
        const emp = getEffectiveEmploymentStatus(s);
        const ec = employmentChipStyle(emp);
        const needsSync = (s.enrollmentStatus || "") === "\uC870\uAE30\uCDE8\uC5C5" && (s.status || "\uBBF8\uCDE8\uC5C5") !== "\uCDE8\uC5C5";
        return /* @__PURE__ */ React.createElement("button", { onClick: () => setEmploymentTarget(s), title: "\uCDE8\uC5C5\uC815\uBCF4 \uBE60\uB978 \uC218\uC815", style: {
          border: `1px solid ${needsSync ? T.danger : "transparent"}`,
          borderRadius: 999,
          background: ec.bg,
          color: ec.color,
          padding: "3px 9px",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 800
        } }, emp, needsSync ? " \xB7 \uBCF4\uC815\uD544\uC694" : "");
      })(), s.employerName && /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 3,
        fontSize: 9,
        color: T.mu,
        maxWidth: 90,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, s.employerName)), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, (() => {
        const tc = getTotalCourseHours(c);
        return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx } }, (s.accumulatedHours || 0).toFixed(1), "h"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, "/ ", tc > 0 ? tc + "h" : "-"));
      })()), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center", minWidth: 80 } }, hiddenRate ? /* @__PURE__ */ React.createElement(Chip, { label: "\uC911\uB3C4\uD0C8\uB77D", bg: "#FEE2E2", color: T.danger, size: 10 }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: col } }, s.rate, "%"), /* @__PURE__ */ React.createElement(RBar, { r: s.rate, h: 4 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: col, marginTop: 2 } }, s.rate >= 80 ? "\uC815\uC0C1" : s.rate >= 70 ? "\uC8FC\uC758" : "\uC704\uD5D8"))), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
        setAttModal(s);
        setStudentDetailTab("profile");
      }, title: "\uD6C8\uB828\uC0DD \uC0C1\uC138 \uC870\uD68C", style: {
        padding: "4px 8px",
        borderRadius: 6,
        border: `1px solid ${T.bd}`,
        background: T.s2,
        color: "#2563EB",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap"
      } }, "\u{1F4CB} \uC0C1\uC138")), /* @__PURE__ */ React.createElement("td", { style: { padding: "11px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "center" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => onEdit(s), title: "\uC218\uC815", style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: T.pbg,
        color: T.p,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "edit", s: 13 })), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setStatusTarget({ student: s, course: c }),
          title: "\uC0C1\uD0DC \uBCC0\uACBD",
          style: {
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "none",
            background: "#F0FDF4",
            color: "#15803D",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13
          }
        },
        "\u2699"
      ), /* @__PURE__ */ React.createElement("button", { onClick: () => onDelete(s.id), title: "\uC0AD\uC81C", style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "#FEF2F2",
        color: T.danger,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 13 })))));
    })))), filtered.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center", color: T.mu, fontSize: 13 } }, "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"))), attModal && (() => {
      const modalCourse = courses.find((x) => x.id === attModal.cid);
      const STATUS_LABEL = { O: "\uCD9C\uC11D", A: "\uACB0\uC11D", L: "\uC9C0\uAC01", U: "\uBBF8\uD655\uC778" };
      const STATUS_COLOR = { O: T.ok, A: T.danger, L: T.warn, U: T.mu };
      const STATUS_BG = { O: "#ECFDF5", A: "#FEF2F2", L: "#FFFBEB", U: T.s2 };
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          onClick: (e) => {
            if (e.target === e.currentTarget) setAttModal(null);
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: {
          background: T.s,
          borderRadius: 16,
          width: 620,
          maxWidth: "96vw",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,.28)",
          overflow: "hidden",
          animation: "fadeUp .2s ease"
        } }, /* @__PURE__ */ React.createElement("div", { style: {
          background: `linear-gradient(135deg,#1D4ED8,#2563EB)`,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff" } }, "\u{1F4CB} \uD6C8\uB828\uC0DD \uC0C1\uC138 \u2014 ", attModal.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 2 } }, modalCourse?.name || "-", " \xB7 \uAE30\uBCF8\uC815\uBCF4 / \uCD9C\uACB0\uD604\uD669")), /* @__PURE__ */ React.createElement("button", { onClick: () => setAttModal(null), style: {
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "none",
          background: "rgba(255,255,255,.18)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", borderBottom: `1px solid ${T.bd}`, background: T.s2 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8, marginBottom: 10 } }, [
          ["\uB4F1\uB85D\uC0C1\uD0DC", attModal.enrollmentStatus || "\uC7AC\uD559\uC911"],
          ["\uCDE8\uC5C5\uC5EC\uBD80", attModal.status || "\uBBF8\uCDE8\uC5C5"],
          ["\uCD9C\uC11D\uB960", isDropoutStudent(attModal) ? "\uC911\uB3C4\uD0C8\uB77D" : `${attModal.rate || 0}%`],
          ["\uB204\uC801\uC2DC\uAC04", `${(attModal.accumulatedHours || 0).toFixed(1)}h`]
        ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { border: `1px solid ${T.bd}`, borderRadius: 8, padding: "8px 10px", background: "#fff" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 3 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.tx, fontWeight: 800, wordBreak: "break-all" } }, v || "-")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, [
          ["profile", "\uAE30\uBCF8\uC815\uBCF4"],
          ["attendance", `\uCD9C\uACB0\uD604\uD669 ${attRecords.length ? `(${attRecords.length}\uC77C)` : ""}`]
        ].map(([id, label]) => {
          const active = studentDetailTab === id;
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: id,
              onClick: () => setStudentDetailTab(id),
              className: `tab-pill${active ? " tab-pill-active" : ""}`,
              style: {
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${active ? T.p : T.bd}`,
                background: active ? T.p : "#fff",
                color: active ? "#fff" : T.mu,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 800
              }
            },
            label
          );
        }))), studentDetailTab === "profile" ? /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 } }, [
          ["\uC774\uB984", attModal.name],
          ["\uC131\uBCC4", attModal.gender],
          ["\uC0DD\uB144\uC6D4\uC77C", attModal.birth],
          ["\uC5F0\uB77D\uCC98", attModal.phone],
          ["\uBE44\uC0C1\uC5F0\uB77D\uCC98", attModal.phone2],
          ["\uAC70\uC8FC\uC9C0", [attModal.addrCity, attModal.addrDetail].filter(Boolean).join(" ")],
          ["\uCD5C\uC885\uD559\uB825", attModal.edu],
          ["\uC804\uACF5", attModal.major],
          ["\uACBD\uB825", attModal.career],
          ["\uC790\uACA9\uC99D", attModal.cert],
          ["\uBA74\uC811", attModal.itvScore ? `${attModal.itvGrade || "-"} \xB7 ${attModal.itvScore}\uC810 \xB7 ${attModal.itvPass ? "\uD569\uACA9" : "\uBD88\uD569\uACA9"}` : "-"],
          ["\uCDE8\uC5C5\uAE30\uC5C5", attModal.employerName || "-"]
        ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { border: `1px solid ${T.bd}`, borderRadius: 8, padding: "9px 10px", background: T.s2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 4 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.tx, fontWeight: 650, wordBreak: "break-all" } }, v || "-")))), attModal.memo && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, border: `1px solid ${T.bd}`, borderRadius: 8, padding: "10px 12px", background: "#fff" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 5 } }, "\uD2B9\uC774\uC0AC\uD56D \xB7 \uBA54\uBAA8"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.tx, lineHeight: 1.6, whiteSpace: "pre-line" } }, attModal.memo))) : /* @__PURE__ */ React.createElement(React.Fragment, null, !attLoading && attRecords.length > 0 && (() => {
          const cnt = { O: 0, A: 0, L: 0, U: 0 };
          attRecords.forEach((r) => {
            cnt[r.status || "U"] = (cnt[r.status || "U"] || 0) + 1;
          });
          return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, borderBottom: `1px solid ${T.bd}`, flexShrink: 0 } }, [
            { key: "O", label: "\uCD9C\uC11D", icon: "\u2705" },
            { key: "A", label: "\uACB0\uC11D", icon: "\u274C" },
            { key: "L", label: "\uC9C0\uAC01", icon: "\u23F0" },
            { key: "U", label: "\uBBF8\uD655\uC778", icon: "\u2753" }
          ].map(({ key, label, icon }) => /* @__PURE__ */ React.createElement("div", { key, style: {
            flex: 1,
            padding: "12px 0",
            textAlign: "center",
            borderRight: `1px solid ${T.bd}`,
            background: STATUS_BG[key]
          } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18 } }, icon), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: STATUS_COLOR[key] } }, cnt[key] || 0), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, label))));
        })(), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, attLoading ? /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center", color: T.mu, fontSize: 13 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, marginBottom: 8 } }, "\u23F3"), "\uCD9C\uACB0 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911...") : attRecords.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: 40, textAlign: "center", color: T.mu, fontSize: 13 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, marginBottom: 8 } }, "\u{1F4ED}"), "\uCD9C\uACB0 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4") : /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2, position: "sticky", top: 0, zIndex: 1 } }, ["\uC77C\uC790", "\uC785\uC2E4\uC2DC\uAC04", "\uD1F4\uC2E4\uC2DC\uAC04", "\uCD9C\uACB0\uC0C1\uD0DC"].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
          padding: "10px 14px",
          fontSize: 11,
          color: T.mu,
          fontWeight: 700,
          textAlign: "center",
          borderBottom: `1px solid ${T.bd}`
        } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, attRecords.map((r, i) => {
          const st = r.status || "U";
          return /* @__PURE__ */ React.createElement("tr", { key: r.date || i, style: { borderBottom: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("td", { style: {
            padding: "10px 14px",
            textAlign: "center",
            fontSize: 12,
            fontWeight: 600,
            color: T.tx
          } }, r.date), /* @__PURE__ */ React.createElement("td", { style: {
            padding: "10px 14px",
            textAlign: "center",
            fontSize: 12,
            color: r.check_in ? T.ok : T.mu
          } }, r.check_in ? r.check_in.slice(0, 5) : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: {
            padding: "10px 14px",
            textAlign: "center",
            fontSize: 12,
            color: r.check_out ? T.p : T.mu
          } }, r.check_out ? r.check_out.slice(0, 5) : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 14px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
            padding: "3px 9px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: STATUS_BG[st],
            color: STATUS_COLOR[st]
          } }, STATUS_LABEL[st] || st)));
        }))))), /* @__PURE__ */ React.createElement("div", { style: {
          padding: "12px 20px",
          borderTop: `1px solid ${T.bd}`,
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: T.s2
        } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, "\uCD1D ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, attRecords.length), "\uC77C \uAE30\uB85D", " \xB7 ", /* @__PURE__ */ React.createElement("span", { style: { color: T.ok, fontSize: 10 } }, "\u25CF Supabase Realtime \uC2E4\uC2DC\uAC04 \uBC18\uC601")), /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => setAttModal(null) }, "\uB2EB\uAE30")))
      );
    })(), statusTarget && statusTarget.course && /* @__PURE__ */ React.createElement(
      StatusChangeDialog,
      {
        student: statusTarget.student,
        course: statusTarget.course,
        currentUser,
        onStatusChanged: () => {
        },
        onClose: () => setStatusTarget(null)
      }
    ), employmentTarget && /* @__PURE__ */ React.createElement(
      EmploymentQuickDialog,
      {
        student: employmentTarget,
        onSave: onUpdate,
        onClose: () => setEmploymentTarget(null)
      }
    ));
  };
  const AttendanceMgmt = ({ students, courses, overrides = [], setOverrides, onRatesUpdated }) => {
    const initCourse = courses[3] || courses[0];
    const initDates = buildCourseDates(initCourse);
    const [course, setCourse] = useState(initCourse);
    const [date, setDate] = useState(initDates[initDates.length - 1] || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const [mode, setMode] = useState("qr");
    const [qrType, setQrType] = useState("in");
    const [simRunning, setSimRunning] = useState(false);
    const [manualAtt, setManualAtt] = useState({});
    const simRef = useRef(null);
    const qrContainerRef = useRef(null);
    const parseHM = (str, defH, defM) => {
      if (!str) return [defH, defM];
      const [h, m] = str.split(":").map(Number);
      return [isNaN(h) ? defH : h, isNaN(m) ? defM : m];
    };
    const initTimes = (c) => {
      const [sh, sm] = parseHM(c?.schedTimeFrom, 9, 0);
      const [eh, em] = parseHM(c?.schedTimeTo, 13, 0);
      return { sh, sm, eh, em };
    };
    const initC = courses[3] || courses[0];
    const init0 = initTimes(initC);
    const [startH, setStartH] = useState(init0.sh);
    const [startM, setStartM] = useState(init0.sm);
    const [endH, setEndH] = useState(init0.eh);
    const [endM, setEndM] = useState(init0.em);
    const [showTimeSetting, setShowTimeSetting] = useState(false);
    const [timeCustomized, setTimeCustomized] = useState(false);
    const handleCourseChange = (c) => {
      setCourse(c);
      setRecords({});
      const newDates = buildCourseDates(c);
      setDate(newDates[newDates.length - 1] || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
      if (!timeCustomized) {
        const t = initTimes(c);
        setStartH(t.sh);
        setStartM(t.sm);
        setEndH(t.eh);
        setEndM(t.em);
      }
    };
    const courseRef = React.useRef(course);
    useEffect(() => {
      courseRef.current = course;
    });
    useEffect(() => {
      if (!courses.length) return;
      const cur = courseRef.current;
      const updated = courses.find((c) => c.id === cur?.id);
      if (!updated) {
        handleCourseChange(courses[0]);
      } else if (updated.dateFrom !== cur.dateFrom || updated.dateTo !== cur.dateTo || updated.schedDays !== cur.schedDays || updated.schedTimeFrom !== cur.schedTimeFrom || updated.schedTimeTo !== cur.schedTimeTo) {
        handleCourseChange(updated);
      } else if (updated.name !== cur.name || updated.code !== cur.code) {
        setCourse(updated);
      }
    }, [courses]);
    const startTotal = startH * 60 + startM;
    const lateTotal = startTotal + Math.floor((endH * 60 + endM - startH * 60 - startM) / 2);
    const endTotal = endH * 60 + endM;
    const fmtTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const timeToMins = (t) => {
      const [h, m] = (t || "00:00").split(":").map(Number);
      return h * 60 + m;
    };
    const qrToken = `${course.code}-${date}-${qrType.toUpperCase()}-${QR_TOKEN_SUFFIX}`;
    const pageBase = window.location.origin + window.location.pathname;
    const qrData = `${pageBase}?mode=checkin&cid=${course.id}&date=${date}&type=${qrType}&t=${encodeURIComponent(qrToken)}`;
    const qrColor = qrType === "in" ? "#2563EB" : "#9A3412";
    const getQrDataUrl = () => {
      const canvas = qrContainerRef.current?.querySelector("canvas");
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    };
    const downloadQrImage = () => {
      const dataUrl = getQrDataUrl();
      if (!dataUrl) {
        alert("QR \uCF54\uB4DC\uB97C \uBA3C\uC800 \uC0DD\uC131\uD574\uC8FC\uC138\uC694.");
        return;
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `QR_${course.code}_${date}_${qrType}.png`;
      a.click();
    };
    const openQrBigView = () => {
      const dataUrl = getQrDataUrl();
      if (!dataUrl) {
        alert("QR \uCF54\uB4DC\uB97C \uBA3C\uC800 \uC0DD\uC131\uD574\uC8FC\uC138\uC694.");
        return;
      }
      const labelColor = qrType === "in" ? "#2563EB" : "#9A3412";
      const labelBg = qrType === "in" ? "#EFF6FF" : "#FFF7ED";
      const labelTxt = qrType === "in" ? "\u{1F4E5} \uC785\uC2E4 QR" : "\u{1F4E4} \uD1F4\uC2E4 QR";
      const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<title>QR \uCD9C\uC11D \u2014 ${course.name}</title>
<style>
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Pretendard','\uB9D1\uC740 \uACE0\uB515',sans-serif; background:#0F172A;
    min-height:100vh; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:28px; padding:32px; }
  .badge { padding:10px 28px; border-radius:32px; font-size:18px; font-weight:800;
    background:${labelBg}; color:${labelColor}; letter-spacing:2px; }
  .course-name { font-size:clamp(22px,3vw,36px); font-weight:900; color:#F1F5F9;
    text-align:center; letter-spacing:1px; }
  .qr-wrap { background:#fff; border-radius:20px; padding:24px;
    box-shadow:0 0 60px rgba(${qrType === "in" ? "37,99,235" : "154,52,18"},.5); }
  .qr-wrap img { display:block; width:min(72vw,540px); height:min(72vw,540px); border-radius:8px; }
  .date-row { font-size:18px; font-weight:600; color:#94A3B8; }
  #clock { font-size:clamp(28px,4.5vw,56px); font-weight:900; color:#F8FAFC;
    letter-spacing:4px; font-variant-numeric:tabular-nums; }
  .hint { font-size:14px; color:#64748B; text-align:center; }
</style></head>
<body>
  <div class="badge">${labelTxt}</div>
  <div class="course-name">${course.name}</div>
  <div class="qr-wrap"><img src="${dataUrl}" alt="QR Code"/></div>
  <div class="date-row">\u{1F4C5} ${date}</div>
  <div id="clock"></div>
  <div class="hint">\u{1F4F1} \uC2A4\uB9C8\uD2B8\uD3F0\uC73C\uB85C QR \uCF54\uB4DC\uB97C \uC2A4\uCE94\uD558\uC5EC \uCD9C\uC11D\uC744 \uB4F1\uB85D\uD558\uC138\uC694</div>
<script>
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('clock').textContent = h+':'+m+':'+s;
  }
  tick();
  setInterval(tick, 1000);
<\/script>
</body></html>`;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
      } else {
        alert("\uD31D\uC5C5\uC774 \uCC28\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uD31D\uC5C5 \uCC28\uB2E8\uC744 \uD574\uC81C\uD574\uC8FC\uC138\uC694.");
      }
    };
    const [records, setRecords] = useState({});
    useEffect(() => {
      if (!course || !date) return;
      setManualAtt({});
      const loadAttendance = async () => {
        try {
          const courseStudentIds = courseStudents.map((s) => s.id);
          if (courseStudentIds.length === 0) return;
          const { data, error } = await sbGet(
            "attendance",
            `select=*&student_id=in.(${courseStudentIds.join(",")})&date=eq.${date}`
          );
          if (error) throw error;
          const newRecords = {};
          (data || []).forEach((att) => {
            const rec = { status: att.status || "U" };
            if (att.check_in) {
              const [h, m] = att.check_in.split(":").map(Number);
              rec.checkIn = att.check_in;
              rec.checkInMins = h * 60 + m;
            }
            if (att.check_out) rec.checkOut = att.check_out;
            if (att.reason) rec.reason = att.reason;
            if (att.absence_type) rec.absenceType = att.absence_type;
            rec.manualAddHours = Number(att.manual_add_hours || 0);
            rec.manualDeductHours = Number(att.manual_deduct_hours || 0);
            rec.manualReason = att.manual_reason || "";
            rec.manualMemo = att.manual_memo || "";
            newRecords[att.student_id] = rec;
          });
          setRecords(newRecords);
          console.log(`\u2705 ${date} \uCD9C\uACB0 \uB370\uC774\uD130 \uB85C\uB4DC \uC644\uB8CC:`, Object.keys(newRecords).length, "\uBA85");
        } catch (err) {
          console.error("\uCD9C\uACB0 \uB85C\uB4DC \uC624\uB958:", err);
        }
      };
      loadAttendance();
    }, [course, date]);
    useEffect(() => {
      if (Object.keys(records).length === 0) return;
      setManualAtt((prev) => {
        const next = { ...prev };
        Object.entries(records).forEach(([sid, rec]) => {
          if (!next[sid]) {
            next[sid] = {
              status: rec.status !== "U" ? rec.status : "",
              inTime: rec.checkIn || "",
              outTime: rec.checkOut || "",
              reason: rec.reason || "",
              absenceType: rec.absenceType || "personal",
              manualAddHours: rec.manualAddHours || 0,
              manualDeductHours: rec.manualDeductHours || 0,
              manualReason: rec.manualReason || "",
              manualMemo: rec.manualMemo || "",
              saved: true
              // DB에서 로드된 값
            };
          }
        });
        return next;
      });
    }, [records]);
    useEffect(() => {
      if (!course || !date || !ENABLE_REALTIME) return;
      let intentionallyClosed = false;
      let heartbeatId = null;
      let currentWs = null;
      let retryDelay = 2e3;
      let refCount = 0;
      const channel = `realtime:public:attendance`;
      const joinRef = String(++refCount);
      let subIds = [];
      const send = (obj) => {
        if (currentWs?.readyState === WebSocket.OPEN) currentWs.send(JSON.stringify(obj));
      };
      const connect = () => {
        if (intentionallyClosed) return;
        const ws = new WebSocket(
          `wss://${SB_URL.replace("https://", "")}/realtime/v1/websocket?apikey=${SB_KEY}&vsn=1.0.0`
        );
        currentWs = ws;
        ws.onopen = () => {
          retryDelay = 2e3;
          console.log(`\u{1F514} [\uCD9C\uACB0 Realtime] ${date} \uAD6C\uB3C5 \uC2DC\uC791`);
          send({
            topic: channel,
            event: "phx_join",
            payload: {
              config: {
                broadcast: { self: false },
                presence: { key: "" },
                postgres_changes: [{
                  event: "*",
                  schema: "public",
                  table: "attendance",
                  filter: `date=eq.${date}`
                }]
              },
              access_token: SB_KEY
            },
            ref: joinRef,
            join_ref: joinRef
          });
          heartbeatId = setInterval(() => {
            send({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++refCount) });
          }, 25e3);
        };
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === "phx_reply" && msg.ref === joinRef) {
              if (msg.payload?.status === "ok") {
                subIds = (msg.payload.response?.postgres_changes || []).map((c) => c.id);
                console.log(`\u2705 [\uCD9C\uACB0 Realtime] \uAD6C\uB3C5 \uD655\uC778 (${date}) IDs:`, subIds);
              } else {
                console.error(`\u274C [\uCD9C\uACB0 Realtime] \uAD6C\uB3C5 \uC2E4\uD328:`, msg.payload?.response);
              }
              return;
            }
            if (msg.event === "postgres_changes" && msg.payload?.data) {
              const ids = msg.payload.ids || [];
              if (subIds.length > 0 && !ids.some((id) => subIds.includes(id))) return;
              const { type: eventType, record: newRecord } = msg.payload.data;
              if (eventType === "INSERT" || eventType === "UPDATE") {
                if (newRecord?.date !== date) return;
                setRecords((prev) => {
                  const existing = prev[newRecord.student_id] || {};
                  const upd = { ...existing, status: newRecord.status || existing.status || "U" };
                  if (newRecord.check_in) {
                    const [h, m] = newRecord.check_in.split(":").map(Number);
                    upd.checkIn = newRecord.check_in;
                    upd.checkInMins = h * 60 + m;
                  }
                  if (newRecord.check_out) upd.checkOut = newRecord.check_out;
                  return { ...prev, [newRecord.student_id]: upd };
                });
                console.log(`\u{1F4CC} [\uCD9C\uACB0 Realtime] \u2190 \uD559\uC0DD ID ${newRecord.student_id} status=${newRecord.status}`);
              }
            }
          } catch (err) {
            console.error("[\uCD9C\uACB0 Realtime] \uBA54\uC2DC\uC9C0 \uD30C\uC2F1 \uC624\uB958:", err);
          }
        };
        ws.onerror = () => console.warn("\u26A0\uFE0F [\uCD9C\uACB0 Realtime] \uC18C\uCF13 \uC624\uB958");
        ws.onclose = (ev) => {
          clearInterval(heartbeatId);
          heartbeatId = null;
          if (!intentionallyClosed) {
            console.warn(`\u{1F50C} [\uCD9C\uACB0 Realtime] \uC5F0\uACB0 \uB04A\uAE40 (code:${ev.code}) \u2014 ${retryDelay / 1e3}\uCD08 \uD6C4 \uC7AC\uC5F0\uACB0`);
            setTimeout(connect, retryDelay);
            retryDelay = Math.min(retryDelay * 2, 3e4);
          }
        };
      };
      connect();
      return () => {
        intentionallyClosed = true;
        clearInterval(heartbeatId);
        heartbeatId = null;
        currentWs?.close();
      };
    }, [course, date]);
    const calcStatus = (inMins, outMins) => {
      if (inMins === null) return "U";
      if (outMins != null) {
        const totalDay = endTotal - startTotal;
        if (totalDay > 0 && outMins - inMins < totalDay * 0.5) return "A";
      }
      return "O";
    };
    const checkedInCnt = Object.values(records).filter((r) => r.checkIn).length;
    const checkedOutCnt = Object.values(records).filter((r) => r.checkOut).length;
    const presentCnt = Object.values(records).filter((r) => r.status === "O").length;
    const absentCnt = Object.values(records).filter((r) => r.status === "A").length;
    const courseStudents = students.filter((s) => sameId(s.cid, course.id));
    const unconfirmedCnt = courseStudents.filter((s) => !records[s.id] || records[s.id].status === "U").length;
    const selectedDateOverride = overrides.find((o) => sameId(o.courseId, course.id) && normalizeDateStr(o.date) === normalizeDateStr(date)) || null;
    const startSim = () => {
      if (simRunning) return;
      setSimRunning(true);
      if (qrType === "in") setRecords({});
      const students2 = [...courseStudents];
      let i = 0;
      simRef.current = setInterval(() => {
        if (i >= students2.length) {
          clearInterval(simRef.current);
          setSimRunning(false);
          return;
        }
        const s = students2[i];
        const offsetMins = Math.floor(Math.random() * 80) - 10;
        const mins = startTotal + offsetMins;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const time = fmtTime(Math.max(0, h), Math.max(0, m));
        if (qrType === "in") {
          const simStatus = "O";
          setRecords((prev) => ({ ...prev, [s.id]: { ...prev[s.id] || {}, checkIn: time, checkInMins: mins, status: simStatus } }));
        } else {
          const outOffset = endTotal + Math.floor(Math.random() * 20) - 5;
          const oh = Math.floor(outOffset / 60), om = outOffset % 60;
          setRecords((prev) => ({ ...prev, [s.id]: { ...prev[s.id] || {}, checkOut: fmtTime(oh, om) } }));
        }
        i++;
      }, 500);
    };
    useEffect(() => () => clearInterval(simRef.current), []);
    if (!course) return null;
    const ATT_MAP = {
      O: { label: "\uCD9C\uC11D", bg: "#ECFDF5", color: T.ok },
      A: { label: "\uACB0\uC11D", bg: "#FEF2F2", color: T.danger },
      U: { label: "\uBBF8\uD655\uC778", bg: T.s2, color: T.mu }
    };
    const inpSel = {
      padding: "5px 8px",
      border: `1px solid ${T.bd}`,
      borderRadius: 7,
      fontSize: 12,
      outline: "none",
      background: T.s2,
      color: T.tx,
      cursor: "pointer",
      width: 64
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement(
      SectionHead,
      {
        title: "\uCD9C\uACB0 \uAD00\uB9AC",
        sub: "QR \uCF54\uB4DC \uCD9C\uC11D \uB610\uB294 \uC218\uB3D9 \uC785\uB825\uC73C\uB85C \uCD9C\uACB0\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4",
        right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("qr"), style: {
          padding: "7px 14px",
          borderRadius: 20,
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          background: mode === "qr" ? T.p : T.s3,
          color: mode === "qr" ? "#fff" : T.mu
        } }, "\u{1F4F1} QR \uCD9C\uC11D"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("manual"), style: {
          padding: "7px 14px",
          borderRadius: 20,
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          background: mode === "manual" ? T.p : T.s3,
          color: mode === "manual" ? "#fff" : T.mu
        } }, "\u270F\uFE0F \uC218\uB3D9 \uC785\uB825"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("sheet"), style: {
          padding: "7px 14px",
          borderRadius: 20,
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          background: mode === "sheet" ? T.p : T.s3,
          color: mode === "sheet" ? "#fff" : T.mu
        } }, "\u{1F4CB} \uCD9C\uC11D\uBD80"))
      }
    ), /* @__PURE__ */ React.createElement("div", { style: {
      background: "#FFFBEB",
      border: `1px solid #FDE68A`,
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 14,
      display: "flex",
      gap: 10,
      fontSize: 12,
      color: "#92400E"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "info", s: 14 }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "2026 \uAC1C\uC815 \uCD9C\uACB0 \uAE30\uC900:"), " \uD558\uB8E8 \uC218\uC5C5\uC2DC\uAC04 50% \uBBF8\uB9CC \uC218\uAC15 \uC2DC \uACB0\uC11D \uCC98\uB9AC \xB7 \uCD1D \uAD50\uC721\uC2DC\uAC04 ", /* @__PURE__ */ React.createElement("b", null, "80% \uC774\uC0C1"), " \uCD9C\uC11D \uC2DC \uC218\uB8CC")), mode !== "sheet" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 14, padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowTimeSetting((v) => !v),
        style: {
          width: "100%",
          padding: "11px 18px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { n: "cal", s: 14 }),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, "\u23F0 \uC218\uC5C5 \uC2DC\uAC04 \uC124\uC815"),
      timeCustomized && /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 10,
        fontWeight: 700,
        color: T.warn,
        background: "#FFFBEB",
        padding: "1px 7px",
        borderRadius: 4,
        border: `1px solid ${T.warn}40`
      } }, "\uC218\uB3D9 \uC218\uC815\uB428"),
      /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 12, alignItems: "center", fontSize: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { color: T.ok } }, "\uC218\uC5C5 ", fmtTime(startH, startM), " ~ ", fmtTime(endH, endM)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, "50% \uAE30\uC900 ", fmtTime(Math.floor(lateTotal / 60), lateTotal % 60)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, showTimeSetting ? "\u25B2" : "\u25BC"))
    ), showTimeSetting && /* @__PURE__ */ React.createElement("div", { style: {
      padding: "14px 18px",
      borderTop: `1px solid ${T.bd}`,
      display: "flex",
      gap: 20,
      flexWrap: "wrap",
      alignItems: "flex-end"
    } }, [
      { label: "\uC218\uC5C5 \uC2DC\uC791", h: startH, m: startM, setH: (v) => {
        setStartH(v);
        setTimeCustomized(true);
      }, setM: (v) => {
        setStartM(v);
        setTimeCustomized(true);
      }, color: T.ok },
      { label: "\uC218\uC5C5 \uC885\uB8CC", h: endH, m: endM, setH: (v) => {
        setEndH(v);
        setTimeCustomized(true);
      }, setM: (v) => {
        setEndM(v);
        setTimeCustomized(true);
      }, color: T.p }
    ].map(({ label, h, m, setH, setM, color }) => /* @__PURE__ */ React.createElement("div", { key: label }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement("select", { value: h, onChange: (e) => setH(+e.target.value), style: { ...inpSel, borderColor: color } }, Array.from({ length: 24 }, (_, i) => i).map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, String(v).padStart(2, "0"), "\uC2DC"))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: T.mu } }, ":"), /* @__PURE__ */ React.createElement("select", { value: m, onChange: (e) => setM(+e.target.value), style: { ...inpSel, borderColor: color } }, [0, 10, 20, 30, 40, 50].map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, String(v).padStart(2, "0"), "\uBD84")))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "8px 12px",
      borderRadius: 8,
      background: T.s2,
      border: `1px solid ${T.bd}`,
      fontSize: 11,
      color: T.mu,
      lineHeight: 1.7
    } }, "\u{1F4CB} ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, "HRD 2026 \uCD9C\uACB0 \uAE30\uC900"), /* @__PURE__ */ React.createElement("br", null), "\uC218\uC5C5: ", fmtTime(startH, startM), " ~ ", fmtTime(endH, endM), /* @__PURE__ */ React.createElement("br", null), "\uCD9C\uC11D: \uC218\uC5C5\uC2DC\uAC04 50% \uC774\uC0C1 \uCC38\uC5EC", /* @__PURE__ */ React.createElement("br", null), "\uACB0\uC11D: \uC218\uC5C5\uC2DC\uAC04 50% \uBBF8\uB9CC \uCC38\uC5EC \uB610\uB294 \uBBF8\uCD9C\uC11D", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: T.ok } }, "50% \uAE30\uC900: ", fmtTime(Math.floor(lateTotal / 60), lateTotal % 60), " \uC774\uD6C4 \uD1F4\uC2E4 \uC2DC \uACB0\uC11D")), timeCustomized && /* @__PURE__ */ React.createElement("button", { onClick: () => {
      const t = initTimes(course);
      setStartH(t.sh);
      setStartM(t.sm);
      setEndH(t.eh);
      setEndM(t.em);
      setTimeCustomized(false);
    }, style: {
      padding: "6px 10px",
      borderRadius: 7,
      border: `1px solid ${T.bd}`,
      background: "transparent",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      color: T.mu,
      textAlign: "center"
    } }, "\u{1F504} \uACFC\uC815 \uC2DC\uAC04\uC73C\uB85C \uCD08\uAE30\uD654")))), /* @__PURE__ */ React.createElement(Card, { style: { padding: "14px 18px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 6, fontWeight: 600 } }, "\uACFC\uC815 \uC120\uD0DD"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, courses.map((c) => {
      const active = course.id === c.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: c.id,
          type: "button",
          onClick: () => handleCourseChange(c),
          style: {
            padding: "5px 10px",
            borderRadius: 8,
            border: `1.5px solid ${active ? T.p : T.bd}`,
            background: active ? T.p : T.s2,
            color: active ? "#fff" : T.tx,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            transition: "all .15s",
            whiteSpace: "nowrap",
            boxShadow: active ? `0 2px 6px ${T.p}44` : "none"
          }
        },
        /* @__PURE__ */ React.createElement("span", { style: { opacity: active ? 0.85 : 0.6, fontSize: 10 } }, "[", c.code, "]"),
        " ",
        shortCourseName(c.name)
      );
    }))), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      gap: 14,
      alignItems: "center",
      flexWrap: "wrap",
      borderTop: `1px solid ${T.bd}`,
      paddingTop: 10
    } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 5, fontWeight: 600 } }, "\uC218\uC5C5\uC77C \uC120\uD0DD"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: date,
        onChange: (e) => setDate(e.target.value),
        style: {
          padding: "7px 10px",
          border: `1px solid ${T.bd}`,
          borderRadius: 8,
          fontSize: 12,
          outline: "none",
          background: T.s2,
          cursor: "pointer",
          color: T.tx
        }
      },
      buildCourseDates(course).map((d) => /* @__PURE__ */ React.createElement("option", { key: d, value: d }, d))
    )), course.schedDays && /* @__PURE__ */ React.createElement("div", { style: {
      padding: "6px 12px",
      borderRadius: 8,
      background: T.s2,
      border: `1px solid ${T.bd}`,
      fontSize: 11,
      color: T.mu,
      lineHeight: 1.5
    } }, "\u{1F4C5} ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, course.schedDays), course.schedTimeFrom && course.schedTimeTo && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 6 } }, "\u{1F558} ", course.schedTimeFrom, " ~ ", course.schedTimeTo)), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 14, alignItems: "center" } }, [
      { v: presentCnt, l: "\uCD9C\uC11D", c: T.ok },
      { v: absentCnt, l: "\uACB0\uC11D", c: T.danger },
      { v: unconfirmedCnt, l: "\uBBF8\uD655\uC778", c: T.mu }
    ].map(({ v, l, c }) => /* @__PURE__ */ React.createElement("div", { key: l, style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: c } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: T.mu } }, l))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: T.mu } }, "/ ", courseStudents.length, "\uBA85"), /* @__PURE__ */ React.createElement("button", { onClick: async () => {
      const absentStudents = courseStudents.filter((s) => !records[s.id]?.checkIn && records[s.id]?.status !== "A");
      if (absentStudents.length === 0) {
        alert("\uBBF8\uD655\uC778 \uC778\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      if (!window.confirm(`\uBBF8\uD655\uC778 ${absentStudents.length}\uBA85\uC744 \uACB0\uC11D\uC73C\uB85C \uC77C\uAD04 \uCC98\uB9AC\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;
      try {
        const courseIdNum = Number(course?.id);
        if (!courseIdNum) {
          alert("\uACFC\uC815 \uC815\uBCF4 \uC624\uB958: course_id \uC5C6\uC74C");
          return;
        }
        const toInsert = absentStudents.map((s) => ({
          course_id: courseIdNum,
          student_id: Number(s.id),
          date,
          status: "A",
          check_in: null,
          check_out: null,
          method: "manual"
        }));
        const { error } = await sbUpsert("attendance", toInsert, "student_id,date,course_id");
        if (error) throw error;
        setRecords((prev) => {
          const next = { ...prev };
          absentStudents.forEach((s) => {
            next[s.id] = { ...next[s.id] || {}, status: "A" };
          });
          return next;
        });
        alert(`\u2705 ${absentStudents.length}\uBA85 \uACB0\uC11D \uC77C\uAD04 \uCC98\uB9AC \uC644\uB8CC`);
        if (onRatesUpdated) onRatesUpdated(course.id);
        Promise.all(absentStudents.map(
          (s) => recalculateHoursAndRate(Number(s.id), Number(course.id))
        )).catch(console.warn);
      } catch (err) {
        alert("\uB9C8\uAC10 \uC624\uB958: " + fmtSaveError(err));
      }
    }, style: {
      padding: "8px 12px",
      borderRadius: 9,
      border: `1.5px solid ${T.danger}`,
      background: "#FEF2F2",
      color: T.danger,
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 5,
      whiteSpace: "nowrap"
    } }, "\u{1F6A9} \uACB0\uC11D \uC77C\uAD04 \uB9C8\uAC10")))), /* @__PURE__ */ React.createElement(
      ScheduleOverridePanel,
      {
        course,
        overrides: overrides.filter((o) => sameId(o.courseId, course.id)),
        onAdd: async (ov) => {
          const { data, error } = await sbInsert("course_schedule_overrides", fromOverride(ov));
          if (error) {
            alert("\uC77C\uC815 \uC608\uC678\uB97C \uC800\uC7A5\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.");
            return;
          }
          if (data && setOverrides) setOverrides((prev) => [...prev, toOverride(data)]);
          const cs = students.filter((s) => sameId(s.cid, course.id));
          for (const s of cs) {
            recalculateHoursAndRate(s.id, course.id).catch(console.warn);
          }
        },
        onDelete: async (id) => {
          const { error } = await sbDelete("course_schedule_overrides", `id=eq.${id}`);
          if (error) {
            alert("\uC77C\uC815 \uC608\uC678\uB97C \uC0AD\uC81C\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
            return;
          }
          if (setOverrides) setOverrides((prev) => prev.filter((o) => o.id !== id));
          const cs = students.filter((s) => sameId(s.cid, course.id));
          for (const s of cs) {
            recalculateHoursAndRate(s.id, course.id).catch(console.warn);
          }
        }
      }
    )), mode === "qr" ? /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "auto 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, { style: { padding: 20, width: 280, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 } }, [
      { id: "in", label: "\u{1F4E5} \uC785\uC2E4 QR", sub: "\uC785\uC2E4 \uC2A4\uCE94 \u2192 \uCD9C\uC11D", color: "#2563EB" },
      { id: "out", label: "\u{1F4E4} \uD1F4\uC2E4 QR", sub: `${fmtTime(endH, endM)} \uAE30\uC900`, color: T.p }
    ].map(({ id, label, sub, color }) => /* @__PURE__ */ React.createElement("button", { key: id, onClick: () => setQrType(id), style: {
      padding: "10px 6px",
      borderRadius: 9,
      border: "none",
      cursor: "pointer",
      background: qrType === id ? color : T.s3,
      color: qrType === id ? "#fff" : T.mu,
      fontWeight: 700,
      fontSize: 11,
      transition: "all .15s",
      outline: qrType === id ? `none` : `1px solid ${T.bd}`
    } }, label, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 9,
      marginTop: 2,
      color: qrType === id ? "rgba(255,255,255,.7)" : T.mu
    } }, sub)))), /* @__PURE__ */ React.createElement("div", { ref: qrContainerRef, style: { position: "relative", display: "inline-block", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { border: `2px solid ${qrType === "in" ? "#2563EB" : T.pl}`, borderRadius: 10, overflow: "hidden", lineHeight: 0 } }, /* @__PURE__ */ React.createElement(QRCanvas, { data: qrData, size: 200, color: qrColor, bgColor: "#ffffff" })), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      overflow: "hidden",
      borderRadius: 10
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 2,
      background: `linear-gradient(90deg,transparent,${qrType === "in" ? "#2563EB" : T.pl},transparent)`,
      animation: "scanLine 2s linear infinite",
      opacity: 0.7
    } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("button", { onClick: openQrBigView, title: "\uB300\uD615 \uBAA8\uB2C8\uD130\uC5D0 QR\uC744 \uD06C\uAC8C \uD45C\uC2DC", style: {
      padding: "8px 4px",
      borderRadius: 8,
      border: `1.5px solid #2563EB`,
      background: "#EFF6FF",
      color: "#2563EB",
      cursor: "pointer",
      fontSize: 10,
      fontWeight: 700,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15 } }, "\u{1F5A5}\uFE0F"), "\uC0C8 \uD0ED\uC73C\uB85C \uD06C\uAC8C \uBCF4\uAE30"), /* @__PURE__ */ React.createElement("button", { onClick: downloadQrImage, title: "QR \uC774\uBBF8\uC9C0\uB97C PNG\uB85C \uC800\uC7A5", style: {
      padding: "8px 4px",
      borderRadius: 8,
      border: `1.5px solid ${T.p}`,
      background: T.pbg,
      color: T.p,
      cursor: "pointer",
      fontSize: 10,
      fontWeight: 700,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15 } }, "\u{1F4E5}"), "QR \uC774\uBBF8\uC9C0 \uB2E4\uC6B4\uB85C\uB4DC")), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 10,
      color: T.mu,
      lineHeight: 1.8,
      marginBottom: 10,
      padding: "8px 10px",
      background: T.s2,
      borderRadius: 7,
      border: `1px solid ${T.bd}`
    } }, /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, "\uACFC\uC815:"), " ", course.name, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, "\uB0A0\uC9DC:"), " ", date, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.ok } }, "\uC218\uC5C5\uC2DC\uC791:"), " ", fmtTime(startH, startM), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.ok } }, "\uC218\uC5C5\uC885\uB8CC:"), " ", fmtTime(endH, endM), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.mu } }, "\uCD9C\uC11D\uAE30\uC900:"), " \uC218\uC5C5\uC2DC\uAC04 50% \uC774\uC0C1", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: "#2563EB" } }, "\uD604\uC7AC QR:"), " ", qrType === "in" ? "\uC785\uC2E4" : "\uD1F4\uC2E4"), /* @__PURE__ */ React.createElement("div", { style: {
      padding: "8px 10px",
      background: T.pbg,
      borderRadius: 6,
      fontSize: 10,
      color: T.mu,
      wordBreak: "break-all",
      marginBottom: 10
    } }, qrData.slice(0, 60), "\u2026"), /* @__PURE__ */ React.createElement("div", { style: {
      background: T.s2,
      borderRadius: 8,
      padding: "9px 11px",
      border: `1px solid ${T.bd}`,
      fontSize: 11,
      color: T.mu,
      lineHeight: 1.8
    } }, /* @__PURE__ */ React.createElement("b", { style: { color: T.tx, display: "block", marginBottom: 3 } }, "\u{1F4F1} \uC2A4\uCE94 \uC808\uCC28"), "1. \uD559\uC0DD\uC774 \uD3F0\uC73C\uB85C QR \uC2A4\uCE94", /* @__PURE__ */ React.createElement("br", null), "2. \uBAA8\uBC14\uC77C \uCD9C\uC11D \uD398\uC774\uC9C0 \uC790\uB3D9 \uC774\uB3D9", /* @__PURE__ */ React.createElement("br", null), "3. \uC774\uB984 \uD655\uC778 \uD6C4 \uCD9C\uC11D \uBC84\uD2BC \uD0ED", /* @__PURE__ */ React.createElement("br", null), "4. \uB2F4\uB2F9\uC790 \uD654\uBA74 0.5\uCD08 \uB0B4 \uC2E4\uC2DC\uAC04 \uBC18\uC601"), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 8,
      padding: "7px 10px",
      borderRadius: 8,
      background: "#ECFDF5",
      border: "1px solid #6EE7B7",
      fontSize: 10,
      color: "#065F46"
    } }, "\u2705 ", /* @__PURE__ */ React.createElement("b", null, "\uC2E4\uC2DC\uAC04 \uC5F0\uB3D9"), " \u2014 QR \uC2A4\uCE94 \uC989\uC2DC \uCD9C\uACB0 \uBC18\uC601 (Supabase Realtime)")), /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "12px 18px",
      borderBottom: `1px solid ${T.bd}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, display: "flex", alignItems: "center", gap: 8 } }, "\u{1F4E1} \uC2E4\uC2DC\uAC04 \uCD9C\uC11D \uD604\uD669", simRunning && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.ok, display: "inline-flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement("span", { style: {
      width: 6,
      height: 6,
      background: T.ok,
      borderRadius: "50%",
      display: "inline-block",
      animation: "ping 1.2s ease infinite"
    } }), "LIVE")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", onClick: () => {
      setRecords({});
      setSimRunning(false);
      clearInterval(simRef.current);
    } }, "\uCD08\uAE30\uD654"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: startSim, variant: simRunning ? "ghost" : "primary" }, /* @__PURE__ */ React.createElement(Icon, { n: simRunning ? "refresh" : "phone", s: 13 }), simRunning ? "\uC2A4\uCE94 \uC911\u2026" : `${qrType === "in" ? "\uC785\uC2E4" : "\uD1F4\uC2E4"} \uC2DC\uBBAC\uB808\uC774\uC158`))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: 14, overflowY: "auto", maxHeight: 400 } }, courseStudents.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: T.mu, padding: "40px 0", fontSize: 13 } }, "\uC774 \uACFC\uC815\uC5D0 \uB4F1\uB85D\uB41C \uD6C8\uB828\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"), courseStudents.map((s) => {
      const rec = records[s.id] || {};
      const inRec = rec.checkIn ? { time: rec.checkIn } : null;
      const outRec = rec.checkOut ? { time: rec.checkOut } : null;
      const status = rec.status || (inRec ? "O" : "U");
      const att = ATT_MAP[status] || ATT_MAP["U"];
      return /* @__PURE__ */ React.createElement("div", { key: s.id, className: inRec ? "checkin-row" : "", style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 8,
        marginBottom: 6,
        background: inRec ? att.bg : T.s2,
        border: `1px solid ${inRec ? att.color + "30" : T.bd}`,
        transition: "all .3s"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 34,
        height: 34,
        borderRadius: 9,
        flexShrink: 0,
        background: inRec ? `${att.color}20` : T.bd,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 800,
        color: inRec ? att.color : T.mu
      } }, inRec ? att.label[0] : "?"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx } }, s.name, s.enrollmentStatus === "\uC911\uB3C4\uD0C8\uB77D" && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 5, fontSize: 9, color: "#DC2626" } }, "\uC911\uB3C4\uD0C8\uB77D"), s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 5, fontSize: 9, color: "#7E22CE" } }, "\uC870\uAE30\uCDE8\uC5C5")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginTop: 1, display: "flex", gap: 8 } }, inRec && /* @__PURE__ */ React.createElement("span", { style: { color: "#2563EB" } }, "\u{1F4E5} \uC785\uC2E4 ", inRec.time), outRec && /* @__PURE__ */ React.createElement("span", { style: { color: T.p } }, "\u{1F4E4} \uD1F4\uC2E4 ", outRec.time), !inRec && "\uB300\uAE30 \uC911")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, alignItems: "center" } }, inRec && /* @__PURE__ */ React.createElement(Chip, { label: att.label, bg: att.bg, color: att.color }), outRec && /* @__PURE__ */ React.createElement(Chip, { label: "\uD1F4\uC2E4\uC644\uB8CC", bg: "#EFF6FF", color: "#2563EB" }), !inRec && /* @__PURE__ */ React.createElement(Chip, { label: "\uBBF8\uD655\uC778", bg: T.s3, color: T.mu })));
    })), /* @__PURE__ */ React.createElement("div", { style: { padding: "11px 18px", borderTop: `1px solid ${T.bd}`, background: T.s2 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, "\uC785\uC2E4 \uC9C4\uD589\uB960"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.p } }, courseStudents.length ? Math.round(checkedInCnt / courseStudents.length * 100) : 0, "%", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu, fontWeight: 400, marginLeft: 4 } }, "(", checkedInCnt, "/", courseStudents.length, ")"))), /* @__PURE__ */ React.createElement(RBar, { r: courseStudents.length ? checkedInCnt / courseStudents.length * 100 : 0, h: 8 })))) : mode === "manual" ? /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2 } }, ["\uC774\uB984", "\uB204\uC801 \uCD9C\uC11D\uB960", "\uC785\uC2E4 \uC2DC\uAC04", "\uD1F4\uC2E4 \uC2DC\uAC04", "\uC77C\uBCC4 \uC2DC\uAC04", "\uC218\uB3D9 \uBCF4\uC815", "\uCD9C\uACB0 \uC0C1\uD0DC", "\uACB0\uC11D \uC0AC\uC720", "\uC800\uC7A5"].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "10px 12px",
      textAlign: h === "\uC774\uB984" ? "left" : "center",
      fontSize: 11,
      color: T.mu,
      fontWeight: 700,
      borderBottom: `1px solid ${T.bd}`
    } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, courseStudents.map((s) => {
      const row = manualAtt[s.id] || {};
      const curStatus = row.status || "";
      const curIn = row.inTime || "";
      const curOut = row.outTime || "";
      const curReason = row.reason || "";
      const curAbsType = row.absenceType || "personal";
      const curManualAdd = row.manualAddHours ?? 0;
      const curManualDeduct = row.manualDeductHours ?? 0;
      const curManualReason = row.manualReason || "";
      const curManualMemo = row.manualMemo || "";
      const saved = row.saved === true;
      const isDropout = s.enrollmentStatus === "\uC911\uB3C4\uD0C8\uB77D";
      const isEarlyEmployment = s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5";
      const isStatusRestricted = isDropout || isEarlyEmployment;
      const cutoffDate = s.statusChangeDate;
      const cutoffLabel = typeof cutoffDate === "string" && cutoffDate.length >= 10 ? cutoffDate.slice(5) : "";
      const isAfterCutoff = isStatusRestricted && cutoffDate && date > cutoffDate;
      const setRow = (patch) => setManualAtt((p) => ({
        ...p,
        [s.id]: { ...p[s.id] || {}, ...patch, saved: false }
      }));
      const saveRow = async () => {
        if (isAfterCutoff) return;
        try {
          const now = /* @__PURE__ */ new Date();
          const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          if (!curIn && !curStatus && !curOut) {
            alert("\uC785\uC2E4 \uC2DC\uAC04 \uB610\uB294 \uC0C1\uD0DC\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694.");
            return;
          }
          const inTime = curIn || (curStatus && curStatus !== "A" ? defaultTime : null);
          const calcMins = inTime ? timeToMins(inTime) : null;
          const rowStatus = curStatus || (inTime ? "O" : "U");
          const courseIdNum = Number(course?.id);
          if (!courseIdNum) {
            alert("\uACFC\uC815 \uC815\uBCF4 \uC624\uB958: course_id \uC5C6\uC74C");
            console.error("\u274C course_id \uC5C6\uC74C", course);
            return;
          }
          const manualAdd = Number(curManualAdd || 0);
          const manualDeduct = Number(curManualDeduct || 0);
          const hasManualAdjustment = manualAdd > 0 || manualDeduct > 0;
          if (hasManualAdjustment && !curManualReason.trim()) {
            alert("\uC218\uB3D9 \uBCF4\uC815 \uC0AC\uC720\uB97C \uC785\uB825\uD558\uC138\uC694.");
            return;
          }
          const rowData = {
            course_id: courseIdNum,
            student_id: Number(s.id),
            date,
            status: rowStatus,
            check_in: inTime || null,
            check_out: curOut || null,
            method: "manual",
            manual_add_hours: manualAdd,
            manual_deduct_hours: manualDeduct,
            manual_reason: hasManualAdjustment ? curManualReason.trim() : null,
            manual_memo: curManualMemo || null,
            manual_updated_at: hasManualAdjustment ? (/* @__PURE__ */ new Date()).toISOString() : null,
            ...rowStatus === "A" && curReason ? { reason: curReason, absence_type: curAbsType || "personal" } : {}
          };
          const { error } = await sbUpsert("attendance", [rowData], "student_id,date,course_id");
          if (error) throw error;
          setManualAtt((p) => ({ ...p, [s.id]: { ...p[s.id] || {}, saved: true } }));
          setRecords((prev) => {
            const next = { ...prev };
            const upd = { ...next[s.id] || {}, status: rowStatus };
            if (inTime) {
              upd.checkIn = inTime;
              upd.checkInMins = calcMins;
            }
            if (curOut) upd.checkOut = curOut;
            next[s.id] = upd;
            return next;
          });
          if (onRatesUpdated) onRatesUpdated(course.id);
          recalculateHoursAndRate(Number(s.id), Number(course.id)).catch(console.warn);
        } catch (err) {
          alert("\uC800\uC7A5 \uC624\uB958: " + fmtSaveError(err));
        }
      };
      return /* @__PURE__ */ React.createElement(
        "tr",
        {
          key: s.id,
          className: "row-hover",
          style: {
            borderBottom: `1px solid ${T.bd}`,
            background: saved ? "#F0FDF4" : isDropout ? "#FEF2F2" : isEarlyEmployment ? "#F3E8FF" : "transparent",
            opacity: isAfterCutoff ? 0.5 : 1,
            textDecoration: isDropout ? "line-through" : "none"
          }
        },
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px", fontSize: 13, fontWeight: 700, color: T.tx } }, s.name, !isDropout && s.rate < 80 && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 6, fontSize: 10, color: T.danger } }, "\u26A0"), isDropout && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 6, fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "#FEE2E2", color: "#DC2626", fontWeight: 700 } }, "\uC911\uB3C4\uD0C8\uB77D ", cutoffLabel), isEarlyEmployment && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 6, fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "#F3E8FF", color: "#7E22CE", fontWeight: 700 } }, "\uC870\uAE30\uCDE8\uC5C5 ", cutoffLabel), isAfterCutoff && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 4, fontSize: 9, color: T.mu } }, "(\uC785\uB825\uBD88\uAC00)")),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px", textAlign: "center" } }, isDropout ? /* @__PURE__ */ React.createElement(Chip, { label: "\uC911\uB3C4\uD0C8\uB77D", bg: "#FEE2E2", color: T.danger, size: 10 }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: rateColor(s.rate) } }, s.rate, "%"), /* @__PURE__ */ React.createElement(RBar, { r: s.rate, h: 3 })), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => showAttendanceHourBasis(s, course),
            style: {
              marginTop: 4,
              padding: "2px 6px",
              borderRadius: 5,
              border: `1px solid ${T.bd}`,
              background: T.s2,
              color: T.mu,
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }
          },
          "\uADFC\uAC70 \uBCF4\uAE30"
        )),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "time",
            value: curIn,
            onChange: (e) => setRow({ inTime: e.target.value }),
            disabled: isAfterCutoff,
            style: {
              width: 90,
              padding: "5px 6px",
              borderRadius: 6,
              fontSize: 12,
              border: `1px solid ${curIn ? T.ok : T.bd}`,
              outline: "none",
              cursor: isAfterCutoff ? "not-allowed" : "text",
              background: isAfterCutoff ? "#F1F5F9" : "#fff"
            }
          }
        )),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "time",
            value: curOut,
            onChange: (e) => setRow({ outTime: e.target.value }),
            disabled: isAfterCutoff,
            style: {
              width: 90,
              padding: "5px 6px",
              borderRadius: 6,
              fontSize: 12,
              border: `1px solid ${curOut ? T.p : T.bd}`,
              outline: "none",
              cursor: isAfterCutoff ? "not-allowed" : "text",
              background: isAfterCutoff ? "#F1F5F9" : "#fff"
            }
          }
        )),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 8px", textAlign: "center" } }, (() => {
          const includeBreakInHours = shouldIncludeBreakInHours(course);
          const defaultScheduleMinutes = getCourseScheduleMinutes(course);
          const effectiveScheduleMinutes = getOverrideScheduleMinutes(selectedDateOverride, defaultScheduleMinutes);
          const statusForCalc = selectedDateOverride?.type === "cancelled" ? "A" : curStatus || "O";
          const daily = calculateDailyHours(
            {
              check_in: curIn,
              check_out: curOut,
              status: statusForCalc,
              manualAddHours: curManualAdd,
              manualDeductHours: curManualDeduct
            },
            getCourseBreakMinutes(course),
            effectiveScheduleMinutes,
            includeBreakInHours
          );
          const hasTime = curIn && curOut;
          const hasManual = Number(curManualAdd || 0) > 0 || Number(curManualDeduct || 0) > 0;
          return /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: hasTime || hasManual ? T.ok : T.mu } }, hasTime || hasManual ? `${daily.toFixed(1)}h` : "\u2014");
        })(), (() => {
          if (selectedDateOverride) return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: selectedDateOverride.type === "cancelled" ? "#DC2626" : selectedDateOverride.type === "extended" ? "#1D4ED8" : "#D97706", fontWeight: 700, marginTop: 2 } }, selectedDateOverride.type === "cancelled" ? "\u{1F6AB}\uD734\uAC15" : selectedDateOverride.type === "extended" ? `\u{1F504}${selectedDateOverride.hours}h` : `\u23F1\uFE0F${selectedDateOverride.hours}h`);
          return null;
        })()),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 8px", textAlign: "center", minWidth: 200 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "number",
            min: "0",
            step: "0.5",
            value: curManualAdd || "",
            onChange: (e) => setRow({ manualAddHours: Math.max(0, Number(e.target.value) || 0) || "" }),
            disabled: isAfterCutoff,
            placeholder: "+\uC2DC\uAC04",
            style: {
              width: 62,
              padding: "3px 5px",
              borderRadius: 5,
              fontSize: 11,
              border: `1px solid ${curManualAdd > 0 ? T.ok : T.bd}`,
              outline: "none",
              background: isAfterCutoff ? "#F1F5F9" : "#fff",
              color: T.tx
            }
          }
        ), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "number",
            min: "0",
            step: "0.5",
            value: curManualDeduct || "",
            onChange: (e) => setRow({ manualDeductHours: Math.max(0, Number(e.target.value) || 0) || "" }),
            disabled: isAfterCutoff,
            placeholder: "-\uC2DC\uAC04",
            style: {
              width: 62,
              padding: "3px 5px",
              borderRadius: 5,
              fontSize: 11,
              border: `1px solid ${curManualDeduct > 0 ? T.danger : T.bd}`,
              outline: "none",
              background: isAfterCutoff ? "#F1F5F9" : "#fff",
              color: T.tx
            }
          }
        )), (Number(curManualAdd || 0) > 0 || Number(curManualDeduct || 0) > 0) && /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "text",
            value: curManualReason,
            onChange: (e) => setRow({ manualReason: e.target.value }),
            disabled: isAfterCutoff,
            placeholder: "\uC0AC\uC720 (\uD544\uC218)",
            style: {
              width: "100%",
              padding: "3px 5px",
              borderRadius: 5,
              fontSize: 11,
              border: `1px solid ${curManualReason.trim() ? T.bd : T.danger}`,
              outline: "none",
              background: isAfterCutoff ? "#F1F5F9" : "#fff",
              color: T.tx
            }
          }
        ), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "text",
            value: curManualMemo,
            onChange: (e) => setRow({ manualMemo: e.target.value }),
            disabled: isAfterCutoff,
            placeholder: "\uBA54\uBAA8",
            style: {
              width: "100%",
              padding: "3px 5px",
              borderRadius: 5,
              fontSize: 11,
              border: `1px solid ${T.bd}`,
              outline: "none",
              background: isAfterCutoff ? "#F1F5F9" : "#fff",
              color: T.tx
            }
          }
        ))),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 8px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "center" } }, Object.entries(ATT_MAP).map(([k, v]) => /* @__PURE__ */ React.createElement(
          "button",
          {
            key: k,
            onClick: () => setRow({ status: k }),
            disabled: isAfterCutoff,
            style: {
              width: 40,
              height: 26,
              border: "none",
              borderRadius: 5,
              cursor: isAfterCutoff ? "not-allowed" : "pointer",
              fontSize: 11,
              fontWeight: 700,
              transition: "all .15s",
              background: curStatus === k ? v.color : T.s2,
              color: curStatus === k ? "#fff" : T.mu,
              opacity: isAfterCutoff ? 0.7 : 1
            }
          },
          v.label
        )))),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 8px", minWidth: 140 } }, curStatus === "A" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement(
          "select",
          {
            value: curAbsType,
            onChange: (e) => setRow({ absenceType: e.target.value }),
            disabled: isAfterCutoff,
            style: {
              width: "100%",
              padding: "3px 6px",
              borderRadius: 5,
              fontSize: 11,
              border: `1px solid ${T.bd}`,
              outline: "none",
              background: T.s2,
              color: T.tx
            }
          },
          /* @__PURE__ */ React.createElement("option", { value: "excused" }, "\uBD80\uB4DD\uC774\uD55C \uC0AC\uC720 (\u3260)"),
          /* @__PURE__ */ React.createElement("option", { value: "personal" }, "\uAC1C\uC778 \uC0AC\uC720 (\u3261)")
        ), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "text",
            value: curReason,
            onChange: (e) => setRow({ reason: e.target.value }),
            disabled: isAfterCutoff,
            placeholder: "\uC0AC\uC720 \uC785\uB825...",
            style: {
              width: "100%",
              padding: "3px 6px",
              borderRadius: 5,
              fontSize: 11,
              border: `1px solid ${T.bd}`,
              outline: "none",
              color: T.tx,
              background: T.s2
            }
          }
        )) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, "\u2014")),
        /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: saveRow,
            disabled: isAfterCutoff,
            style: {
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: saved ? T.ok : T.p,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              cursor: isAfterCutoff ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              opacity: isAfterCutoff ? 0.65 : 1
            }
          },
          saved ? "\u2713 \uC800\uC7A5\uB428" : "\uC800\uC7A5"
        ))
      );
    }))), /* @__PURE__ */ React.createElement("div", { style: {
      padding: "14px 18px",
      borderTop: `1px solid ${T.bd}`,
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, Object.values(manualAtt).filter((r) => r.saved).length, "\uBA85 \uC800\uC7A5\uB428"), /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: () => setManualAtt({}) }, "\uCD08\uAE30\uD654"), /* @__PURE__ */ React.createElement(Btn, { onClick: async () => {
      const unsaved = courseStudents.filter((s) => {
        const row = manualAtt[s.id] || {};
        return (row.inTime || row.status || row.outTime) && !row.saved;
      });
      if (unsaved.length === 0) {
        alert("\uC800\uC7A5\uD560 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      for (const s of unsaved) {
        const row = manualAtt[s.id] || {};
        const manualAdd = Number(row.manualAddHours || 0);
        const manualDeduct = Number(row.manualDeductHours || 0);
        if ((manualAdd > 0 || manualDeduct > 0) && !(row.manualReason || "").trim()) {
          alert(`${s.name}: \uC218\uB3D9 \uBCF4\uC815 \uC0AC\uC720\uB97C \uC785\uB825\uD558\uC138\uC694.`);
          return;
        }
      }
      try {
        const courseIdNum = Number(course?.id);
        if (!courseIdNum) {
          alert("\uACFC\uC815 \uC815\uBCF4 \uC624\uB958: course_id \uC5C6\uC74C");
          console.error("\u274C course_id \uC5C6\uC74C", course);
          return;
        }
        const now = /* @__PURE__ */ new Date();
        const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const attRows = unsaved.map((s) => {
          const row = manualAtt[s.id] || {};
          const inTime = row.inTime || (row.status && row.status !== "A" ? defaultTime : null);
          const rowStatus = row.status || (inTime ? "O" : "U");
          const manualAdd = Number(row.manualAddHours || 0);
          const manualDeduct = Number(row.manualDeductHours || 0);
          const hasManualAdjustment = manualAdd > 0 || manualDeduct > 0;
          return {
            course_id: courseIdNum,
            student_id: Number(s.id),
            date,
            status: rowStatus,
            check_in: inTime || null,
            check_out: row.outTime || null,
            method: "manual",
            manual_add_hours: manualAdd,
            manual_deduct_hours: manualDeduct,
            manual_reason: hasManualAdjustment ? (row.manualReason || "").trim() : null,
            manual_memo: row.manualMemo || null,
            manual_updated_at: hasManualAdjustment ? (/* @__PURE__ */ new Date()).toISOString() : null,
            ...rowStatus === "A" && row.reason ? { reason: row.reason, absence_type: row.absenceType || "personal" } : {}
          };
        });
        const { error } = await sbUpsert("attendance", attRows, "student_id,date,course_id");
        if (error) throw error;
        setManualAtt((p) => {
          const next = { ...p };
          unsaved.forEach((s) => {
            next[s.id] = { ...next[s.id] || {}, saved: true };
          });
          return next;
        });
        setRecords((prev) => {
          const next = { ...prev };
          attRows.forEach((r) => {
            const upd = { ...next[r.student_id] || {}, status: r.status };
            if (r.check_in) {
              upd.checkIn = r.check_in;
              upd.checkInMins = timeToMins(r.check_in);
            }
            if (r.check_out) upd.checkOut = r.check_out;
            next[r.student_id] = upd;
          });
          return next;
        });
        alert(`\u2705 ${unsaved.length}\uBA85 \uCD9C\uACB0 \uC77C\uAD04 \uC800\uC7A5 \uC644\uB8CC`);
        if (onRatesUpdated) onRatesUpdated(course.id);
        Promise.all(unsaved.map(
          (s) => recalculateHoursAndRate(Number(s.id), Number(course.id))
        )).catch(console.warn);
      } catch (err) {
        alert("\uC800\uC7A5 \uC624\uB958: " + fmtSaveError(err));
      }
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), "\uC804\uCCB4 \uC77C\uAD04 \uC800\uC7A5"))) : (
      /* ── 출석부 모드 ── */
      /* @__PURE__ */ React.createElement(AttendanceSheet, { course, courses, students })
    ));
  };
  const ScheduleOverridePanel = ({ course, overrides, onAdd, onDelete }) => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: "", type: "cancelled", timeFrom: "", timeTo: "", hours: 0, reason: "" });
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const typeLabels = { extended: "\u{1F504} \uBCF4\uAC15", cancelled: "\u{1F6AB} \uD734\uAC15", shortened: "\u23F1\uFE0F \uB2E8\uCD95" };
    const typeBg = { extended: "#DBEAFE", cancelled: "#FEE2E2", shortened: "#FEF3C7" };
    const typeColor = { extended: "#1D4ED8", cancelled: "#DC2626", shortened: "#D97706" };
    const handleSave = () => {
      if (!form.date) {
        alert("\uC77C\uC815 \uC608\uC678\uB97C \uCD94\uAC00\uD558\uB824\uBA74 \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD558\uC138\uC694.");
        return;
      }
      if (form.type !== "cancelled" && (!form.timeFrom || !form.timeTo)) {
        alert("\uBCF4\uAC15/\uB2E8\uCD95 \uC218\uC5C5\uC740 \uC2DC\uC791 \uC2DC\uAC04\uACFC \uC885\uB8CC \uC2DC\uAC04\uC744 \uC785\uB825\uD574\uC57C \uD569\uB2C8\uB2E4.");
        return;
      }
      const hours = form.type === "cancelled" ? 0 : (() => {
        const from = parseTimeToMinutes(form.timeFrom);
        const to = parseTimeToMinutes(form.timeTo);
        return getHoursFromScheduleRange(from, to, getCourseBreakMinutes(course), shouldIncludeBreakInHours(course));
      })();
      if (form.type !== "cancelled" && hours <= 0) {
        alert("\uBCF4\uAC15/\uB2E8\uCD95 \uC218\uC5C5 \uC2DC\uAC04\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        return;
      }
      onAdd({
        courseId: course.id,
        date: form.date,
        type: form.type,
        timeFrom: form.type === "cancelled" ? null : form.timeFrom,
        timeTo: form.type === "cancelled" ? null : form.timeTo,
        hours,
        reason: form.reason
      });
      setShowModal(false);
      setForm({ date: "", type: "cancelled", timeFrom: "", timeTo: "", hours: 0, reason: "" });
    };
    if (!course) return null;
    if (overrides.length === 0 && !showModal) {
      return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14, display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowModal(true), style: {
        padding: "6px 12px",
        borderRadius: 8,
        border: `1px solid ${T.bd}`,
        background: T.s2,
        color: T.mu,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600
      } }, "\u{1F4C5} \uC77C\uC815 \uC608\uC678 \uCD94\uAC00"));
    }
    const inp = { padding: "6px 8px", border: `1px solid ${T.bd}`, borderRadius: 7, fontSize: 12, outline: "none", background: T.s2 };
    return /* @__PURE__ */ React.createElement(Card, { style: { padding: "14px 18px", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, "\u{1F4C5} \uC77C\uC815 \uC608\uC678 \uAD00\uB9AC"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowModal(true), style: {
      padding: "5px 10px",
      borderRadius: 7,
      border: "none",
      background: T.p,
      color: "#fff",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700
    } }, "+ \uCD94\uAC00")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, [...overrides].sort((a, b) => a.date.localeCompare(b.date)).map((ov) => /* @__PURE__ */ React.createElement("div", { key: ov.id, style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 8,
      background: typeBg[ov.type],
      border: `1px solid ${typeColor[ov.type]}30`
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.tx, minWidth: 70 } }, ov.date.slice(5)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: typeColor[ov.type] } }, typeLabels[ov.type]), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, ov.type === "cancelled" ? "\u2014" : `${ov.timeFrom?.slice(0, 5)}~${ov.timeTo?.slice(0, 5)}`), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.tx } }, ov.hours, "h"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu, flex: 1 } }, ov.reason), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (window.confirm("\uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) onDelete(ov.id);
        },
        style: {
          width: 22,
          height: 22,
          borderRadius: 5,
          border: "none",
          background: "#FEF2F2",
          color: T.danger,
          cursor: "pointer",
          fontSize: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      "\xD7"
    )))), showModal && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: "14px 16px", borderRadius: 10, background: T.s2, border: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx, marginBottom: 10 } }, "\u{1F4C5} \uC77C\uC815 \uC608\uC678 \uCD94\uAC00"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10, color: T.mu, display: "block", marginBottom: 4 } }, "\uB0A0\uC9DC"), /* @__PURE__ */ React.createElement("input", { type: "date", value: form.date, onChange: (e) => set("date", e.target.value), style: { ...inp, width: "100%" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10, color: T.mu, display: "block", marginBottom: 4 } }, "\uC720\uD615"), /* @__PURE__ */ React.createElement("select", { value: form.type, onChange: (e) => set("type", e.target.value), style: { ...inp, width: "100%", cursor: "pointer" } }, /* @__PURE__ */ React.createElement("option", { value: "cancelled" }, "\u{1F6AB} \uC790\uCCB4 \uD734\uAC15"), /* @__PURE__ */ React.createElement("option", { value: "extended" }, "\u{1F504} \uBCF4\uAC15 (\uC2DC\uAC04\uC5F0\uC7A5)"), /* @__PURE__ */ React.createElement("option", { value: "shortened" }, "\u23F1\uFE0F \uB2E8\uCD95 \uC218\uC5C5")))), form.type !== "cancelled" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10, color: T.mu, display: "block", marginBottom: 4 } }, "\uC2DC\uC791 \uC2DC\uAC04"), /* @__PURE__ */ React.createElement("input", { type: "time", value: form.timeFrom, onChange: (e) => set("timeFrom", e.target.value), style: { ...inp, width: "100%" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10, color: T.mu, display: "block", marginBottom: 4 } }, "\uC885\uB8CC \uC2DC\uAC04"), /* @__PURE__ */ React.createElement("input", { type: "time", value: form.timeTo, onChange: (e) => set("timeTo", e.target.value), style: { ...inp, width: "100%" } }))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10, color: T.mu, display: "block", marginBottom: 4 } }, "\uC0AC\uC720"), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: form.reason,
        onChange: (e) => set("reason", e.target.value),
        placeholder: "\uC608: \uC5B4\uB9B0\uC774\uB0A0 \uB300\uCCB4\uD734\uBB34",
        style: { ...inp, width: "100%" }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowModal(false), style: { padding: "6px 14px", borderRadius: 7, border: `1px solid ${T.bd}`, background: T.s2, color: T.mu, cursor: "pointer", fontSize: 11 } }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement("button", { onClick: handleSave, style: { padding: "6px 14px", borderRadius: 7, border: "none", background: T.p, color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700 } }, "\uC800\uC7A5"))));
  };
  const buildCourseDatesAll = (course) => {
    const getLocalStr = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const dateFrom = course?.dateFrom ?? course?.date_from;
    const dateTo = course?.dateTo ?? course?.date_to;
    const schedDaysRaw = course?.schedDays ?? course?.sched_days;
    if (!dateFrom) return [];
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    const end = dateTo ? new Date(dateTo) : /* @__PURE__ */ new Date();
    end.setHours(0, 0, 0, 0);
    if (start > end) return [];
    const DAY_MAP = { \uC77C: 0, \uC6D4: 1, \uD654: 2, \uC218: 3, \uBAA9: 4, \uAE08: 5, \uD1A0: 6 };
    const allowedDows = schedDaysRaw && String(schedDaysRaw).trim().length ? new Set(
      String(schedDaysRaw).split(",").map((s) => s.trim()).filter(Boolean).map((s) => /^[0-6]$/.test(s) ? Number(s) : DAY_MAP[s]).filter((d) => d !== void 0)
    ) : /* @__PURE__ */ new Set([1, 2, 3, 4, 5]);
    const out = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (allowedDows.has(d.getDay())) {
        const ds = getLocalStr(d);
        if (!isHoliday(ds) && !isCancelledOverride(course?.id, ds)) out.push(ds);
      }
    }
    return out;
  };
  const formatHourText = (hours) => {
    const n = Number(hours) || 0;
    return Number.isInteger(n) ? `${n}` : n.toFixed(1);
  };
  const isAttendanceCutoffStatus = (status) => status === "\uC911\uB3C4\uD0C8\uB77D" || status === "\uC870\uAE30\uCDE8\uC5C5";
  const isAttendanceDateLocked = (student, date) => {
    const status = student?.enrollmentStatus || "\uC7AC\uD559\uC911";
    const cutoffDate = student?.statusChangeDate || "";
    return !!(date && cutoffDate && isAttendanceCutoffStatus(status) && date > cutoffDate);
  };
  const getAttendanceStatusMeta = (student) => {
    const status = student?.enrollmentStatus || "\uC7AC\uD559\uC911";
    if (!status || status === "\uC7AC\uD559\uC911") return null;
    const cutoffDate = student?.statusChangeDate || "";
    const cutoffLabel = cutoffDate && cutoffDate.length >= 10 ? cutoffDate.slice(5) : "";
    const sc = STATUS_COLORS?.[status] || { bg: "#E5E7EB", color: "#475569" };
    const label = cutoffLabel && isAttendanceCutoffStatus(status) ? `${status} ${cutoffLabel}` : status;
    return { status, cutoffDate, cutoffLabel, label, shortLabel: status, colors: sc };
  };
  const getAttendanceSheetTotalHours = (course, student) => {
    if (student?.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" && student?.statusChangeDate) {
      return getProportionalCourseHours(course, student.statusChangeDate);
    }
    return getTotalCourseHours(course);
  };
  const printAttendanceSheet = (course, courseStudents, dates, attMap, instructorName) => {
    const today = /* @__PURE__ */ new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const period = formatCoursePeriod(course);
    const schedInfo = course.schedDays ? `${course.schedDays}${course.schedTimeFrom && course.schedTimeTo ? ` / ${course.schedTimeFrom}~${course.schedTimeTo}` : ""}` : "";
    const totalCourseHours = getTotalCourseHours(course);
    const breakMinutes = getCourseBreakMinutes(course);
    const includeBreakInHours = shouldIncludeBreakInHours(course);
    const fmtDate = (d) => {
      const [, m, dd] = d.split("-");
      return `${+m}/${+dd}`;
    };
    const getDow = (d) => {
      const dw = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"];
      return dw[new Date(d).getDay()];
    };
    const MAX_COLS = 20;
    const chunks = [];
    for (let i = 0; i < dates.length; i += MAX_COLS) chunks.push(dates.slice(i, i + MAX_COLS));
    const totalPages = chunks.length;
    const totalAttMap = {};
    courseStudents.forEach((s) => {
      let cnt = 0;
      dates.forEach((d) => {
        if (d <= todayStr && !isAttendanceDateLocked(s, d) && attMap[`${s.id}_${d}`]?.status === "O") cnt++;
      });
      totalAttMap[s.id] = cnt;
    });
    const buildTable = (datePart, pageNum) => {
      const n = datePart.length;
      const colW = Math.max(24, Math.min(36, Math.floor(1060 / Math.max(n, 1))));
      const isLast = pageNum === totalPages;
      const pageStudents = courseStudents;
      const miniHeader = totalPages > 1 ? `<div class="page-mini-header"><span class="page-course-name">${course.name}</span><span class="page-info">\uCD9C\uC11D\uBD80 (${pageNum}/${totalPages})</span></div>` : "";
      return `
    ${miniHeader}
    <table class="att-table">
      <colgroup>
        <col style="width:28px"/>
        <col style="width:90px"/>
        ${datePart.map(() => `<col style="width:${colW}px"/>`).join("")}
        <col style="width:44px"/>
      </colgroup>
      <thead>
        <tr>
          <th rowspan="2" class="th-hd">\uBC88\uD638</th>
          <th rowspan="2" class="th-hd">\uC131\uBA85</th>
          ${datePart.map((d) => {
        const dow = getDow(d);
        const wkend = dow === "\uC77C" || dow === "\uD1A0";
        return `<th class="th-date${wkend ? " th-wkend" : ""}">${fmtDate(d)}</th>`;
      }).join("")}
          <th rowspan="2" class="th-hd">${isLast && totalPages > 1 ? '\uCD9C\uC11D<br/>\uC77C\uC218<br/><span style="font-size:6pt;font-weight:400;">(\uC804\uCCB4)</span>' : "\uCD9C\uC11D<br/>\uC77C\uC218"}</th>
        </tr>
        <tr>
          ${datePart.map((d) => {
        const dow = getDow(d);
        const cs = dow === "\uC77C" ? "color:#DC2626;" : dow === "\uD1A0" ? "color:#2563EB;" : "";
        return `<th class="th-dow" style="${cs}">${dow}</th>`;
      }).join("")}
        </tr>
      </thead>
      <tbody>
        ${pageStudents.map((s, idx) => {
        let cnt = 0;
        const statusMeta = getAttendanceStatusMeta(s);
        const totalHoursForStudent = getAttendanceSheetTotalHours(course, s);
        const nameSub = isDropoutStudent(s) ? `\uB204\uC801 ${formatHourText(s.accumulatedHours || 0)}h / ${formatHourText(totalHoursForStudent)}h \xB7 \uC911\uB3C4\uD0C8\uB77D` : `\uB204\uC801 ${formatHourText(s.accumulatedHours || 0)}h / ${formatHourText(totalHoursForStudent)}h \xB7 ${formatHourText(s.rate || 0)}%`;
        const cells = datePart.map((d) => {
          const rec = attMap[`${s.id}_${d}`] || {};
          const status = rec.status;
          const isLocked = isAttendanceDateLocked(s, d);
          const checkIn = rec.checkIn ? String(rec.checkIn).slice(0, 5) : "";
          const checkOut = rec.checkOut ? String(rec.checkOut).slice(0, 5) : "";
          const timeHtml = checkIn || checkOut ? `<div class="cell-time">${checkIn || "\u2014"}~${checkOut || "\u2014"}</div>` : "";
          if (d > todayStr) return `<td class="cell"></td>`;
          if (isLocked) return `<td class="cell cell-cutoff"></td>`;
          if (status === "O") {
            cnt++;
            return `<td class="cell cell-o">O${timeHtml}</td>`;
          }
          if (status === "A") return `<td class="cell cell-x">X${timeHtml}</td>`;
          if (status === "L") return `<td class="cell cell-tri">\u25B3${timeHtml}</td>`;
          return `<td class="cell"></td>`;
        }).join("");
        const cntCell = isLast && totalPages > 1 ? `<td class="cell cell-cnt">${totalAttMap[s.id]}</td>` : `<td class="cell cell-cnt">${cnt}${!isLast ? '<div style="font-size:6pt;color:#888;">(\uC18C\uACC4)</div>' : ""}</td>`;
        return `<tr class="${idx % 2 === 1 ? "row-even" : ""}"><td class="cell cell-num">${idx + 1}</td><td class="cell cell-name"><div class="cell-name-main">${s.name}</div>${statusMeta ? `<div class="cell-status" style="background:${statusMeta.colors.bg};color:${statusMeta.colors.color};">${statusMeta.label}</div>` : ""}<div class="cell-sub">${nameSub}</div></td>${cells}${cntCell}</tr>`;
      }).join("")}
      </tbody>
    </table>`;
    };
    const tables = chunks.map((chunk, i) => {
      const pageNum = i + 1;
      const isLast = pageNum === totalPages;
      const signHtml = "";
      return buildTable(chunk, pageNum) + signHtml + (i < totalPages - 1 ? '<div style="page-break-before:always;margin-top:6px;"></div>' : "");
    }).join("");
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<title>\uCD9C\uC11D\uBD80 - ${course.name}</title>
<style>
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Pretendard','\uB9D1\uC740 \uACE0\uB515',sans-serif;background:#fff;padding:8mm 7mm;}
  .header{text-align:center;margin-bottom:10px;}
  .header h1{font-size:17pt;font-weight:900;letter-spacing:6px;border-bottom:2px solid #333;
    display:inline-block;padding-bottom:5px;}
  .info-table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:9pt;}
  .info-table td{padding:4px 8px;border:1px solid #aaa;}
  .info-table .lbl{background:#E8ECF0;font-weight:700;text-align:center;width:68px;}
  .info-table [contenteditable]:hover{background:#FFFBEB;cursor:text;}
  .info-table [contenteditable]:focus{background:#FEF3C7;outline:none;}
  .att-table{width:100%;border-collapse:collapse;font-size:8pt;}
  .att-table th,.att-table td{border:1px solid #aaa;}
  .th-hd{background:#CBD5E1;font-weight:700;padding:4px 2px;text-align:center;font-size:8pt;}
  .th-date{background:#E2E8F0;font-weight:600;padding:2px 1px;text-align:center;font-size:7pt;}
  .th-date.th-wkend{background:#FEE2E2;}
  .th-dow{background:#F8FAFC;font-weight:600;padding:2px 1px;text-align:center;font-size:7pt;}
  .cell{padding:2px 1px;text-align:center;font-size:10pt;height:20px;}
  .cell-num{background:#F8FAFC;font-size:8pt;color:#777;}
  .cell-name{text-align:left;padding:3px 4px;font-weight:600;white-space:normal;font-size:9pt;line-height:1.2;vertical-align:middle;}
  .cell-name-main{font-weight:700;}
  .cell-status{display:inline-block;margin-top:2px;padding:1px 4px;border-radius:999px;font-size:6.3pt;font-weight:700;}
  .cell-sub{margin-top:2px;font-size:6pt;color:#475569;font-weight:500;white-space:nowrap;}
  .cell-o{color:#15803D;font-weight:900;font-size:12pt;}
  .cell-x{color:#DC2626;font-weight:900;font-size:12pt;}
  .cell-tri{color:#D97706;font-weight:900;font-size:12pt;}
  .cell-time{font-size:5.6pt;line-height:1.1;font-weight:500;color:#334155;letter-spacing:-0.1px;white-space:nowrap;}
  .cell-cutoff{background:#F8FAFC;}
  .cell-cnt{font-weight:700;background:#EFF6FF;color:#1D4ED8;vertical-align:middle;}
  .row-even td{background:#F8FAFC !important;}
  .sign-area{margin-top:14px;display:flex;justify-content:flex-end;gap:24px;}
  .sign-box{text-align:center;border:1px solid #555;padding:6px 14px;min-width:76px;}
  .sign-box .lbl2{font-weight:700;font-size:9pt;margin-bottom:4px;}
  .sign-box .line{height:34px;}
  .page-mini-header{display:flex;justify-content:space-between;align-items:center;
    margin-bottom:4px;padding:3px 6px;background:#E8ECF0;font-size:8.5pt;font-weight:700;border:1px solid #aaa;}
  .page-course-name{color:#1e3a5f;}
  .page-info{color:#555;font-weight:600;}
  .print-btn{position:fixed;bottom:24px;right:24px;background:#EA580C;color:#fff;
    border:none;border-radius:10px;padding:12px 24px;font-size:14px;font-weight:700;
    cursor:pointer;box-shadow:0 4px 20px rgba(234,88,12,.4);
    font-family:'Pretendard',sans-serif;z-index:99;}
  @media print{
    body{padding:5mm 5mm;}
    .print-btn{display:none;}
    [contenteditable]{background:transparent !important;outline:none !important;}
    @page{size:A4 landscape;margin:5mm;}
  }
</style></head>
<body>
  <div class="header"><h1>\uCD9C \uC11D \uBD80</h1></div>
  <table class="info-table">
    <tr>
      <td class="lbl">\uACFC\uC815\uBA85</td>
      <td colspan="3" contenteditable="true">${course.name}</td>
      <td class="lbl">\uACFC\uC815\uCF54\uB4DC</td>
      <td>${course.code}</td>
    </tr>
    <tr>
      <td class="lbl">\uD6C8\uB828\uAE30\uAC04</td>
      <td contenteditable="true">${period}</td>
      <td class="lbl">\uC218\uC5C5\uC77C\uC815</td>
      <td>${schedInfo}</td>
      <td class="lbl">\uCD1D \uC2DC\uAC04</td>
      <td>${formatHourText(totalCourseHours)}\uC2DC\uAC04 / \uD734\uC2DD ${breakMinutes}\uBD84 ${includeBreakInHours ? "\uD3EC\uD568" : "\uC81C\uC678"}</td>
    </tr>
    <tr>
      <td class="lbl">\uB2F4\uB2F9 \uAC15\uC0AC</td>
      <td contenteditable="true">${instructorName || "-"}</td>
      <td class="lbl">\uB2F4 \uB2F9 \uC790</td>
      <td contenteditable="true"></td>
      <td class="lbl">\uCD9C\uB825\uC77C\uC790</td>
      <td>${todayStr}</td>
    </tr>
  </table>
  ${tables}
  <button class="print-btn" onclick="window.print()">\u{1F5A8}\uFE0F PDF \uC800\uC7A5 / \uC778\uC1C4</button>
</body></html>`;
    const USE_PREVIEW = true;
    if (USE_PREVIEW && window._showPrintPreview) {
      window._showPrintPreview(html, "attendanceSheet", "landscape");
    } else {
      const w = window.open("", "_blank", "width=1200,height=900");
      if (w) {
        w.document.write(html);
        w.document.close();
      } else {
        alert("\uD31D\uC5C5\uC774 \uCC28\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uD31D\uC5C5 \uCC28\uB2E8\uC744 \uD574\uC81C\uD574\uC8FC\uC138\uC694.");
      }
    }
  };
  const AttendanceSheet = ({ course, courses, students }) => {
    const [sheetCourse, setSheetCourse] = useState(course);
    const [attData, setAttData] = useState({});
    const [loadingSheet, setLoadingSheet] = useState(false);
    const [instructors, setInstructors] = useState([]);
    useEffect(() => {
      if (!courses.length) return;
      setSheetCourse((prev) => {
        if (!prev) return courses[0];
        const updated = courses.find((c) => c.id === prev.id);
        return updated || courses[0];
      });
    }, [courses]);
    useEffect(() => {
      (async () => {
        try {
          const { data } = await sbGet("instructors", "select=*&order=id");
          if (data) setInstructors(data.map(toInstructor));
        } catch {
        }
      })();
    }, []);
    useEffect(() => {
      if (!sheetCourse) return;
      const load = async () => {
        setLoadingSheet(true);
        try {
          const courseStudentIds = students.filter((s) => s.cid === sheetCourse.id).map((s) => s.id);
          if (courseStudentIds.length === 0) {
            setAttData({});
            setLoadingSheet(false);
            return;
          }
          const { data, error } = await sbGet(
            "attendance",
            `select=student_id,date,status,check_in,check_out&course_id=eq.${sheetCourse.id}&student_id=in.(${courseStudentIds.join(",")})`
          );
          if (error) throw error;
          const map = {};
          (data || []).forEach((att) => {
            map[`${att.student_id}_${att.date}`] = {
              status: att.status || "U",
              checkIn: att.check_in || "",
              checkOut: att.check_out || ""
            };
          });
          setAttData(map);
        } catch (err) {
          console.error("\uCD9C\uC11D\uBD80 \uB370\uC774\uD130 \uB85C\uB4DC \uC624\uB958:", err);
          setAttData({});
        }
        setLoadingSheet(false);
      };
      load();
    }, [sheetCourse, students]);
    const allDates = buildCourseDatesAll(sheetCourse);
    const courseStudents = students.filter((s) => s.cid === sheetCourse?.id);
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const totalCourseHours = getTotalCourseHours(sheetCourse);
    const breakMinutes = getCourseBreakMinutes(sheetCourse);
    const includeBreakInHours = shouldIncludeBreakInHours(sheetCourse);
    const instNames = instructors.filter((i) => (i.cids || []).includes(sheetCourse?.id)).map((i) => i.name);
    const instructorName = instNames.join(", ");
    const fmtDateShort = (d) => {
      const [, m, dd] = d.split("-");
      return `${+m}/${+dd}`;
    };
    const getDow = (d) => {
      const dw = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"];
      return dw[new Date(d).getDay()];
    };
    const PAGE_SIZE = 20;
    const [datePage, setDatePage] = useState(0);
    const [showTimes, setShowTimes] = useState(false);
    const totalDatePages = Math.ceil(allDates.length / PAGE_SIZE);
    const visibleDates = allDates.slice(datePage * PAGE_SIZE, (datePage + 1) * PAGE_SIZE);
    const pageStudents = courseStudents;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Card, { style: { padding: "14px 18px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 6, fontWeight: 600 } }, "\uCD9C\uC11D\uBD80 \u2014 \uACFC\uC815 \uC120\uD0DD"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 } }, courses.map((c) => {
      const active = sheetCourse?.id === c.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: c.id,
          type: "button",
          onClick: () => {
            setSheetCourse(c);
            setDatePage(0);
          },
          style: {
            padding: "5px 10px",
            borderRadius: 8,
            border: `1.5px solid ${active ? T.p : T.bd}`,
            background: active ? T.p : T.s2,
            color: active ? "#fff" : T.tx,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            transition: "all .15s",
            whiteSpace: "nowrap",
            boxShadow: active ? `0 2px 6px ${T.p}44` : "none"
          }
        },
        /* @__PURE__ */ React.createElement("span", { style: { opacity: active ? 0.85 : 0.6, fontSize: 10 } }, "[", c.code, "]"),
        " ",
        shortCourseName(c.name)
      );
    })), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      gap: 14,
      alignItems: "center",
      flexWrap: "wrap",
      borderTop: `1px solid ${T.bd}`,
      paddingTop: 10
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.tx } }, /* @__PURE__ */ React.createElement("b", null, sheetCourse?.name), " \xB7 ", formatCoursePeriod(sheetCourse), " \xB7 \uCD1D ", formatHourText(totalCourseHours), "\uC2DC\uAC04 \xB7 \uD734\uC2DD ", breakMinutes, "\uBD84 ", includeBreakInHours ? "\uD3EC\uD568" : "\uC81C\uC678"), instructorName && /* @__PURE__ */ React.createElement(Chip, { label: `\uAC15\uC0AC: ${instructorName}`, bg: T.pbg, color: T.p }), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowTimes((p) => !p),
        style: {
          padding: "5px 10px",
          borderRadius: 7,
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          border: `1.5px solid ${showTimes ? T.p : T.bd}`,
          background: showTimes ? T.pbg : T.s2,
          color: showTimes ? T.p : T.mu
        }
      },
      "\u23F1 \uC2DC\uAC04 ",
      showTimes ? "\uC228\uAE30\uAE30" : "\uBCF4\uAE30"
    ), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: () => {
      printAttendanceSheet(sheetCourse, courseStudents, allDates, attData, instructorName);
    } }, "\u{1F5A8}\uFE0F PDF \uCD9C\uB825")))), loadingSheet ? /* @__PURE__ */ React.createElement(Card, { style: { padding: 40, textAlign: "center", color: T.mu, fontSize: 13 } }, "\u23F3 \uCD9C\uC11D \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4...") : courseStudents.length === 0 ? /* @__PURE__ */ React.createElement(Card, { style: { padding: 40, textAlign: "center", color: T.mu, fontSize: 13 } }, "\uD574\uB2F9 \uACFC\uC815\uC5D0 \uB4F1\uB85D\uB41C \uD6C8\uB828\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") : allDates.length === 0 ? /* @__PURE__ */ React.createElement(Card, { style: { padding: 40, textAlign: "center", color: T.mu, fontSize: 13 } }, "\uACFC\uC815 \uC77C\uC815\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.") : /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden" } }, totalDatePages > 1 && /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 14px", borderBottom: `1px solid ${T.bd}`, display: "flex", gap: 8, alignItems: "center", background: T.s2 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        disabled: datePage === 0,
        onClick: () => setDatePage((p) => p - 1),
        style: {
          padding: "4px 10px",
          borderRadius: 6,
          border: `1px solid ${T.bd}`,
          background: datePage === 0 ? T.s3 : "#fff",
          color: datePage === 0 ? T.mu : T.tx,
          cursor: datePage === 0 ? "default" : "pointer",
          fontSize: 11,
          fontWeight: 600
        }
      },
      "\u25C0 \uC774\uC804"
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu, fontWeight: 600 } }, datePage + 1, " / ", totalDatePages, " \uD398\uC774\uC9C0 (", fmtDateShort(visibleDates[0]), " ~ ", fmtDateShort(visibleDates[visibleDates.length - 1]), ")"), /* @__PURE__ */ React.createElement(
      "button",
      {
        disabled: datePage >= totalDatePages - 1,
        onClick: () => setDatePage((p) => p + 1),
        style: {
          padding: "4px 10px",
          borderRadius: 6,
          border: `1px solid ${T.bd}`,
          background: datePage >= totalDatePages - 1 ? T.s3 : "#fff",
          color: datePage >= totalDatePages - 1 ? T.mu : T.tx,
          cursor: datePage >= totalDatePages - 1 ? "default" : "pointer",
          fontSize: 11,
          fontWeight: 600
        }
      },
      "\uB2E4\uC74C \u25B6"
    ), /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", fontSize: 11, color: T.mu } }, "\uC804\uCCB4 \uC218\uC5C5\uC77C: ", allDates.length, "\uC77C \xB7 \uD6C8\uB828\uC0DD: ", courseStudents.length, "\uBA85")), /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 120 + visibleDates.length * (showTimes ? 48 : 28) } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2 } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 6px", fontSize: 10, color: T.mu, fontWeight: 700, borderBottom: `1px solid ${T.bd}`, position: "sticky", left: 0, background: T.s2, zIndex: 2, minWidth: 36, textAlign: "center" } }, "\uBC88\uD638"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 6px", fontSize: 10, color: T.mu, fontWeight: 700, borderBottom: `1px solid ${T.bd}`, position: "sticky", left: 36, background: T.s2, zIndex: 2, minWidth: 140, textAlign: "left" } }, "\uC131\uBA85 / \uC0C1\uD0DC"), visibleDates.map((d) => /* @__PURE__ */ React.createElement("th", { key: d, style: {
      padding: "4px 2px",
      fontSize: 9,
      color: d > today ? T.mu : T.tx,
      fontWeight: 600,
      borderBottom: `1px solid ${T.bd}`,
      textAlign: "center",
      minWidth: showTimes ? 44 : 26,
      whiteSpace: "nowrap",
      background: d === today ? "#FFFBEB" : T.s2
    } }, /* @__PURE__ */ React.createElement("div", null, fmtDateShort(d)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: T.mu, fontWeight: 400 } }, getDow(d)))), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 4px", fontSize: 10, color: T.mu, fontWeight: 700, borderBottom: `1px solid ${T.bd}`, textAlign: "center", minWidth: 44 } }, "\uCD9C\uC11D", /* @__PURE__ */ React.createElement("br", null), "\uC77C\uC218"))), /* @__PURE__ */ React.createElement("tbody", null, pageStudents.map((s, idx) => {
      const presentDays = allDates.filter((d) => !isAttendanceDateLocked(s, d) && attData[`${s.id}_${d}`]?.status === "O").length;
      const absentDays = allDates.filter((d) => !(d > today) && !isAttendanceDateLocked(s, d) && attData[`${s.id}_${d}`]?.status === "A").length;
      const statusMeta = getAttendanceStatusMeta(s);
      const totalHoursForStudent = getAttendanceSheetTotalHours(sheetCourse, s);
      const rowBg = absentDays >= 3 ? "#FFF8F8" : void 0;
      return /* @__PURE__ */ React.createElement("tr", { key: s.id, className: "row-hover", style: { borderBottom: `1px solid ${T.bd}`, background: rowBg } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 4px", fontSize: 11, color: T.mu, textAlign: "center", position: "sticky", left: 0, background: rowBg || T.s, zIndex: 1 } }, idx + 1), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 6px", fontSize: 12, fontWeight: 700, color: T.tx, whiteSpace: "nowrap", position: "sticky", left: 36, background: rowBg || T.s, zIndex: 1 } }, s.name, statusMeta && /* @__PURE__ */ React.createElement("span", { style: {
        marginLeft: 6,
        fontSize: 9,
        padding: "1px 5px",
        borderRadius: 4,
        background: statusMeta.colors.bg,
        color: statusMeta.colors.color,
        fontWeight: 700
      } }, statusMeta.label), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 3, fontSize: 9, color: T.mu, fontWeight: 500, whiteSpace: "nowrap" } }, "\uB204\uC801 ", formatHourText(s.accumulatedHours || 0), "h / ", formatHourText(totalHoursForStudent), "h \xB7 ", isDropoutStudent(s) ? "\uC911\uB3C4\uD0C8\uB77D" : `${formatHourText(s.rate || 0)}%`), absentDays >= 3 && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 4, fontSize: 9, padding: "1px 4px", borderRadius: 4, background: "#FEF3C7", color: "#92400E", fontWeight: 600 } }, "\uACB0\uC11D ", absentDays, "\uC77C")), visibleDates.map((d) => {
        const key = `${s.id}_${d}`;
        const rec = attData[key] || {};
        const status = rec.status;
        const isFuture = d > today;
        const isLocked = isAttendanceDateLocked(s, d);
        let display = "";
        let color = T.mu;
        let timeText = "";
        if (!isFuture) {
          if (!isLocked) {
            if (status === "O") {
              display = "O";
              color = T.ok;
            } else if (status === "A") {
              display = "\u2715";
              color = T.danger;
            } else if (status === "L") {
              display = "\u25B3";
              color = "#D97706";
            } else if (!status) {
              display = "?";
              color = T.bd;
            }
            const inTxt = rec.checkIn ? String(rec.checkIn).slice(0, 5) : "";
            const outTxt = rec.checkOut ? String(rec.checkOut).slice(0, 5) : "";
            if (inTxt || outTxt) timeText = `${inTxt || "\u2014"}~${outTxt || "\u2014"}`;
          }
        }
        const isException = display === "\u2715" || display === "\u25B3";
        const cellBg = d === today ? "#FFFBEB" : isFuture ? T.s2 : isLocked ? "#F8FAFC" : display === "\u2715" ? "#FFF0F0" : display === "\u25B3" ? "#FFFBEB" : "transparent";
        return /* @__PURE__ */ React.createElement(
          "td",
          {
            key: d,
            title: timeText || void 0,
            style: {
              padding: "4px 2px",
              textAlign: "center",
              fontSize: isException ? 13 : 11,
              fontWeight: isException ? 800 : display === "O" ? 500 : 400,
              color,
              background: cellBg,
              borderBottom: `1px solid ${T.bd}`
            }
          },
          display,
          showTimes && timeText && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, lineHeight: 1.2, fontWeight: 500, color: T.mu, whiteSpace: "nowrap" } }, timeText)
        );
      }), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 4px", textAlign: "center", fontSize: 13, fontWeight: 800, color: T.p, background: T.s2 } }, presentDays));
    }))))));
  };
  const CompletionMgmt = ({ students, courses }) => {
    const [course, setCourse] = useState(courses[3] || courses[0]);
    const [threshold, setThr] = useState(80);
    const [overrides, setOvr] = useState({});
    const [confirming, setConfirming] = useState(false);
    useEffect(() => {
      if (!courses.length) return;
      setCourse((prev) => {
        if (!prev) return courses[0];
        const updated = courses.find((c) => c.id === prev.id);
        return updated || courses[0];
      });
    }, [courses]);
    if (!course) return null;
    const list = students.filter((s) => {
      if (s.cid !== course.id) return false;
      if (s.enrollmentStatus === "\uC911\uB3C4\uD0C8\uB77D") return false;
      if (s.enrollmentStatus === "\uC218\uB8CC" || s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC") return false;
      return true;
    });
    const get = (s) => {
      if (s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" && s.rate >= threshold) return "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC";
      if (overrides[s.id] !== void 0) return overrides[s.id];
      return s.rate >= threshold ? "\uC218\uB8CC" : "\uBBF8\uC218\uB8CC";
    };
    const completed = list.filter((s) => get(s) === "\uC218\uB8CC" || get(s) === "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC").length;
    const rate = list.length ? Math.round(completed / list.length * 100) : 0;
    const getStudentTotalHours = (s) => {
      if (s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" && s.statusChangeDate) {
        return getProportionalCourseHours(course, s.statusChangeDate);
      }
      return getTotalCourseHours(course);
    };
    const courseTotalHours = getTotalCourseHours(course);
    const atOrAbove = list.filter((s) => s.rate >= threshold).length;
    const nearMiss = list.filter((s) => s.rate >= threshold - 10 && s.rate < threshold).length;
    const atRisk = list.filter((s) => s.rate < threshold - 10).length;
    const earlyEmp = list.filter((s) => s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5").length;
    const isComplete = (s) => get(s) === "\uC218\uB8CC" || get(s) === "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC";
    const handleConfirm = async () => {
      const completeCount = list.filter(isComplete).length;
      const incompleteCount = list.length - completeCount;
      if (!window.confirm(`\uD604\uC7AC \uD310\uC815 \uACB0\uACFC\uB97C DB\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4.
\uC218\uB8CC: ${completeCount}\uBA85 / \uBBF8\uC218\uB8CC: ${incompleteCount}\uBA85

\uACC4\uC18D \uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;
      setConfirming(true);
      try {
        await Promise.all(list.map((s) => {
          const final = get(s);
          const newStatus = isComplete(s) ? final : "\uBBF8\uC218\uB8CC";
          return sbUpdate("students", `id=eq.${s.id}`, { enrollment_status: newStatus });
        }));
        if (window._setStudents) {
          const statusMap = {};
          list.forEach((s) => {
            statusMap[s.id] = isComplete(s) ? get(s) : "\uBBF8\uC218\uB8CC";
          });
          window._setStudents((prev) => prev.map((s) => {
            if (!(s.id in statusMap)) return s;
            return { ...s, enrollmentStatus: statusMap[s.id] };
          }));
        }
        alert("\uC218\uB8CC \uD655\uC815\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. DB\uC5D0 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      } catch (e) {
        alert("\uC800\uC7A5 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: " + (e?.message || e));
      } finally {
        setConfirming(false);
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement(SectionHead, { title: "\uC218\uB8CC \uAD00\uB9AC", sub: "\uCD9C\uC11D\uB960 \uAE30\uC900 \uC790\uB3D9 \uD310\uC815 \xB7 \uB2F4\uB2F9\uC790 \uC218\uB3D9 \uC870\uC815 \uAC00\uB2A5" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" } }, courses.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, onClick: () => setCourse(c), style: {
      padding: "6px 13px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: "nowrap",
      background: course.id === c.id ? c.cc : T.s3,
      color: course.id === c.id ? "#fff" : T.mu
    } }, shortCourseName(c.name)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, marginBottom: 18 } }, /* @__PURE__ */ React.createElement(Card, { style: { padding: "16px 20px", display: "flex", gap: 20, alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginBottom: 6, fontWeight: 600 } }, "\uC218\uB8CC \uAE30\uC900 \uCD9C\uC11D\uB960"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "range",
        min: 60,
        max: 95,
        step: 5,
        value: threshold,
        onChange: (e) => setThr(+e.target.value),
        style: { flex: 1, accentColor: T.p }
      }
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 26, fontWeight: 900, color: T.p, minWidth: 52 } }, threshold, "%")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, "\u203B \uB9E4\uB274\uC5BC \uAE30\uC900: \uCD1D \uAD50\uC721\uC2DC\uAC04\uC758 80% \uC774\uC0C1")), /* @__PURE__ */ React.createElement(Btn, { onClick: () => {
      const j = {};
      list.forEach((s) => {
        if (s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" && s.rate >= threshold) j[s.id] = "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC";
        else j[s.id] = s.rate >= threshold ? "\uC218\uB8CC" : "\uBBF8\uC218\uB8CC";
      });
      setOvr(j);
    } }, "\uC790\uB3D9 \uD310\uC815"), /* @__PURE__ */ React.createElement(Btn, { onClick: handleConfirm, disabled: confirming, style: {
      background: confirming ? T.s3 : "#16A34A",
      color: confirming ? T.mu : "#fff",
      marginLeft: 4
    } }, confirming ? "\uC800\uC7A5 \uC911\u2026" : "\u2705 \uC218\uB8CC \uD655\uC815")), /* @__PURE__ */ React.createElement(Card, { style: { padding: "16px 22px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, "\uC218\uB8CC\uC728"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, fontWeight: 900, color: rate >= 90 ? T.p : T.danger, lineHeight: 1.1 } }, rate, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, completed, "/", list.length, "\uBA85"), /* @__PURE__ */ React.createElement(Chip, { label: rate >= 90 ? "\uBAA9\uD45C\uB2EC\uC131" : "\uBAA9\uD45C\uBBF8\uB2EC", bg: rate >= 90 ? T.pbg : "#FEF2F2", color: rate >= 90 ? T.p : T.danger, size: 10 })), /* @__PURE__ */ React.createElement(Card, { style: { padding: "16px 22px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, "\uACFC\uC815 \uBAA9\uD45C"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: T.tx, marginTop: 4 } }, course.cGoal, "\uBA85 \uC218\uB8CC"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginTop: 2 } }, course.eGoal, "\uBA85 \uCDE8\uC5C5 \uBAA9\uD45C"))), /* @__PURE__ */ React.createElement(Card, { style: { padding: "12px 18px", marginBottom: 14, background: "#F8FAFF", border: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, fontWeight: 700, marginBottom: 8 } }, "\u{1F4CA} \uD310\uC815 \uADFC\uAC70 \uC694\uC57D \u2014 ", course.name, " \xB7 \uCD1D ", courseTotalHours, "\uC2DC\uAC04 \xB7 \uAE30\uC900 ", threshold, "%"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: T.ok } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: T.ok } }, atOrAbove, "\uBA85"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, "\uAE30\uC900 \uC774\uC0C1")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#D97706" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#D97706" } }, nearMiss, "\uBA85"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, "\uACBD\uACC4(", threshold - 10, "~", threshold, "% \uBBF8\uB9CC)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: T.danger } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: T.danger } }, atRisk, "\uBA85"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, threshold - 10, "% \uBBF8\uB9CC")), earlyEmp > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#7E22CE" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#7E22CE" } }, earlyEmp, "\uBA85"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, "\uC870\uAE30\uCDE8\uC5C5(\uBE44\uB840 \uAE30\uC900)")))), /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2 } }, ["\uC774\uB984", "\uB204\uC801\uC2DC\uAC04", "\uCD9C\uC11D\uB960", "\uC790\uB3D9\uD310\uC815", "\uCD5C\uC885\uACB0\uACFC", "\uBE44\uACE0"].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "10px 16px",
      textAlign: h === "\uC774\uB984" ? "left" : "center",
      fontSize: 11,
      color: T.mu,
      fontWeight: 700,
      borderBottom: `1px solid ${T.bd}`
    } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, list.map((s) => {
      const autoBase = s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" && s.rate >= threshold ? "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC" : s.rate >= threshold ? "\uC218\uB8CC" : "\uBBF8\uC218\uB8CC";
      const final = get(s);
      const changed = overrides[s.id] !== void 0 && overrides[s.id] !== autoBase;
      const sTotal = getStudentTotalHours(s);
      const isEarlyEmp = s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" && !!s.statusChangeDate;
      return /* @__PURE__ */ React.createElement("tr", { key: s.id, className: "row-hover", style: { borderBottom: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", fontSize: 13, fontWeight: 700, color: T.tx } }, s.name, s.enrollmentStatus && s.enrollmentStatus !== "\uC7AC\uD559\uC911" && /* @__PURE__ */ React.createElement(
        Chip,
        {
          label: s.enrollmentStatus,
          bg: STATUS_COLORS[s.enrollmentStatus]?.bg || T.s3,
          color: STATUS_COLORS[s.enrollmentStatus]?.color || T.mu,
          size: 10,
          style: { marginLeft: 6 }
        }
      )), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: rateColor(s.rate) } }, (s.accumulatedHours || 0).toFixed(1), "h"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginTop: 1 } }, "/ ", sTotal.toFixed(1), "h", isEarlyEmp && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 3, color: "#7E22CE" } }, "\uBE44\uB840"))), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: rateColor(s.rate) } }, s.rate, "%"), /* @__PURE__ */ React.createElement(RBar, { r: s.rate, h: 3 })), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", textAlign: "center" } }, (() => {
        const isAutoComplete = autoBase === "\uC218\uB8CC" || autoBase === "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC";
        return /* @__PURE__ */ React.createElement(Chip, { label: autoBase, bg: isAutoComplete ? T.pbg : "#FEF2F2", color: isAutoComplete ? T.p : T.danger });
      })()), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, justifyContent: "center" } }, ["\uC218\uB8CC", "\uBBF8\uC218\uB8CC"].map((v) => /* @__PURE__ */ React.createElement("button", { key: v, onClick: () => setOvr((p) => ({ ...p, [s.id]: v })), style: {
        padding: "5px 14px",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
        transition: "all .15s",
        background: final === v ? v === "\uC218\uB8CC" ? T.p : T.danger : "#F1F5F9",
        color: final === v ? "#fff" : T.mu
      } }, v))), final === "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC" && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 4 } }, /* @__PURE__ */ React.createElement(Chip, { label: "\uC870\uAE30\uCDE8\uC5C5 \uC218\uB8CC", bg: "#F3E8FF", color: "#7E22CE", size: 10 }))), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", textAlign: "center", fontSize: 11 } }, changed && /* @__PURE__ */ React.createElement(Chip, { label: "\uC218\uB3D9\uC870\uC815", bg: "#FFFBEB", color: T.warn }), s.rate < 60 && /* @__PURE__ */ React.createElement(Chip, { label: "1\uB144 \uC81C\uD55C \uAC80\uD1A0", bg: "#FEF2F2", color: T.danger, size: 10 })));
    })))));
  };
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 200;
  const ZOOM_STEP = 10;
  const MM_TO_PX = 3.78;
  const clampZoom = (value) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(value)));
  const DOC_TYPE_NAMES = {
    certificate: "\uC218\uB8CC\uC99D",
    attendCert83: "\uC218\uAC15\uC99D\uBA85\uC11C_\uBCC4\uC9C083\uD638",
    attendCertSelf: "\uC218\uAC15\uC99D\uBA85\uC11C_\uC790\uCCB4",
    attendanceSheet: "\uCD9C\uC11D\uBD80",
    trainingLog: "\uD6C8\uB828\uC77C\uC9C0",
    attendConfirm: "\uCD9C\uACB0\uD655\uC778\uC11C",
    gradeCert: "\uC131\uC801\uC99D\uBA85\uC11C"
  };
  const generatePrintFilename = (docType, courseName, date, extension) => {
    const typeName = DOC_TYPE_NAMES[docType] || docType;
    const safeCourse = (courseName || "").replace(/[/\\?%*:|"<>]/g, "_");
    const safeDate = date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    return `${typeName}_${safeCourse}_${safeDate}.${extension}`;
  };
  const generatePDF = async (element, options = {}) => {
    const { orientation = "portrait", filename = "document.pdf" } = options;
    const A4 = orientation === "portrait" ? { width: 210, height: 297 } : { width: 297, height: 210 };
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
    pdf.addImage(imgData, "JPEG", 0, 0, A4.width, A4.height);
    pdf.save(filename);
    return pdf;
  };
  const DEFAULT_DAILY_HOURS = 4;
  const DEFAULT_BREAK_MINUTES = 60;
  const sameId = (a, b) => Number(a) === Number(b);
  const normalizeDateStr = (v) => v ? String(v).slice(0, 10) : "";
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return null;
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  };
  const normalizeBreakMinutes = (breakMinutes) => {
    const n = Number(breakMinutes);
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_BREAK_MINUTES;
  };
  const getCourseBreakMinutes = (course) => {
    return normalizeBreakMinutes(course?.breakMinutes ?? course?.break_minutes);
  };
  const shouldIncludeBreakInHours = (course) => {
    const raw = course?.includeBreakInHours ?? course?.include_break_in_hours;
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase();
      if (normalized === "false" || normalized === "0" || normalized === "n") return false;
      if (normalized === "true" || normalized === "1" || normalized === "y") return true;
    }
    if (typeof raw === "number") return raw !== 0;
    return false;
  };
  const getCourseScheduleMinutes = (course) => {
    const schedStart = parseTimeToMinutes(course?.schedTimeFrom);
    const schedEnd = parseTimeToMinutes(course?.schedTimeTo);
    if (schedStart === null || schedEnd === null || schedEnd <= schedStart) return null;
    return { schedStart, schedEnd };
  };
  const getOverrideScheduleMinutes = (override, fallbackScheduleMinutes = null) => {
    if (!override || override.type === "cancelled") return fallbackScheduleMinutes;
    const schedStart = parseTimeToMinutes(override.timeFrom);
    const schedEnd = parseTimeToMinutes(override.timeTo);
    if (schedStart === null || schedEnd === null || schedEnd <= schedStart) return fallbackScheduleMinutes;
    return { schedStart, schedEnd };
  };
  const getHoursFromScheduleRange = (fromMin, toMin, breakMinutesValue = DEFAULT_BREAK_MINUTES, includeBreakInHours = true) => {
    if (fromMin === null || toMin === null || toMin <= fromMin) return 0;
    const spanMinutes = toMin - fromMin;
    const appliedBreak = includeBreakInHours ? 0 : Math.min(normalizeBreakMinutes(breakMinutesValue), spanMinutes);
    return Math.round(Math.max(0, spanMinutes - appliedBreak) / 60 * 100) / 100;
  };
  const getScheduledDailyHours = (course, includeBreakInHours = true) => {
    return getHoursFromScheduleRange(
      parseTimeToMinutes(course?.schedTimeFrom),
      parseTimeToMinutes(course?.schedTimeTo),
      getCourseBreakMinutes(course),
      includeBreakInHours
    );
  };
  const getOverrideHours = (override, course = null, fallbackDailyHours = DEFAULT_DAILY_HOURS) => {
    if (!override) return fallbackDailyHours;
    if (override.type === "cancelled") return 0;
    const fromMin = parseTimeToMinutes(override.timeFrom);
    const toMin = parseTimeToMinutes(override.timeTo);
    if (fromMin !== null && toMin !== null && toMin > fromMin) {
      return getHoursFromScheduleRange(
        fromMin,
        toMin,
        getCourseBreakMinutes(course),
        shouldIncludeBreakInHours(course)
      );
    }
    const h = Number(override.hours);
    return Number.isFinite(h) && h > 0 ? h : fallbackDailyHours;
  };
  const normalizeManualHours = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const applyManualHoursAdjustment = (baseHours, record = {}) => {
    const add = normalizeManualHours(record.manual_add_hours ?? record.manualAddHours);
    const deduct = normalizeManualHours(record.manual_deduct_hours ?? record.manualDeductHours);
    return Math.round(Math.max(0, baseHours + add - deduct) * 100) / 100;
  };
  const calculateDailyHours = (record, breakMinutes = DEFAULT_BREAK_MINUTES, scheduleMinutes = null, includeBreakInHours = true) => {
    if (record.status === "A") return applyManualHoursAdjustment(0, record);
    let checkInMin = parseTimeToMinutes(record.check_in);
    let checkOutMin = parseTimeToMinutes(record.check_out);
    if ((record.status === "O" || record.status === "L") && scheduleMinutes) {
      if (checkInMin === null) checkInMin = scheduleMinutes.schedStart;
      if (checkOutMin === null) checkOutMin = scheduleMinutes.schedEnd;
    }
    if (checkInMin === null || checkOutMin === null) {
      return applyManualHoursAdjustment(0, record);
    }
    if (checkOutMin <= checkInMin) {
      return applyManualHoursAdjustment(0, record);
    }
    if (scheduleMinutes) {
      const { schedStart, schedEnd } = scheduleMinutes;
      checkInMin = Math.max(checkInMin, schedStart);
      checkOutMin = Math.min(checkOutMin, schedEnd);
      if (checkOutMin <= checkInMin) {
        return applyManualHoursAdjustment(0, record);
      }
    }
    const stayMinutes = checkOutMin - checkInMin;
    const safeBreak = normalizeBreakMinutes(breakMinutes);
    const appliedBreak = includeBreakInHours ? 0 : Math.min(safeBreak, stayMinutes);
    const diffMinutes = Math.max(0, stayMinutes - appliedBreak);
    const autoHours = Math.round(diffMinutes / 60 * 100) / 100;
    return applyManualHoursAdjustment(autoHours, record);
  };
  const calculateAccumulatedHours = (attendanceRecords, cutoffDate = null, breakMinutes = DEFAULT_BREAK_MINUTES, scheduleMinutes = null, includeBreakInHours = true, overridesByDate = null) => {
    const invalidRecords = [];
    const details = [];
    let totalHours = 0;
    for (const record of attendanceRecords) {
      const recordDate = normalizeDateStr(record.date);
      if (cutoffDate && recordDate > normalizeDateStr(cutoffDate)) {
        details.push({ ...record, date: recordDate, hours: 0, calcReason: "\uAE30\uC900\uC77C \uC774\uD6C4 \uC81C\uC678" });
        continue;
      }
      const override = overridesByDate ? overridesByDate.get(recordDate) : null;
      if (override?.type === "cancelled") {
        details.push({ ...record, date: recordDate, hours: 0, calcReason: "\uD734\uAC15\uC77C \uC81C\uC678" });
        continue;
      }
      const effectiveScheduleMinutes = getOverrideScheduleMinutes(override, scheduleMinutes);
      const dailyHours = calculateDailyHours(record, breakMinutes, effectiveScheduleMinutes, includeBreakInHours);
      if (dailyHours === 0 && record.status !== "A") {
        if (!record.check_in || !record.check_out) {
          invalidRecords.push({ ...record, reason: "incomplete" });
        } else if (parseTimeToMinutes(record.check_out) <= parseTimeToMinutes(record.check_in)) {
          invalidRecords.push({ ...record, reason: "invalid_time" });
        }
      }
      details.push({
        ...record,
        date: recordDate,
        hours: dailyHours,
        calcReason: override ? `${override.type === "extended" ? "\uBCF4\uAC15" : "\uB2E8\uCD95"} \uBC18\uC601` : "\uAE30\uBCF8 \uC2DC\uAC04\uD45C",
        schedule: effectiveScheduleMinutes
      });
      totalHours += dailyHours;
    }
    return { accumulatedHours: Math.round(totalHours * 100) / 100, invalidRecords, details };
  };
  const getCourseOverrideMap = (course) => {
    const ovs = (window._overridesRef?.current || []).filter((o) => sameId(o.courseId, course?.id));
    return new Map(ovs.map((o) => [normalizeDateStr(o.date), o]));
  };
  const getTotalCourseHours = (course, cutoffDate = null, overrideMapArg = null) => {
    if (!course) return 0;
    const includeBreakInHours = shouldIncludeBreakInHours(course);
    const allDates = buildCourseDatesAll(course);
    const scheduledDaily = getScheduledDailyHours(course, includeBreakInHours);
    const defaultDaily = scheduledDaily > 0 ? scheduledDaily : DEFAULT_DAILY_HOURS;
    const overrideMap = overrideMapArg || getCourseOverrideMap(course);
    if (overrideMap.size === 0 && Number(course.hours) > 0) {
      if (!cutoffDate) return Number(course.hours);
      const totalDays = allDates.length;
      if (totalDays === 0) return 0;
      const activeDays = allDates.filter((d) => normalizeDateStr(d) <= normalizeDateStr(cutoffDate)).length;
      return Math.round(Number(course.hours) * activeDays / totalDays * 100) / 100;
    }
    let total = 0;
    for (const date of allDates) {
      if (cutoffDate && normalizeDateStr(date) > normalizeDateStr(cutoffDate)) continue;
      const ov = overrideMap.get(normalizeDateStr(date));
      total += getOverrideHours(ov, course, defaultDaily);
    }
    return Math.round(total * 100) / 100;
  };
  const getProportionalCourseHours = (course, cutoffDate, overrideMapArg = null) => {
    return getTotalCourseHours(course, cutoffDate, overrideMapArg);
  };
  const calculateHoursBasedRate = (accumulatedHours, totalCourseHours) => {
    if (!totalCourseHours || totalCourseHours <= 0) return 0;
    const rate = accumulatedHours / totalCourseHours * 100;
    const rounded = Math.round(rate * 10) / 10;
    return Math.min(rounded, 100);
  };
  const recalculateHoursAndRate = async (studentId, courseId) => {
    try {
      const student = window._studentsRef?.current?.find((s) => sameId(s.id, studentId));
      const course = window._coursesRef?.current?.find((c) => sameId(c.id, courseId));
      if (!student || !course) return;
      const { data: attRecords, error } = await sbGet(
        "attendance",
        `select=*&student_id=eq.${studentId}&course_id=eq.${courseId}`
      );
      if (error) throw error;
      const cutoffDate = student.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" || student.enrollmentStatus === "\uC911\uB3C4\uD0C8\uB77D" ? student.statusChangeDate : null;
      const breakMinutes = getCourseBreakMinutes(course);
      const includeBreakInHours = shouldIncludeBreakInHours(course);
      const defaultScheduleMinutes = getCourseScheduleMinutes(course);
      const overridesByDate = getCourseOverrideMap(course);
      const { accumulatedHours } = calculateAccumulatedHours(
        attRecords || [],
        cutoffDate,
        breakMinutes,
        defaultScheduleMinutes,
        includeBreakInHours,
        overridesByDate
      );
      const totalHours = cutoffDate ? getProportionalCourseHours(course, cutoffDate) : getTotalCourseHours(course);
      const rate = calculateHoursBasedRate(accumulatedHours, totalHours);
      await sbUpdate("students", `id=eq.${studentId}`, {
        accumulated_hours: accumulatedHours,
        rate
      });
      if (window._setStudents) {
        window._setStudents((prev) => prev.map(
          (s) => sameId(s.id, studentId) ? { ...s, accumulatedHours, rate } : s
        ));
      }
      console.log(`\u2705 \uC2DC\uAC04 \uC7AC\uACC4\uC0B0: ${student.name} \u2014 ${accumulatedHours.toFixed(1)}h / ${totalHours}h = ${rate}%`);
    } catch (err) {
      console.error("\uC2DC\uAC04 \uC7AC\uACC4\uC0B0 \uC624\uB958:", err);
    }
  };
  const showAttendanceHourBasis = async (student, course) => {
    try {
      if (!student || !course) return;
      const { data: attRecords, error } = await sbGet(
        "attendance",
        `select=*&student_id=eq.${Number(student.id)}&course_id=eq.${Number(course.id)}&order=date.asc`
      );
      if (error) throw error;
      const cutoffDate = student.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" || student.enrollmentStatus === "\uC911\uB3C4\uD0C8\uB77D" ? student.statusChangeDate : null;
      const breakMinutes = getCourseBreakMinutes(course);
      const includeBreakInHours = shouldIncludeBreakInHours(course);
      const defaultScheduleMinutes = getCourseScheduleMinutes(course);
      const overridesByDate = getCourseOverrideMap(course);
      const { accumulatedHours, invalidRecords, details } = calculateAccumulatedHours(
        attRecords || [],
        cutoffDate,
        breakMinutes,
        defaultScheduleMinutes,
        includeBreakInHours,
        overridesByDate
      );
      const totalHours = cutoffDate ? getProportionalCourseHours(course, cutoffDate) : getTotalCourseHours(course);
      const rate = calculateHoursBasedRate(accumulatedHours, totalHours);
      const detailLines = (details || []).map((d) => {
        const inOut = `${d.check_in || "--:--"}~${d.check_out || "--:--"}`;
        const status = d.status || "U";
        return `${d.date} | ${status} | ${inOut} | ${Number(d.hours || 0).toFixed(2)}h | ${d.calcReason}`;
      });
      const invalidLines = (invalidRecords || []).map(
        (r) => `${normalizeDateStr(r.date)}: ${r.reason === "invalid_time" ? "\uD1F4\uC2E4\uC2DC\uAC04\uC774 \uC785\uC2E4\uC2DC\uAC04\uBCF4\uB2E4 \uBE60\uB984" : "\uC785/\uD1F4\uC2E4 \uBBF8\uC644\uB8CC"}`
      );
      alert([
        `[\uB204\uC801\uC2DC\uAC04 \uC0B0\uCD9C \uADFC\uAC70] ${student.name}`,
        `\uACFC\uC815: ${course.name}`,
        `\uD734\uAC8C\uC2DC\uAC04: ${includeBreakInHours ? "\uAD50\uC721\uC2DC\uAC04 \uD3EC\uD568" : `${breakMinutes}\uBD84 \uC790\uB3D9 \uCC28\uAC10`}`,
        cutoffDate ? `\uAE30\uC900\uC77C: ${cutoffDate} \uC774\uD6C4 \uC81C\uC678 (${student.enrollmentStatus})` : null,
        `\uC778\uC815 \uB204\uC801: ${accumulatedHours.toFixed(2)}h / \uCD1D ${Number(totalHours || 0).toFixed(2)}h = ${rate}%`,
        "",
        detailLines.length ? detailLines.join("\n") : "\uCD9C\uACB0 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
        invalidLines.length ? `
[\uD655\uC778 \uD544\uC694]
${invalidLines.join("\n")}` : null
      ].filter(Boolean).join("\n"));
    } catch (err) {
      alert("\uC0B0\uCD9C \uADFC\uAC70\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: " + fmtSaveError(err));
    }
  };
  const batchRecalculateAllHours = async (students, courses, overridesArg = null) => {
    if (!students || students.length === 0) return 0;
    if (!courses || courses.length === 0) return 0;
    const allOverrides = overridesArg || window._overridesRef?.current || [];
    const overridesByCourse = /* @__PURE__ */ new Map();
    for (const ov of allOverrides) {
      const cid = Number(ov.courseId);
      if (!overridesByCourse.has(cid)) overridesByCourse.set(cid, /* @__PURE__ */ new Map());
      overridesByCourse.get(cid).set(normalizeDateStr(ov.date), ov);
    }
    const attendanceByCourse = /* @__PURE__ */ new Map();
    for (const course of courses) {
      const courseStudents = students.filter((s) => sameId(s.cid, course.id));
      if (courseStudents.length === 0) continue;
      const studentIds = courseStudents.map((s) => Number(s.id)).filter(Boolean);
      const studentFilter = studentIds.length ? `&student_id=in.(${studentIds.join(",")})` : "";
      const { data, error } = await sbGet(
        "attendance",
        `select=id,course_id,student_id,date,status,check_in,check_out&course_id=eq.${Number(course.id)}${studentFilter}&order=date.asc&limit=10000`
      );
      if (error) {
        console.error("\uC77C\uAD04 \uC7AC\uACC4\uC0B0 \u2014 \uCD9C\uACB0 \uC870\uD68C \uC2E4\uD328:", course.name, error);
        continue;
      }
      attendanceByCourse.set(Number(course.id), data || []);
    }
    const updates = [];
    for (const student of students) {
      const course = courses.find((c) => sameId(c.id, student.cid));
      if (!course) continue;
      const courseAttendance = attendanceByCourse.get(Number(course.id)) || [];
      if (courseAttendance.length === 0) continue;
      const records = courseAttendance.filter((a) => sameId(a.student_id, student.id));
      const cutoffDate = student.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5" || student.enrollmentStatus === "\uC911\uB3C4\uD0C8\uB77D" ? student.statusChangeDate : null;
      const breakMinutes = getCourseBreakMinutes(course);
      const includeBreakInHours = shouldIncludeBreakInHours(course);
      const defaultScheduleMinutes = getCourseScheduleMinutes(course);
      const overridesByDate = overridesByCourse.get(Number(course.id)) || null;
      const { accumulatedHours } = calculateAccumulatedHours(
        records,
        cutoffDate,
        breakMinutes,
        defaultScheduleMinutes,
        includeBreakInHours,
        overridesByDate
      );
      const totalHours = cutoffDate ? getProportionalCourseHours(course, cutoffDate, overridesByDate) : getTotalCourseHours(course, null, overridesByDate);
      const rate = calculateHoursBasedRate(accumulatedHours, totalHours);
      if (Math.abs((student.accumulatedHours || 0) - accumulatedHours) > 0.01 || Math.abs((student.rate || 0) - rate) > 0.1) {
        updates.push({ id: student.id, accumulated_hours: accumulatedHours, rate });
      }
    }
    for (let i = 0; i < updates.length; i += 5) {
      const chunk = updates.slice(i, i + 5);
      await Promise.all(
        chunk.map((u) => sbUpdate("students", `id=eq.${u.id}`, {
          accumulated_hours: u.accumulated_hours,
          rate: u.rate
        }).catch((e) => console.warn("\uC77C\uAD04 \uC7AC\uACC4\uC0B0 \uC5C5\uB370\uC774\uD2B8 \uC2E4\uD328:", e)))
      );
    }
    if (updates.length > 0 && window._setStudents) {
      window._setStudents((prev) => prev.map((s) => {
        const u = updates.find((x) => sameId(x.id, s.id));
        return u ? { ...s, accumulatedHours: u.accumulated_hours, rate: u.rate } : s;
      }));
    }
    console.log(`[\uB204\uC801\uC2DC\uAC04 \uC77C\uAD04 \uC7AC\uACC4\uC0B0] ${updates.length}\uBA85 \uC5C5\uB370\uC774\uD2B8 \uC644\uB8CC`);
    return updates.length;
  };
  const ENROLLMENT_STATUSES = ["\uC7AC\uD559\uC911", "\uC218\uB8CC", "\uC870\uAE30\uCDE8\uC5C5", "\uC911\uB3C4\uD0C8\uB77D", "\uC218\uB8CC\uC608\uC815"];
  const DROPOUT_REASONS = ["\uAC1C\uC778\uC0AC\uC720", "\uCDE8\uC5C5", "\uAC74\uAC15", "\uAE30\uD0C0"];
  const VALID_TRANSITIONS = {
    "\uC7AC\uD559\uC911": ["\uC218\uB8CC\uC608\uC815", "\uC870\uAE30\uCDE8\uC5C5", "\uC911\uB3C4\uD0C8\uB77D"],
    "\uC218\uB8CC\uC608\uC815": ["\uC218\uB8CC", "\uC870\uAE30\uCDE8\uC5C5", "\uC911\uB3C4\uD0C8\uB77D"],
    "\uC218\uB8CC": [],
    "\uC870\uAE30\uCDE8\uC5C5": [],
    "\uC911\uB3C4\uD0C8\uB77D": []
  };
  const STATUS_COLORS = {
    "\uC7AC\uD559\uC911": { bg: "#DBEAFE", color: "#1D4ED8" },
    "\uC218\uB8CC": { bg: "#DCFCE7", color: "#15803D" },
    "\uC870\uAE30\uCDE8\uC5C5": { bg: "#F3E8FF", color: "#7E22CE" },
    "\uC911\uB3C4\uD0C8\uB77D": { bg: "#FEE2E2", color: "#DC2626" },
    "\uC218\uB8CC\uC608\uC815": { bg: "#FFF7ED", color: "#C2410C" }
  };
  const EMPLOYMENT_STATUSES = ["\uBBF8\uCDE8\uC5C5", "\uCDE8\uC5C5", "\uCDE8\uC5C5\uC608\uC815", "\uCC3D\uC5C5", "\uC9C4\uD559", "\uAE30\uD0C0"];
  const EMPLOYMENT_COLORS = {
    "\uCDE8\uC5C5": { bg: "#DCFCE7", color: "#15803D" },
    "\uCDE8\uC5C5\uC608\uC815": { bg: "#E0F2FE", color: "#0369A1" },
    "\uCC3D\uC5C5": { bg: "#F3E8FF", color: "#7E22CE" },
    "\uC9C4\uD559": { bg: "#FEF3C7", color: "#B45309" },
    "\uBBF8\uCDE8\uC5C5": { bg: "#F1F5F9", color: "#64748B" },
    "\uAE30\uD0C0": { bg: "#E5E7EB", color: "#374151" }
  };
  const employmentChipStyle = (status) => EMPLOYMENT_COLORS[status || "\uBBF8\uCDE8\uC5C5"] || EMPLOYMENT_COLORS["\uAE30\uD0C0"];
  const getEffectiveEmploymentStatus = (s) => {
    if (!s) return "\uBBF8\uCDE8\uC5C5";
    if ((s.enrollmentStatus || "") === "\uC870\uAE30\uCDE8\uC5C5" && (!s.status || s.status === "\uBBF8\uCDE8\uC5C5")) return "\uCDE8\uC5C5";
    return s.status || "\uBBF8\uCDE8\uC5C5";
  };
  const isValidTransition = (fromStatus, toStatus) => {
    const allowed = VALID_TRANSITIONS[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  };
  const changeEnrollmentStatus = async (params) => {
    const { studentId, courseId, newStatus, changeDate, dropoutReason, reasonDetail, employerName, changedBy } = params;
    const student = window._studentsRef?.current?.find((s) => sameId(s.id, studentId));
    if (!student) throw new Error("\uD559\uC0DD\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    const prevStatus = student.enrollmentStatus || "\uC7AC\uD559\uC911";
    if (!isValidTransition(prevStatus, newStatus))
      throw new Error(`${prevStatus}\uC5D0\uC11C ${newStatus}\uB85C \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`);
    if (!changeDate) throw new Error("\uBCC0\uACBD\uC77C\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");
    if (newStatus === "\uC911\uB3C4\uD0C8\uB77D" && !dropoutReason) throw new Error("\uC911\uB3C4\uD0C8\uB77D \uC0AC\uC720\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.");
    if (newStatus === "\uC911\uB3C4\uD0C8\uB77D" && dropoutReason === "\uAE30\uD0C0" && !reasonDetail) throw new Error("\uAE30\uD0C0 \uC0AC\uC720 \uC0C1\uC138 \uB0B4\uC6A9\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");
    let warning = null;
    if ((newStatus === "\uC218\uB8CC" || newStatus === "\uC218\uB8CC\uC608\uC815") && student.rate < 80) {
      warning = `\uCD9C\uC11D\uB960\uC774 ${student.rate}%\uB85C 80% \uBBF8\uB9CC\uC785\uB2C8\uB2E4. \uACC4\uC18D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`;
    }
    const finalReason = newStatus === "\uC911\uB3C4\uD0C8\uB77D" ? dropoutReason === "\uAE30\uD0C0" ? reasonDetail : dropoutReason : null;
    const employmentStatus = newStatus === "\uC870\uAE30\uCDE8\uC5C5" ? "\uCDE8\uC5C5" : student.status || "\uBBF8\uCDE8\uC5C5";
    await sbUpdate("students", `id=eq.${studentId}`, {
      enrollment_status: newStatus,
      status: employmentStatus,
      status_change_date: changeDate,
      dropout_reason: finalReason,
      employer_name: newStatus === "\uC870\uAE30\uCDE8\uC5C5" ? employerName || null : null
    });
    try {
      await sbInsert("status_changes", {
        student_id: studentId,
        course_id: courseId,
        previous_status: prevStatus,
        new_status: newStatus,
        change_date: changeDate,
        reason: finalReason,
        employer_name: newStatus === "\uC870\uAE30\uCDE8\uC5C5" ? employerName || null : null,
        changed_by: changedBy
      });
    } catch (e) {
      console.warn("\uC0C1\uD0DC \uBCC0\uACBD \uC774\uB825 \uC800\uC7A5 \uC2E4\uD328:", e);
    }
    if (window._setStudents) {
      window._setStudents((prev) => prev.map(
        (s) => sameId(s.id, studentId) ? {
          ...s,
          enrollmentStatus: newStatus,
          status: employmentStatus,
          statusChangeDate: changeDate,
          dropoutReason: finalReason,
          employerName: newStatus === "\uC870\uAE30\uCDE8\uC5C5" ? employerName || null : null
        } : s
      ));
    }
    await recalculateHoursAndRate(studentId, courseId);
    return { success: true, warning };
  };
  const getCertificateMarkup = (s, c, certNo, issueDate) => {
    const formatCertificateCourseName = (name) => {
      const text = String(name || "");
      if (!text || /과정\s*$/.test(text)) return text;
      if (/양성\s*$/.test(text)) return `${text}\uACFC\uC815`;
      return text;
    };
    const fmtDot = (d) => {
      if (!d) return "";
      const [y, m, day] = d.split("-");
      return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}.`;
    };
    const period = c?.dateFrom ? `${fmtDot(c.dateFrom)}~${c.dateTo ? fmtDot(c.dateTo) : ""}` : "\uAE30\uAC04 \uBBF8\uC815";
    const hours = (() => {
      const h = Number(c?.hours || 0);
      return h > 0 ? `${formatHourText(h)}\uC2DC\uAC04` : "\uC2DC\uAC04 \uBBF8\uC815";
    })();
    const completeDate = c?.dateTo ? fmtDot(c.dateTo) : "\uC218\uB8CC\uC77C \uBBF8\uC815";
    const issueDateText = issueDate || "\u3000\u3000\uB144\u3000\u3000\uC6D4\u3000\u3000\uC77C";
    const currentYear = String((/* @__PURE__ */ new Date()).getFullYear());
    const issueYear = (() => {
      const m = String(issueDateText).match(/^\s*(\d{4})/);
      return m && m[1] ? m[1] : currentYear;
    })();
    const year2 = issueYear.length === 4 ? issueYear.slice(2) : currentYear.slice(2);
    const certNoStr = certNo ? `\uC81C${year2}${String(certNo).padStart(6, "0")}\uD638` : "";
    return `
<div class="doc">
  <div class="doc-no">${certNoStr}</div>
  <div class="title">\uC218 \uB8CC \uC99D</div>
  <div class="fields">
    <div class="row"><span class="dot">\xB7</span><span class="label">\uC131\u3000\uBA85</span><span class="colon">:</span><span class="val">${s.name}</span></div>
    <div class="row"><span class="dot">\xB7</span><span class="label">\uAD50\uC721\uACFC\uC815</span><span class="colon">:</span><span class="val">${formatCertificateCourseName(c.name)}</span></div>
    <div class="row"><span class="dot">\xB7</span><span class="label">\uAD50\uC721\uAE30\uAC04</span><span class="colon">:</span><span class="val">${period} (${hours})</span></div>
    <div class="row"><span class="dot">\xB7</span><span class="label">\uC218\uB8CC\uC77C</span><span class="colon">:</span><span class="val">${completeDate}</span></div>
  </div>
  <div class="msg">\uC704 \uC0AC\uB78C\uC740 \uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8\uC5D0\uC11C<br/>\uC2E4\uC2DC\uD55C \uAD50\uC721\uACFC\uC815\uC744 \uC218\uB8CC\uD558\uC600\uC73C\uBBC0\uB85C<br/>\uC774 \uC99D\uC11C\uB97C \uC218\uC5EC\uD569\uB2C8\uB2E4.</div>
  <div class="date">${issueDateText}</div>
  <div class="sign-wrap">
    <div class="sign-title">\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uB300\uD45C\uC774\uC0AC</div>
    </div>
    <input type="file" id="cert-stamp-up" accept="image/png,image/jpeg,image/gif" style="display:none;" onchange="attachStamp(event)"/>
  </div>
</div>`;
  };
  const CERTIFICATE_PRINT_STYLE = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Pretendard','\uB9D1\uC740 \uACE0\uB515','Malgun Gothic',sans-serif;background:#E8E8E8;
    display:flex;flex-direction:column;align-items:center;padding:26px 16px;gap:16px;}
  .doc{width:210mm;min-height:297mm;background:#fff;padding:16mm 16mm 18mm;
    box-shadow:0 8px 36px rgba(0,0,0,.15);position:relative;color:#2D3748;page-break-after:always;}
  .doc:last-of-type{page-break-after:auto;}
  .doc-no{font-size:13pt;font-weight:700;letter-spacing:.2px;margin-bottom:24mm;}
  .title{font-size:40pt;font-weight:900;letter-spacing:18px;text-align:center;margin-bottom:24mm;color:#4A5568;}
  .fields{padding-left:4mm;margin-bottom:20mm;}
  .row{display:flex;align-items:center;gap:10px;font-size:15pt;font-weight:700;line-height:1.65;margin-bottom:4px;}
  .dot{width:18px;text-align:center;}
  .label{width:95px;letter-spacing:6px;white-space:nowrap;}
  .colon{width:16px;text-align:center;}
  .val{font-weight:600;letter-spacing:1px;}
  .msg{margin-top:10mm;text-align:center;font-size:19pt;line-height:1.7;letter-spacing:1px;
    color:#4A5568;font-weight:700;word-break:keep-all;}
  .date{margin-top:18mm;text-align:center;font-size:20pt;font-weight:800;letter-spacing:1px;color:#374151;}
  .sign-wrap{margin-top:26mm;display:flex;justify-content:center;align-items:flex-end;gap:14px;}
  .sign-title{font-size:24pt;font-weight:900;letter-spacing:1px;color:#111827;}
  .stamp-area{width:72px;height:72px;border:2px solid #DC2626;color:#DC2626;border-radius:4px;
    display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;
    line-height:1.2;cursor:pointer;position:relative;overflow:hidden;}
  .stamp-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:none;}
  .print-btn{position:fixed;bottom:24px;right:24px;background:#EA580C;color:#fff;border:none;
    border-radius:10px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;
    box-shadow:0 4px 20px rgba(234,88,12,.35);font-family:'Pretendard',sans-serif;z-index:99;}
  @media print{
    body{background:#fff;padding:0;}
    .doc{box-shadow:none;padding:30mm 28mm 16mm;}
    .print-btn{display:none;}
    @page{size:A4 portrait;margin:0;}
  }
`;
  const printCertificate = (s, c, certNo, issueDate) => {
    const doc = getCertificateMarkup(s, c, certNo, issueDate);
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<title>\uC218\uB8CC\uC99D - ${s.name}</title>
<style>${CERTIFICATE_PRINT_STYLE}</style></head>
<body>
${doc}
<button class="print-btn" onclick="window.print()">\u{1F5A8}\uFE0F PDF \uC800\uC7A5 / \uC778\uC1C4</button>
<script>
function attachStamp(e){
  var f=e.target.files&&e.target.files[0];
  if(!f) return;
  var r=new FileReader();
  r.onload=function(ev){
    var img=document.getElementById('cert-stamp-img');
    img.src=ev.target.result;
    img.style.display='block';
  };
  r.readAsDataURL(f);
}
<\/script>
</body></html>`;
    const USE_PREVIEW = true;
    if (USE_PREVIEW && window._showPrintPreview) {
      window._showPrintPreview(html, "certificate", "portrait");
    } else {
      const w = window.open("", "_blank", "width=900,height=1100");
      w.document.write(html);
      w.document.close();
    }
  };
  const printCertificateBatch = (items, c, issueDate) => {
    if (!items || items.length === 0) return;
    const docs = items.map(
      ({ student, certNo }) => getCertificateMarkup(student, c, certNo, issueDate)
    ).join("");
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<title>\uC218\uB8CC\uC99D \uC77C\uAD04 \uCD9C\uB825</title>
<style>${CERTIFICATE_PRINT_STYLE}</style></head>
<body>
${docs}
<button class="print-btn" onclick="window.print()">\u{1F5A8}\uFE0F PDF \uC800\uC7A5 / \uC778\uC1C4</button>
</body></html>`;
    const w = window.open("", "_blank", "width=1200,height=900");
    if (!w) {
      alert("\uD31D\uC5C5\uC774 \uCC28\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uD31D\uC5C5 \uD5C8\uC6A9 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.");
      return;
    }
    w.document.write(html);
    w.document.close();
  };
  const printAttendCert = (s, c, certNo, issueDate, absences = [], certStartDate = null, certEndDate = null) => {
    const b = (s.birth || "").replace(/-/g, "");
    const front6 = b.length >= 8 ? b.slice(2, 4) + b.slice(4, 6) + b.slice(6, 8) : "";
    const idFront = front6 || "\u3000\u3000\u3000\u3000\u3000\u3000";
    const idBack = s.idBack || "\u3000\u3000\u3000\u3000\u3000\u3000\u3000";
    const idNum = `${idFront} - ${idBack}`;
    const fmtYMD_dot = (d) => {
      if (!d) return "";
      const p = d.split("-");
      return `${p[0]}. ${+p[1]}. ${+p[2]}.`;
    };
    const fmtMD_dot = (d) => {
      if (!d) return "";
      const p = d.split("-");
      return `${+p[1]}. ${+p[2]}.`;
    };
    const fmtRange_dot = (from, to) => {
      if (!from) return "";
      if (!to) return fmtYMD_dot(from) + " ~";
      return from.slice(0, 4) === to.slice(0, 4) ? `${fmtYMD_dot(from)} ~ ${fmtMD_dot(to)}` : `${fmtYMD_dot(from)} ~ ${fmtYMD_dot(to)}`;
    };
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const computedFrom = certStartDate || c.dateFrom || "";
    const computedTo = certEndDate || (c.dateTo && todayStr < c.dateTo ? todayStr : c.dateTo) || todayStr;
    const dailyHoursNum = (() => {
      const tFrom = c.schedTimeFrom || "";
      const tTo = c.schedTimeTo || "";
      if (!tFrom || !tTo) return 0;
      const [fh, fm] = tFrom.split(":").map(Number);
      const [th, tm] = tTo.split(":").map(Number);
      const h = (th * 60 + tm - fh * 60 - fm) / 60;
      return h > 0 ? h : 0;
    })();
    const countCertTrainingDays = (from, to) => {
      if (!from || !to) return 0;
      const DAY_MAP = { \uC77C: 0, \uC6D4: 1, \uD654: 2, \uC218: 3, \uBAA9: 4, \uAE08: 5, \uD1A0: 6 };
      const schedDaysRaw = c.schedDays || "";
      const allowedDows = schedDaysRaw.trim() ? new Set(schedDaysRaw.split(",").map((s2) => DAY_MAP[s2.trim()]).filter((d) => d !== void 0)) : /* @__PURE__ */ new Set([1, 2, 3, 4, 5]);
      let count = 0;
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(0, 0, 0, 0);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (allowedDows.has(d.getDay())) count++;
      }
      return count;
    };
    const certDayCount = countCertTrainingDays(computedFrom, computedTo);
    const certHoursNum = certDayCount * dailyHoursNum;
    const certDaySuffix = certDayCount ? ` (${certDayCount}\uC77C${certHoursNum ? `, ${certHoursNum}\uC2DC\uAC04` : ""})` : "";
    const certPeriodStr = fmtRange_dot(computedFrom, computedTo) + certDaySuffix;
    const trainingHoursStr = (() => {
      const days = c.schedDays || "";
      const dailyStr = dailyHoursNum ? `\uC77C ${dailyHoursNum}\uC2DC\uAC04` : "";
      const periodStr = fmtRange_dot(c.dateFrom, c.dateTo);
      const totalStr = c.hours ? `\uCD1D ${c.hours}\uC2DC\uAC04` : "";
      const inner = [dailyStr, periodStr, totalStr].filter(Boolean).join(", ");
      return days ? inner ? `${days} (${inner})` : days : inner || "\u3000\u3000\uC2DC\uAC04";
    })();
    const excused = absences.filter((a) => a.absenceType === "excused");
    const personal = absences.filter((a) => a.absenceType === "personal" || !a.absenceType);
    const fmtAbsDates = (list) => {
      if (!list.length) return "\uD574\uB2F9 \uC5C6\uC74C";
      return list.map((a) => a.date).join(", ");
    };
    const fmtAbsReasons = (list) => {
      const reasons = [...new Set(list.map((a) => a.reason).filter(Boolean))];
      return reasons.length ? reasons.join("; ") : "\u3000";
    };
    const addr = (s.addrCity || "") + (s.addrDetail ? ` ${s.addrDetail}` : "") || "\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u3000";
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<title>\uC218\uAC15\uC99D\uBA85\uC11C - ${s.name}</title>
<style>
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Pretendard','\uB9D1\uC740 \uACE0\uB515','Malgun Gothic',sans-serif;background:#f4f4f4;
       display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:24px 0;}
  .edit-guide{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;padding:10px 18px;
    border-radius:8px;margin-bottom:16px;font-size:13px;font-weight:600;width:210mm;
    text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.06);}
  .edit-guide span{color:#D97706;}
  .doc{width:210mm;min-height:297mm;padding:13mm 17mm 11mm;background:#fff;display:flex;flex-direction:column;
       box-shadow:0 4px 32px rgba(0,0,0,.13);}
  /* \uC11C\uC2DD \uBC88\uD638 */
  .form-no{text-align:right;font-size:8pt;color:#555;margin-bottom:4px;letter-spacing:.5px;}
  /* \uC81C\uBAA9 */
  .title-box{border:2.5px solid #111;text-align:center;padding:10px 0;margin-bottom:7px;}
  .title-box h1{font-size:17pt;font-weight:900;letter-spacing:10px;color:#111;}
  /* \uBA54\uC778 \uD14C\uC774\uBE14 */
  table.main{width:100%;border-collapse:collapse;font-size:9pt;}
  table.main td{border:1px solid #000;padding:5px 8px;vertical-align:middle;line-height:1.75;}
  .slbl{background:#d8d8d8;font-weight:900;text-align:center;writing-mode:vertical-rl;
    text-orientation:upright;letter-spacing:3px;font-size:8pt;width:26px;padding:5px 2px;color:#111;}
  .fno{background:#ececec;font-weight:800;font-size:9pt;text-align:center;
    width:22px;padding:5px 2px;color:#111;border-right:1px solid #aaa;}
  .flbl{background:#ececec;font-weight:700;font-size:9pt;white-space:nowrap;padding:5px 10px;
    border-right:1px solid #ccc;}
  .fval{font-size:9.5pt;padding:5px 10px;}
  .hd{background:#d8d8d8;font-weight:800;text-align:center;}
  .col-hd{background:#e4e4e4;font-weight:800;font-size:8pt;text-align:center;
    padding:4px 6px;white-space:nowrap;letter-spacing:1.5px;color:#222;}
  /* \uC218\uC815 \uAC00\uB2A5 \uC140 */
  .editable{outline:none;border:1px dashed #a0bfdf !important;border-radius:0;}
  .editable:hover{background:#f0f7ff;cursor:text;}
  .editable:focus{background:#fef3c7;border-color:#f59e0b !important;outline:none;}
  /* \uC11C\uBA85 \uC601\uC5ED */
  .sign-area{margin-top:10px;text-align:center;}
  .sign-date{font-size:11.5pt;font-weight:700;letter-spacing:2px;margin-bottom:8px;color:#111;}
  .sign-row{display:flex;justify-content:center;align-items:center;gap:16px;margin-top:6px;}
  .sign-org{font-size:12.5pt;font-weight:900;letter-spacing:3px;color:#111;}
  .stamp{width:48px;height:48px;border:2.5px solid #333;border-radius:50%;
    display:inline-flex;align-items:center;justify-content:center;font-size:12pt;font-weight:900;color:#333;}
  .sign-to{font-size:9.5pt;margin-top:8px;color:#444;}
  /* \uC778\uC1C4 \uBC84\uD2BC */
  .print-btn{position:fixed;bottom:24px;right:24px;background:#EA580C;color:#fff;
    border:none;border-radius:10px;padding:12px 24px;font-size:14px;font-weight:700;
    cursor:pointer;box-shadow:0 4px 20px rgba(234,88,12,.4);font-family:inherit;z-index:99;}
  @media print{
    body{padding:0;background:#fff;}
    .doc{padding:11mm 15mm 9mm;box-shadow:none;}
    .edit-guide,.print-btn{display:none;}
    .editable{border:1px solid #555 !important;background:transparent !important;}
    @page{size:A4 portrait;margin:0;}
  }
</style></head>
<body>
<div class="edit-guide">
  \u{1F4A1} <span>\uC140\uC744 \uD074\uB9AD</span>\uD558\uBA74 \uC218\uAC15\uC2DC\uAC04, \uC99D\uBA85\uB300\uC0C1\uAE30\uAC04, \uD734\uC77C, \uACB0\uC11D \uB0A0\uC9DC \uB4F1\uC744 \uC9C1\uC811 \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
  (\uC778\uC1C4\xB7PDF \uC800\uC7A5 \uC2DC \uC810\uC120 \uD14C\uB450\uB9AC\uB294 \uBAA8\uB450 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4.)
</div>
<div class="doc">

  <div class="form-no">[\uBCC4\uC9C0 \uC81C83\uD638 \uC11C\uC2DD]</div>
  <div class="title-box"><h1>\uC9C1\uC5C5\uB2A5\uB825\uAC1C\uBC1C \uD6C8\uB828 \uB4F1 \uC218\uAC15\uC99D\uBA85\uC11C</h1></div>

  <!-- \u2501\u2501 \uBA54\uC778 \uD14C\uC774\uBE14 (7\uC5F4) \u2501\u2501
       col1=\uAD6C\uC5ED\uB808\uC774\uBE14(26px) col2=\uBC88\uD638(22px) col3=\uD56D\uBAA9\uBA85(80px)
       col4=\uAC12(\uAC00\uBCC0)        col5=\uBC88\uD6382(22px) col6=\uD56D\uBAA9\uBA852(90px) col7=\uAC122(100px) -->
  <table class="main">
    <colgroup>
      <col style="width:26px"/>
      <col style="width:22px"/>
      <col style="width:80px"/>
      <col/>
      <col style="width:22px"/>
      <col style="width:90px"/>
      <col style="width:100px"/>
    </colgroup>
    <tbody>
      <!-- \u2501\u2501 \uD6C8\uB828\uC0DD(\uC218\uAE09\uC790\uACA9\uC790) \u2014 2\uD589 \u2501\u2501 -->
      <tr>
        <td class="slbl" rowspan="2">\uD6C8\uB828\uC0DD<br/>(\uC218\uAE09<br/>\uC790\uACA9\uC790)</td>
        <td class="fno">\u2460</td>
        <td class="flbl">\uC131\u3000\u3000\uBA85</td>
        <td class="fval" style="font-size:11pt;font-weight:800;">${s.name}</td>
        <td class="fno">\u2461</td>
        <td class="flbl">\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638</td>
        <td class="fval" style="font-family:'Courier New',monospace;letter-spacing:1px;font-size:9pt;">${idNum}</td>
      </tr>
      <tr>
        <td class="fno">\u2462</td>
        <td class="flbl">\uC8FC\u3000\u3000\uC18C</td>
        <td class="fval editable" contenteditable="true" colspan="4">${addr}</td>
      </tr>

      <!-- \u2501\u2501 \uC218\uAC15\uBA85\uC138 \u2014 1\uD589 \u2501\u2501 -->
      <tr>
        <td class="slbl">\uC218\uAC15<br/>\uBA85\uC138</td>
        <td class="fno">\u2463</td>
        <td class="flbl">\uC218\uAC15\uC9C1\uC885</td>
        <td class="fval editable" contenteditable="true">${c.name}</td>
        <td class="fno">\u2464</td>
        <td class="flbl">\uC218\uAC15\uC2DC\uAC04</td>
        <td class="fval editable" contenteditable="true" style="font-size:8.5pt;word-break:keep-all;">${trainingHoursStr}</td>
      </tr>

      <!-- \u2501\u2501 \uC218\uAC15\uC99D\uBA85\uBA85\uC138 \u2014 rowspan=7 (\uD5896~12) \u2501\u2501 -->
      <!-- \uD5891: \u2465 \uC99D\uBA85\uB300\uC0C1\uAE30\uAC04 -->
      <tr>
        <td class="slbl" rowspan="7">\uC218\uAC15\uC99D\uBA85<br/>\uBA85\uC138</td>
        <td class="fno">\u2465</td>
        <td class="flbl" style="font-size:8.5pt;">\uC99D\uBA85\uB300\uC0C1\uAE30\uAC04</td>
        <td class="fval editable" contenteditable="true" colspan="4" style="font-size:9.5pt;font-weight:600;">${certPeriodStr}</td>
      </tr>
      <!-- \uD5892: \u2466 \uD734\uC77C -->
      <tr>
        <td class="fno">\u2466</td>
        <td class="flbl" colspan="2" style="font-size:8.5pt;">\uD734\uC77C \uB4F1 \uD6C8\uB828\uC774<br/>\uC5C6\uC5C8\uB358 \uB0A0</td>
        <td class="fval editable" contenteditable="true" colspan="3" style="font-size:8.5pt;">\uACF5\uD734\uC77C \uBC0F \uBC95\uC815 \uD734\uC77C (\uACFC\uC815 \uC6B4\uC601 \uC77C\uC815 \uCC38\uC870)</td>
      </tr>
      <!-- \uD5893: \u2467 \uD5E4\uB354 \u2014 \u2467 \uBC88\uD638 \uC140\uC740 rowspan=5\uB85C \uD5893~7 \uC810\uC720(\u3260\uB77C\uBCA8+\u3260\uB370\uC774\uD130+\u3261\uB77C\uBCA8+\u3261\uB370\uC774\uD130) -->
      <tr>
        <td class="fno hd" rowspan="5" style="vertical-align:middle;font-size:9pt;">\u2467</td>
        <td colspan="5" style="background:#f0f0f0;font-size:9pt;font-weight:700;padding:5px 8px;text-align:center;letter-spacing:1px;">
          \uBCF8\uC778\uC758 \uC0AC\uC815\uC73C\uB85C \uC218\uAC15\uD558\uC9C0 \uC544\uB2C8\uD55C \uB0A0
        </td>
      </tr>
      <!-- \uD5894: \u3260 \uB77C\uBCA8 -->
      <tr>
        <td class="fno hd" style="font-size:8pt;vertical-align:middle;">\u3260</td>
        <td colspan="4" style="padding:4px 8px;font-size:9pt;background:#f8f8f8;">
          \uC9C8\uBCD1\xB7\uBD80\uC0C1 \uB4F1 \uBD80\uB4DD\uC774\uD55C \uC0AC\uC720\uAC00 \uC788\uB294 \uB0A0 &nbsp;&nbsp;<b>(\uCD1D ${excused.length}\uC77C)</b>
        </td>
      </tr>
      <!-- \uD5895: \u3260 \uB0A0\uC9DC\xB7\uC0AC\uC720 -->
      <tr>
        <td class="col-hd" style="width:30px;">\uB0A0\uC790</td>
        <td colspan="2" class="editable" contenteditable="true" style="padding:5px 8px;font-size:8.5pt;">${fmtAbsDates(excused)}</td>
        <td class="col-hd" style="width:30px;">\uC0AC\uC720</td>
        <td class="editable" contenteditable="true" style="padding:5px 8px;font-size:8.5pt;">${fmtAbsReasons(excused) || "\uD574\uB2F9\uC5C6\uC74C"}</td>
      </tr>
      <!-- \uD5896: \u3261 \uB77C\uBCA8 -->
      <tr>
        <td class="fno hd" style="font-size:8pt;vertical-align:middle;">\u3261</td>
        <td colspan="4" style="padding:4px 8px;font-size:9pt;background:#f8f8f8;">
          \uBD80\uB4DD\uC774\uD55C \uC0AC\uC720\uAC00 \uC5C6\uB294 \uB0A0 &nbsp;&nbsp;<b>(\uCD1D ${personal.length}\uC77C)</b>
        </td>
      </tr>
      <!-- \uD5897: \u3261 \uB0A0\uC9DC\xB7\uC0AC\uC720 -->
      <tr>
        <td class="col-hd" style="width:30px;">\uB0A0\uC790</td>
        <td colspan="2" class="editable" contenteditable="true" style="padding:5px 8px;font-size:8.5pt;">${fmtAbsDates(personal)}</td>
        <td class="col-hd" style="width:30px;">\uC0AC\uC720</td>
        <td class="editable" contenteditable="true" style="padding:5px 8px;font-size:8.5pt;">${fmtAbsReasons(personal) || "\uAC1C\uC778\uC0AC\uC720"}</td>
      </tr>

      <!-- \u2468 \uCDE8\uC5C5 \uC0AC\uC2E4 \u2014 \uC218\uAC15\uC99D\uBA85\uBA85\uC138 rowspan \uC885\uB8CC \uD6C4, \uC804\uCCB4 7\uC5F4 \uC0AC\uC6A9 -->
      <tr>
        <td class="fno hd" colspan="2" style="text-align:center;padding:5px 6px;font-size:9.5pt;">\u2468</td>
        <td colspan="3" style="padding:5px 8px;font-size:9pt;font-weight:700;">
          \uC99D\uBA85\uB300\uC0C1\uAE30\uAC04 \uC911 \uCDE8\uC5C5\xB7\uCDE8\uB85C \uB610\uB294 \uC18C\uB4DD\uC744 \uC5BB\uC740 \uC0AC\uC2E4
        </td>
        <td class="editable" contenteditable="true" colspan="2" style="padding:5px 8px;font-size:9pt;">\u25A1 \uC788\uC74C&nbsp;&nbsp;\u25A0 \uC5C6\uC74C</td>
      </tr>
    </tbody>
  </table>

  <!-- \u2501\u2501 \uD6C8\uB828\uC0DD \uD655\uC778 \u2501\u2501 -->
  <table style="width:100%;border-collapse:collapse;margin-top:6px;">
    <tr>
      <td style="border:1px solid #333;padding:6px 10px;font-size:9pt;line-height:1.8;">
        <b>\u203B \uD6C8\uB828\uC0DD\uD655\uC778</b>&nbsp;&nbsp;\uC704\uC758 \uC0AC\uC2E4\uC774 \uD2C0\uB9BC\uC5C6\uC74C\uC744 \uC99D\uBA85\uD569\uB2C8\uB2E4.
      </td>
    </tr>
  </table>

  <!-- \u2501\u2501 \uC11C\uBA85 \u2501\u2501 -->
  <div class="sign-area">
    <div class="sign-date">${issueDate}</div>
    <div class="sign-row">
      <span class="sign-org">\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uB300\uD45C\uC774\uC0AC</span>
      <span class="stamp"></span>
    </div>
    <div class="sign-to">\uC9C0\uBC29\uB178\uB3D9\uCCAD(\uC9C0\uCCAD)\uC7A5&nbsp;&nbsp;\uADC0\uD558</div>
  </div>

  <!-- \u2501\u2501 \uC218\uC218\uB8CC \u2501\u2501 -->
  <table style="width:100%;border-collapse:collapse;font-size:8.5pt;margin-top:10px;">
    <tr>
      <td rowspan="2" class="hd" style="border:1px solid #333;width:52px;padding:5px 6px;">\uC218\uC218\uB8CC</td>
      <td style="border:1px solid #333;padding:4px 8px;font-weight:700;">\uC5C6&nbsp;&nbsp;\uC74C</td>
    </tr>
    <tr>
      <td style="border:1px solid #333;padding:4px 8px;font-size:8pt;color:#555;">
        \u203B \uD45C\uC2DC\uB780\uC740 \uC801\uC9C0 \uC544\uB2C8\uD569\uB2C8\uB2E4.
      </td>
    </tr>
  </table>

  <!-- \u2501\u2501 \uCC98\uB9AC\uC0AC\uD56D \u2501\u2501
       7\uC5F4: \u203B\uCC98\uB9AC\uC0AC\uD56D(r5) | \uC9C0\uAE09\uACB0\uC815\uC0AC\uD56D(r2) | \uAD6C\uC9C1\uAE09\uC5EC/\uC9C1\uC5C5\uB2A5\uB825\uAC1C\uBC1C\uC218\uB2F9(r3) | \uC0B0\uCD9C\uBA85\uC138 | \uAC12 | \uC9C0\uAE09\uC561 | \uAC12 -->
  <table style="width:100%;border-collapse:collapse;font-size:8pt;margin-top:5px;">
    <colgroup>
      <col style="width:20px"/>
      <col style="width:56px"/>
      <col style="width:66px"/>
      <col style="width:74px"/>
      <col/>
      <col style="width:44px"/>
      <col style="width:70px"/>
    </colgroup>
    <tbody>
      <tr>
        <td rowspan="5" class="hd" style="border:1px solid #333;writing-mode:vertical-rl;padding:3px 2px;font-size:7.5pt;">\u203B \uCC98\uB9AC<br/>\uC0AC\uD56D</td>
        <td rowspan="2" class="hd" style="border:1px solid #333;padding:3px 5px;">\uC9C0\uAE09\uACB0\uC815<br/>\uC0AC\uD56D</td>
        <td class="hd" style="border:1px solid #333;padding:3px 5px;">\uAD6C\uC9C1\uAE09\uC5EC</td>
        <td class="hd" style="border:1px solid #333;padding:3px 5px;">\uC0B0\uCD9C\uBA85\uC138</td>
        <td style="border:1px solid #333;padding:3px 5px;">&nbsp;</td>
        <td class="hd" style="border:1px solid #333;padding:3px 5px;">\uC9C0\uAE09\uC561</td>
        <td style="border:1px solid #333;padding:3px 5px;">&nbsp;</td>
      </tr>
      <tr>
        <td rowspan="3" class="hd" style="border:1px solid #333;padding:3px 5px;font-size:7.5pt;">\uC9C1\uC5C5\uB2A5\uB825<br/>\uAC1C\uBC1C\uC218\uB2F9</td>
        <td class="hd" style="border:1px solid #333;padding:3px 5px;">\uC0B0\uCD9C\uBA85\uC138</td>
        <td style="border:1px solid #333;padding:3px 5px;">&nbsp;</td>
        <td class="hd" style="border:1px solid #333;padding:3px 5px;">\uC9C0\uAE09\uC561</td>
        <td style="border:1px solid #333;padding:3px 5px;">&nbsp;</td>
      </tr>
      <tr>
        <td class="hd" style="border:1px solid #333;padding:3px 5px;">\uBBF8\uC9C0\uAE09\uC0AC\uC720</td>
        <td style="border:1px solid #333;padding:3px 5px;" colspan="3">&nbsp;</td>
      </tr>
      <tr>
        <td style="border:1px solid #333;padding:3px 5px;" colspan="4">&nbsp;</td>
      </tr>
      <tr>
        <td colspan="6" style="border:none;height:3px;"></td>
      </tr>
    </tbody>
  </table>

  <!-- \u2501\u2501 \uACB0\uC7AC \u2501\u2501 -->
  <table style="width:100%;border-collapse:collapse;font-size:8pt;margin-top:4px;">
    <tr>
      <td class="hd" style="border:1px solid #333;width:36px;padding:3px 4px;">\u203B \uACB0\uC7AC</td>
      <td class="hd" style="border:1px solid #333;width:42px;padding:3px 4px;">\uB2F4\uB2F9</td>
      <td style="border:1px solid #333;width:50px;height:40px;">&nbsp;</td>
      <td class="hd" style="border:1px solid #333;width:42px;padding:3px 4px;">\uD300\uC7A5</td>
      <td style="border:1px solid #333;width:50px;height:40px;">&nbsp;</td>
      <td class="hd" style="border:1px solid #333;width:42px;padding:3px 4px;">\uACFC\uC7A5</td>
      <td style="border:1px solid #333;width:50px;height:40px;">&nbsp;</td>
      <td class="hd" style="border:1px solid #333;width:60px;padding:3px 4px;font-size:7.5pt;">\uCCAD\uC7A5\xB7\uC9C0\uCCAD\uC7A5</td>
      <td style="border:1px solid #333;width:64px;height:40px;">&nbsp;</td>
      <td class="hd" style="border:1px solid #333;width:72px;padding:3px 4px;">\uACB0\uC7AC \uC5F0\uC6D4\uC77C</td>
      <td style="border:1px solid #333;padding:3px 4px;">\u3000.\u3000.\u3000</td>
    </tr>
  </table>

  <div style="font-size:7.5pt;color:#888;margin-top:5px;text-align:right;">210mm\xD7297mm(\uC77C\uBC18\uC6A9\uC9C0 60g/\u33A1)</div>

</div>
<button class="print-btn" onclick="window.print()">\u{1F5A8}\uFE0F PDF \uC800\uC7A5 / \uC778\uC1C4</button>
<script>
document.querySelectorAll('[contenteditable="true"]').forEach(function(el){
  el.setAttribute('data-original', el.textContent.trim());
  el.addEventListener('input', function(){
    var orig = this.getAttribute('data-original');
    if(orig !== null){
      this.style.background = this.textContent.trim() !== orig ? '#FEF3C7' : '';
    }
  });
});
<\/script>
</body></html>`;
    const USE_PREVIEW = true;
    if (USE_PREVIEW && window._showPrintPreview) {
      window._showPrintPreview(html, "attendCert83", "portrait");
    } else {
      const w = window.open("", "_blank", "width=900,height=1200");
      w.document.write(html);
      w.document.close();
    }
  };
  const printParticipationCert = (s, c, certNo, issueDate, roomName = "") => {
    const birthFmt = s.birth ? s.birth.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1\uB144 $2\uC6D4 $3\uC77C") : "\u3000\u3000\u3000\u3000\uB144\u3000\u3000\uC6D4\u3000\u3000\uC77C";
    const fmtD = (d) => d ? d.replace(/(\d{4})-(\d{2})-(\d{2})/, (_, y, m, dd) => `${y}\uB144 ${String(+m)}\uC6D4 ${String(+dd)}\uC77C`) : "\u3000\u3000\u3000\u3000";
    const eduPeriod = c.dateFrom && c.dateTo ? `${fmtD(c.dateFrom)} ~ ${fmtD(c.dateTo)}` : "\u3000\u3000\u3000\u3000\u3000\u3000";
    const loc = roomName || "\uBBF8\uBC30\uC815";
    const courseYear = c.dateFrom ? c.dateFrom.slice(0, 4) : (/* @__PURE__ */ new Date()).getFullYear();
    const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>\uC218\uAC15\uC99D\uBA85\uC11C - ${s.name}</title>
<style>
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#e2e8f0;display:flex;flex-direction:column;align-items:center;
       padding:40px 20px;color:#111;font-family:'Pretendard','Malgun Gothic',sans-serif;}
  .edit-guide{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;padding:12px 20px;
    border-radius:8px;margin-bottom:20px;font-size:14px;font-weight:600;width:210mm;
    text-align:center;box-shadow:0 4px 6px rgba(0,0,0,0.05);}
  .edit-guide span{color:#D97706;}
  .doc{width:210mm;min-height:297mm;padding:35mm 25mm;background:#fff;display:flex;
       flex-direction:column;position:relative;line-height:1.6;
       box-shadow:0 10px 30px rgba(0,0,0,0.15);}
  .editable{outline:none;border:1px dashed #cbd5e1;border-radius:4px;padding:2px 4px;
    transition:background 0.2s,border-color 0.2s;}
  .editable:hover,.editable:focus{background:#fef3c7;border-color:#f59e0b;cursor:text;}
  td.editable{border:1px solid #000;border-radius:0;}
  td.editable:hover,td.editable:focus{background:#fef3c7;outline:2px solid #f59e0b;outline-offset:-2px;}
  .header-info{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;}
  .doc-no{font-size:11pt;color:#333;}
  .title-wrap{text-align:center;margin-bottom:50px;}
  .title{font-size:32pt;font-weight:900;letter-spacing:15px;color:#000;
    font-family:'Batang','\uBC14\uD0D5',serif;-webkit-text-stroke:1.5px #000;}
  table{width:100%;border-collapse:collapse;border:2px solid #000;}
  th,td{border:1px solid #000;padding:14px 10px;font-size:12pt;text-align:center;vertical-align:middle;}
  th{background-color:#f4f6f8;font-weight:700;width:20%;}
  td{width:30%;}
  .course-table{margin-bottom:50px;}
  .course-table td.full-width{text-align:left;padding-left:20px;}
  .main-text{font-size:18pt;font-weight:700;line-height:1.9;text-align:center;color:#000;
    margin-bottom:50px;word-break:keep-all;}
  .trainee-table{margin-bottom:60px;}
  .trainee-table th{width:25%;}
  .footer{text-align:center;margin-top:auto;margin-bottom:20px;display:flex;
    flex-direction:column;align-items:center;gap:40px;}
  .issue-date{font-size:14pt;letter-spacing:2px;}
  .issuer{font-size:24pt;font-weight:900;letter-spacing:5px;
    font-family:'Gungsuh','\uAD81\uC11C',serif;position:relative;display:flex;align-items:center;}
  .stamp-container{position:relative;margin-left:10px;cursor:pointer;display:inline-flex;
    align-items:center;justify-content:center;width:60px;height:60px;border-radius:8px;
    transition:background 0.2s;}
  .stamp-container:hover{background:#fef3c7;}
  .stamp-container:hover::after{content:'\uD074\uB9AD\uD558\uC5EC \uC9C1\uC778 \uCCA8\uBD80';position:absolute;bottom:-20px;
    font-size:11px;color:#EA580C;font-family:'Pretendard',sans-serif;white-space:nowrap;
    letter-spacing:0;font-weight:bold;}
  .stamp-img{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    width:75px;height:75px;object-fit:contain;mix-blend-mode:multiply;pointer-events:none;}
  .print-btn{position:fixed;bottom:24px;right:24px;background:#EA580C;color:#fff;
    border:none;border-radius:10px;padding:12px 24px;font-size:15px;font-weight:700;
    cursor:pointer;z-index:99;box-shadow:0 4px 15px rgba(234,88,12,0.4);}
  .print-btn:active{transform:scale(0.96);}
  @media print{
    body{background:#fff;padding:0;}
    .doc{padding:25mm;box-shadow:none;width:auto;min-height:auto;}
    .edit-guide,.print-btn{display:none;}
    .editable{border:none !important;padding:0 !important;background:transparent !important;}
    td.editable{border:1px solid #000 !important;outline:none !important;}
    .stamp-container:hover{background:transparent;}
    .stamp-container::after{display:none;}
    @page{size:A4 portrait;margin:0;}
  }
</style></head>
<body>
<div class="edit-guide">
  \u{1F4A1} <span>\uB9C8\uC6B0\uC2A4\uB85C \uD14D\uC2A4\uD2B8\uB97C \uD074\uB9AD</span>\uD558\uBA74 \uBB38\uC11C\uBC88\uD638, \uC81C\uCD9C\uCC98, \uC774\uB984, \uB0A0\uC9DC \uB4F1\uC744 \uC790\uC720\uB86D\uAC8C \uC9C1\uC811 \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.<br/>
  (\uC778\uC1C4 \uB610\uB294 PDF \uC800\uC7A5 \uC2DC \uC810\uC120 \uBC15\uC2A4\uB294 \uBAA8\uB450 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4.)
</div>
<div class="doc">
  <div class="header-info">
    <div style="font-size:12pt;font-weight:700;">\uC218 \uAC15 \uC99D \uBA85 \uC11C</div>
    <div class="doc-no">
      <span class="editable" contenteditable="true">2026-\uBD81\uBD80-\uCC38\uC5EC-${certNo}\uD638</span>
    </div>
  </div>
  <div class="title-wrap"><div class="title">\uC218 \uAC15 \uC99D \uBA85 \uC11C</div></div>
  <table class="course-table">
    <tbody>
      <tr>
        <th>\uACFC\uC815\uBA85</th>
        <td colspan="3" class="full-width editable" contenteditable="true" style="font-weight:700;">${c.name}</td>
      </tr>
      <tr>
        <th>\uAD50\uC721\uAE30\uAC04</th>
        <td class="editable" contenteditable="true">${eduPeriod}</td>
        <th>\uAD50\uC721\uC2DC\uAC04</th>
        <td class="editable" contenteditable="true">${c.hours ? c.hours + "\uC2DC\uAC04" : "\u3000\u3000\uC2DC\uAC04"}</td>
      </tr>
      <tr>
        <th>\uAD50\uC721\uC7A5\uC18C</th>
        <td class="editable" contenteditable="true">${loc}</td>
        <th>\uC81C\uCD9C\uCC98</th>
        <td class="editable" contenteditable="true"></td>
      </tr>
    </tbody>
  </table>
  <div class="main-text editable" contenteditable="true">
    \uC704 \uC0AC\uB78C\uC740 ${courseYear}\uB144 \u300C${c.name}\u300D\uC5D0<br/>
    \uCD5C\uC885 \uC120\uBC1C\uB418\uC5B4 \uCC38\uC5EC \uC911\uC784\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.
  </div>
  <table class="trainee-table">
    <thead>
      <tr>
        <th>\uC131\uBA85</th><th>\uC0DD\uB144\uC6D4\uC77C</th><th>\uAD50\uC721\uACFC\uC815 \uCC38\uC5EC\uC5EC\uBD80</th><th>\uC11C\uBA85</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="editable" contenteditable="true" style="font-weight:700;font-size:13pt;">${s.name}</td>
        <td class="editable" contenteditable="true">${birthFmt}</td>
        <td class="editable" contenteditable="true" style="font-weight:800;color:#059669;">\u2611 \uCC38\uC5EC \uC911</td>
        <td class="editable" contenteditable="true"></td>
      </tr>
    </tbody>
  </table>
  <div class="footer">
    <div class="issue-date editable" contenteditable="true">${issueDate}</div>
    <div class="issuer">
      <span class="editable" contenteditable="true">\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uB300\uD45C\uC774\uC0AC</span>
      <span class="stamp-container" onclick="document.getElementById('stamp-upload').click()" title="\uC9C1\uC778 \uC774\uBBF8\uC9C0 \uCCA8\uBD80">
        <img id="stamp-preview" class="stamp-img" style="display:none;" alt="\uC9C1\uC778"/>
      </span>
      <input type="file" id="stamp-upload" accept="image/png,image/jpeg" style="display:none;"
        onchange="(function(e){const f=e.target.files[0];if(f){const r=new FileReader();r.onload=function(ev){const i=document.getElementById('stamp-preview');i.src=ev.target.result;i.style.display='block';};r.readAsDataURL(f);}})(event)"/>
    </div>
  </div>
</div>
<button class="print-btn" onclick="window.print()">\u{1F5A8}\uFE0F PDF \uC800\uC7A5 / \uC778\uC1C4</button>
<script>
document.querySelectorAll('[contenteditable="true"]').forEach(function(el){
  el.setAttribute('data-original', el.textContent.trim());
  el.addEventListener('input', function(){
    var orig = this.getAttribute('data-original');
    if(orig !== null){
      var changed = this.textContent.trim() !== orig;
      this.style.background = changed ? '#fef3c7' : '';
      this.style.borderColor = changed ? '#f59e0b' : '';
    }
  });
});
<\/script>
</body></html>`;
    const USE_PREVIEW = true;
    if (USE_PREVIEW && window._showPrintPreview) {
      window._showPrintPreview(html, "attendCertSelf", "portrait");
    } else {
      const w = window.open("", "_blank", "width=900,height=1200");
      if (w) {
        w.document.write(html);
        w.document.close();
      } else {
        alert("\uD31D\uC5C5\uC774 \uCC28\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uD31D\uC5C5 \uCC28\uB2E8\uC744 \uD574\uC81C\uD574\uC8FC\uC138\uC694.");
      }
    }
  };
  const CERT_HIST_KEY = "gjf_issued_certs";
  const loadCertHistory = () => {
    try {
      return JSON.parse(safeLocal.get(CERT_HIST_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const saveCertHistory = (hist) => {
    try {
      safeLocal.set(CERT_HIST_KEY, JSON.stringify(hist));
    } catch {
    }
  };
  const CertMgmt = ({ students, courses, currentUser, addAudit }) => {
    const [course, setCourse] = useState(courses[3] || courses[0]);
    const [docType, setDocType] = useState("cert");
    const [issueDate, setIssueDate] = useState("2026\uB144\u3000\u3000\uC6D4\u3000\u3000\uC77C");
    const [customDate, setCustomDate] = useState("");
    const [batchStartNo, setBatchStartNo] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [certOverrideStart, setCertOverrideStart] = useState("");
    const [certOverrideEnd, setCertOverrideEnd] = useState("");
    const [historyFilter, setHistoryFilter] = useState({
      q: "",
      status: "all",
      courseId: "all",
      from: "",
      to: "",
      sort: "issuedAtDesc"
    });
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [memoDraft, setMemoDraft] = useState("");
    const [historyBusyId, setHistoryBusyId] = useState("");
    const [certDbStatus, setCertDbStatus] = useState("loading");
    const [certDbError, setCertDbError] = useState("");
    const issueStatusLabel = (status) => status === "\uCDE8\uC18C" ? "\uCDE8\uC18C" : "\uC815\uC0C1";
    const normalizeHistoryRecord = (r) => ({
      id: r.id,
      studentId: r.student_id ?? r.studentId,
      studentName: r.student_name ?? r.studentName,
      courseId: r.course_id ?? r.courseId,
      courseName: r.course_name ?? r.courseName,
      docType: r.doc_type ?? r.docType,
      certNo: r.cert_no ?? r.certNo,
      fullNo: r.full_no ?? r.fullNo,
      issueDate: r.issue_date ?? r.issueDate,
      issuedAt: r.issued_at ?? r.issuedAt,
      issueReason: (r.issue_reason ?? r.issueReason) || "\uCD5C\uCD08\uBC1C\uAE09",
      issueChannel: (r.issue_channel ?? r.issueChannel) || "\uBBF8\uB9AC\uBCF4\uAE30",
      issueStatus: issueStatusLabel(r.issue_status ?? r.issueStatus),
      completionStatus: (r.completion_status ?? r.completionStatus) || "\uBBF8\uC815",
      attendanceRate: Number(r.attendance_rate ?? r.attendanceRate ?? 0),
      issuedBy: (r.issued_by ?? r.issuedBy) || "\uC2DC\uC2A4\uD15C",
      originalIssueId: (r.original_issue_id ?? r.originalIssueId) || "",
      cancelledAt: (r.cancelled_at ?? r.cancelledAt) || "",
      cancelReason: (r.cancel_reason ?? r.cancelReason) || "",
      cancelledBy: (r.cancelled_by ?? r.cancelledBy) || "",
      adminMemo: (r.admin_memo ?? r.adminMemo) || "",
      printCount: Number(r.print_count ?? r.printCount ?? 0),
      pdfCount: Number(r.pdf_count ?? r.pdfCount ?? 0),
      imageCount: Number(r.image_count ?? r.imageCount ?? 0),
      lastOutputAt: (r.last_output_at ?? r.lastOutputAt) || ""
    });
    const [certHistory, setCertHistory] = useState(loadCertHistory);
    useEffect(() => {
      const loadFromDB = async () => {
        try {
          const { data, error } = await sbGet("cert_issuances", "select=*&order=issued_at.desc&limit=2000");
          if (error) {
            setCertDbStatus("error");
            setCertDbError(error.message || JSON.stringify(error));
            return;
          }
          setCertDbStatus("ok");
          setCertDbError("");
          if (data && data.length > 0) {
            const hist = data.map(normalizeHistoryRecord);
            setCertHistory(hist);
            saveCertHistory(hist);
          }
        } catch (e) {
          console.warn("\uBC1C\uAE09\uC774\uB825 DB \uB85C\uB4DC \uC624\uB958:", e);
          setCertDbStatus("error");
          setCertDbError(e.message || String(e));
        }
      };
      loadFromDB();
    }, []);
    useEffect(() => {
      if (!ENABLE_REALTIME) return;
      realtimeManager.subscribe("cert_issuances", {
        onInsert: (newRecord) => {
          const rec = normalizeHistoryRecord(newRecord);
          setCertHistory((prev) => {
            if (prev.some((r) => r.id === rec.id)) return prev;
            const next = [rec, ...prev].sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
            saveCertHistory(next);
            return next;
          });
        },
        onUpdate: (newRecord) => {
          const rec = normalizeHistoryRecord(newRecord);
          setCertHistory((prev) => {
            const next = prev.map((r) => r.id === rec.id ? rec : r);
            saveCertHistory(next);
            return next;
          });
        },
        onDelete: (oldRecord) => {
          setCertHistory((prev) => {
            const next = prev.filter((r) => r.id !== oldRecord.id);
            saveCertHistory(next);
            return next;
          });
        }
      });
      return () => realtimeManager.unsubscribe("cert_issuances");
    }, []);
    useEffect(() => {
      setCertHistory((prev) => {
        const next = prev.map(normalizeHistoryRecord);
        saveCertHistory(next);
        return next;
      });
    }, []);
    const issued = useMemo(() => {
      const map = {};
      certHistory.filter((r) => r.issueStatus !== "\uCDE8\uC18C").sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)).forEach((r) => {
        const key = String(r.studentId) + r.docType + String(r.courseId);
        if (!map[key]) map[key] = { no: r.certNo, date: r.issueDate, issuedAt: r.issuedAt };
      });
      return map;
    }, [certHistory]);
    useEffect(() => {
      if (!courses.length) return;
      setCourse((prev) => {
        if (!prev) return courses[0];
        const updated = courses.find((c) => c.id === prev.id);
        return updated || courses[0];
      });
    }, [courses]);
    if (!course) return null;
    const certEligible = students.filter((s) => {
      if (Number(s.cid) !== Number(course.id)) return false;
      if (s.enrollmentStatus === "\uC911\uB3C4\uD0C8\uB77D") return false;
      if (s.enrollmentStatus === "\uC218\uB8CC" || s.enrollmentStatus === "\uC870\uAE30\uCDE8\uC5C5") return true;
      return s.rate >= 80;
    });
    const attendEligible = students.filter((s) => Number(s.cid) === Number(course.id) && s.enrollmentStatus !== "\uC911\uB3C4\uD0C8\uB77D");
    const eligible = docType === "cert" ? certEligible : attendEligible;
    const docSeries = (dt) => dt === "cert" ? "\uBD81\uBD80\uAD50\uC721\uD300" : dt === "parti" ? "\uBD81\uBD80-\uCC38\uC5EC" : "\uBD81\uBD80-\uC218\uAC15";
    const normalizeCertNo = (value, fallback = "001") => {
      const num = parseInt(String(value ?? "").replace(/\D/g, ""), 10);
      const base = parseInt(String(fallback ?? "001").replace(/\D/g, ""), 10);
      const safe = Number.isFinite(num) && num > 0 ? num : Number.isFinite(base) && base > 0 ? base : 1;
      return String(safe).padStart(3, "0");
    };
    const getNextCertNo = (dt) => {
      const maxNo = certHistory.filter((r) => r.docType === dt).reduce((max, r) => Math.max(max, parseInt(r.certNo, 10) || 0), 0);
      return String(maxNo + 1).padStart(3, "0");
    };
    const getCertNo = (s, histOverride = null) => {
      const hist = histOverride || certHistory;
      const existing = hist.find(
        (r) => String(r.studentId) === String(s.id) && r.docType === docType && String(r.courseId) === String(course.id) && r.issueStatus !== "\uCDE8\uC18C"
      );
      if (existing) return existing.certNo;
      const maxNo = hist.filter((r) => r.docType === docType).reduce((max, r) => Math.max(max, parseInt(r.certNo, 10) || 0), 0);
      return String(maxNo + 1).padStart(3, "0");
    };
    const findLatestIssuedRecord = (s, histRef) => {
      return [...histRef].filter(
        (r) => String(r.studentId) === String(s.id) && r.docType === docType && String(r.courseId) === String(course.id) && r.issueStatus !== "\uCDE8\uC18C"
      ).sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))[0] || null;
    };
    const getCurrentIssuedRecordsForCourse = () => {
      const latestByStudent = {};
      certHistory.filter(
        (r) => r.docType === docType && String(r.courseId) === String(course.id) && r.issueStatus !== "\uCDE8\uC18C"
      ).sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)).forEach((r) => {
        const key = `${r.studentId}_${r.docType}_${r.courseId}`;
        if (!latestByStudent[key]) latestByStudent[key] = r;
      });
      return Object.values(latestByStudent).sort(
        (a, b) => String(a.studentName || "").localeCompare(String(b.studentName || ""), "ko") || new Date(a.issuedAt) - new Date(b.issuedAt)
      );
    };
    const recordIssue = (s, no, histRef, channel = "\uBBF8\uB9AC\uBCF4\uAE30") => {
      const latest = findLatestIssuedRecord(s, histRef);
      const latestAny = [...histRef].filter(
        (r) => String(r.studentId) === String(s.id) && r.docType === docType && String(r.courseId) === String(course.id)
      ).sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))[0] || null;
      const hasAnyHistory = histRef.some(
        (r) => String(r.studentId) === String(s.id) && r.docType === docType && String(r.courseId) === String(course.id)
      );
      const isReissue = hasAnyHistory;
      const record = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        studentId: s.id,
        studentName: s.name,
        courseId: course.id,
        courseName: course.name,
        docType,
        certNo: no,
        fullNo: `2026-${docSeries(docType)}-${no}\uD638`,
        issueDate,
        issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
        issueReason: isReissue ? "\uC7AC\uBC1C\uAE09" : "\uCD5C\uCD08\uBC1C\uAE09",
        issueChannel: channel,
        issueStatus: "\uC815\uC0C1",
        completionStatus: s.enrollmentStatus || "\uC7AC\uD559\uC911",
        attendanceRate: Number(s.rate || 0),
        issuedBy: currentUser?.name || "\uC2DC\uC2A4\uD15C",
        originalIssueId: isReissue ? latest?.originalIssueId || latest?.id || latestAny?.id || "" : "",
        cancelledAt: "",
        cancelReason: "",
        cancelledBy: "",
        adminMemo: "",
        printCount: 0,
        pdfCount: 0,
        imageCount: 0,
        lastOutputAt: ""
      };
      return [record, ...histRef];
    };
    const saveCertIssuanceToDB = async (rec) => {
      try {
        const { error } = await sbInsert("cert_issuances", {
          id: rec.id,
          student_id: rec.studentId,
          student_name: rec.studentName,
          course_id: rec.courseId,
          course_name: rec.courseName,
          doc_type: rec.docType,
          cert_no: rec.certNo,
          full_no: rec.fullNo,
          issue_date: rec.issueDate,
          issued_at: rec.issuedAt,
          issue_reason: rec.issueReason,
          issue_channel: rec.issueChannel,
          issue_status: rec.issueStatus,
          completion_status: rec.completionStatus,
          attendance_rate: rec.attendanceRate,
          issued_by: rec.issuedBy,
          original_issue_id: rec.originalIssueId || null,
          cancelled_at: rec.cancelledAt || null,
          cancel_reason: rec.cancelReason || null,
          cancelled_by: rec.cancelledBy || null,
          admin_memo: rec.adminMemo || "",
          print_count: rec.printCount || 0,
          pdf_count: rec.pdfCount || 0,
          image_count: rec.imageCount || 0,
          last_output_at: rec.lastOutputAt || null
        });
        if (error) throw error;
        setCertDbStatus("ok");
        setCertDbError("");
        return true;
      } catch (e) {
        console.warn("\uBC1C\uAE09\uC774\uB825 DB \uC800\uC7A5 \uC624\uB958:", e);
        setCertDbStatus("error");
        setCertDbError(e.message || JSON.stringify(e));
        alert("\uBC1C\uAE09\uC774\uB825\uC744 Supabase\uC5D0 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.\n\uB2E4\uB978 PC\uC5D0\uC11C \uC774 \uAC74\uC774 \uBCF4\uC774\uC9C0 \uC54A\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.\n\nSupabase SQL Editor\uC5D0\uC11C supabase-setup.sql\uC744 \uB2E4\uC2DC \uC2E4\uD589\uD55C \uB4A4 Schema Cache\uB97C Reload \uD574\uC8FC\uC138\uC694.\n\n\uC624\uB958: " + (e.message || JSON.stringify(e)));
        return false;
      }
    };
    const handleIssue = async (s, histOverride = null) => {
      const hist = histOverride || certHistory;
      const latestIssued = findLatestIssuedRecord(s, hist);
      const no = latestIssued ? latestIssued.certNo : getCertNo(s, hist);
      const nextHist = recordIssue(s, no, hist, "\uBBF8\uB9AC\uBCF4\uAE30");
      const issuedRec = nextHist[0];
      if (!histOverride) {
        setCertHistory(nextHist);
        saveCertHistory(nextHist);
        saveCertIssuanceToDB(issuedRec);
        addAudit?.(
          issuedRec.issueReason === "\uCD5C\uCD08\uBC1C\uAE09" ? "\uC99D\uBA85\uC11C \uBC1C\uAE09" : "\uC99D\uBA85\uC11C \uC7AC\uBC1C\uAE09",
          `${issuedRec.studentName} \xB7 ${issuedRec.fullNo} \xB7 ${issuedRec.docType}`,
          currentUser?.name
        );
      }
      window._pendingPreviewMeta = {
        certIssueId: issuedRec.id,
        docType: issuedRec.docType,
        studentName: issuedRec.studentName,
        fullNo: issuedRec.fullNo
      };
      if (docType === "cert") {
        printCertificate(s, course, no, issueDate);
      } else if (docType === "parti") {
        let roomName = "";
        try {
          const { data: bookData } = await sbGet(
            "room_bookings",
            `select=room_id&course_id=eq.${course.id}&limit=1`
          );
          if (bookData && bookData.length > 0) {
            const { data: roomData } = await sbGet(
              "rooms",
              `select=name&id=eq.${bookData[0].room_id}&limit=1`
            );
            if (roomData && roomData.length > 0) roomName = roomData[0].name;
          }
        } catch (e) {
          console.warn("\uAC15\uC758\uC2E4 \uC870\uD68C \uC624\uB958:", e);
        }
        printParticipationCert(s, course, no, issueDate, roomName);
      } else {
        let studentAbsences = [];
        let certStartDate = null;
        let certEndDate = null;
        try {
          const [absRes, firstRes] = await Promise.all([
            sbGet(
              "attendance",
              `select=date,status,reason,absence_type&student_id=eq.${s.id}&course_id=eq.${course.id}&status=eq.A`
            ),
            sbGet(
              "attendance",
              `select=date&student_id=eq.${s.id}&course_id=eq.${course.id}&status=in.(O,L)&order=date.asc&limit=1`
            )
          ]);
          if (absRes.data) {
            studentAbsences = absRes.data.map((r) => ({
              date: r.date,
              absenceType: r.absence_type || "personal",
              reason: r.reason || ""
            }));
          }
          if (firstRes.data && firstRes.data.length > 0) {
            certStartDate = firstRes.data[0].date;
          } else {
            certStartDate = course.dateFrom || null;
          }
          const todayISO = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          certEndDate = course.dateTo && todayISO < course.dateTo ? todayISO : course.dateTo || todayISO;
        } catch (e) {
          console.warn("\uCD9C\uACB0 \uB370\uC774\uD130 \uB85C\uB4DC \uC624\uB958:", e);
        }
        if (certOverrideStart) certStartDate = certOverrideStart;
        if (certOverrideEnd) certEndDate = certOverrideEnd;
        printAttendCert(s, course, no, issueDate, studentAbsences, certStartDate, certEndDate);
      }
      return nextHist;
    };
    const handleIssueAll = async () => {
      const prevLen = certHistory.length;
      let runningHist = [...certHistory];
      if (docType === "cert") {
        let nextNoInt = parseInt(normalizeCertNo(batchStartNo || getNextCertNo(docType)), 10);
        const usedNoSet = new Set(
          runningHist.filter((r) => r.docType === docType).map((r) => parseInt(r.certNo, 10)).filter((n) => Number.isFinite(n) && n > 0)
        );
        const batchPrintItems = [];
        for (const s of eligible) {
          const existing = runningHist.find(
            (r) => String(r.studentId) === String(s.id) && r.docType === docType && String(r.courseId) === String(course.id) && r.issueStatus !== "\uCDE8\uC18C"
          );
          const no = existing ? existing.certNo : (() => {
            while (usedNoSet.has(nextNoInt)) nextNoInt += 1;
            const assigned = String(nextNoInt).padStart(3, "0");
            usedNoSet.add(nextNoInt);
            nextNoInt += 1;
            return assigned;
          })();
          runningHist = recordIssue(s, no, runningHist, "\uC77C\uAD04\uCD9C\uB825");
          batchPrintItems.push({ student: s, certNo: no });
        }
        window._pendingPreviewMeta = null;
        printCertificateBatch(batchPrintItems, course, issueDate);
      } else {
        for (const s of eligible) {
          runningHist = await handleIssue(s, runningHist);
        }
      }
      setCertHistory(runningHist);
      saveCertHistory(runningHist);
      const newCount = runningHist.length - prevLen;
      const newRecords = newCount > 0 ? runningHist.slice(0, newCount) : [];
      for (const rec of newRecords) {
        await saveCertIssuanceToDB(rec);
      }
      if (newRecords.length > 0) {
        addAudit?.("\uC99D\uBA85\uC11C \uC77C\uAD04\uBC1C\uAE09", `${DOC_TYPE_NAMES[docType] || docType} ${newRecords.length}\uAC74 \uCC98\uB9AC`, currentUser?.name);
      }
    };
    const handleBatchRenumber = async () => {
      if (docType !== "cert") {
        alert("\uC77C\uAD04\uBC88\uD638 \uC218\uC815\uC740 \uC218\uB8CC\uC99D\uC5D0\uC11C\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.");
        return;
      }
      const target = getCurrentIssuedRecordsForCourse();
      if (target.length === 0) {
        alert("\uD604\uC7AC \uACFC\uC815\uC758 \uC218\uB8CC\uC99D \uBC1C\uAE09\uC774\uB825\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      const startNo = parseInt(normalizeCertNo(batchStartNo || getNextCertNo(docType)), 10);
      if (!window.confirm(`\uD604\uC7AC \uACFC\uC815 \uC218\uB8CC\uC99D ${target.length}\uAC74 \uBC88\uD638\uB97C ${String(startNo).padStart(3, "0")}\uBD80\uD130 \uC77C\uAD04 \uC218\uC815\uD560\uAE4C\uC694?`)) return;
      const updates = target.map((r, idx) => {
        const no = String(startNo + idx).padStart(3, "0");
        return { id: r.id, certNo: no, fullNo: `2026-${docSeries(docType)}-${no}\uD638` };
      });
      const updateMap = {};
      updates.forEach((u) => {
        updateMap[u.id] = u;
      });
      const nextHist = certHistory.map((r) => updateMap[r.id] ? { ...r, certNo: updateMap[r.id].certNo, fullNo: updateMap[r.id].fullNo } : r);
      setCertHistory(nextHist);
      saveCertHistory(nextHist);
      await Promise.all(updates.map(
        (u) => sbUpdate("cert_issuances", `id=eq.${encodeURIComponent(u.id)}`, {
          cert_no: u.certNo,
          full_no: u.fullNo
        }).catch((e) => console.warn("\uC77C\uAD04\uBC88\uD638 DB \uBC18\uC601 \uC2E4\uD328:", e))
      ));
      addAudit?.("\uC218\uB8CC\uC99D \uBC88\uD638 \uC77C\uAD04\uC218\uC815", `${course.name} ${updates.length}\uAC74`, currentUser?.name);
      alert(`\u2705 \uC218\uB8CC\uC99D \uBC88\uD638 ${updates.length}\uAC74\uC744 \uC77C\uAD04 \uC218\uC815\uD588\uC2B5\uB2C8\uB2E4.`);
    };
    const fmtDate = (raw) => {
      if (!raw) return "";
      const [y, m, d] = raw.split("-");
      return `${y}\uB144 ${m}\uC6D4 ${d}\uC77C`;
    };
    const issuedCountForType = certHistory.filter((r) => r.docType === docType).length;
    const historyForCurrent = certHistory.filter(
      (r) => r.docType === docType && String(r.courseId) === String(course.id)
    );
    const filteredHistory = certHistory.filter((r) => r.docType === docType).filter((r) => historyFilter.status === "all" ? true : r.issueStatus === historyFilter.status).filter((r) => historyFilter.courseId === "all" ? true : String(r.courseId) === String(historyFilter.courseId)).filter((r) => {
      if (!historyFilter.from && !historyFilter.to) return true;
      const v = (r.issuedAt || "").slice(0, 10);
      if (historyFilter.from && v < historyFilter.from) return false;
      if (historyFilter.to && v > historyFilter.to) return false;
      return true;
    }).filter((r) => {
      if (!historyFilter.q) return true;
      const q = historyFilter.q.trim();
      return [r.studentName, r.courseName, r.fullNo, r.issueReason, r.issuedBy, r.cancelReason, r.adminMemo].some((v) => String(v || "").includes(q));
    }).sort((a, b) => {
      if (historyFilter.sort === "issuedAtAsc") return new Date(a.issuedAt) - new Date(b.issuedAt);
      if (historyFilter.sort === "nameAsc") return String(a.studentName).localeCompare(String(b.studentName), "ko");
      if (historyFilter.sort === "noAsc") return String(a.fullNo).localeCompare(String(b.fullNo), "ko");
      return new Date(b.issuedAt) - new Date(a.issuedAt);
    });
    const updateHistoryRecord = async (targetId, patch, auditAction = "\uC99D\uBA85\uC11C \uC774\uB825 \uBCC0\uACBD", auditDetail = "") => {
      const prev = certHistory.find((r) => r.id === targetId);
      if (!prev) return;
      const nextRec = { ...prev, ...patch };
      const nextHist = certHistory.map((r) => r.id === targetId ? nextRec : r);
      setCertHistory(nextHist);
      saveCertHistory(nextHist);
      if (selectedHistory?.id === targetId) {
        setSelectedHistory(nextRec);
        setMemoDraft(nextRec.adminMemo || "");
      }
      try {
        await sbUpdate("cert_issuances", `id=eq.${encodeURIComponent(targetId)}`, {
          issue_status: nextRec.issueStatus,
          issue_reason: nextRec.issueReason,
          issue_channel: nextRec.issueChannel,
          completion_status: nextRec.completionStatus,
          attendance_rate: nextRec.attendanceRate,
          issued_by: nextRec.issuedBy,
          original_issue_id: nextRec.originalIssueId || null,
          cancelled_at: nextRec.cancelledAt || null,
          cancel_reason: nextRec.cancelReason || null,
          cancelled_by: nextRec.cancelledBy || null,
          admin_memo: nextRec.adminMemo || "",
          print_count: nextRec.printCount || 0,
          pdf_count: nextRec.pdfCount || 0,
          image_count: nextRec.imageCount || 0,
          last_output_at: nextRec.lastOutputAt || null
        });
      } catch (e) {
        console.warn("\uBC1C\uAE09\uC774\uB825 DB \uAC31\uC2E0 \uC624\uB958:", e);
      }
      addAudit?.(auditAction, auditDetail || `${nextRec.studentName} \xB7 ${nextRec.fullNo}`, currentUser?.name);
    };
    const handleToggleCancel = async (rec) => {
      if (historyBusyId) return;
      setHistoryBusyId(rec.id);
      try {
        if (rec.issueStatus === "\uCDE8\uC18C") {
          if (!window.confirm("\uCDE8\uC18C\uB41C \uBC1C\uAE09\uAC74\uC744 \uC815\uC0C1 \uC0C1\uD0DC\uB85C \uBCF5\uAD6C\uD560\uAE4C\uC694?")) return;
          await updateHistoryRecord(rec.id, {
            issueStatus: "\uC815\uC0C1",
            cancelledAt: "",
            cancelReason: "",
            cancelledBy: ""
          }, "\uC99D\uBA85\uC11C \uBC1C\uAE09\uCDE8\uC18C \uBCF5\uAD6C", `${rec.studentName} \xB7 ${rec.fullNo}`);
        } else {
          const reason = window.prompt("\uCDE8\uC18C(\uBB34\uD6A8) \uC0AC\uC720\uB97C \uC785\uB825\uD558\uC138\uC694.", rec.cancelReason || "");
          if (reason === null) return;
          await updateHistoryRecord(rec.id, {
            issueStatus: "\uCDE8\uC18C",
            cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
            cancelReason: reason.trim() || "\uAD00\uB9AC\uC790 \uCDE8\uC18C",
            cancelledBy: currentUser?.name || "\uC2DC\uC2A4\uD15C"
          }, "\uC99D\uBA85\uC11C \uBC1C\uAE09\uCDE8\uC18C", `${rec.studentName} \xB7 ${rec.fullNo}`);
        }
      } finally {
        setHistoryBusyId("");
      }
    };
    const handleSaveMemo = async () => {
      if (!selectedHistory) return;
      await updateHistoryRecord(selectedHistory.id, { adminMemo: memoDraft }, "\uC99D\uBA85\uC11C \uAD00\uB9AC\uC790\uBA54\uBAA8 \uC218\uC815", `${selectedHistory.studentName} \xB7 ${selectedHistory.fullNo}`);
      alert("\uAD00\uB9AC\uC790 \uBA54\uBAA8\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.");
    };
    useEffect(() => {
      const handler = async (evt) => {
        const d = evt?.detail || {};
        if (!d.certIssueId) return;
        const target = certHistory.find((r) => r.id === d.certIssueId);
        if (!target) return;
        const patch = {
          printCount: target.printCount + (d.action === "print" ? 1 : 0),
          pdfCount: target.pdfCount + (d.action === "pdf" ? 1 : 0),
          imageCount: target.imageCount + (d.action === "image" ? 1 : 0),
          lastOutputAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await updateHistoryRecord(target.id, patch, "\uC99D\uBA85\uC11C \uCD9C\uB825", `${target.studentName} \xB7 ${target.fullNo} \xB7 ${d.action}`);
      };
      window.addEventListener("cert-print-action", handler);
      return () => window.removeEventListener("cert-print-action", handler);
    }, [certHistory, currentUser, addAudit]);
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement(
      SectionHead,
      {
        title: "\uC99D\uBA85\uC11C \uBC1C\uAE09",
        sub: "\uC218\uB8CC\uC99D \xB7 \uC218\uAC15\uC99D\uBA85\uC11C \uACF5\uC2DD \uC591\uC2DD \uCD9C\uB825 \xB7 \uBE0C\uB77C\uC6B0\uC800 \uC778\uC1C4 \u2192 PDF \uC800\uC7A5"
      }
    ), /* @__PURE__ */ React.createElement("div", { style: {
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 12px",
      borderRadius: 10,
      background: certDbStatus === "error" ? "#FEF2F2" : certDbStatus === "loading" ? "#FFFBEB" : "#F0FDF4",
      border: `1px solid ${certDbStatus === "error" ? "#FECACA" : certDbStatus === "loading" ? "#FDE68A" : "#BBF7D0"}`,
      color: certDbStatus === "error" ? T.danger : certDbStatus === "loading" ? "#B45309" : "#15803D",
      fontSize: 11,
      fontWeight: 700
    } }, /* @__PURE__ */ React.createElement("span", null, certDbStatus === "error" ? "\u26A0" : certDbStatus === "loading" ? "\u23F3" : "\u25CF"), /* @__PURE__ */ React.createElement("span", null, certDbStatus === "error" ? "\uBC1C\uAE09\uC774\uB825 DB \uB3D9\uAE30\uD654 \uC2E4\uD328" : certDbStatus === "loading" ? "\uBC1C\uAE09\uC774\uB825 DB \uD655\uC778 \uC911" : "\uBC1C\uAE09\uC774\uB825 Supabase \uB3D9\uAE30\uD654 \uC815\uC0C1"), certDbError && /* @__PURE__ */ React.createElement("span", { style: { color: T.mu, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, certDbError)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" } }, [
      { id: "cert", label: "\u{1F4CB} \uC218 \uB8CC \uC99D", sub: "\uCD9C\uC11D\uB960 80% \uC774\uC0C1" },
      { id: "attend", label: "\u{1F4C4} \uC218\uAC15\uC99D\uBA85\uC11C(\uACE0\uC6A9\uB178\uB3D9\uBD80)", sub: "\uC218\uAC15\uC790 \uC804\uCCB4" },
      { id: "parti", label: "\u{1F4C3} \uC218\uAC15\uC99D\uBA85\uC11C(\uC790\uCCB4)", sub: "\uCD5C\uC885 \uC120\uBC1C \uCC38\uC5EC\uC790" }
    ].map(({ id, label, sub }) => {
      const cnt = certHistory.filter((r) => r.docType === id).length;
      return /* @__PURE__ */ React.createElement("button", { key: id, onClick: () => setDocType(id), style: {
        padding: "10px 20px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: docType === id ? T.p : T.s2,
        color: docType === id ? "#fff" : T.mu,
        fontWeight: 700,
        fontSize: 13,
        transition: "all .15s",
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: docType === id ? T.p : T.bd,
        position: "relative"
      } }, label, /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 10,
        fontWeight: 400,
        marginTop: 2,
        color: docType === id ? "rgba(255,255,255,.7)" : T.mu
      } }, sub), cnt > 0 && /* @__PURE__ */ React.createElement("span", { style: {
        position: "absolute",
        top: -6,
        right: -6,
        background: docType === id ? "#fff" : T.p,
        color: docType === id ? T.p : "#fff",
        borderRadius: 99,
        fontSize: 9,
        fontWeight: 800,
        padding: "1px 5px",
        lineHeight: "16px",
        minWidth: 16,
        textAlign: "center"
      } }, cnt));
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" } }, courses.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, onClick: () => setCourse(c), style: {
      padding: "6px 12px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: "nowrap",
      background: course.id === c.id ? c.cc : T.s3,
      color: course.id === c.id ? "#fff" : T.mu
    } }, shortCourseName(c.name)))), /* @__PURE__ */ React.createElement(Card, { style: { padding: "14px 18px", marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, "\u{1F4C5} \uBC1C\uAE09\uC77C\uC790"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        value: customDate,
        onChange: (e) => {
          setCustomDate(e.target.value);
          setIssueDate(fmtDate(e.target.value));
        },
        style: {
          padding: "6px 10px",
          border: `1px solid ${T.bd}`,
          borderRadius: 8,
          fontSize: 12,
          outline: "none",
          background: T.s2,
          cursor: "pointer"
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.mu } }, "\u2192 ", /* @__PURE__ */ React.createElement("b", { style: { color: T.p } }, issueDate)), docType === "cert" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginLeft: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.tx } }, "\u{1F522} \uC77C\uAD04 \uC2DC\uC791\uBC88\uD638"), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: batchStartNo,
        onChange: (e) => setBatchStartNo(e.target.value.replace(/\D/g, "").slice(0, 6)),
        placeholder: getNextCertNo(docType),
        style: {
          width: 90,
          padding: "6px 8px",
          border: `1px solid ${T.bd}`,
          borderRadius: 8,
          fontSize: 12,
          outline: "none",
          background: "#fff",
          fontFamily: "monospace"
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", onClick: () => setShowHistory((v) => !v) }, "\u{1F4CB} \uBC1C\uAE09\uC774\uB825 ", issuedCountForType > 0 && `(${issuedCountForType}\uAC74)`), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: handleIssueAll }, /* @__PURE__ */ React.createElement(Icon, { n: "dl", s: 13 }), " \uC804\uCCB4 ", eligible.length, "\uBA85 ", docType === "cert" ? "\uC77C\uAD04\uC778\uC1C4" : "\uCD9C\uB825"))), docType === "attend" && /* @__PURE__ */ React.createElement(Card, { style: { padding: "14px 18px", marginBottom: 16, background: "#FFFBEB", border: `1px solid #FDE68A` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 10 } }, "\u{1F4CB} \u2465 \uC99D\uBA85\uB300\uC0C1\uAE30\uAC04 \uC218\uB3D9 \uC9C0\uC815 ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 400 } }, "\u2014 \uBE44\uC6CC\uB450\uBA74 \uC790\uB3D9 \uACC4\uC0B0 (\uCD5C\uCD08 \uCD9C\uC11D\uC77C ~ \uC624\uB298)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#92400E", fontWeight: 600 } }, "\uC2DC\uC791\uC77C"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        value: certOverrideStart,
        onChange: (e) => setCertOverrideStart(e.target.value),
        style: {
          padding: "5px 8px",
          border: `1px solid #FCD34D`,
          borderRadius: 7,
          fontSize: 12,
          outline: "none",
          background: "#fff"
        }
      }
    )), /* @__PURE__ */ React.createElement("span", { style: { color: "#92400E" } }, "~"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#92400E", fontWeight: 600 } }, "\uC885\uB8CC\uC77C"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        value: certOverrideEnd,
        onChange: (e) => setCertOverrideEnd(e.target.value),
        style: {
          padding: "5px 8px",
          border: `1px solid #FCD34D`,
          borderRadius: 7,
          fontSize: 12,
          outline: "none",
          background: "#fff"
        }
      }
    )), (certOverrideStart || certOverrideEnd) && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setCertOverrideStart("");
          setCertOverrideEnd("");
        },
        style: {
          padding: "4px 10px",
          borderRadius: 6,
          border: `1px solid #FCD34D`,
          background: "#FEF3C7",
          color: "#92400E",
          fontSize: 11,
          cursor: "pointer",
          fontWeight: 600
        }
      },
      "\uCD08\uAE30\uD654 (\uC790\uB3D9)"
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#B45309", marginLeft: 4 } }, "\u{1F4A1} \uC218\uAC15\uC99D\uBA85\uC11C \uBC1C\uAE09 \uCC3D\uC5D0\uC11C\uB3C4 \uC140 \uD074\uB9AD\uC73C\uB85C \uC9C1\uC811 \uC218\uC815 \uAC00\uB2A5\uD569\uB2C8\uB2E4"))), showHistory && /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "12px 18px",
      borderBottom: `1px solid ${T.bd}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: T.tx } }, "\u{1F4CB} \uBC1C\uAE09\uC774\uB825 \u2014 ", docType === "cert" ? "\uC218\uB8CC\uC99D" : docType === "parti" ? "\uC218\uAC15\uC99D\uBA85\uC11C(\uC790\uCCB4)" : "\uC218\uAC15\uC99D\uBA85\uC11C(\uACE0\uC6A9\uB178\uB3D9\uBD80)", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu, fontWeight: 400, marginLeft: 8 } }, "\uD604\uC7AC \uACFC\uC815: ", historyForCurrent.length, "\uAC74 / \uC804\uCCB4: ", issuedCountForType, "\uAC74")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, docType === "cert" && /* @__PURE__ */ React.createElement("button", { onClick: handleBatchRenumber, style: {
      fontSize: 11,
      padding: "4px 10px",
      borderRadius: 6,
      border: `1px solid #FCD34D`,
      background: "#FFFBEB",
      color: "#92400E",
      cursor: "pointer",
      fontWeight: 700
    } }, "\u{1F522} \uC77C\uAD04\uBC88\uD638 \uC218\uC815"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
      if (!window.confirm("\uD604\uC7AC \uBB38\uC11C \uC885\uB958\uC758 \uBC1C\uAE09\uC774\uB825\uC744 \uBAA8\uB450 \uCD08\uAE30\uD654\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) return;
      setCertHistory((prev) => {
        const next = prev.filter((r) => r.docType !== docType);
        saveCertHistory(next);
        addAudit?.("\uC99D\uBA85\uC11C \uC774\uB825 \uCD08\uAE30\uD654", `${DOC_TYPE_NAMES[docType] || docType}`, currentUser?.name);
        return next;
      });
      sbDelete("cert_issuances", `doc_type=eq.${encodeURIComponent(docType)}`).then(({ error }) => {
        if (error) {
          setCertDbStatus("error");
          setCertDbError(error.message || JSON.stringify(error));
          alert("\uB85C\uCEEC \uC774\uB825\uC740 \uCD08\uAE30\uD654\uD588\uC9C0\uB9CC Supabase \uC774\uB825 \uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.\n\uB2E4\uB978 PC\uC5D0\uB294 \uAE30\uC874 \uC774\uB825\uC774 \uB0A8\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.\n\n" + (error.message || JSON.stringify(error)));
        }
      }).catch((e) => {
        setCertDbStatus("error");
        setCertDbError(e.message || String(e));
      });
    }, style: {
      fontSize: 11,
      padding: "4px 10px",
      borderRadius: 6,
      border: `1px solid ${T.bd}`,
      background: "#FEF2F2",
      color: T.danger,
      cursor: "pointer",
      fontWeight: 600
    } }, "\u{1F5D1} \uC774\uB825 \uCD08\uAE30\uD654"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowHistory(false), style: {
      fontSize: 11,
      padding: "4px 10px",
      borderRadius: 6,
      border: `1px solid ${T.bd}`,
      background: T.s2,
      color: T.mu,
      cursor: "pointer"
    } }, "\uB2EB\uAE30"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 16px", borderBottom: `1px solid ${T.bd}`, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", background: T.s2 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: historyFilter.q,
        onChange: (e) => setHistoryFilter((f) => ({ ...f, q: e.target.value })),
        placeholder: "\uAC80\uC0C9 (\uC774\uB984/\uBB38\uC11C\uBC88\uD638/\uACFC\uC815/\uC0AC\uC720/\uBA54\uBAA8)",
        style: {
          padding: "6px 10px",
          border: `1px solid ${T.bd}`,
          borderRadius: 8,
          fontSize: 11,
          minWidth: 180,
          flex: 1,
          background: "#fff"
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: historyFilter.status,
        onChange: (e) => setHistoryFilter((f) => ({ ...f, status: e.target.value })),
        style: { padding: "6px 10px", border: `1px solid ${T.bd}`, borderRadius: 8, fontSize: 11 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "all" }, "\uC804\uCCB4\uC0C1\uD0DC"),
      /* @__PURE__ */ React.createElement("option", { value: "\uC815\uC0C1" }, "\uC815\uC0C1"),
      /* @__PURE__ */ React.createElement("option", { value: "\uCDE8\uC18C" }, "\uCDE8\uC18C")
    ), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: historyFilter.courseId,
        onChange: (e) => setHistoryFilter((f) => ({ ...f, courseId: e.target.value })),
        style: { padding: "6px 10px", border: `1px solid ${T.bd}`, borderRadius: 8, fontSize: 11 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "all" }, "\uC804\uCCB4\uACFC\uC815"),
      courses.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: String(c.id) }, shortCourseName(c.name)))
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        value: historyFilter.from,
        onChange: (e) => setHistoryFilter((f) => ({ ...f, from: e.target.value })),
        style: { padding: "6px 10px", border: `1px solid ${T.bd}`, borderRadius: 8, fontSize: 11 }
      }
    ), /* @__PURE__ */ React.createElement("span", { style: { color: T.mu, fontSize: 11 } }, "~"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        value: historyFilter.to,
        onChange: (e) => setHistoryFilter((f) => ({ ...f, to: e.target.value })),
        style: { padding: "6px 10px", border: `1px solid ${T.bd}`, borderRadius: 8, fontSize: 11 }
      }
    ), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: historyFilter.sort,
        onChange: (e) => setHistoryFilter((f) => ({ ...f, sort: e.target.value })),
        style: { padding: "6px 10px", border: `1px solid ${T.bd}`, borderRadius: 8, fontSize: 11 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "issuedAtDesc" }, "\uCD5C\uC2E0\uC21C"),
      /* @__PURE__ */ React.createElement("option", { value: "issuedAtAsc" }, "\uC624\uB798\uB41C\uC21C"),
      /* @__PURE__ */ React.createElement("option", { value: "nameAsc" }, "\uC774\uB984\uC21C"),
      /* @__PURE__ */ React.createElement("option", { value: "noAsc" }, "\uBB38\uC11C\uBC88\uD638\uC21C")
    )), filteredHistory.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "28px 0", textAlign: "center", fontSize: 13, color: T.mu } }, "\uBC1C\uAE09\uC774\uB825\uC774 \uC5C6\uC2B5\uB2C8\uB2E4 (\uD544\uD130 \uACB0\uACFC 0\uAC74)") : /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2 } }, ["\uBB38\uC11C\uBC88\uD638", "\uC774\uB984", "\uACFC\uC815\uBA85", "\uC0C1\uD0DC", "\uBC1C\uAE09\uC0AC\uC720", "\uCC44\uB110", "\uBC1C\uAE09\uC77C\uC790", "\uBC1C\uAE09\uC2DC\uAC01", "\uCD9C\uB825\uC774\uB825", "\uAD00\uB9AC"].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "8px 14px",
      textAlign: "center",
      fontSize: 11,
      color: T.mu,
      fontWeight: 700,
      borderBottom: `1px solid ${T.bd}`
    } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, filteredHistory.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.id, className: "row-hover", style: { borderBottom: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("td", { style: {
      padding: "9px 14px",
      textAlign: "center",
      fontFamily: "monospace",
      fontSize: 11,
      fontWeight: 700,
      color: T.p
    } }, r.fullNo), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 14px", textAlign: "center", fontSize: 12, fontWeight: 700, color: T.tx } }, r.studentName), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 14px", textAlign: "center", fontSize: 11, color: T.mu } }, r.courseName), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 14px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(Chip, { label: r.issueStatus, bg: r.issueStatus === "\uCDE8\uC18C" ? "#FEE2E2" : "#DCFCE7", color: r.issueStatus === "\uCDE8\uC18C" ? "#B91C1C" : "#15803D" })), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 14px", textAlign: "center", fontSize: 11, color: T.mu } }, r.issueReason), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 14px", textAlign: "center", fontSize: 11, color: T.mu } }, r.issueChannel), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 14px", textAlign: "center", fontSize: 11, color: T.mu } }, r.issueDate), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 14px", textAlign: "center", fontSize: 10, color: T.mu } }, new Date(r.issuedAt).toLocaleString("ko-KR")), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 10px", textAlign: "center", fontSize: 10, color: T.mu } }, "\u{1F5A8} ", r.printCount || 0, " \xB7 PDF ", r.pdfCount || 0, " \xB7 \uC774\uBBF8\uC9C0 ", r.imageCount || 0), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 8px", textAlign: "center", whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setSelectedHistory(r);
          setMemoDraft(r.adminMemo || "");
        },
        style: { fontSize: 10, padding: "3px 8px", borderRadius: 6, border: `1px solid ${T.bd}`, background: "#fff", color: T.p, cursor: "pointer", marginRight: 6 }
      },
      "\uC0C1\uC138"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleToggleCancel(r),
        disabled: historyBusyId === r.id,
        style: {
          fontSize: 10,
          padding: "3px 8px",
          borderRadius: 6,
          border: `1px solid ${r.issueStatus === "\uCDE8\uC18C" ? "#86EFAC" : "#FECACA"}`,
          background: r.issueStatus === "\uCDE8\uC18C" ? "#ECFDF5" : "#FEF2F2",
          color: r.issueStatus === "\uCDE8\uC18C" ? "#166534" : "#B91C1C",
          cursor: "pointer"
        }
      },
      r.issueStatus === "\uCDE8\uC18C" ? "\uBCF5\uAD6C" : "\uCDE8\uC18C"
    ))))))), selectedHistory && /* @__PURE__ */ React.createElement(
      "div",
      {
        style: { position: "fixed", inset: 0, zIndex: 2200, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center" },
        onClick: () => setSelectedHistory(null)
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: { width: 560, maxWidth: "96vw", maxHeight: "82vh", overflow: "auto", background: T.s, borderRadius: 16, border: `1px solid ${T.bd}` },
          onClick: (e) => e.stopPropagation()
        },
        /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 18px", borderBottom: `1px solid ${T.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.tx } }, "\u{1F4D1} \uBC1C\uAE09 \uC0C1\uC138"), /* @__PURE__ */ React.createElement("button", { onClick: () => setSelectedHistory(null), style: { border: "none", background: "transparent", color: T.mu, cursor: "pointer", fontSize: 14 } }, "\u2715")),
        /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, [
          ["\uBB38\uC11C\uBC88\uD638", selectedHistory.fullNo],
          ["\uC774\uB984", selectedHistory.studentName],
          ["\uACFC\uC815\uBA85", selectedHistory.courseName],
          ["\uC0C1\uD0DC", selectedHistory.issueStatus],
          ["\uBC1C\uAE09\uC0AC\uC720", selectedHistory.issueReason],
          ["\uBC1C\uAE09\uCC44\uB110", selectedHistory.issueChannel],
          ["\uC218\uB8CC\uAE30\uC900\uC0C1\uD0DC", selectedHistory.completionStatus],
          ["\uCD9C\uC11D\uB960", `${selectedHistory.attendanceRate || 0}%`],
          ["\uBC1C\uAE09\uC790", selectedHistory.issuedBy],
          ["\uBC1C\uAE09\uC77C\uC2DC", new Date(selectedHistory.issuedAt).toLocaleString("ko-KR")],
          ["\uCDE8\uC18C\uC790", selectedHistory.cancelledBy || "-"],
          ["\uCDE8\uC18C\uC0AC\uC720", selectedHistory.cancelReason || "-"]
        ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { border: `1px solid ${T.bd}`, borderRadius: 8, padding: "8px 10px", background: T.s2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 3 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.tx, fontWeight: 600, wordBreak: "break-all" } }, v || "-")))),
        /* @__PURE__ */ React.createElement("div", { style: { padding: "0 18px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: T.mu, marginBottom: 6 } }, "\uAD00\uB9AC\uC790 \uBA54\uBAA8"), /* @__PURE__ */ React.createElement(
          "textarea",
          {
            value: memoDraft,
            onChange: (e) => setMemoDraft(e.target.value),
            style: { width: "100%", minHeight: 72, border: `1px solid ${T.bd}`, borderRadius: 8, padding: "8px 10px", fontSize: 12, resize: "vertical", fontFamily: "inherit" }
          }
        ), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: handleSaveMemo, style: { fontSize: 11, fontWeight: 700, color: "#fff", background: T.p, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" } }, "\uBA54\uBAA8 \uC800\uC7A5")))
      )
    ), /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "12px 18px",
      borderBottom: `1px solid ${T.bd}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: T.tx } }, docType === "cert" ? "\uC218\uB8CC \uB300\uC0C1\uC790" : docType === "parti" ? "\uC218\uAC15\uC99D\uBA85\uC11C \uB300\uC0C1\uC790(\uC790\uCCB4)" : "\uC218\uAC15 \uB300\uC0C1\uC790"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: T.mu, marginLeft: 8 } }, eligible.length, "\uBA85", docType === "cert" && /* @__PURE__ */ React.createElement(React.Fragment, null, " ", "/ \uBAA9\uD45C ", course.cGoal, "\uBA85", eligible.length >= course.cGoal ? /* @__PURE__ */ React.createElement("span", { style: { color: T.ok, fontWeight: 700, marginLeft: 6 } }, "\u2713 \uBAA9\uD45C \uB2EC\uC131") : /* @__PURE__ */ React.createElement("span", { style: { color: T.danger, fontWeight: 700, marginLeft: 6 } }, "(", course.cGoal - eligible.length, "\uBA85 \uBD80\uC871)")))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, "\uB2E4\uC74C \uBC1C\uAE09\uBC88\uD638: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.p, fontFamily: "monospace" } }, "2026-", docSeries(docType), "-", getNextCertNo(docType), "\uD638"))), /* @__PURE__ */ React.createElement("div", { style: {
      padding: "10px 18px",
      background: "#FFFBEB",
      borderBottom: `1px solid #FDE68A`,
      fontSize: 11,
      color: "#92400E",
      display: "flex",
      gap: 8,
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "info", s: 13 }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "PDF \uC800\uC7A5:"), " \uBC1C\uAE09 \uBC84\uD2BC \u2192 \uC0C8 \uCC3D \u2192 \u{1F5A8}\uFE0F \uD074\uB9AD \u2192 \uD504\uB9B0\uD130\uB97C ", /* @__PURE__ */ React.createElement("b", null, "\u300CPDF\uB85C \uC800\uC7A5\u300D"), " \uC120\uD0DD \xB7 \uC11C\uBA85\uB780: ", /* @__PURE__ */ React.createElement("b", null, "\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uB300\uD45C\uC774\uC0AC (\uC778)"))), /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: T.s2 } }, [
      { h: "\uBC88\uD638", w: 50 },
      { h: "\uC774\uB984", w: "auto" },
      { h: "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638", w: 130 },
      { h: "\uCD9C\uC11D\uB960", w: 80 },
      { h: "\uBB38\uC11C\uBC88\uD638", w: 180 },
      { h: "\uBC1C\uAE09\uC5EC\uBD80", w: 90 },
      { h: "", w: 130 }
    ].map(({ h, w }) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "10px 14px",
      textAlign: h === "\uC774\uB984" ? "left" : "center",
      fontSize: 11,
      color: T.mu,
      fontWeight: 700,
      borderBottom: `1px solid ${T.bd}`,
      width: w
    } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, eligible.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { padding: "40px 0", textAlign: "center", fontSize: 13, color: T.mu } }, docType === "cert" ? "\uC218\uB8CC \uB300\uC0C1\uC790(\uCD9C\uC11D\uB960 80% \uC774\uC0C1)\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4" : "\uC218\uAC15\uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4")), eligible.map((s, idx) => {
      const issuedKey = String(s.id) + docType + String(course.id);
      const cert = issued[issuedKey];
      const no = getCertNo(s);
      const fullNo = `2026-${docSeries(docType)}-${no}\uD638`;
      return /* @__PURE__ */ React.createElement("tr", { key: s.id, className: "row-hover", style: { borderBottom: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 14px", textAlign: "center", fontSize: 12, color: T.mu } }, idx + 1), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        background: `${T.p}15`,
        color: T.p,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 800,
        flexShrink: 0
      } }, s.name[0]), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: T.tx } }, s.name))), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 14px", textAlign: "center", fontSize: 11, color: T.mu, fontFamily: "monospace" } }, (() => {
        const b = (s.birth || "").replace(/-/g, "");
        const front = b.length >= 8 ? b.slice(2, 4) + b.slice(4, 6) + b.slice(6, 8) : "------";
        const back = s.idBack ? s.idBack[0] + "______" : "-------";
        return `${front}-${back}`;
      })()), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 14px", textAlign: "center" } }, isDropoutStudent(s) ? /* @__PURE__ */ React.createElement(Chip, { label: "\uC911\uB3C4\uD0C8\uB77D", bg: "#FEE2E2", color: T.danger, size: 10 }) : /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 14,
        fontWeight: 800,
        color: s.rate >= 80 ? T.ok : s.rate >= 60 ? T.warn : T.danger
      } }, s.rate, "%")), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 14px", textAlign: "center", fontSize: 11, fontFamily: "monospace" } }, cert ? /* @__PURE__ */ React.createElement("span", { style: { color: T.p, fontWeight: 700 } }, fullNo) : /* @__PURE__ */ React.createElement("span", { style: { color: T.bd } }, "\uBBF8\uBC1C\uAE09 (\uC608\uC815: ", fullNo, ")")), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 14px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(Chip, { label: cert ? "\uBC1C\uAE09\uC644\uB8CC" : "\uBBF8\uBC1C\uAE09", bg: cert ? T.pbg : T.s3, color: cert ? T.p : T.mu }), cert && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: T.mu, marginTop: 2 } }, cert.date)), /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 14px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: cert ? "ghost" : "primary", onClick: () => handleIssue(s) }, /* @__PURE__ */ React.createElement(Icon, { n: "dl", s: 12 }), cert ? "\uC7AC\uCD9C\uB825" : "PDF \uBC1C\uAE09")));
    })))));
  };
  const FLD = ({ label, required, children }) => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, label, required && /* @__PURE__ */ React.createElement("span", { style: { color: T.danger, marginLeft: 2 } }, "*")), children);
  const PrintPreviewModal = ({ isOpen, onClose, docHtml, docType, orientation = "portrait", meta = {} }) => {
    const [zoom, setZoom] = useState(100);
    const [exporting, setExporting] = useState(false);
    const iframeRef = useRef(null);
    if (!isOpen || !docHtml) return null;
    const pageW = orientation === "portrait" ? 210 : 297;
    const pageH = orientation === "portrait" ? 297 : 210;
    const scale = zoom / 100;
    const handlePrint = () => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) return;
      iframeRef.current.contentWindow.print();
      if (meta?.certIssueId) {
        window.dispatchEvent(new CustomEvent("cert-print-action", { detail: { ...meta, action: "print" } }));
      }
    };
    const handlePDF = async () => {
      if (!iframeRef.current) return;
      setExporting(true);
      try {
        const el = iframeRef.current.contentDocument?.body?.firstElementChild;
        if (el) {
          const fname = generatePrintFilename(docType, "", "", "pdf");
          await generatePDF(el, { orientation, filename: fname });
          if (meta?.certIssueId) {
            window.dispatchEvent(new CustomEvent("cert-print-action", { detail: { ...meta, action: "pdf" } }));
          }
        }
      } catch (err) {
        alert("PDF \uC0DD\uC131 \uC624\uB958: " + err.message);
      }
      setExporting(false);
    };
    const handleImage = async () => {
      if (!iframeRef.current) return;
      setExporting(true);
      try {
        const el = iframeRef.current.contentDocument?.body?.firstElementChild;
        if (!el) {
          setExporting(false);
          return;
        }
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff"
        });
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = generatePrintFilename(docType, "", "", "png");
        a.click();
        if (meta?.certIssueId) {
          window.dispatchEvent(new CustomEvent("cert-print-action", { detail: { ...meta, action: "image" } }));
        }
      } catch (err) {
        alert("\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC624\uB958: " + err.message);
      }
      setExporting(false);
    };
    return /* @__PURE__ */ React.createElement("div", { style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.7)",
      zIndex: 2e3,
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      padding: "10px 20px",
      background: "#1E293B",
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexShrink: 0,
      flexWrap: "wrap"
    } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#fff", fontWeight: 800, fontSize: 14 } }, "\u{1F5A8}\uFE0F \uBBF8\uB9AC\uBCF4\uAE30"), /* @__PURE__ */ React.createElement("span", { style: { color: "#94A3B8", fontSize: 11 } }, DOC_TYPE_NAMES[docType] || docType), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setZoom((z) => clampZoom(z - ZOOM_STEP)),
        style: {
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "none",
          background: "#334155",
          color: "#fff",
          cursor: "pointer",
          fontSize: 14
        }
      },
      "\u2212"
    ), /* @__PURE__ */ React.createElement("span", { style: { color: "#fff", fontSize: 12, minWidth: 40, textAlign: "center" } }, zoom, "%"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setZoom((z) => clampZoom(z + ZOOM_STEP)),
        style: {
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "none",
          background: "#334155",
          color: "#fff",
          cursor: "pointer",
          fontSize: 14
        }
      },
      "+"
    ), /* @__PURE__ */ React.createElement("div", { style: { width: 1, height: 20, background: "#475569", margin: "0 4px" } }), /* @__PURE__ */ React.createElement("button", { onClick: handlePrint, style: {
      padding: "6px 14px",
      borderRadius: 7,
      border: "none",
      background: "#2563EB",
      color: "#fff",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700
    } }, "\u{1F5A8}\uFE0F \uC778\uC1C4"), /* @__PURE__ */ React.createElement("button", { onClick: handlePDF, disabled: exporting, style: {
      padding: "6px 14px",
      borderRadius: 7,
      border: "none",
      background: "#EA580C",
      color: "#fff",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700,
      opacity: exporting ? 0.5 : 1
    } }, "\u{1F4C4} ", exporting ? "\uC0DD\uC131\uC911\u2026" : "PDF"), /* @__PURE__ */ React.createElement("button", { onClick: handleImage, disabled: exporting, style: {
      padding: "6px 14px",
      borderRadius: 7,
      border: "none",
      background: "#059669",
      color: "#fff",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700
    } }, "\u{1F5BC}\uFE0F \uC774\uBBF8\uC9C0"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
      padding: "6px 14px",
      borderRadius: 7,
      border: "1px solid #475569",
      background: "transparent",
      color: "#94A3B8",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700
    } }, "\u2715 \uB2EB\uAE30"))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflow: "auto", padding: 20, display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { transformOrigin: "top center", transform: `scale(${scale})` } }, /* @__PURE__ */ React.createElement(
      "iframe",
      {
        ref: iframeRef,
        srcDoc: docHtml,
        style: {
          border: "none",
          width: `${pageW * MM_TO_PX}px`,
          height: `${pageH * MM_TO_PX}px`,
          boxShadow: "0 8px 40px rgba(0,0,0,.4)",
          borderRadius: 4,
          background: "#fff"
        }
      }
    ))));
  };
  const StatusChangeDialog = ({ student, course, onStatusChanged, onClose, currentUser }) => {
    const currentStatus = student.enrollmentStatus || "\uC7AC\uD559\uC911";
    const allowedStatuses = VALID_TRANSITIONS[currentStatus] || [];
    const [newStatus, setNewStatus] = useState(allowedStatuses[0] || "");
    const [changeDate, setChangeDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const [dropoutReason, setDropoutReason] = useState("\uAC1C\uC778\uC0AC\uC720");
    const [reasonDetail, setReasonDetail] = useState("");
    const [employerName, setEmployerName] = useState(student.employerName || "");
    const [warning, setWarning] = useState("");
    const [saving, setSaving] = useState(false);
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    const handleSubmit = async () => {
      if (!newStatus) {
        setWarning("\uBCC0\uACBD\uD560 \uC0C1\uD0DC\uB97C \uC120\uD0DD\uD558\uC138\uC694.");
        return;
      }
      if ((newStatus === "\uC218\uB8CC" || newStatus === "\uC218\uB8CC\uC608\uC815") && student.rate < 80) {
        if (!window.confirm(`\uCD9C\uC11D\uB960\uC774 ${student.rate}%\uB85C 80% \uBBF8\uB9CC\uC785\uB2C8\uB2E4. \uACC4\uC18D \uBCC0\uACBD\uD560\uAE4C\uC694?`)) return;
      }
      setSaving(true);
      setWarning("");
      try {
        const result = await changeEnrollmentStatus({
          studentId: student.id,
          courseId: course.id,
          newStatus,
          changeDate,
          dropoutReason: newStatus === "\uC911\uB3C4\uD0C8\uB77D" ? dropoutReason : null,
          reasonDetail: newStatus === "\uC911\uB3C4\uD0C8\uB77D" && dropoutReason === "\uAE30\uD0C0" ? reasonDetail : null,
          employerName: newStatus === "\uC870\uAE30\uCDE8\uC5C5" ? employerName : null,
          changedBy: currentUser?.name || "\uC2DC\uC2A4\uD15C"
        });
        if (result.warning && !window.confirm(result.warning)) {
          setSaving(false);
          return;
        }
        alert(`\u2705 ${student.name}\uC758 \uC0C1\uD0DC\uAC00 ${currentStatus} \u2192 ${newStatus}\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`);
        onStatusChanged();
        onClose();
      } catch (err) {
        setWarning(err.message);
      }
      setSaving(false);
    };
    const sc = STATUS_COLORS[currentStatus] || {};
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "modal-backdrop",
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.55)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 16,
        width: 440,
        maxWidth: "96vw",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,#1E293B,#334155)`,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff" } }, "\uB4F1\uB85D \uC0C1\uD0DC \uBCC0\uACBD"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 2 } }, student.name)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16
      } }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 4 } }, "\uD604\uC7AC \uC0C1\uD0DC"), /* @__PURE__ */ React.createElement("span", { style: {
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: sc.bg || T.s3,
        color: sc.color || T.tx
      } }, currentStatus)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 4 } }, "\uCD9C\uC11D\uB960"), isDropoutStudent(student) ? /* @__PURE__ */ React.createElement(Chip, { label: "\uC911\uB3C4\uD0C8\uB77D", bg: "#FEE2E2", color: T.danger, size: 10 }) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: student.rate >= 80 ? T.ok : T.danger } }, student.rate || 0, "%")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 4 } }, "\uB204\uC801\uC2DC\uAC04"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: T.tx } }, (student.accumulatedHours || 0).toFixed(1), "h"))), allowedStatuses.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: {
        padding: "12px 16px",
        background: "#FEF2F2",
        borderRadius: 8,
        fontSize: 12,
        color: "#DC2626"
      } }, "\uD604\uC7AC \uC0C1\uD0DC\uC5D0\uC11C\uB294 \uB354 \uC774\uC0C1 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uBCC0\uACBD\uD560 \uC0C1\uD0DC ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, allowedStatuses.map((st) => {
        const sc2 = STATUS_COLORS[st] || {};
        return /* @__PURE__ */ React.createElement("button", { key: st, onClick: () => setNewStatus(st), style: {
          padding: "6px 14px",
          borderRadius: 20,
          border: `2px solid ${newStatus === st ? sc2.color || T.p : T.bd}`,
          background: newStatus === st ? sc2.bg || T.pbg : T.s2,
          color: newStatus === st ? sc2.color || T.p : T.mu,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 12,
          transition: "all .15s"
        } }, st);
      }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uBCC0\uACBD\uC77C ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement("input", { type: "date", value: changeDate, onChange: (e) => setChangeDate(e.target.value), style: inp })), newStatus === "\uC911\uB3C4\uD0C8\uB77D" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uD0C8\uB77D \uC0AC\uC720 ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement("select", { value: dropoutReason, onChange: (e) => setDropoutReason(e.target.value), style: inp }, DROPOUT_REASONS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r, value: r }, r)))), dropoutReason === "\uAE30\uD0C0" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uAE30\uD0C0 \uC0AC\uC720 \uC0C1\uC138 ", /* @__PURE__ */ React.createElement("span", { style: { color: T.danger } }, "*")), /* @__PURE__ */ React.createElement(
        "input",
        {
          value: reasonDetail,
          onChange: (e) => setReasonDetail(e.target.value),
          placeholder: "\uC0AC\uC720\uB97C \uC785\uB825\uD558\uC138\uC694",
          style: inp
        }
      ))), newStatus === "\uC870\uAE30\uCDE8\uC5C5" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 5 } }, "\uCDE8\uC5C5 \uAE30\uC5C5\uBA85"), /* @__PURE__ */ React.createElement(
        "input",
        {
          value: employerName,
          onChange: (e) => setEmployerName(e.target.value),
          placeholder: "\uAE30\uC5C5\uBA85 \uC785\uB825",
          style: inp
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.ok, marginTop: 5, fontWeight: 700 } }, "\uC800\uC7A5\uD558\uBA74 \uCDE8\uC5C5\uC5EC\uBD80\uAC00 \uC790\uB3D9\uC73C\uB85C '\uCDE8\uC5C5' \uCC98\uB9AC\uB429\uB2C8\uB2E4.")), warning && /* @__PURE__ */ React.createElement("div", { style: {
        padding: "10px 14px",
        background: "#FEF2F2",
        borderRadius: 8,
        fontSize: 12,
        color: "#DC2626"
      } }, "\u26A0\uFE0F ", warning), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 } }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        padding: "8px 18px",
        borderRadius: 8,
        border: `1px solid ${T.bd}`,
        background: T.s2,
        color: T.mu,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600
      } }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement("button", { onClick: handleSubmit, disabled: saving || !newStatus, style: {
        padding: "8px 18px",
        borderRadius: 8,
        border: "none",
        background: saving || !newStatus ? "#CBD5E1" : T.p,
        color: "#fff",
        cursor: saving || !newStatus ? "not-allowed" : "pointer",
        fontSize: 12,
        fontWeight: 700
      } }, saving ? "\uC800\uC7A5 \uC911\u2026" : "\uC0C1\uD0DC \uBCC0\uACBD")))))
    );
  };
  const EmploymentQuickDialog = ({ student, onSave, onClose }) => {
    const initialStatus = getEffectiveEmploymentStatus(student);
    const [status, setStatus] = useState(initialStatus);
    const [employerName, setEmployerName] = useState(student.employerName || "");
    const [saving, setSaving] = useState(false);
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    const ec = employmentChipStyle(status);
    const isEarly = (student.enrollmentStatus || "") === "\uC870\uAE30\uCDE8\uC5C5";
    const submit = async () => {
      setSaving(true);
      try {
        await onSave({
          ...student,
          status,
          employerName: ["\uCDE8\uC5C5", "\uCDE8\uC5C5\uC608\uC815"].includes(status) ? employerName : ""
        });
        onClose();
      } finally {
        setSaving(false);
      }
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "modal-backdrop",
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 1250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 16,
        width: 420,
        maxWidth: "96vw",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        padding: "15px 18px",
        background: `linear-gradient(135deg,#0F766E,#0369A1)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: "#fff", fontWeight: 900 } }, "\uCDE8\uC5C5\uC815\uBCF4 \uBE60\uB978 \uC218\uC815"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2 } }, student.name)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        fontSize: 16
      } }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 20px", display: "flex", flexDirection: "column", gap: 13 } }, isEarly && /* @__PURE__ */ React.createElement("div", { style: {
        padding: "10px 12px",
        borderRadius: 8,
        background: "#F0FDF4",
        border: "1px solid #BBF7D0",
        color: "#166534",
        fontSize: 12,
        fontWeight: 700
      } }, "\uC870\uAE30\uCDE8\uC5C5 \uC0C1\uD0DC\uC774\uBBC0\uB85C \uCDE8\uC5C5\uC5EC\uBD80\uB294 \uAE30\uBCF8\uC801\uC73C\uB85C '\uCDE8\uC5C5'\uC73C\uB85C \uAD00\uB9AC\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: T.mu, marginBottom: 6 } }, "\uCDE8\uC5C5\uC5EC\uBD80"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, EMPLOYMENT_STATUSES.map((v) => {
        const c = employmentChipStyle(v);
        const active = status === v;
        return /* @__PURE__ */ React.createElement("button", { key: v, onClick: () => setStatus(v), style: {
          padding: "6px 11px",
          borderRadius: 999,
          border: `2px solid ${active ? c.color : T.bd}`,
          background: active ? c.bg : T.s2,
          color: active ? c.color : T.mu,
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer"
        } }, v);
      }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: T.mu, marginBottom: 6 } }, "\uCDE8\uC5C5 \uAE30\uC5C5\uBA85"), /* @__PURE__ */ React.createElement(
        "input",
        {
          value: employerName,
          onChange: (e) => setEmployerName(e.target.value),
          placeholder: "\uAE30\uC5C5\uBA85 \uB610\uB294 \uCDE8\uC5C5\uCC98",
          style: inp
        }
      )), /* @__PURE__ */ React.createElement("div", { style: { border: `1px solid ${T.bd}`, background: T.s2, borderRadius: 8, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 4 } }, "\uC800\uC7A5 \uD6C4 \uD45C\uC2DC"), /* @__PURE__ */ React.createElement("span", { style: {
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        background: ec.bg,
        color: ec.color,
        fontSize: 11,
        fontWeight: 900
      } }, status), employerName && /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 8, fontSize: 12, color: T.tx, fontWeight: 700 } }, employerName))), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "12px 20px",
        borderTop: `1px solid ${T.bd}`,
        background: T.s2,
        display: "flex",
        justifyContent: "flex-end",
        gap: 8
      } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { onClick: submit, disabled: saving }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), " ", saving ? "\uC800\uC7A5 \uC911\u2026" : "\uC800\uC7A5")))
    );
  };
  const EditModal = ({ student, onSave, onClose, isNew = false, courses = COURSES }) => {
    const empty = {
      cid: courses[0]?.id || 1,
      name: "",
      gender: "\uB0A8",
      birth: "",
      idBack: "",
      addrCity: "\uC758\uC815\uBD80\uC2DC",
      phone: "",
      status: "\uBBF8\uCDE8\uC5C5",
      itvDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      itvScore: "",
      itvGrade: "B",
      itvPass: true,
      memo: "",
      rate: 0
    };
    const [form, setForm] = useState(student ? { ...student } : empty);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const [residentInput, setResidentInput] = useState("");
    useEffect(() => {
      const b = (form.birth || "").replace(/-/g, "");
      const front6 = b.length >= 8 ? b.slice(2, 4) + b.slice(4, 6) + b.slice(6, 8) : "";
      setResidentInput(front6 ? `${front6}${form.idBack ? `-${form.idBack}` : ""}` : "");
    }, []);
    const age = (() => {
      if (!form.birth) return "";
      const b = new Date(form.birth), t = /* @__PURE__ */ new Date();
      let a = t.getFullYear() - b.getFullYear();
      if (t.getMonth() < b.getMonth() || t.getMonth() === b.getMonth() && t.getDate() < b.getDate()) a--;
      return isNaN(a) ? "" : `\uB9CC ${a}\uC138`;
    })();
    const gradeColor = (g) => g?.startsWith("A") ? T.ok : g?.startsWith("B") ? T.warn : T.danger;
    const selStyle = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      background: T.s2,
      color: T.tx,
      cursor: "pointer"
    };
    const inpStyle = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    const divider = (label) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, margin: "4px 0 0" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: T.p } }, label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 1, background: T.bd } }));
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "modal-backdrop",
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "modal-sheet", style: {
        background: T.s,
        borderRadius: 16,
        width: 520,
        maxWidth: "96vw",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,${T.sb},${T.p})`,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff" } }, isNew ? "\uC2E0\uADDC \uD6C8\uB828\uC0DD \uBA74\uC811 \uB4F1\uB85D" : `\uC815\uBCF4 \uC218\uC815 \u2014 ${student.name}`), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 2 } }, isNew ? "\uBA74\uC811 \uC2DC \uD655\uC778 \uD56D\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694" : age)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 } }, divider("\uAE30\uBCF8 \uC2E0\uC6D0"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uC774\uB984", required: true }, /* @__PURE__ */ React.createElement("input", { value: form.name || "", onChange: (e) => set("name", e.target.value), placeholder: "\uD64D\uAE38\uB3D9", style: inpStyle })), /* @__PURE__ */ React.createElement(FLD, { label: "\uC131\uBCC4" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, height: 36 } }, ["\uB0A8", "\uC5EC"].map((g) => /* @__PURE__ */ React.createElement("button", { key: g, type: "button", onClick: () => set("gender", g), style: {
        flex: 1,
        border: "none",
        borderRadius: 7,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
        background: form.gender === g ? g === "\uB0A8" ? "#EFF6FF" : "#FDF2F8" : T.s3,
        color: form.gender === g ? g === "\uB0A8" ? "#1D4ED8" : "#BE185D" : T.mu
      } }, g)))), /* @__PURE__ */ React.createElement(FLD, { label: "\uACFC\uC815" }, /* @__PURE__ */ React.createElement("select", { value: form.cid, onChange: (e) => set("cid", +e.target.value), style: selStyle }, courses.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.code, " \u2014 ", c.name))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638", required: true }, /* @__PURE__ */ React.createElement(
        "input",
        {
          value: residentInput,
          onChange: (e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            let display = raw.slice(0, 13);
            if (display.length > 6) display = display.slice(0, 6) + "-" + display.slice(6);
            setResidentInput(display);
            const front6 = raw.slice(0, 6);
            const back7 = raw.slice(6, 13);
            if (front6.length === 6) {
              const yy = front6.slice(0, 2), mm = front6.slice(2, 4), dd = front6.slice(4, 6);
              const f1 = back7[0] || "";
              const yyyy = f1 === "3" || f1 === "4" || f1 === "7" || f1 === "8" ? `20${yy}` : `19${yy}`;
              const candidate = `${yyyy}-${mm}-${dd}`;
              const d = new Date(candidate);
              if (!isNaN(d.getTime()) && d.getFullYear() === +yyyy && d.getMonth() === +mm - 1 && d.getDate() === +dd) {
                set("birth", candidate);
              }
            }
            if (back7) set("idBack", back7);
          },
          placeholder: "YYMMDD-XXXXXXX  (\uC55E 6\uC790\uB9AC + \uB4A4 7\uC790\uB9AC, \uCD1D 13\uC790\uB9AC)",
          maxLength: 14,
          style: { ...inpStyle, letterSpacing: "3px", fontFamily: "monospace" }
        }
      ), form.birth && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginTop: 4, paddingLeft: 2 } }, "\u{1F4C5} \uC790\uB3D9\uACC4\uC0B0 \u2014 \uC0DD\uB144\uC6D4\uC77C: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, form.birth), "\u3000\xB7\u3000", age))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uC5F0\uB77D\uCC98" }, /* @__PURE__ */ React.createElement("input", { value: form.phone || "", onChange: (e) => set("phone", e.target.value), placeholder: "010-0000-0000", style: inpStyle })), /* @__PURE__ */ React.createElement(FLD, { label: "\uAC70\uC8FC \uC2DC\xB7\uAD70" }, /* @__PURE__ */ React.createElement("select", { value: form.addrCity || "\uC758\uC815\uBD80\uC2DC", onChange: (e) => set("addrCity", e.target.value), style: selStyle }, ["\uC758\uC815\uBD80\uC2DC", "\uC591\uC8FC\uC2DC", "\uD3EC\uCC9C\uC2DC", "\uB3D9\uB450\uCC9C\uC2DC", "\uC5F0\uCC9C\uAD70", "\uAC00\uD3C9\uAD70", "\uB0A8\uC591\uC8FC\uC2DC", "\uAD6C\uB9AC\uC2DC", "\uAE30\uD0C0"].map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uCDE8\uC5C5\uC5EC\uBD80 (\uC218\uB8CC \uD6C4)" }, /* @__PURE__ */ React.createElement("select", { value: form.status || "\uBBF8\uCDE8\uC5C5", onChange: (e) => set("status", e.target.value), style: selStyle }, EMPLOYMENT_STATUSES.map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v)))), /* @__PURE__ */ React.createElement(FLD, { label: "\uCDE8\uC5C5 \uAE30\uC5C5\uBA85" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          value: form.employerName || "",
          onChange: (e) => set("employerName", e.target.value),
          placeholder: "\uCDE8\uC5C5/\uC608\uC815\uC77C \uB54C \uC785\uB825",
          style: inpStyle
        }
      ))), divider("\uBA74\uC811 \uACB0\uACFC"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uBA74\uC811\uC77C\uC790" }, /* @__PURE__ */ React.createElement("input", { type: "date", value: form.itvDate || "", onChange: (e) => set("itvDate", e.target.value), style: inpStyle })), /* @__PURE__ */ React.createElement(FLD, { label: "\uC810\uC218 (100\uC810)" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          value: form.itvScore || "",
          onChange: (e) => set("itvScore", e.target.value),
          placeholder: "88",
          type: "number",
          min: "0",
          max: "100",
          style: inpStyle
        }
      )), /* @__PURE__ */ React.createElement(FLD, { label: "\uB4F1\uAE09" }, /* @__PURE__ */ React.createElement("select", { value: form.itvGrade || "B", onChange: (e) => set("itvGrade", e.target.value), style: selStyle }, ["A+", "A", "B+", "B", "C", "\uD0C8\uB77D"].map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [["\u2705 \uD569\uACA9", true], ["\u274C \uBD88\uD569\uACA9", false]].map(([l, v]) => /* @__PURE__ */ React.createElement("button", { key: l, type: "button", onClick: () => set("itvPass", v), style: {
        flex: 1,
        padding: "9px 0",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 12,
        transition: "all .15s",
        background: form.itvPass === v ? v ? "#ECFDF5" : "#FEF2F2" : T.s3,
        color: form.itvPass === v ? v ? T.ok : T.danger : T.mu,
        borderWidth: 1.5,
        borderStyle: "solid",
        borderColor: form.itvPass === v ? v ? T.ok : T.danger : T.bd
      } }, l))), (form.itvScore || form.itvGrade) && /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: 10,
        background: form.itvPass ? T.pbg : "#FEF2F2",
        border: `1px solid ${form.itvPass ? T.pl + "60" : "#FECACA"}`
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 44,
        height: 44,
        borderRadius: 10,
        flexShrink: 0,
        background: form.itvPass ? T.p : T.danger,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 900,
        color: "#fff"
      } }, form.itvGrade || "?"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.tx } }, form.name || "(\uC774\uB984 \uC5C6\uC74C)", " \xB7 ", form.itvScore || "-", "\uC810 \xB7 ", form.itvPass ? "\uD569\uACA9" : "\uBD88\uD569\uACA9"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginTop: 2 } }, courses.find((c) => c.id === form.cid)?.name, " \xB7 ", form.itvDate || "-"))), /* @__PURE__ */ React.createElement(FLD, { label: "\uD2B9\uC774\uC0AC\uD56D \xB7 \uBA54\uBAA8" }, /* @__PURE__ */ React.createElement(
        "textarea",
        {
          value: form.memo || "",
          onChange: (e) => set("memo", e.target.value),
          placeholder: "\uBA74\uC811 \uD2B9\uC774\uC0AC\uD56D, \uCDE8\uC5C5 \uC758\uC9C0, \uBC30\uB824 \uD544\uC694 \uC0AC\uD56D \uB4F1 \uC790\uC720 \uAE30\uC7AC",
          rows: 3,
          style: { ...inpStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }
        }
      ))), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "13px 22px",
        borderTop: `1px solid ${T.bd}`,
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        background: T.s2,
        flexShrink: 0
      } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { onClick: async () => {
        if (!form.name || !form.name.trim()) return alert("\uC774\uB984\uC740 \uD544\uC218 \uC785\uB825 \uD56D\uBAA9\uC785\uB2C8\uB2E4.");
        if (!form.birth) return alert("\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638\uB294 \uD544\uC218 \uC785\uB825 \uD56D\uBAA9\uC785\uB2C8\uB2E4. (\uC55E 6\uC790\uB9AC \uC785\uB825 \uD544\uC694)");
        await onSave({ ...form, id: form.id || void 0 });
        onClose();
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), " ", isNew ? "\uB4F1\uB85D" : "\uC800\uC7A5")))
    );
  };
  const SEED_INSTRUCTORS = [
    {
      id: 1,
      name: "\uAE40\uBBFC\uC900",
      type: "\uC8FC\uAC15\uC0AC",
      category: "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
      subject: "\uCF54\uB529\xB7AI",
      phone: "010-1111-2222",
      email: "kim@gjf.or.kr",
      career: "5\uB144",
      cert: "\uC9C1\uC5C5\uD6C8\uB828\uAD50\uC0AC 2\uAE09",
      cids: [1, 2],
      note: "\uCD08\uB4F1 \uCF54\uB529 \uC804\uBB38",
      hourlyRate: 5e4
    },
    {
      id: 2,
      name: "\uC774\uC218\uC5F0",
      type: "\uC8FC\uAC15\uC0AC",
      category: "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
      subject: "\uD589\uC815\uD68C\uACC4",
      phone: "010-3333-4444",
      email: "lee@gjf.or.kr",
      career: "8\uB144",
      cert: "\uD68C\uACC4\uC0AC 2\uAE09",
      cids: [7, 8],
      note: "",
      hourlyRate: 55e3
    },
    {
      id: 3,
      name: "\uBC15\uD604\uC6B0",
      type: "\uBCF4\uC870\uAC15\uC0AC",
      category: "\uC678\uBD80 \uAC15\uC0AC",
      subject: "\uBB3C\uB958\xB7ERP",
      phone: "010-5555-6666",
      email: "park@gjf.or.kr",
      career: "3\uB144",
      cert: "\uC9C0\uAC8C\uCC28 \uBA74\uD5C8",
      cids: [4],
      note: "",
      hourlyRate: 4e4
    }
  ];
  const InstructorModal = ({ inst, onSave, onClose, isNew, courses }) => {
    const empty = { name: "", type: "\uC8FC\uAC15\uC0AC", category: "\uACBD\uAE30\uB3C4 \uAC15\uC0AC", subject: "", phone: "", email: "", career: "", cert: "", cids: [], note: "", hourlyRate: 0, customDates: {} };
    const [form, setForm] = useState(inst ? { ...inst, cids: inst.cids || [], customDates: inst.customDates || {} } : empty);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    const toggleCid = (id) => {
      const removing = form.cids.includes(id);
      const newCids = removing ? form.cids.filter((x) => x !== id) : [...form.cids, id];
      const newCustomDates = removing ? (() => {
        const cd = { ...form.customDates || {} };
        delete cd[String(id)];
        return cd;
      })() : form.customDates || {};
      setForm((p) => ({ ...p, cids: newCids, customDates: newCustomDates }));
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 16,
        width: 520,
        maxWidth: "96vw",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,${T.sb},${T.p})`,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff" } }, isNew ? "\uAC15\uC0AC \uCD94\uAC00" : "\uAC15\uC0AC \uC218\uC815"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 2 } }, isNew ? "\uC0C8 \uAC15\uC0AC \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694" : form.name)), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uC774\uB984", required: true }, /* @__PURE__ */ React.createElement("input", { value: form.name || "", onChange: (e) => set("name", e.target.value), placeholder: "\uD64D\uAE38\uB3D9", style: inp })), /* @__PURE__ */ React.createElement(FLD, { label: "\uAD6C\uBD84" }, /* @__PURE__ */ React.createElement(
        "select",
        {
          value: form.type || "\uC8FC\uAC15\uC0AC",
          onChange: (e) => set("type", e.target.value),
          style: { ...inp, cursor: "pointer" }
        },
        ["\uC8FC\uAC15\uC0AC", "\uBCF4\uC870\uAC15\uC0AC", "\uC678\uB798\uAC15\uC0AC", "\uC6B4\uC601\uC694\uC6D0"].map((v) => /* @__PURE__ */ React.createElement("option", { key: v }, v))
      )), /* @__PURE__ */ React.createElement(FLD, { label: "\uC18C\uC18D \uAD6C\uBD84" }, /* @__PURE__ */ React.createElement(
        "select",
        {
          value: form.category || "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
          onChange: (e) => set("category", e.target.value),
          style: { ...inp, cursor: "pointer" }
        },
        ["\uACBD\uAE30\uB3C4 \uAC15\uC0AC", "\uC678\uBD80 \uAC15\uC0AC"].map((v) => /* @__PURE__ */ React.createElement("option", { key: v }, v))
      ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uB2F4\uB2F9 \uACFC\uBAA9/\uBD84\uC57C" }, /* @__PURE__ */ React.createElement("input", { value: form.subject || "", onChange: (e) => set("subject", e.target.value), placeholder: "\uCF54\uB529\xB7AI", style: inp })), /* @__PURE__ */ React.createElement(FLD, { label: "\uACBD\uB825" }, /* @__PURE__ */ React.createElement("input", { value: form.career || "", onChange: (e) => set("career", e.target.value), placeholder: "5\uB144", style: inp })), /* @__PURE__ */ React.createElement(FLD, { label: "\uC2DC\uAC04\uB2F9 \uB2E8\uAC00 (\uC6D0)" }, /* @__PURE__ */ React.createElement("input", { type: "number", value: form.hourlyRate || "", onChange: (e) => set("hourlyRate", +e.target.value || 0), placeholder: "50000", style: inp }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uC5F0\uB77D\uCC98" }, /* @__PURE__ */ React.createElement("input", { value: form.phone || "", onChange: (e) => set("phone", e.target.value), placeholder: "010-0000-0000", style: inp })), /* @__PURE__ */ React.createElement(FLD, { label: "\uC774\uBA54\uC77C" }, /* @__PURE__ */ React.createElement("input", { value: form.email || "", onChange: (e) => set("email", e.target.value), placeholder: "name@gjf.or.kr", style: inp }))), /* @__PURE__ */ React.createElement(FLD, { label: "\uBCF4\uC720 \uC790\uACA9\uC99D/\uBA74\uD5C8" }, /* @__PURE__ */ React.createElement("input", { value: form.cert || "", onChange: (e) => set("cert", e.target.value), placeholder: "\uC9C1\uC5C5\uD6C8\uB828\uAD50\uC0AC 2\uAE09", style: inp })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 7 } }, "\uB2F4\uB2F9 \uACFC\uC815 (\uBCF5\uC218 \uC120\uD0DD)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } }, courses.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, type: "button", title: c.name, onClick: () => toggleCid(c.id), style: {
        padding: "5px 11px",
        borderRadius: 16,
        border: "none",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        background: form.cids.includes(c.id) ? c.cc : T.s3,
        color: form.cids.includes(c.id) ? "#fff" : T.mu
      } }, c.code, form.cids.includes(c.id) && " \u2713")))), /* @__PURE__ */ React.createElement(FLD, { label: "\uD2B9\uC774\uC0AC\uD56D / \uBA54\uBAA8" }, /* @__PURE__ */ React.createElement(
        "textarea",
        {
          value: form.note || "",
          onChange: (e) => set("note", e.target.value),
          rows: 2,
          placeholder: "\uC218\uC5C5 \uC2A4\uD0C0\uC77C, \uC8FC\uC758\uC0AC\uD56D \uB4F1",
          style: { ...inp, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }
        }
      ))), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "13px 22px",
        borderTop: `1px solid ${T.bd}`,
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        background: T.s2
      } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { onClick: async () => {
        if (!form.name) return alert("\uC774\uB984\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");
        try {
          await onSave({ ...form, id: form.id ? form.id : void 0 });
          onClose();
        } catch (err) {
          console.error("\uAC15\uC0AC \uC800\uC7A5 \uC2E4\uD328:", err);
        }
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), isNew ? "\uCD94\uAC00" : "\uC800\uC7A5")))
    );
  };
  const InstructorMgmt = ({ courses, onUpdateCourse }) => {
    const [instructors, setInst] = useState(SEED_INSTRUCTORS);
    const [editTarget, setEdit] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTF] = useState("\uC804\uCCB4");
    const [catFilter, setCF] = useState("\uC804\uCCB4");
    const [expandedId, setExpandedId] = useState(null);
    const [dateToggleIds, setDateToggleIds] = useState({});
    const [courseEditTarget, setCourseEditTarget] = useState(null);
    const [dbStatus, setDbStatus] = useState("loading");
    const [rtStatus, setRtStatus] = useState("pending");
    const [lastOp, setLastOp] = useState(null);
    useEffect(() => {
      const load = async () => {
        try {
          const { data, error } = await sbGet("instructors", "select=*&order=id");
          if (error) throw error;
          if (data && data.length > 0) setInst(data.map(toInstructor));
          setDbStatus("ok");
        } catch (err) {
          console.warn("\uAC15\uC0AC \uBAA9\uB85D \uB85C\uB4DC \uC2E4\uD328 (\uC2DC\uB4DC \uB370\uC774\uD130 \uC0AC\uC6A9):", err.message || err);
          setDbStatus("error");
        }
      };
      load();
    }, []);
    useEffect(() => {
      realtimeManager.subscribe("instructors", {
        onInsert: (newRecord) => {
          setInst((prev) => {
            if (prev.find((x) => x.id === newRecord.id))
              return prev.map((x) => x.id === newRecord.id ? toInstructor(newRecord) : x);
            console.log("\u{1F195} \uAC15\uC0AC \uCD94\uAC00 (\uC2E4\uC2DC\uAC04):", newRecord.name);
            return [...prev, toInstructor(newRecord)];
          });
        },
        onUpdate: (newRecord) => {
          setInst((prev) => prev.map((x) => x.id === newRecord.id ? toInstructor(newRecord) : x));
          console.log("\u270F\uFE0F \uAC15\uC0AC \uC218\uC815 (\uC2E4\uC2DC\uAC04):", newRecord.name);
        },
        onDelete: (oldRecord) => {
          setInst((prev) => prev.filter((x) => x.id !== oldRecord.id));
          console.log("\u{1F5D1}\uFE0F \uAC15\uC0AC \uC0AD\uC81C (\uC2E4\uC2DC\uAC04):", oldRecord.name);
        },
        onStatus: (s) => setRtStatus(s)
      });
      return () => realtimeManager.unsubscribe("instructors");
    }, []);
    const filtered = instructors.filter((i) => {
      if (typeFilter !== "\uC804\uCCB4" && i.type !== typeFilter) return false;
      if (catFilter !== "\uC804\uCCB4" && i.category !== catFilter) return false;
      if (search && !i.name.includes(search) && !i.subject.includes(search)) return false;
      return true;
    });
    const todayStr = (() => {
      const d = /* @__PURE__ */ new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();
    const calcInstSchedule = (inst) => {
      const assignedCourses = (inst.cids || []).map((cid) => courses.find((c) => c.id === cid)).filter(Boolean);
      let totalDays = 0, totalHours = 0;
      const courseDetails = assignedCourses.map((c) => {
        const allCourseDates = buildCourseDatesAll(c);
        const customMap = inst.customDates || {};
        const hasCustom = Object.prototype.hasOwnProperty.call(customMap, String(c.id));
        const rawCustom = hasCustom ? customMap[String(c.id)] || [] : null;
        const dates = hasCustom ? rawCustom.filter((d) => allCourseDates.includes(d)).sort() : allCourseDates;
        const hoursPerDay = getScheduledDailyHours(c) || 4;
        const estHours = Math.round(dates.length * hoursPerDay);
        totalDays += dates.length;
        totalHours += estHours;
        const hasToday = dates.includes(todayStr);
        const nextDate = dates.find((dt) => dt > todayStr) || null;
        return {
          course: c,
          dates,
          allCourseDates,
          hoursPerDay,
          estDays: dates.length,
          estHours,
          hasToday,
          nextDate,
          useCustom: hasCustom
        };
      });
      const teachesToday = courseDetails.some((cd) => cd.hasToday);
      return { courseDetails, totalDays, totalHours, teachesToday };
    };
    const todayInstructors = instructors.map((inst) => {
      const sched = calcInstSchedule(inst);
      if (!sched.teachesToday) return null;
      const todayCourses = sched.courseDetails.filter((cd) => cd.hasToday);
      return { inst, todayCourses, courseCount: todayCourses.length };
    }).filter(Boolean);
    const downloadInstructorExcel = () => {
      const wb = XLSX.utils.book_new();
      const rows = instructors.map((inst) => {
        const sched = calcInstSchedule(inst);
        const courseNames = (inst.cids || []).map((cid) => courses.find((c) => c.id === cid)?.name || "").filter(Boolean).join(", ");
        const courseCodes = (inst.cids || []).map((cid) => courses.find((c) => c.id === cid)?.code || "").filter(Boolean).join(", ");
        return {
          "\uC774\uB984": inst.name,
          "\uAD6C\uBD84": inst.type,
          "\uC18C\uC18D": inst.category || "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
          "\uB2F4\uB2F9 \uACFC\uBAA9": inst.subject,
          "\uC5F0\uB77D\uCC98": inst.phone,
          "\uC774\uBA54\uC77C": inst.email,
          "\uACBD\uB825": inst.career,
          "\uC790\uACA9\uC99D": inst.cert,
          "\uB2F4\uB2F9 \uACFC\uC815\uCF54\uB4DC": courseCodes,
          "\uB2F4\uB2F9 \uACFC\uC815\uBA85": courseNames,
          "\uC608\uC0C1 \uAC15\uC758\uC77C\uC218": sched.totalDays,
          "\uC608\uC0C1 \uCD1D \uC2DC\uC218": sched.totalHours,
          "\uC2DC\uAC04\uB2F9 \uB2E8\uAC00": inst.hourlyRate || "",
          "\uC608\uC0C1 \uAC15\uC0AC\uB8CC": inst.hourlyRate ? sched.totalHours * inst.hourlyRate : "",
          "\uD2B9\uC774\uC0AC\uD56D": inst.note
        };
      });
      const ws1 = XLSX.utils.json_to_sheet(rows);
      ws1["!cols"] = [8, 8, 10, 12, 14, 18, 6, 14, 14, 30, 10, 10, 10, 12, 20].map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws1, "\uAC15\uC0AC_\uAE30\uBCF8\uC815\uBCF4");
      const detailRows = [];
      instructors.forEach((inst) => {
        const sched = calcInstSchedule(inst);
        sched.courseDetails.forEach((cd) => {
          cd.dates.forEach((d) => {
            detailRows.push({
              "\uAC15\uC0AC\uBA85": inst.name,
              "\uC18C\uC18D": inst.category || "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
              "\uACFC\uC815\uCF54\uB4DC": cd.course.code,
              "\uACFC\uC815\uBA85": cd.course.name,
              "\uAC15\uC758\uC77C": d,
              "\uC218\uC5C5\uC2DC\uAC04": cd.course.schedTimeFrom && cd.course.schedTimeTo ? `${cd.course.schedTimeFrom}~${cd.course.schedTimeTo}` : "",
              "\uC2DC\uAC04(h)": cd.hoursPerDay,
              "\uC2DC\uAC04\uB2F9 \uB2E8\uAC00": inst.hourlyRate || ""
            });
          });
        });
      });
      if (detailRows.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(detailRows);
        ws2["!cols"] = [8, 10, 10, 30, 12, 14, 6, 10].map((w) => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws2, "\uAC15\uC758\uC77C_\uC0C1\uC138");
      }
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([out], { type: "application/octet-stream" }));
      a.download = `\uAC15\uC0AC_\uAD00\uB9AC_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`;
      a.click();
    };
    const handleSave = async (inst) => {
      const isSchemaErr = (e, col) => {
        const m = e?.message || e?.hint || JSON.stringify(e);
        return m.includes("schema cache") && m.includes(col);
      };
      const doSave = async (body) => isNew ? sbInsert("instructors", body) : sbUpdate("instructors", `id=eq.${inst.id}`, body);
      try {
        const body = fromInstructor(inst);
        let res = await doSave(body);
        if (res.error && (isSchemaErr(res.error, "cids") || isSchemaErr(res.error, "note") || isSchemaErr(res.error, "category") || isSchemaErr(res.error, "hourly_rate") || isSchemaErr(res.error, "custom_dates"))) {
          console.warn("\u26A0\uFE0F instructors \uC2A4\uD0A4\uB9C8 \uCE90\uC2DC \uC624\uB958 \u2014 Supabase \uB300\uC2DC\uBCF4\uB4DC \u2192 Settings \u2192 API \u2192 Schema Cache \u2192 Reload \uD074\uB9AD");
          const { cids, note, category, hourly_rate, custom_dates, ...fallback } = body;
          res = await doSave(fallback);
        }
        if (res.error) throw res.error;
        if (isNew) {
          const saved = res.data && res.data[0] ? toInstructor(res.data[0]) : { ...inst, id: Date.now() };
          setInst((p) => [...p, saved]);
        } else {
          setInst((p) => p.map((x) => x.id === inst.id ? inst : x));
        }
        setLastOp({ type: isNew ? "add" : "edit", status: "ok" });
      } catch (err) {
        setLastOp({ type: isNew ? "add" : "edit", status: "error", msg: err.message || String(err) });
        alert("\uC800\uC7A5 \uC624\uB958: " + (err.message || String(err)));
        throw err;
      }
    };
    const handleDel = async (id) => {
      if (!window.confirm("\uAC15\uC0AC\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) return;
      try {
        const { error } = await sbDelete("instructors", `id=eq.${id}`);
        if (error) throw error;
        setInst((p) => p.filter((x) => x.id !== id));
        setLastOp({ type: "delete", status: "ok" });
      } catch (err) {
        console.warn("\uAC15\uC0AC \uC0AD\uC81C \uC624\uB958:", err.message || err);
        setLastOp({ type: "delete", status: "error", msg: err.message || String(err) });
        alert("\uC0AD\uC81C \uC624\uB958: " + (err.message || String(err)));
      }
    };
    const fmtMD = (d) => {
      const p = d.split("-");
      return `${+p[1]}/${+p[2]}`;
    };
    const groupDatesByMonth = (dates) => {
      const groups = {};
      dates.forEach((d) => {
        const month = d.slice(0, 7);
        if (!groups[month]) groups[month] = [];
        groups[month].push(d);
      });
      return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    };
    const typeColors = { "\uC8FC\uAC15\uC0AC": T.p, "\uBCF4\uC870\uAC15\uC0AC": T.ok, "\uC678\uB798\uAC15\uC0AC": "#7C3AED", "\uC6B4\uC601\uC694\uC6D0": T.warn };
    const catColors = { "\uACBD\uAE30\uB3C4 \uAC15\uC0AC": "#2563EB", "\uC678\uBD80 \uAC15\uC0AC": "#9A3412" };
    const [editingCustomDates, setEditingCustomDates] = useState(null);
    const [tempCustomDates, setTempCustomDates] = useState([]);
    const startCustomDateEdit = (inst, courseId, allCourseDates) => {
      const customMap = inst.customDates || {};
      const hasCustom = Object.prototype.hasOwnProperty.call(customMap, String(courseId));
      setEditingCustomDates({ instId: inst.id, courseId });
      setTempCustomDates(
        hasCustom ? [...customMap[String(courseId)] || []] : [...allCourseDates]
      );
    };
    const toggleCustomDate = (date) => {
      setTempCustomDates(
        (prev) => prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()
      );
    };
    const saveCustomDates = async (inst, courseId, allCourseDates) => {
      const selectedDates = tempCustomDates.sort();
      const isAll = selectedDates.length === allCourseDates.length && selectedDates.every((d, i) => d === allCourseDates[i]);
      const newCustomDates = { ...inst.customDates || {} };
      if (isAll) {
        delete newCustomDates[String(courseId)];
      } else {
        newCustomDates[String(courseId)] = selectedDates;
      }
      const updatedInst = { ...inst, customDates: newCustomDates };
      try {
        await handleSave(updatedInst);
        setInst((p) => p.map((x) => x.id === inst.id ? updatedInst : x));
      } catch (err) {
      }
      setEditingCustomDates(null);
      setTempCustomDates([]);
    };
    const resetCustomDates = async (inst, courseId) => {
      const newCustomDates = { ...inst.customDates || {} };
      delete newCustomDates[String(courseId)];
      const updatedInst = { ...inst, customDates: newCustomDates };
      try {
        await handleSave(updatedInst);
        setInst((p) => p.map((x) => x.id === inst.id ? updatedInst : x));
      } catch (err) {
      }
      setEditingCustomDates(null);
      setTempCustomDates([]);
    };
    const handleCourseScheduleSave = async (updatedCourse) => {
      if (onUpdateCourse) {
        await onUpdateCourse(updatedCourse);
      }
      setCourseEditTarget(null);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, editTarget !== null && /* @__PURE__ */ React.createElement(
      InstructorModal,
      {
        inst: isNew ? null : editTarget,
        isNew,
        courses,
        onSave: handleSave,
        onClose: () => setEdit(null)
      }
    ), courseEditTarget && /* @__PURE__ */ React.createElement(
      CourseModal,
      {
        course: courseEditTarget,
        isNew: false,
        onSave: handleCourseScheduleSave,
        onClose: () => setCourseEditTarget(null)
      }
    ), /* @__PURE__ */ React.createElement(
      SectionHead,
      {
        title: "\uAC15\uC0AC \uAD00\uB9AC",
        sub: `\uB4F1\uB85D \uAC15\uC0AC ${instructors.length}\uBA85`,
        right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", onClick: downloadInstructorExcel }, "\u{1F4E5} \uC5D1\uC140 \uB2E4\uC6B4\uB85C\uB4DC"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: () => {
          setIsNew(true);
          setEdit({});
        } }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 13 }), " \uAC15\uC0AC \uCD94\uAC00"))
      }
    ), /* @__PURE__ */ React.createElement(SyncPanel, { dbStatus, rtStatus, lastOp, count: instructors.length }), /* @__PURE__ */ React.createElement(Card, { style: { padding: "14px 18px", marginBottom: 14, background: todayInstructors.length > 0 ? T.pbg : T.s2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: todayInstructors.length > 0 ? T.p : T.mu, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 } }, "\u{1F393} \uC624\uB298 \uAC15\uC758 \uAC15\uC0AC", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: T.mu } }, "(", (/* @__PURE__ */ new Date()).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" }), ")")), todayInstructors.length > 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, todayInstructors.map(({ inst, todayCourses, courseCount }) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: inst.id,
        onClick: () => {
          setExpandedId(inst.id);
          setTimeout(() => {
            const el = document.getElementById(`inst-card-${inst.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        },
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 12px",
          borderRadius: 20,
          border: "none",
          cursor: "pointer",
          background: T.s,
          boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          fontSize: 12,
          fontWeight: 700,
          color: T.tx,
          transition: "all .15s"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: {
        width: 22,
        height: 22,
        borderRadius: 7,
        flexShrink: 0,
        background: `${typeColors[inst.type] || T.p}18`,
        color: typeColors[inst.type] || T.p,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 900
      } }, inst.name[0]),
      inst.name,
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu, fontWeight: 600 } }, "\xB7 ", courseCount > 1 ? `${courseCount}\uACFC\uC815` : todayCourses[0]?.course?.code || ""),
      todayCourses[0]?.course?.schedTimeFrom && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: T.p, fontWeight: 600 } }, todayCourses[0].course.schedTimeFrom, "~", todayCourses[0].course.schedTimeTo)
    ))) : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.mu } }, "\uC624\uB298 \uC608\uC815\uB41C \uAC15\uC758 \uAC15\uC0AC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4")), /* @__PURE__ */ React.createElement(Card, { style: { padding: "12px 16px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: search,
        onChange: (e) => setSearch(e.target.value),
        placeholder: "\uC774\uB984 / \uB2F4\uB2F9\uACFC\uBAA9 \uAC80\uC0C9\u2026",
        style: {
          padding: "7px 11px",
          border: `1px solid ${T.bd}`,
          borderRadius: 8,
          fontSize: 12,
          outline: "none",
          background: T.s2,
          color: T.tx,
          width: 180
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5 } }, ["\uC804\uCCB4", "\uC8FC\uAC15\uC0AC", "\uBCF4\uC870\uAC15\uC0AC", "\uC678\uB798\uAC15\uC0AC", "\uC6B4\uC601\uC694\uC6D0"].map((t) => /* @__PURE__ */ React.createElement("button", { key: t, onClick: () => setTF(t), style: {
      padding: "5px 12px",
      borderRadius: 16,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      background: typeFilter === t ? T.p : T.s3,
      color: typeFilter === t ? "#fff" : T.mu
    } }, t))), /* @__PURE__ */ React.createElement("div", { style: { height: 20, width: 1, background: T.bd } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5 } }, ["\uC804\uCCB4", "\uACBD\uAE30\uB3C4 \uAC15\uC0AC", "\uC678\uBD80 \uAC15\uC0AC"].map((c) => /* @__PURE__ */ React.createElement("button", { key: c, onClick: () => setCF(c), style: {
      padding: "5px 12px",
      borderRadius: 16,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      background: catFilter === c ? catColors[c] || T.p : T.s3,
      color: catFilter === c ? "#fff" : T.mu
    } }, c))), /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", fontSize: 12, color: T.mu, fontWeight: 600 } }, filtered.length, "\uBA85")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 12 } }, filtered.map((inst) => {
      const sched = calcInstSchedule(inst);
      const isExpanded = expandedId === inst.id;
      const courseCount = (inst.cids || []).filter((cid) => courses.find((c) => c.id === cid)).length;
      return /* @__PURE__ */ React.createElement(
        Card,
        {
          key: inst.id,
          id: `inst-card-${inst.id}`,
          style: {
            padding: 18,
            position: "relative",
            border: sched.teachesToday ? `2px solid ${T.p}` : `1px solid ${T.bd}`
          }
        },
        sched.teachesToday && /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          top: -1,
          right: 16,
          background: T.p,
          color: "#fff",
          fontSize: 9,
          fontWeight: 800,
          padding: "2px 10px 4px",
          borderRadius: "0 0 8px 8px",
          letterSpacing: ".3px"
        } }, "\uC624\uB298 \uAC15\uC758"),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10, paddingRight: 60 } }, /* @__PURE__ */ React.createElement("div", { style: {
          width: 44,
          height: 44,
          borderRadius: 12,
          flexShrink: 0,
          background: `${typeColors[inst.type] || T.p}18`,
          color: typeColors[inst.type] || T.p,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 900
        } }, inst.name[0]), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: T.tx } }, inst.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Chip, { label: inst.type, bg: `${typeColors[inst.type] || T.p}15`, color: typeColors[inst.type] || T.p }), /* @__PURE__ */ React.createElement(
          Chip,
          {
            label: inst.category || "\uACBD\uAE30\uB3C4 \uAC15\uC0AC",
            bg: `${catColors[inst.category] || catColors["\uACBD\uAE30\uB3C4 \uAC15\uC0AC"]}12`,
            color: catColors[inst.category] || catColors["\uACBD\uAE30\uB3C4 \uAC15\uC0AC"]
          }
        )))),
        /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8, fontSize: 11, color: T.mu } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4DA} \uB2F4\uB2F9\uBD84\uC57C: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, inst.subject || "\u2014")), /* @__PURE__ */ React.createElement("span", null, "\u{1F4CB} \uB2F4\uB2F9\uACFC\uC815: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, courseCount, "\uAC1C")), /* @__PURE__ */ React.createElement("span", null, "\u23F1\uFE0F \uC608\uC0C1 \uC2DC\uC218: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, sched.totalHours > 0 ? `${sched.totalDays}\uC77C \xB7 ${sched.totalHours}\uC2DC\uAC04` : "\u2014")), /* @__PURE__ */ React.createElement("span", null, "\u{1F4B0} \uC608\uC0C1 \uAC15\uC0AC\uB8CC: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, inst.hourlyRate > 0 && sched.totalHours > 0 ? `\u20A9${(inst.hourlyRate * sched.totalHours).toLocaleString()}` : "\u2014"))),
        inst.cert && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, alignItems: "center", marginBottom: 6, fontSize: 11, color: T.mu } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F3C5}"), /* @__PURE__ */ React.createElement(CertChips, { text: inst.cert, maxShow: 3 })),
        inst.career && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginBottom: 6 } }, "\u23F3 \uACBD\uB825: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, inst.career)),
        inst.note && /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: 11,
          color: T.mu,
          background: T.s3,
          borderRadius: 6,
          padding: "5px 9px",
          marginBottom: 6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: "1.5"
        } }, "\u{1F4DD} ", inst.note),
        courseCount > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 } }, (inst.cids || []).map((cid) => {
          const c = courses.find((x) => x.id === cid);
          if (!c) return null;
          const cd = sched.courseDetails.find((d) => d.course.id === cid);
          return /* @__PURE__ */ React.createElement("span", { key: cid, style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 12,
            background: `${c.cc}12`,
            color: c.cc
          } }, c.code, cd?.hasToday && /* @__PURE__ */ React.createElement("span", { style: {
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: T.ok,
            display: "inline-block"
          } }));
        })),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 2 } }, sched.courseDetails.length > 0 && /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setExpandedId(isExpanded ? null : inst.id),
            style: {
              flex: 1,
              padding: "6px 0",
              borderRadius: 8,
              border: `1px solid ${T.p}`,
              background: isExpanded ? T.p : "transparent",
              color: isExpanded ? "#fff" : T.p,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              transition: "all .15s"
            }
          },
          isExpanded ? "\u25B2 \uC77C\uC815 \uC811\uAE30" : "\u{1F4C5} \uC77C\uC815 \uBCF4\uAE30"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => {
              setIsNew(false);
              setEdit(inst);
            },
            style: {
              flex: 1,
              padding: "6px 0",
              borderRadius: 8,
              border: `1px solid ${T.bd}`,
              background: T.s2,
              color: T.mu,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700
            }
          },
          "\u270F\uFE0F \uC815\uBCF4 \uC218\uC815"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => handleDel(inst.id),
            style: {
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid #FECACA`,
              background: "#FEF2F2",
              color: T.danger,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700
            }
          },
          "\u{1F5D1}\uFE0F"
        )),
        isExpanded && sched.courseDetails.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, background: T.s2, borderRadius: 10, padding: 12 } }, sched.courseDetails.map((cd) => {
          const dtKey = `${inst.id}-${cd.course.id}`;
          const showDates = dateToggleIds[dtKey];
          const monthGroups = groupDatesByMonth(cd.dates);
          const isEditingThis = editingCustomDates?.instId === inst.id && editingCustomDates?.courseId === cd.course.id;
          const allMonthGroups = groupDatesByMonth(cd.allCourseDates || cd.dates);
          return /* @__PURE__ */ React.createElement("div", { key: cd.course.id, style: {
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: `1px solid ${T.bd}`
          } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: cd.course.cc || T.tx, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 } }, "[", cd.course.code, "] ", cd.course.name, cd.useCustom && /* @__PURE__ */ React.createElement("span", { style: {
            fontSize: 8,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 8,
            background: "#DBEAFE",
            color: "#1D4ED8"
          } }, "\uAC1C\uBCC4\uC77C\uC815")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, fontSize: 10, color: T.mu } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4C5} \uAE30\uAC04: ", formatCoursePeriod(cd.course)), /* @__PURE__ */ React.createElement("span", null, "\u{1F5D3}\uFE0F \uC694\uC77C: ", cd.course.schedDays || "\uBBF8\uC815"), /* @__PURE__ */ React.createElement("span", null, "\u{1F558} \uC2DC\uAC04: ", cd.course.schedTimeFrom && cd.course.schedTimeTo ? `${cd.course.schedTimeFrom}~${cd.course.schedTimeTo}` : "\uBBF8\uC815"), /* @__PURE__ */ React.createElement("span", null, "\u{1F4CA} \uCD1D\uB7C9: ", cd.estDays, "\uC77C \xB7 ", cd.estHours, "\uC2DC\uAC04", cd.useCustom && cd.allCourseDates && ` (\uC804\uCCB4 ${cd.allCourseDates.length}\uC77C \uC911)`))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginLeft: 8, flexShrink: 0 } }, !isEditingThis && /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => startCustomDateEdit(inst, cd.course.id, cd.allCourseDates || cd.dates),
              style: {
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid #2563EB`,
                background: "transparent",
                color: "#2563EB",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: "nowrap"
              }
            },
            "\u{1F4C5} \uB0A0\uC9DC \uC120\uD0DD"
          ), onUpdateCourse && /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => setCourseEditTarget(cd.course),
              style: {
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${T.p}`,
                background: "transparent",
                color: T.p,
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: "nowrap"
              }
            },
            "\uC77C\uC815 \uC218\uC815"
          ))), isEditingThis && /* @__PURE__ */ React.createElement("div", { style: {
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 8,
            padding: 10,
            marginBottom: 8
          } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#1D4ED8", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4C5} \uAC15\uC0AC \uC218\uC5C5\uC77C \uC120\uD0DD (\uD074\uB9AD\uD558\uC5EC \uB0A0\uC9DC\uB97C \uC120\uD0DD/\uD574\uC81C)"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 600, color: T.mu } }, tempCustomDates.length, "\uC77C \uC120\uD0DD\uB428 / \uC804\uCCB4 ", (cd.allCourseDates || cd.dates).length, "\uC77C")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 8 } }, /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => setTempCustomDates([...cd.allCourseDates || cd.dates]),
              style: {
                padding: "3px 8px",
                borderRadius: 5,
                border: `1px solid ${T.bd}`,
                background: T.s,
                cursor: "pointer",
                fontSize: 9,
                fontWeight: 600,
                color: T.tx
              }
            },
            "\u2705 \uC804\uCCB4 \uC120\uD0DD"
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => setTempCustomDates([]),
              style: {
                padding: "3px 8px",
                borderRadius: 5,
                border: `1px solid ${T.bd}`,
                background: T.s,
                cursor: "pointer",
                fontSize: 9,
                fontWeight: 600,
                color: T.mu
              }
            },
            "\u2B1C \uC804\uCCB4 \uD574\uC81C"
          )), allMonthGroups.map(([month, days]) => {
            const monthLabel = `${+month.split("-")[1]}\uC6D4`;
            const selectedInMonth = days.filter((d) => tempCustomDates.includes(d)).length;
            const allInMonth = selectedInMonth === days.length;
            return /* @__PURE__ */ React.createElement("div", { key: month, style: { marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: T.tx } }, monthLabel), /* @__PURE__ */ React.createElement(
              "button",
              {
                onClick: () => {
                  if (allInMonth) {
                    setTempCustomDates((prev) => prev.filter((d) => !days.includes(d)));
                  } else {
                    setTempCustomDates((prev) => [.../* @__PURE__ */ new Set([...prev, ...days])].sort());
                  }
                },
                style: {
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 8,
                  fontWeight: 600,
                  color: "#2563EB",
                  padding: 0
                }
              },
              allInMonth ? "(\uC6D4 \uD574\uC81C)" : "(\uC6D4 \uC804\uCCB4)"
            ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: T.mu } }, "(", selectedInMonth, "/", days.length, ")")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3 } }, days.map((d) => {
              const selected = tempCustomDates.includes(d);
              const dow = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"][new Date(d).getDay()];
              return /* @__PURE__ */ React.createElement(
                "button",
                {
                  key: d,
                  onClick: () => toggleCustomDate(d),
                  style: {
                    padding: "3px 6px",
                    borderRadius: 5,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 9,
                    fontWeight: selected ? 700 : 400,
                    background: selected ? "#2563EB" : T.s3,
                    color: selected ? "#fff" : T.mu,
                    transition: "all .12s",
                    minWidth: 42,
                    textAlign: "center"
                  }
                },
                fmtMD(d),
                /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7 } }, "(", dow, ")")
              );
            })));
          }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" } }, cd.useCustom && /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => resetCustomDates(inst, cd.course.id),
              style: {
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid #FECACA`,
                background: "#FEF2F2",
                color: T.danger,
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700
              }
            },
            "\u{1F504} \uC804\uCCB4 \uB0A0\uC9DC\uB85C \uCD08\uAE30\uD654"
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => {
                setEditingCustomDates(null);
                setTempCustomDates([]);
              },
              style: {
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${T.bd}`,
                background: T.s,
                color: T.mu,
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700
              }
            },
            "\uCDE8\uC18C"
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => saveCustomDates(inst, cd.course.id, cd.allCourseDates || cd.dates),
              style: {
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                background: "#2563EB",
                color: "#fff",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700
              }
            },
            "\u{1F4BE} \uC800\uC7A5 (",
            tempCustomDates.length,
            "\uC77C)"
          ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, fontSize: 10, color: T.mu, marginBottom: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, cd.hasToday ? /* @__PURE__ */ React.createElement("b", { style: { color: T.ok } }, "\u2705 \uC624\uB298 \uC218\uC5C5 \uC788\uC74C") : "\u2B1C \uC624\uB298 \uC218\uC5C5 \uC5C6\uC74C"), cd.nextDate && /* @__PURE__ */ React.createElement("span", null, "\u{1F4CC} \uB2E4\uC74C \uC218\uC5C5: ", /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, fmtMD(cd.nextDate)))), cd.dates.length > 0 && /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => setDateToggleIds((p) => ({ ...p, [dtKey]: !p[dtKey] })),
              style: {
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 600,
                color: T.p,
                padding: "3px 0"
              }
            },
            showDates ? "\u25B2 \uC0C1\uC138 \uB0A0\uC9DC \uC811\uAE30" : `\u25BC \uC0C1\uC138 \uB0A0\uC9DC \uBCF4\uAE30 (${cd.dates.length}\uC77C)`
          ), showDates && monthGroups.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4 } }, monthGroups.map(([month, days]) => {
            const monthLabel = `${+month.split("-")[1]}\uC6D4`;
            const MAX_SHOW = 20;
            const visibleDays = days.slice(0, MAX_SHOW);
            const extraDays = days.length - MAX_SHOW;
            return /* @__PURE__ */ React.createElement("div", { key: month, style: { marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: T.tx, marginRight: 6 } }, monthLabel, ":"), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", flexWrap: "wrap", gap: 2 } }, visibleDays.map((d) => /* @__PURE__ */ React.createElement("span", { key: d, style: {
              fontSize: 8,
              padding: "1px 4px",
              borderRadius: 3,
              background: d === todayStr ? `${T.p}20` : d < todayStr ? `${T.ok}12` : T.s3,
              color: d === todayStr ? T.p : d < todayStr ? T.ok : T.mu,
              fontWeight: d === todayStr ? 800 : 400
            } }, fmtMD(d))), extraDays > 0 && /* @__PURE__ */ React.createElement("span", { style: {
              fontSize: 8,
              padding: "1px 4px",
              borderRadius: 3,
              background: T.pbg,
              color: T.p,
              fontWeight: 600
            } }, "...+", extraDays, "\uC77C")));
          })));
        }))
      );
    }), /* @__PURE__ */ React.createElement("div", { onClick: () => {
      setIsNew(true);
      setEdit({});
    }, style: {
      borderRadius: 12,
      padding: 18,
      border: `2px dashed ${T.bd}`,
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minHeight: 160,
      background: T.s2,
      transition: "all .2s"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: `${T.p}15`,
      color: T.p,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 20 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.mu } }, "\uAC15\uC0AC \uCD94\uAC00"))));
  };
  const SEED_ROOMS = [
    // 1층
    { id: 1, floor: 1, name: "\uB4DC\uB9BC\uC2A4\uD29C\uB514\uC624", addr: "1\uCE35", capacity: 2, equip: "\uAC1C\uC778 \uC791\uC5C5 \uACF5\uAC04 (1/2\uC778\uC2E4)" },
    { id: 2, floor: 1, name: "\uC5B4\uC6B8\uB9BC\uD640", addr: "1\uCE35", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uAC15\uC758\uB300\xB7\uC74C\uD5A5" },
    { id: 3, floor: 1, name: "\uCC28\uC624\uB984\uD640", addr: "1\uCE35", capacity: 50, equip: "\uBB34\uB300\xB7\uC74C\uD5A5\xB7\uBE54\uD504\uB85C\uC81D\uD130" },
    { id: 4, floor: 1, name: "IT\uAD50\uC721\uC7A5 205\uD638", addr: "1\uCE35 205\uD638", capacity: 30, equip: "PC 30\uB300\xB7\uBE54\uD504\uB85C\uC81D\uD130" },
    { id: 5, floor: 1, name: "IT\uAD50\uC721\uC7A5 206\uD638", addr: "1\uCE35 206\uD638", capacity: 30, equip: "PC 30\uB300\xB7\uBE54\uD504\uB85C\uC81D\uD130" },
    // 2층
    { id: 6, floor: 2, name: "IT\uAD50\uC721\uC7A5 209\uD638", addr: "2\uCE35 209\uD638", capacity: 30, equip: "PC 30\uB300\xB7\uBE54\uD504\uB85C\uC81D\uD130" },
    { id: 7, floor: 2, name: "IT\uAD50\uC721\uC7A5 210\uD638", addr: "2\uCE35 210\uD638", capacity: 30, equip: "PC 30\uB300\xB7\uBE54\uD504\uB85C\uC81D\uD130" },
    { id: 8, floor: 2, name: "\uC77C\uBC18\uAD50\uC721\uC7A5 201\uD638", addr: "2\uCE35", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" },
    { id: 9, floor: 2, name: "\uC77C\uBC18\uAD50\uC721\uC7A5 202\uD638", addr: "2\uCE35", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" },
    { id: 10, floor: 2, name: "\uC77C\uBC18\uAD50\uC721\uC7A5 203\uD638", addr: "2\uCE35", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" },
    { id: 11, floor: 2, name: "\uC77C\uBC18\uAD50\uC721\uC7A5 204\uD638", addr: "2\uCE35", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" },
    { id: 12, floor: 2, name: "\uC9D1\uB2E8\uC0C1\uB2F4\uC2E4", addr: "2\uCE35", capacity: 10, equip: "\uC6D0\uD615 \uD14C\uC774\uBE14\xB7\uC758\uC790" },
    // 3층
    { id: 13, floor: 3, name: "\uC77C\uBC18\uAD50\uC721\uC7A5 301\uD638", addr: "3\uCE35 301\uD638", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" },
    { id: 14, floor: 3, name: "\uC77C\uBC18\uAD50\uC721\uC7A5 305\uD638", addr: "3\uCE35 305\uD638", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" },
    { id: 15, floor: 3, name: "\uC77C\uBC18\uAD50\uC721\uC7A5 306\uD638", addr: "3\uCE35 306\uD638", capacity: 25, equip: "\uBE54\uD504\uB85C\uC81D\uD130\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" },
    { id: 16, floor: 3, name: "\uBD84\uC784\uD1A0\uC758\uC2E4", addr: "3\uCE35", capacity: 15, equip: "\uC6D0\uD615 \uD14C\uC774\uBE14\xB7\uD654\uC774\uD2B8\uBCF4\uB4DC" }
  ];
  const BookModal = ({ init, onClose, rooms, bookings, courses, setBookings, onSave, onDelete }) => {
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    const firstCourseId = courses[0]?.id || 1;
    const empty = {
      roomId: rooms[0]?.id || 1,
      courseId: firstCourseId,
      label: courses[0]?.name || "",
      start: "",
      end: "",
      color: getCourseColor(firstCourseId, courses)
      // ← 과정 팔레트 자동 적용
    };
    const [form, setForm] = useState(init || empty);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const isEdit = !!init?.id;
    const daysOverlap = (daysA, daysB) => {
      if (!daysA || !daysB) return true;
      const setA = new Set(daysA.split(/[,\s]+/).map((d) => d.trim()).filter(Boolean));
      return daysB.split(/[,\s]+/).map((d) => d.trim()).filter(Boolean).some((d) => setA.has(d));
    };
    const timesOverlap = (fromA, toA, fromB, toB) => {
      if (!fromA || !toA || !fromB || !toB) return true;
      const toMins = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      return toMins(fromA) < toMins(toB) && toMins(toA) > toMins(fromB);
    };
    const getCourseSchedule = (courseId) => courses.find((c) => c.id === courseId) || {};
    const conflicts = form.start && form.end && form.roomId ? bookings.filter((b) => {
      if (b.roomId !== form.roomId) return false;
      if (b.id === init?.id) return false;
      if (b.start > form.end || b.end < form.start) return false;
      const bCourse = getCourseSchedule(b.courseId);
      const fCourse = getCourseSchedule(form.courseId);
      if (!daysOverlap(bCourse.schedDays, fCourse.schedDays)) return false;
      if (!timesOverlap(
        bCourse.schedTimeFrom,
        bCourse.schedTimeTo,
        fCourse.schedTimeFrom,
        fCourse.schedTimeTo
      )) return false;
      return true;
    }) : [];
    const hasConflict = conflicts.length > 0;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 1e3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 16,
        width: 440,
        maxWidth: "96vw",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,${T.sb},${T.p})`,
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#fff" } }, isEdit ? "\uAC15\uC758 \uC77C\uC815 \uC218\uC815" : "\uAC15\uC758 \uC77C\uC815 \uCD94\uAC00"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 26,
        height: 26,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 13 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uAC15\uC758\uC2E4" }, /* @__PURE__ */ React.createElement(
        "select",
        {
          value: form.roomId,
          onChange: (e) => set("roomId", +e.target.value),
          style: {
            ...inp,
            cursor: "pointer",
            borderColor: hasConflict ? T.danger : T.bd,
            background: hasConflict ? "#FEF2F2" : T.s2
          }
        },
        rooms.map((r) => /* @__PURE__ */ React.createElement("option", { key: r.id, value: r.id }, r.name))
      )), /* @__PURE__ */ React.createElement(FLD, { label: "\uACFC\uC815" }, /* @__PURE__ */ React.createElement("select", { value: form.courseId, onChange: (e) => {
        const cid = +e.target.value;
        const c = courses.find((x) => x.id === cid);
        setForm((p) => ({
          ...p,
          courseId: cid,
          label: c?.name || "",
          color: getCourseColor(cid, courses)
          // ← 과정 선택 시 색상 자동 설정
        }));
      }, style: { ...inp, cursor: "pointer" } }, courses.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, shortCourseName(c.name), " [", c.code, "]")))), /* @__PURE__ */ React.createElement(FLD, { label: "\uD45C\uC2DC \uC774\uB984" }, /* @__PURE__ */ React.createElement("input", { value: form.label || "", onChange: (e) => set("label", e.target.value), placeholder: "\uCE98\uB9B0\uB354\uC5D0 \uD45C\uC2DC\uB420 \uC774\uB984", style: inp })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uC2DC\uC791\uC77C" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          value: form.start || "",
          onChange: (e) => set("start", e.target.value),
          style: { ...inp, borderColor: hasConflict ? T.danger : T.bd }
        }
      )), /* @__PURE__ */ React.createElement(FLD, { label: "\uC885\uB8CC\uC77C" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "date",
          value: form.end || "",
          onChange: (e) => set("end", e.target.value),
          style: { ...inp, borderColor: hasConflict ? T.danger : T.bd }
        }
      ))), hasConflict && /* @__PURE__ */ React.createElement("div", { style: {
        padding: "10px 12px",
        borderRadius: 8,
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        fontSize: 11,
        color: T.danger
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "\u26A0\uFE0F \uAC15\uC758\uC2E4 \uC911\uBCF5! \uC544\uB798 \uC77C\uC815\uACFC \uACB9\uCE69\uB2C8\uB2E4"), conflicts.map((b) => /* @__PURE__ */ React.createElement("div", { key: b.id, style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 0",
        borderTop: "1px solid #FEE2E2"
      } }, /* @__PURE__ */ React.createElement("div", { style: { width: 8, height: 8, borderRadius: 2, background: b.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, b.label), /* @__PURE__ */ React.createElement("span", { style: { color: "#991B1B", marginLeft: "auto" } }, b.start, " ~ ", b.end)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 600, color: T.mu, display: "block", marginBottom: 6 } }, "\uC0C9\uC0C1"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, BOOKING_COLORS.map((col) => /* @__PURE__ */ React.createElement("button", { key: col, type: "button", onClick: () => set("color", col), style: {
        width: 24,
        height: 24,
        borderRadius: 6,
        background: col,
        border: "none",
        cursor: "pointer",
        outline: form.color === col ? `3px solid ${col}` : "none",
        outlineOffset: 2
      } }))))), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "12px 20px",
        borderTop: `1px solid ${T.bd}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: T.s2
      } }, isEdit ? /* @__PURE__ */ React.createElement(Btn, { variant: "danger", size: "sm", onClick: async () => {
        if (onDelete) await onDelete(init.id);
        else setBookings((p) => p.filter((b) => b.id !== init.id));
        onClose();
      } }, "\uC0AD\uC81C") : /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { variant: hasConflict ? "danger" : "primary", onClick: async () => {
        if (!form.label || !form.start || !form.end) return alert("\uC774\uB984\xB7\uC2DC\uC791\uC77C\xB7\uC885\uB8CC\uC77C\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");
        if (form.start > form.end) return alert("\uC2DC\uC791\uC77C\uC774 \uC885\uB8CC\uC77C\uBCF4\uB2E4 \uB2A6\uC2B5\uB2C8\uB2E4.");
        if (hasConflict && !window.confirm(`\u26A0\uFE0F \uC911\uBCF5 \uC608\uC57D\uB429\uB2C8\uB2E4.

${conflicts.map((b) => `\u2022 ${b.label} (${b.start}~${b.end})`).join("\n")}

\uADF8\uB798\uB3C4 \uC800\uC7A5\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;
        try {
          if (onSave) {
            await onSave(isEdit ? { ...form } : { ...form, id: void 0 });
          } else {
            if (isEdit) setBookings((p) => p.map((b) => b.id === init.id ? { ...form } : b));
            else setBookings((p) => [...p, { ...form, id: Date.now() }]);
          }
          onClose();
        } catch (err) {
          alert("\uC800\uC7A5 \uC624\uB958: " + (err.message || JSON.stringify(err)));
        }
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), hasConflict ? "\u26A0\uFE0F \uAC15\uD589 \uC800\uC7A5" : isEdit ? "\uC800\uC7A5" : "\uCD94\uAC00"))))
    );
  };
  const RoomModal = ({ room, onClose, setRooms, onSave }) => {
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    const empty = { floor: 1, name: "", addr: "", capacity: 20, equip: "" };
    const [form, setForm] = useState(room || empty);
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const isEdit = !!room?.id;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 1e3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 16,
        width: 400,
        maxWidth: "96vw",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,${T.sb},${T.p})`,
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#fff" } }, isEdit ? "\uAC15\uC758\uC2E4 \uC218\uC815" : "\uAC15\uC758\uC2E4 \uCD94\uAC00"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 26,
        height: 26,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 13 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 20px", display: "flex", flexDirection: "column", gap: 11 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement(FLD, { label: "\uCE35" }, /* @__PURE__ */ React.createElement("select", { value: form.floor || 1, onChange: (e) => set("floor", +e.target.value), style: { ...inp, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("option", { value: 1 }, "1\uCE35"), /* @__PURE__ */ React.createElement("option", { value: 2 }, "2\uCE35"), /* @__PURE__ */ React.createElement("option", { value: 3 }, "3\uCE35"))), /* @__PURE__ */ React.createElement(FLD, { label: "\uC218\uC6A9 \uC778\uC6D0" }, /* @__PURE__ */ React.createElement("input", { type: "number", value: form.capacity || "", onChange: (e) => set("capacity", +e.target.value), placeholder: "20", style: inp }))), /* @__PURE__ */ React.createElement(FLD, { label: "\uAC15\uC758\uC2E4 \uC774\uB984", required: true }, /* @__PURE__ */ React.createElement("input", { value: form.name || "", onChange: (e) => set("name", e.target.value), placeholder: "\uC77C\uBC18\uAD50\uC721\uC7A5 301\uD638", style: inp })), /* @__PURE__ */ React.createElement(FLD, { label: "\uC704\uCE58(\uD638\uC218)" }, /* @__PURE__ */ React.createElement("input", { value: form.addr || "", onChange: (e) => set("addr", e.target.value), placeholder: "3\uCE35 301\uD638", style: inp })), /* @__PURE__ */ React.createElement(FLD, { label: "\uC124\uBE44" }, /* @__PURE__ */ React.createElement("input", { value: form.equip || "", onChange: (e) => set("equip", e.target.value), placeholder: "PC\xB7\uBE54\uD504\uB85C\uC81D\uD130", style: inp }))), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "12px 20px",
        borderTop: `1px solid ${T.bd}`,
        display: "flex",
        justifyContent: "space-between",
        background: T.s2
      } }, isEdit ? /* @__PURE__ */ React.createElement(Btn, { variant: "danger", size: "sm", onClick: async () => {
        try {
          const { error } = await sbDelete("rooms", `id=eq.${room.id}`);
          if (error) throw error;
          if (setRooms) setRooms((p) => p.filter((r) => r.id !== room.id));
          onClose();
        } catch (e) {
          alert("\uAC15\uC758\uC2E4 \uC0AD\uC81C \uC624\uB958: " + (e.message || String(e)));
        }
      } }, "\uC0AD\uC81C") : /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { onClick: async () => {
        if (!form.name) return alert("\uAC15\uC758\uC2E4 \uC774\uB984\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.");
        try {
          if (onSave) await onSave(form);
          else {
            if (isEdit) setRooms((p) => p.map((r) => r.id === room.id ? { ...form } : r));
            else setRooms((p) => [...p, { ...form, id: Date.now() }]);
          }
          onClose();
        } catch (err) {
          alert("\uC800\uC7A5 \uC624\uB958: " + (err.message || JSON.stringify(err)));
        }
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), isEdit ? "\uC800\uC7A5" : "\uCD94\uAC00"))))
    );
  };
  const BOOKING_COLORS = ["#EA580C", "#C2410C", "#7C2D12", "#9A3412", "#DC2626", "#2563EB", "#7C3AED", "#059669"];
  const COURSE_PALETTE = [
    "#2563EB",
    "#7C3AED",
    "#059669",
    "#DC2626",
    "#D97706",
    "#0891B2",
    "#DB2777",
    "#65A30D",
    "#EA580C",
    "#0F766E",
    "#4F46E5",
    "#BE185D",
    "#15803D",
    "#B45309",
    "#6D28D9"
  ];
  const getCourseColor = (courseId, courses) => {
    const idx = courses.findIndex((c) => c.id === courseId);
    return COURSE_PALETTE[(idx >= 0 ? idx : 0) % COURSE_PALETTE.length];
  };
  const TAB_PILL_SHADOW = `0 1px 6px rgba(0,0,0,.10),0 0 0 1px rgba(234,88,12,.18)`;
  let _idCounter = Date.now();
  const RoomGanttChart = ({ rooms, bookings, courses, onEditBook, year, month, prevMonth, nextMonth, goToday }) => {
    const today = /* @__PURE__ */ new Date();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const MONTH_KR = ["1\uC6D4", "2\uC6D4", "3\uC6D4", "4\uC6D4", "5\uC6D4", "6\uC6D4", "7\uC6D4", "8\uC6D4", "9\uC6D4", "10\uC6D4", "11\uC6D4", "12\uC6D4"];
    const dateStr = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return /* @__PURE__ */ React.createElement(Card, { style: { overflow: "auto", padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "12px 18px",
      borderBottom: `1px solid ${T.bd}`,
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: T.s2
    } }, /* @__PURE__ */ React.createElement("button", { onClick: prevMonth, style: {
      width: 30,
      height: 30,
      borderRadius: 8,
      border: `1px solid ${T.bd}`,
      background: T.s,
      cursor: "pointer",
      fontSize: 15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, "\u2039"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: T.tx, minWidth: 120, textAlign: "center" } }, year, "\uB144 ", MONTH_KR[month]), /* @__PURE__ */ React.createElement("button", { onClick: nextMonth, style: {
      width: 30,
      height: 30,
      borderRadius: 8,
      border: `1px solid ${T.bd}`,
      background: T.s,
      cursor: "pointer",
      fontSize: 15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, "\u203A"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: goToday,
        style: {
          padding: "5px 12px",
          borderRadius: 8,
          border: `1px solid ${T.bd}`,
          background: T.s2,
          cursor: "pointer",
          fontSize: 11,
          color: T.mu,
          marginLeft: 4
        }
      },
      "\uC624\uB298"
    )), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 140 + daysInMonth * 30, padding: "14px 14px 18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: `140px repeat(${daysInMonth}, 30px)`, gap: 1, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: T.mu, fontSize: 10, padding: "4px 8px" } }, "\uAC15\uC758\uC2E4"), Array.from({ length: daysInMonth }).map((_, i) => {
      const ds = dateStr(i + 1);
      const dow = new Date(year, month, i + 1).getDay();
      const isToday = ds === todayStr;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: {
        textAlign: "center",
        fontSize: 9,
        fontWeight: isToday ? 900 : 600,
        color: isToday ? T.p : dow === 0 ? "#EF4444" : dow === 6 ? "#3B82F6" : T.mu,
        padding: "4px 0",
        background: isToday ? T.pbg : "transparent",
        borderRadius: 4
      } }, i + 1);
    })), rooms.map((room) => /* @__PURE__ */ React.createElement("div", { key: room.id, style: {
      display: "grid",
      gridTemplateColumns: `140px repeat(${daysInMonth}, 30px)`,
      gap: 1,
      marginBottom: 3
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontWeight: 600,
      color: T.tx,
      fontSize: 11,
      padding: "6px 8px",
      display: "flex",
      alignItems: "center",
      background: T.s2,
      borderRadius: 6,
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, room.name)), Array.from({ length: daysInMonth }).map((_, dayIdx) => {
      const ds = dateStr(dayIdx + 1);
      const dayBooks = bookings.filter((b) => b.roomId === room.id && b.start <= ds && b.end >= ds);
      const conflict = dayBooks.length > 1;
      const isToday = ds === todayStr;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: dayIdx,
          onClick: () => {
            if (dayBooks.length > 0 && onEditBook) onEditBook(dayBooks[0]);
          },
          title: conflict ? "\u26A0\uFE0F \uC911\uBCF5 \uC608\uC57D!" : dayBooks[0]?.label || "",
          style: {
            height: 28,
            borderRadius: 4,
            background: dayBooks.length > 0 ? dayBooks[0].color : isToday ? T.pbg : T.s2,
            border: conflict ? `2px solid ${T.danger}` : isToday ? `1px solid ${T.pl}` : "none",
            cursor: dayBooks.length > 0 ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }
        },
        dayBooks.length > 0 && /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: 8,
          color: "#fff",
          fontWeight: 700,
          padding: "0 3px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        } }, conflict ? "\u26A0\uFE0F" : dayBooks[0].label.slice(0, 5))
      );
    }))), bookings.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 } }, [...new Map(bookings.map((b) => [b.label, b])).values()].map((b) => /* @__PURE__ */ React.createElement("div", { key: b.label, style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 10, height: 10, borderRadius: 3, background: b.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, b.label))))));
  };
  const RoomMgmt = ({ courses }) => {
    const today = /* @__PURE__ */ new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [rooms, setRooms] = useState(SEED_ROOMS);
    const [bookings, setBookings] = useState([]);
    const [showRoomModal, setShowRM] = useState(false);
    const [showBookModal, setShowBM] = useState(null);
    const [editRoom, setEditRoom] = useState(null);
    const [editBook, setEditBook] = useState(null);
    const [selRoom, setSelRoom] = useState(0);
    const [viewMode, setViewMode] = useState("calendar");
    const [dbStatus, setDbStatus] = useState("loading");
    const [rtStatus, setRtStatus] = useState("pending");
    const [lastOp, setLastOp] = useState(null);
    useEffect(() => {
      const load = async () => {
        try {
          const [rRes, bRes] = await Promise.all([
            sbGet("rooms", "select=*&order=id"),
            sbGet("room_bookings", "select=*&order=id")
          ]);
          if (rRes.error) throw rRes.error;
          if (!rRes.error && rRes.data && rRes.data.length > 0) setRooms(rRes.data.map(toRoom));
          if (!bRes.error && bRes.data) setBookings(bRes.data.map(toBooking));
          setDbStatus("ok");
        } catch (err) {
          console.warn("\uAC15\uC758\uC2E4 \uB370\uC774\uD130 \uB85C\uB4DC \uC2E4\uD328 (\uC2DC\uB4DC \uB370\uC774\uD130 \uC0AC\uC6A9):", err.message || err);
          setDbStatus("error");
        }
      };
      load();
    }, []);
    useEffect(() => {
      realtimeManager.subscribe("rooms", {
        onInsert: (newRecord) => {
          setRooms((prev) => {
            if (prev.find((r) => r.id === newRecord.id))
              return prev.map((r) => r.id === newRecord.id ? toRoom(newRecord) : r);
            console.log("\u{1F195} \uAC15\uC758\uC2E4 \uCD94\uAC00 (\uC2E4\uC2DC\uAC04):", newRecord.name);
            return [...prev, toRoom(newRecord)];
          });
        },
        onUpdate: (newRecord) => {
          setRooms((prev) => prev.map((r) => r.id === newRecord.id ? toRoom(newRecord) : r));
          console.log("\u270F\uFE0F \uAC15\uC758\uC2E4 \uC218\uC815 (\uC2E4\uC2DC\uAC04):", newRecord.name);
        },
        onDelete: (oldRecord) => {
          setRooms((prev) => prev.filter((r) => r.id !== oldRecord.id));
          console.log("\u{1F5D1}\uFE0F \uAC15\uC758\uC2E4 \uC0AD\uC81C (\uC2E4\uC2DC\uAC04):", oldRecord.name);
        },
        onStatus: (s) => setRtStatus(s)
      });
      realtimeManager.subscribe("room_bookings", {
        onInsert: (newRecord) => {
          setBookings((prev) => {
            if (prev.find((b) => b.id === newRecord.id))
              return prev.map((b) => b.id === newRecord.id ? toBooking(newRecord) : b);
            console.log("\u{1F195} \uAC15\uC758\uC2E4 \uC608\uC57D \uCD94\uAC00 (\uC2E4\uC2DC\uAC04):", newRecord.id);
            return [...prev, toBooking(newRecord)];
          });
        },
        onUpdate: (newRecord) => {
          setBookings((prev) => prev.map((b) => b.id === newRecord.id ? toBooking(newRecord) : b));
          console.log("\u270F\uFE0F \uAC15\uC758\uC2E4 \uC608\uC57D \uC218\uC815 (\uC2E4\uC2DC\uAC04):", newRecord.id);
        },
        onDelete: (oldRecord) => {
          setBookings((prev) => prev.filter((b) => b.id !== oldRecord.id));
          console.log("\u{1F5D1}\uFE0F \uAC15\uC758\uC2E4 \uC608\uC57D \uC0AD\uC81C (\uC2E4\uC2DC\uAC04):", oldRecord.id);
        },
        onStatus: (s) => setRtStatus(s)
      });
      return () => {
        realtimeManager.unsubscribe("rooms");
        realtimeManager.unsubscribe("room_bookings");
      };
    }, []);
    const _roomErrMsg = (err, prefix) => {
      const m = err?.message || String(err);
      const is404 = err?.code === "42P01" || m.includes("does not exist") || m.includes("404");
      if (is404) {
        return `${prefix}: 'rooms' \uD14C\uC774\uBE14\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.
Supabase SQL Editor\uC5D0\uC11C supabase-setup.sql \uC804\uCCB4\uB97C \uC2E4\uD589\uD558\uC138\uC694.`;
      }
      if (m.includes("floor") && (m.includes("schema cache") || m.includes("Could not find"))) {
        return `${prefix}: rooms \uD14C\uC774\uBE14\uC5D0 'floor' \uCEEC\uB7FC\uC774 \uC544\uC9C1 \uBC18\uC601\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.

\u{1F4A1} \uD574\uACB0 \uBC29\uBC95 (\uC21C\uC11C\uB300\uB85C \uC2DC\uB3C4):
1. Supabase SQL Editor\uC5D0\uC11C supabase-setup.sql \uC804\uCCB4\uB97C \uB2E4\uC2DC \uC2E4\uD589\uD558\uC138\uC694.
2. Supabase \uB300\uC2DC\uBCF4\uB4DC \u2192 Settings \u2192 API \u2192 [Reload schema] \uBC84\uD2BC \uD074\uB9AD
3. \uC704 \uB450 \uB2E8\uACC4 \uC644\uB8CC \uD6C4 \uBE0C\uB77C\uC6B0\uC800\uB97C \uC0C8\uB85C \uACE0\uCE68\uD558\uC138\uC694.`;
      }
      return `${prefix}: ${fmtSaveError(err)}`;
    };
    const handleRoomSave = async (room) => {
      try {
        if (room.id) {
          const { error } = await sbUpdate("rooms", `id=eq.${room.id}`, fromRoom(room));
          if (error) throw error;
          setRooms((p) => p.map((r) => r.id === room.id ? room : r));
        } else {
          const { data, error } = await sbInsert("rooms", fromRoom(room));
          if (error) throw error;
          const saved = data && data[0] ? toRoom(data[0]) : { ...room, id: Date.now() };
          setRooms((p) => p.find((r) => r.id === saved.id) ? p.map((r) => r.id === saved.id ? saved : r) : [...p, saved]);
        }
        setLastOp({ type: room.id ? "edit" : "add", status: "ok" });
      } catch (err) {
        setLastOp({ type: room.id ? "edit" : "add", status: "error", msg: err.message || String(err) });
        alert(_roomErrMsg(err, "\uAC15\uC758\uC2E4 \uC800\uC7A5 \uC624\uB958"));
        throw err;
      }
    };
    const handleBookSave = async (book) => {
      try {
        if (book.id) {
          const { error } = await sbUpdate("room_bookings", `id=eq.${book.id}`, fromBooking(book));
          if (error) throw error;
          setBookings((p) => p.map((b) => b.id === book.id ? book : b));
        } else {
          const { data, error } = await sbInsert("room_bookings", fromBooking(book));
          if (error) {
            const m = error?.message || String(error);
            if (m.includes("does not exist") || m.includes("404") || error?.code === "42P01") {
              console.warn("\u26A0\uFE0F room_bookings \uD14C\uC774\uBE14 \uC5C6\uC74C \u2014 \uB85C\uCEEC \uC800\uC7A5.");
              alert("\uAC15\uC758\uC2E4 \uC608\uC57D \uD14C\uC774\uBE14\uC774 \uC5C6\uC5B4 \uC774\uBC88 \uC138\uC158\uC5D0\uB9CC \uC784\uC2DC \uC800\uC7A5\uB429\uB2C8\uB2E4.\nSupabase SQL Editor\uC5D0\uC11C supabase-setup.sql \uC804\uCCB4\uB97C \uC2E4\uD589\uD558\uBA74 \uC601\uAD6C \uC800\uC7A5\uB429\uB2C8\uB2E4.");
              setBookings((p) => [...p, { ...book, id: Date.now() }]);
              setLastOp({ type: "add", status: "error", msg: "room_bookings \uD14C\uC774\uBE14 \uC5C6\uC74C" });
              return;
            }
            throw error;
          }
          if (data && data[0]) {
            const saved = toBooking(data[0]);
            setBookings(
              (p) => p.some((b) => b.id === saved.id) ? p.map((b) => b.id === saved.id ? saved : b) : [...p, saved]
            );
          }
        }
        setLastOp({ type: book.id ? "edit" : "add", status: "ok" });
      } catch (err) {
        setLastOp({ type: book.id ? "edit" : "add", status: "error", msg: err.message || String(err) });
        alert(_roomErrMsg(err, "\uC77C\uC815 \uC800\uC7A5 \uC624\uB958"));
        throw err;
      }
    };
    const handleBookDelete = async (id) => {
      try {
        const { error } = await sbDelete("room_bookings", `id=eq.${id}`);
        if (error) throw error;
        setBookings((p) => p.filter((b) => b.id !== id));
        setLastOp({ type: "delete", status: "ok" });
      } catch (err) {
        console.warn("\uC608\uC57D \uC0AD\uC81C \uC624\uB958:", err.message || err);
        setLastOp({ type: "delete", status: "error", msg: err.message || String(err) });
        alert("\uC608\uC57D \uC0AD\uC81C \uC624\uB958: " + (err.message || String(err)));
      }
    };
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks = [];
    let day = 1 - firstDay;
    while (day <= daysInMonth) {
      const week = [];
      for (let d = 0; d < 7; d++, day++) week.push(day > 0 && day <= daysInMonth ? day : null);
      weeks.push(week);
    }
    const dateStr = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const bookingsForDay = (roomId, d) => {
      if (!d) return [];
      const ds = dateStr(d);
      return bookings.filter(
        (b) => (roomId === 0 || b.roomId === roomId) && b.start <= ds && b.end >= ds
      );
    };
    const hasConflictOnDay = (d) => {
      if (!d) return false;
      const ds = dateStr(d);
      const dayOfWeek = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"][new Date(ds).getDay()];
      const daysOverlapLocal = (daysA, daysB) => {
        if (!daysA || !daysB) return true;
        const setA = new Set(daysA.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean));
        return daysB.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean).some((x) => setA.has(x));
      };
      const timesOverlapLocal = (fA, tA, fB, tB) => {
        if (!fA || !tA || !fB || !tB) return true;
        const m = (t) => {
          const [h, mn] = t.split(":").map(Number);
          return h * 60 + mn;
        };
        return m(fA) < m(tB) && m(tA) > m(fB);
      };
      const roomIds = [...new Set(bookings.map((b) => b.roomId))];
      return roomIds.some((rid) => {
        const dayBkgs = bookings.filter((b) => b.roomId === rid && b.start <= ds && b.end >= ds);
        if (dayBkgs.length < 2) return false;
        for (let i = 0; i < dayBkgs.length; i++) {
          for (let j = i + 1; j < dayBkgs.length; j++) {
            const cA = courses.find((c) => c.id === dayBkgs[i].courseId) || {};
            const cB = courses.find((c) => c.id === dayBkgs[j].courseId) || {};
            if (daysOverlapLocal(cA.schedDays, cB.schedDays) && (daysOverlapLocal(dayOfWeek, cA.schedDays) || !cA.schedDays) && timesOverlapLocal(
              cA.schedTimeFrom,
              cA.schedTimeTo,
              cB.schedTimeFrom,
              cB.schedTimeTo
            )) return true;
          }
        }
        return false;
      });
    };
    const prevMonth = () => {
      if (month === 0) {
        setMonth(11);
        setYear((y) => y - 1);
      } else setMonth((m) => m - 1);
    };
    const nextMonth = () => {
      if (month === 11) {
        setMonth(0);
        setYear((y) => y + 1);
      } else setMonth((m) => m + 1);
    };
    const MONTH_KR = ["1\uC6D4", "2\uC6D4", "3\uC6D4", "4\uC6D4", "5\uC6D4", "6\uC6D4", "7\uC6D4", "8\uC6D4", "9\uC6D4", "10\uC6D4", "11\uC6D4", "12\uC6D4"];
    const DAY_KR = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"];
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2
    };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, editBook !== null && /* @__PURE__ */ React.createElement(BookModal, { init: editBook.id ? editBook : null, onClose: () => setEditBook(null), rooms, bookings, courses, setBookings, onSave: handleBookSave, onDelete: handleBookDelete }), showRoomModal && /* @__PURE__ */ React.createElement(RoomModal, { room: editRoom, onClose: () => {
      setShowRM(false);
      setEditRoom(null);
    }, setRooms, onSave: handleRoomSave }), /* @__PURE__ */ React.createElement(
      SectionHead,
      {
        title: "\uAC15\uC758\uC2E4 \uAD00\uB9AC",
        sub: "\uC6D4\uAC04 \uCE98\uB9B0\uB354 \xB7 \uAC15\uC758\uC2E4 \uB4F1\uB85D \xB7 \uAC15\uC758 \uAE30\uAC04 \uC124\uC815",
        right: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", background: T.s3, borderRadius: 8, padding: 2 } }, [["calendar", "\u{1F4C5} \uCE98\uB9B0\uB354"], ["gantt", "\u{1F4CA} Gantt"]].map(([v, l]) => /* @__PURE__ */ React.createElement("button", { key: v, onClick: () => setViewMode(v), style: {
          padding: "5px 10px",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 600,
          fontSize: 11,
          borderRadius: 6,
          background: viewMode === v ? T.s : "transparent",
          color: viewMode === v ? T.p : T.mu,
          boxShadow: viewMode === v ? TAB_PILL_SHADOW : "none",
          transition: "all .15s"
        } }, l))), /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => {
          setEditRoom(null);
          setShowRM(true);
        } }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 13 }), " \uAC15\uC758\uC2E4 \uCD94\uAC00"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: () => setEditBook({}) }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 13 }), " \uC77C\uC815 \uCD94\uAC00"))
      }
    ), /* @__PURE__ */ React.createElement(SyncPanel, { dbStatus, rtStatus, lastOp, count: rooms.length }), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setSelRoom(0), style: {
      padding: "6px 14px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      background: selRoom === 0 ? T.p : T.s3,
      color: selRoom === 0 ? "#fff" : T.mu
    } }, "\uC804\uCCB4"), selRoom !== 0 && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditRoom(rooms.find((r) => r.id === selRoom));
          setShowRM(true);
        },
        style: {
          padding: "5px 10px",
          borderRadius: 16,
          border: `1px solid ${T.bd}`,
          background: "transparent",
          color: T.mu,
          cursor: "pointer",
          fontSize: 11
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { n: "edit", s: 11 }),
      " \uC218\uC815"
    )), [1, 2, 3].map((fl) => {
      const flRooms = rooms.filter((r) => (r.floor || 0) === fl);
      if (!flRooms.length) return null;
      return /* @__PURE__ */ React.createElement("div", { key: fl, style: { marginBottom: 8, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 10,
        fontWeight: 800,
        color: T.mu,
        minWidth: 24,
        textAlign: "center",
        background: T.s3,
        borderRadius: 6,
        padding: "3px 7px",
        whiteSpace: "nowrap"
      } }, fl, "\uCE35"), flRooms.map((r) => /* @__PURE__ */ React.createElement("button", { key: r.id, onClick: () => setSelRoom(r.id), style: {
        padding: "6px 14px",
        borderRadius: 20,
        border: "none",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        background: selRoom === r.id ? T.p : T.s3,
        color: selRoom === r.id ? "#fff" : T.mu
      } }, r.name)));
    }), rooms.filter((r) => !r.floor).length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: T.mu, background: T.s3, borderRadius: 6, padding: "3px 7px" } }, "\uAE30\uD0C0"), rooms.filter((r) => !r.floor).map((r) => /* @__PURE__ */ React.createElement("button", { key: r.id, onClick: () => setSelRoom(r.id), style: {
      padding: "6px 14px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      background: selRoom === r.id ? T.p : T.s3,
      color: selRoom === r.id ? "#fff" : T.mu
    } }, r.name)))), selRoom !== 0 && (() => {
      const r = rooms.find((x) => x.id === selRoom);
      return r ? /* @__PURE__ */ React.createElement(Card, { style: { padding: "12px 16px", marginBottom: 14, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18 } }, "\u{1F3EB}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.tx } }, r.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, r.floor ? `${r.floor}\uCE35` : "", r.addr && r.floor ? " \xB7 " : "", r.addr))), /* @__PURE__ */ React.createElement(Chip, { label: `\uC218\uC6A9 ${r.capacity}\uBA85`, bg: T.pbg, color: T.p }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, r.equip)) : null;
    })(), viewMode === "calendar" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Card, { style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
      padding: "12px 18px",
      borderBottom: `1px solid ${T.bd}`,
      display: "flex",
      alignItems: "center",
      gap: 12
    } }, /* @__PURE__ */ React.createElement("button", { onClick: prevMonth, style: {
      width: 30,
      height: 30,
      borderRadius: 8,
      border: `1px solid ${T.bd}`,
      background: T.s2,
      cursor: "pointer",
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, "\u2039"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: T.tx, minWidth: 120, textAlign: "center" } }, year, "\uB144 ", MONTH_KR[month]), /* @__PURE__ */ React.createElement("button", { onClick: nextMonth, style: {
      width: 30,
      height: 30,
      borderRadius: 8,
      border: `1px solid ${T.bd}`,
      background: T.s2,
      cursor: "pointer",
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, "\u203A"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setYear(today.getFullYear());
          setMonth(today.getMonth());
        },
        style: {
          padding: "5px 12px",
          borderRadius: 8,
          border: `1px solid ${T.bd}`,
          background: T.s2,
          cursor: "pointer",
          fontSize: 11,
          color: T.mu,
          marginLeft: 4
        }
      },
      "\uC624\uB298"
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${T.bd}` } }, DAY_KR.map((d, i) => /* @__PURE__ */ React.createElement("div", { key: d, style: {
      padding: "8px 0",
      textAlign: "center",
      fontSize: 12,
      fontWeight: 700,
      color: i === 0 ? "#EF4444" : i === 6 ? "#3B82F6" : T.mu,
      background: T.s2
    } }, d))), weeks.map((week, wi) => /* @__PURE__ */ React.createElement("div", { key: wi, style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      borderBottom: wi < weeks.length - 1 ? `1px solid ${T.bd}` : "none"
    } }, week.map((d, di) => {
      const isToday = d && year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      const dayBkgs = bookingsForDay(selRoom, d);
      const isConflict = selRoom === 0 ? hasConflictOnDay(d) : dayBkgs.length >= 2;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: di,
          onClick: () => {
            if (d) setEditBook({ start: dateStr(d), end: dateStr(d) });
          },
          style: {
            minHeight: 72,
            padding: "6px 5px",
            borderRight: di < 6 ? `1px solid ${T.bd}` : "none",
            background: !d ? T.s3 : isConflict ? "#FFF1F2" : isToday ? T.pbg : T.s,
            cursor: d ? "pointer" : "default",
            outline: isConflict ? "inset 2px solid #FECDD3" : "none",
            transition: "background .1s",
            verticalAlign: "top",
            position: "relative"
          }
        },
        d && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 2, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("div", { style: {
          fontSize: 11,
          fontWeight: isToday ? 900 : 600,
          color: isToday ? "#fff" : isConflict ? T.danger : di === 0 ? "#EF4444" : di === 6 ? "#3B82F6" : T.tx,
          width: 20,
          height: 20,
          borderRadius: 6,
          background: isToday ? T.p : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        } }, d), isConflict && /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: 8,
          fontWeight: 800,
          color: T.danger,
          background: "#FEE2E2",
          padding: "1px 4px",
          borderRadius: 3
        } }, "\uC911\uBCF5")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, dayBkgs.slice(0, 3).map((b, bi) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: bi,
            onClick: (e) => {
              e.stopPropagation();
              setEditBook(b);
            },
            style: {
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
              background: b.color,
              borderRadius: 3,
              padding: "1px 4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer"
            }
          },
          b.label
        )), dayBkgs.length > 3 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: isConflict ? T.danger : T.mu } }, "+", dayBkgs.length - 3, "\uAC74")))
      );
    })))), (() => {
      const ms = `${year}-${String(month + 1).padStart(2, "0")}`;
      const monthBkgs = bookings.filter(
        (b) => (selRoom === 0 || b.roomId === selRoom) && (b.start.startsWith(ms) || b.end.startsWith(ms) || b.start < ms + "-01" && b.end >= ms + "-01")
      );
      if (!monthBkgs.length) return null;
      const conflictIds = /* @__PURE__ */ new Set();
      monthBkgs.forEach((a) => {
        monthBkgs.forEach((b) => {
          if (a.id !== b.id && a.roomId === b.roomId && a.start <= b.end && a.end >= b.start) {
            conflictIds.add(a.id);
            conflictIds.add(b.id);
          }
        });
      });
      return /* @__PURE__ */ React.createElement(Card, { style: { marginTop: 14, padding: "14px 18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, "\uC774\uB2EC \uAC15\uC758 \uC77C\uC815"), conflictIds.size > 0 && /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 10,
        fontWeight: 700,
        color: T.danger,
        background: "#FEE2E2",
        padding: "2px 7px",
        borderRadius: 5
      } }, "\u26A0\uFE0F \uC911\uBCF5 ", conflictIds.size, "\uAC74")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, monthBkgs.map((b) => {
        const r = rooms.find((x) => x.id === b.roomId);
        const isConflict = conflictIds.has(b.id);
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: b.id,
            onClick: () => setEditBook(b),
            style: {
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background .1s",
              border: isConflict ? "1px solid #FECACA" : `1px solid ${T.bd}`,
              background: isConflict ? "#FFF1F2" : T.s2
            }
          },
          /* @__PURE__ */ React.createElement("div", { style: { width: 10, height: 10, borderRadius: 3, background: b.color, flexShrink: 0 } }),
          /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, b.label), isConflict && /* @__PURE__ */ React.createElement("span", { style: {
            fontSize: 9,
            fontWeight: 800,
            color: T.danger,
            background: "#FEE2E2",
            padding: "1px 5px",
            borderRadius: 3
          } }, "\uC911\uBCF5")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu } }, r?.name, " \xB7 ", b.start, " ~ ", b.end)),
          /* @__PURE__ */ React.createElement(Icon, { n: "edit", s: 12 })
        );
      })));
    })()), viewMode === "gantt" && /* @__PURE__ */ React.createElement(
      RoomGanttChart,
      {
        rooms,
        bookings,
        courses,
        onEditBook: (b) => setEditBook(b),
        year,
        month,
        prevMonth,
        nextMonth,
        goToday: () => {
          setYear(today.getFullYear());
          setMonth(today.getMonth());
        }
      }
    ));
  };
  const DataManager = ({ students, courses, onResetAll, onResetCourse, onClose }) => {
    const [tab, setTab] = useState("status");
    const [selCid, setSelCid] = useState(courses[0]?.id || 0);
    const [confirmAll, setConfirmAll] = useState(false);
    const [confirmCourse, setConfirmCourse] = useState(false);
    const stats = courses.map((c) => {
      const ss = students.filter((s) => s.cid === c.id);
      const rateSs = ss.filter((s) => !isDropoutStudent(s));
      const completed = rateSs.filter((s) => s.rate >= 80).length;
      const avgRate = rateSs.length ? Math.round(rateSs.reduce((a, s) => a + s.rate, 0) / rateSs.length) : 0;
      return { ...c, enrolled: ss.length, completed, avgRate, rateCount: rateSs.length };
    });
    const backupAll = () => {
      const wb = XLSX.utils.book_new();
      const rows = students.map((s) => {
        const c = courses.find((x) => x.id === s.cid);
        const b = (s.birth || "").replace(/-/g, "");
        const front6 = b.length >= 8 ? b.slice(2, 4) + b.slice(4, 6) + b.slice(6, 8) : "";
        const idNum = front6 ? `${front6}-${s.idBack || ""}` : s.idBack || "";
        return {
          "\uC774\uB984": s.name,
          "\uC131\uBCC4": s.gender || "",
          "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638": idNum,
          "\uC5F0\uB77D\uCC98": s.phone,
          "\uAC70\uC8FC\uC2DC\uAD70": s.addrCity || "",
          "\uACFC\uC815\uCF54\uB4DC": c?.code || "",
          "\uACFC\uC815\uBA85": c?.name || "",
          "\uBD84\uC57C": c?.cat || "",
          "\uBA74\uC811\uC77C": s.itvDate || "",
          "\uBA74\uC811\uC810\uC218": s.itvScore || "",
          "\uBA74\uC811\uB4F1\uAE09": s.itvGrade || "",
          "\uD569\uACA9\uC5EC\uBD80": s.itvPass ? "\uD569\uACA9" : "\uBD88\uD569\uACA9",
          "\uD2B9\uC774\uC0AC\uD56D": s.memo || "",
          "\uCD9C\uC11D\uB960(%)": isDropoutStudent(s) ? "" : s.rate,
          "\uC218\uB8CC\uC5EC\uBD80": isDropoutStudent(s) ? "\uC911\uB3C4\uD0C8\uB77D" : s.rate >= 80 ? "\uC218\uB8CC" : "\uBBF8\uC218\uB8CC"
        };
      });
      const ws1 = XLSX.utils.json_to_sheet(rows);
      ws1["!cols"] = [8, 5, 16, 14, 10, 8, 28, 10, 12, 8, 8, 8, 20, 8, 8].map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws1, "\uC804\uCCB4_\uD6C8\uB828\uC0DD");
      const summary = stats.map((c) => ({
        "\uACFC\uC815\uCF54\uB4DC": c.code,
        "\uACFC\uC815\uBA85": c.name,
        "\uBD84\uC57C": c.cat,
        "\uBAA8\uC9D1\uBAA9\uD45C": c.tgt,
        "\uD604\uC7AC\uB4F1\uB85D": c.enrolled,
        "\uCDA9\uC6D0\uC728(%)": c.tgt ? Math.round(c.enrolled / c.tgt * 100) : 0,
        "\uC218\uB8CC\uBAA9\uD45C": c.cGoal,
        "\uC218\uB8CC\uC778\uC6D0": c.completed,
        "\uC218\uB8CC\uC728(%)": c.rateCount ? Math.round(c.completed / c.rateCount * 100) : 0,
        "\uD3C9\uADE0\uCD9C\uC11D\uB960(%)": c.rateCount ? c.avgRate : ""
      }));
      const ws2 = XLSX.utils.json_to_sheet(summary);
      ws2["!cols"] = [8, 28, 12, 8, 8, 8, 8, 8, 8, 10].map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws2, "\uACFC\uC815\uBCC4_\uC9D1\uACC4");
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([out], { type: "application/octet-stream" }));
      a.download = `\uACBD\uAE30\uBD81\uBD80_\uD559\uC0AC_\uBC31\uC5C5_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`;
      a.click();
    };
    const backupCourse = (cid) => {
      const c = courses.find((x) => x.id === cid);
      const ss = students.filter((s) => s.cid === cid);
      if (!ss.length) {
        alert("\uD574\uB2F9 \uACFC\uC815\uC5D0 \uD6C8\uB828\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      const rows = ss.map((s) => {
        const b = (s.birth || "").replace(/-/g, "");
        const front6 = b.length >= 8 ? b.slice(2, 4) + b.slice(4, 6) + b.slice(6, 8) : "";
        const idNum = front6 ? `${front6}-${s.idBack || ""}` : s.idBack || "";
        return {
          "\uC774\uB984": s.name,
          "\uC131\uBCC4": s.gender || "",
          "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638": idNum,
          "\uC5F0\uB77D\uCC98": s.phone,
          "\uAC70\uC8FC\uC2DC\uAD70": s.addrCity || "",
          "\uBA74\uC811\uC77C": s.itvDate || "",
          "\uBA74\uC811\uC810\uC218": s.itvScore || "",
          "\uBA74\uC811\uB4F1\uAE09": s.itvGrade || "",
          "\uD569\uACA9\uC5EC\uBD80": s.itvPass ? "\uD569\uACA9" : "\uBD88\uD569\uACA9",
          "\uD2B9\uC774\uC0AC\uD56D": s.memo || "",
          "\uCD9C\uC11D\uB960(%)": isDropoutStudent(s) ? "" : s.rate,
          "\uC218\uB8CC\uC5EC\uBD80": isDropoutStudent(s) ? "\uC911\uB3C4\uD0C8\uB77D" : s.rate >= 80 ? "\uC218\uB8CC" : "\uBBF8\uC218\uB8CC"
        };
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [8, 5, 12, 14, 14, 10, 12, 8, 8, 8, 20, 8, 8].map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, c?.code || "\uACFC\uC815");
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([out], { type: "application/octet-stream" }));
      a.download = `${c?.code || "\uACFC\uC815"}_\uD6C8\uB828\uC0DD_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`;
      a.click();
    };
    const TAB_ITEMS_DM = [
      { id: "status", icon: "\u{1F4CA}", label: "\uD604\uD669" },
      { id: "course", icon: "\u{1F4C2}", label: "\uACFC\uC815\uBCC4 \uAD00\uB9AC" },
      { id: "backup", icon: "\u{1F4BE}", label: "\uBC31\uC5C5 \xB7 \uCD08\uAE30\uD654" }
    ];
    const selCourse = courses.find((c) => c.id === selCid);
    const selStudents = students.filter((s) => s.cid === selCid);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 18,
        width: 580,
        maxWidth: "98vw",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,.28)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,${T.sb},${T.p})`,
        padding: "16px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff" } }, "\u{1F5C4}\uFE0F \uB370\uC774\uD130 \uAD00\uB9AC"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 2 } }, "\uD6C8\uB828\uC0DD ", students.length, "\uBA85 \xB7 ", courses.length, "\uAC1C \uACFC\uC815")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px 0", background: T.s2, borderBottom: `1px solid ${T.bd}`, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 2, background: T.s3, borderRadius: 12, padding: 4 } }, TAB_ITEMS_DM.map((t) => {
        const active = tab === t.id;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: t.id,
            onClick: () => setTab(t.id),
            "aria-current": active ? "page" : void 0,
            className: `tab-pill${active ? " tab-pill-active" : ""}`,
            style: {
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "8px 10px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 9,
              background: active ? T.s : "transparent",
              color: active ? T.p : T.mu,
              boxShadow: active ? TAB_PILL_SHADOW : "none"
            }
          },
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14 }, "aria-hidden": "true" }, t.icon),
          /* @__PURE__ */ React.createElement("span", null, t.label),
          active && /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: {
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: T.p,
            flexShrink: 0,
            marginLeft: 2
          } })
        );
      }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "18px 22px" } }, tab === "status" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 } }, [
        { l: "\uCD1D \uD6C8\uB828\uC0DD", v: students.length, sub: `\uBAA9\uD45C ${courses.reduce((a, c) => a + c.tgt, 0)}\uBA85`, c: T.p },
        { l: "\uC218\uB8CC \uC608\uC815", v: students.filter((s) => !isDropoutStudent(s) && s.rate >= 80).length, sub: "\uCD9C\uC11D\uB960 80% \uC774\uC0C1", c: T.ok },
        { l: "\uC704\uD5D8\uAD70", v: students.filter((s) => !isDropoutStudent(s) && s.rate < 60 && s.rate > 0).length, sub: "\uCD9C\uC11D\uB960 60% \uBBF8\uB9CC", c: T.danger }
      ].map(({ l, v, sub, c }) => /* @__PURE__ */ React.createElement("div", { key: l, style: {
        padding: "14px 16px",
        borderRadius: 10,
        background: T.s2,
        border: `1px solid ${T.bd}`,
        textAlign: "center"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: c } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx, marginTop: 2 } }, l), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginTop: 2 } }, sub)))), /* @__PURE__ */ React.createElement("div", { style: { borderRadius: 10, border: `1px solid ${T.bd}`, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
        padding: "10px 14px",
        background: T.s2,
        borderBottom: `1px solid ${T.bd}`,
        fontSize: 12,
        fontWeight: 700,
        color: T.tx
      } }, "\uACFC\uC815\uBCC4 \uB4F1\uB85D \uD604\uD669"), /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: "#F8FAFC" } }, ["\uACFC\uC815", "\uB4F1\uB85D/\uBAA9\uD45C", "\uC218\uB8CC", "\uD3C9\uADE0\uCD9C\uC11D"].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
        padding: "8px 12px",
        fontSize: 10,
        fontWeight: 700,
        color: T.mu,
        textAlign: h === "\uACFC\uC815" ? "left" : "center",
        borderBottom: `1px solid ${T.bd}`
      } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, stats.map((c, i) => /* @__PURE__ */ React.createElement("tr", { key: c.id, style: {
        borderBottom: `1px solid ${T.bd}`,
        background: i % 2 === 0 ? T.s : T.s2
      } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, c.code, " \xB7 ", c.cat)), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 13,
        fontWeight: 800,
        color: c.enrolled >= c.tgt ? T.ok : c.enrolled > 0 ? T.warn : T.mu
      } }, c.enrolled), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu } }, "/", c.tgt)), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 12,
        fontWeight: 700,
        color: c.enrolled > 0 && c.completed / c.enrolled >= 0.8 ? T.ok : T.mu
      } }, c.completed, "\uBA85")), /* @__PURE__ */ React.createElement("td", { style: { padding: "9px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 12,
        fontWeight: 700,
        color: c.avgRate >= 80 ? T.ok : c.avgRate >= 60 ? T.warn : c.rateCount ? T.danger : T.mu
      } }, c.rateCount ? `${c.avgRate}%` : "\u2014")))))))), tab === "course" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 700, color: T.mu, display: "block", marginBottom: 7 } }, "\uAD00\uB9AC\uD560 \uACFC\uC815 \uC120\uD0DD"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, courses.map((c) => {
        const cnt = students.filter((s) => s.cid === c.id).length;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: c.id,
            onClick: () => {
              setSelCid(c.id);
              setConfirmCourse(false);
            },
            style: {
              padding: "7px 12px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              transition: "all .15s",
              background: selCid === c.id ? T.p : T.s3,
              color: selCid === c.id ? "#fff" : T.mu
            }
          },
          c.code,
          /* @__PURE__ */ React.createElement("span", { style: {
            marginLeft: 5,
            fontSize: 10,
            opacity: 0.75
          } }, "(", cnt, "\uBA85)")
        );
      }))), selCourse && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: {
        padding: "12px 16px",
        borderRadius: 10,
        background: T.pbg,
        border: `1px solid ${T.pl}40`
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.tx } }, selCourse.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginTop: 3 } }, selCourse.code, " \xB7 ", selCourse.cat, " \xB7 ", selCourse.method, " \xB7 ", selCourse.hours, "\uC2DC\uAC04", selCourse.dateFrom && ` \xB7 ${selCourse.dateFrom} ~ ${selCourse.dateTo}`), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 10 } }, [
        { l: "\uB4F1\uB85D", v: selStudents.length, c: T.p },
        { l: "\uC218\uB8CC\uAD8C", v: selStudents.filter((s) => !isDropoutStudent(s) && s.rate >= 80).length, c: T.ok },
        { l: "\uC704\uD5D8", v: selStudents.filter((s) => !isDropoutStudent(s) && s.rate < 60 && s.rate > 0).length, c: T.danger },
        { l: "\uBBF8\uB4F1\uB85D", v: Math.max(0, selCourse.tgt - selStudents.length), c: T.mu }
      ].map(({ l, v, c }) => /* @__PURE__ */ React.createElement("div", { key: l, style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: c } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, l))))), selStudents.length > 0 ? /* @__PURE__ */ React.createElement("div", { style: {
        borderRadius: 10,
        border: `1px solid ${T.bd}`,
        overflow: "hidden",
        maxHeight: 200,
        overflowY: "auto"
      } }, selStudents.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: s.id, style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        borderBottom: `1px solid ${T.bd}`,
        background: i % 2 === 0 ? T.s : T.s2
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 28,
        height: 28,
        borderRadius: 7,
        flexShrink: 0,
        background: `${T.p}15`,
        color: T.p,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 800
      } }, s.name[0]), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: T.tx } }, s.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu, marginLeft: 8 } }, s.phone)), isDropoutStudent(s) ? /* @__PURE__ */ React.createElement(Chip, { label: "\uC911\uB3C4\uD0C8\uB77D", bg: "#FEE2E2", color: T.danger, size: 10 }) : /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 12,
        fontWeight: 800,
        color: s.rate >= 80 ? T.ok : s.rate >= 60 ? T.warn : T.danger
      } }, s.rate, "%")))) : /* @__PURE__ */ React.createElement("div", { style: {
        padding: "20px 0",
        textAlign: "center",
        fontSize: 12,
        color: T.mu,
        borderRadius: 10,
        border: `1px dashed ${T.bd}`
      } }, "\uB4F1\uB85D\uB41C \uD6C8\uB828\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: {
        padding: "14px 16px",
        borderRadius: 10,
        background: T.s2,
        border: `1px solid ${T.bd}`
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx, marginBottom: 5 } }, "\u{1F4E5} \uACFC\uC815\uBCC4 \uBC31\uC5C5"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginBottom: 10 } }, selCourse.code, " \uD6C8\uB828\uC0DD \uB370\uC774\uD130\uB9CC \uC5D1\uC140\uB85C \uB0B4\uBCF4\uB0B4\uAE30"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: () => backupCourse(selCid) }, /* @__PURE__ */ React.createElement(Icon, { n: "dl", s: 12 }), " \uC5D1\uC140 \uB2E4\uC6B4\uB85C\uB4DC")), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "14px 16px",
        borderRadius: 10,
        background: "#FEF2F2",
        border: "1px solid #FECACA"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.tx, marginBottom: 5 } }, "\u{1F5D1}\uFE0F \uACFC\uC815 \uD6C8\uB828\uC0DD \uCD08\uAE30\uD654"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginBottom: 10 } }, selCourse.code, " \uD6C8\uB828\uC0DD ", selStudents.length, "\uBA85 \uC804\uCCB4 \uC0AD\uC81C", selStudents.length === 0 && /* @__PURE__ */ React.createElement("span", { style: { color: T.mu } }, " (\uC5C6\uC74C)")), !confirmCourse ? /* @__PURE__ */ React.createElement(
        Btn,
        {
          variant: "danger",
          size: "sm",
          onClick: () => {
            if (selStudents.length === 0) {
              alert("\uC0AD\uC81C\uD560 \uD6C8\uB828\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
              return;
            }
            setConfirmCourse(true);
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { n: "alert", s: 12 }),
        " \uCD08\uAE30\uD654"
      ) : /* @__PURE__ */ React.createElement("div", { style: { background: "#FEE2E2", borderRadius: 7, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: T.danger, marginBottom: 7 } }, "\u26A0\uFE0F ", selCourse.code, " \uD6C8\uB828\uC0DD ", selStudents.length, "\uBA85\uC744 \uC0AD\uC81C\uD569\uB2C8\uB2E4"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => setConfirmCourse(false) }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { variant: "danger", size: "sm", onClick: () => {
        onResetCourse(selCid);
        setConfirmCourse(false);
      } }, "\uC0AD\uC81C \uD655\uC778"))))))), tab === "backup" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: {
        padding: 18,
        background: T.pbg,
        borderRadius: 12,
        border: `1px solid ${T.pl}40`
      } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: `${T.p}20`,
        color: T.p,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 20
      } }, "\u{1F4BE}"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, marginBottom: 4 } }, "\uC804\uCCB4 \uB370\uC774\uD130 \uBC31\uC5C5"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, lineHeight: 1.7, marginBottom: 10 } }, "\uD6C8\uB828\uC0DD ", /* @__PURE__ */ React.createElement("b", { style: { color: T.p } }, students.length, "\uBA85"), " \uC804\uCCB4 + \uACFC\uC815\uBCC4 \uC9D1\uACC4\uB97C \uC5D1\uC140 2\uAC1C \uC2DC\uD2B8\uB85C \uB0B4\uBCF4\uB0C5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: backupAll }, /* @__PURE__ */ React.createElement(Icon, { n: "dl", s: 13 }), " \uC804\uCCB4 \uBC31\uC5C5 \uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC")))), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "11px 14px",
        borderRadius: 9,
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        fontSize: 11,
        color: "#92400E",
        lineHeight: 1.7
      } }, "\u2139\uFE0F ", /* @__PURE__ */ React.createElement("b", null, "\uC0D8\uD50C \uB370\uC774\uD130 \uD3EC\uD568 \uC548\uB0B4:"), " \uD604\uC7AC \uB4F1\uB85D\uB41C \uD6C8\uB828\uC0DD \uB370\uC774\uD130\uB294 \uC2DC\uC2A4\uD15C \uD14C\uC2A4\uD2B8\uC6A9 \uC0D8\uD50C\uC785\uB2C8\uB2E4. \uC2E4\uC81C \uC6B4\uC601 \uC2DC\uC791 \uC804\uC5D0 \uACFC\uC815\uBCC4 \uB610\uB294 \uC804\uCCB4 \uCD08\uAE30\uD654\uB97C \uC9C4\uD589\uD574 \uC8FC\uC138\uC694."), /* @__PURE__ */ React.createElement("div", { style: {
        padding: 18,
        background: "#FEF2F2",
        borderRadius: 12,
        border: "1px solid #FECACA"
      } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "#FEE2E2",
        color: T.danger,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 20
      } }, "\u{1F5D1}\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, marginBottom: 4 } }, "\uC804\uCCB4 \uD6C8\uB828\uC0DD \uCD08\uAE30\uD654"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, lineHeight: 1.7, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("b", { style: { color: T.danger } }, "\uBAA8\uB4E0 \uACFC\uC815\uC758 \uD6C8\uB828\uC0DD ", students.length, "\uBA85"), " \uB370\uC774\uD130\uAC00 \uC0AD\uC81C\uB429\uB2C8\uB2E4. \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."), !confirmAll ? /* @__PURE__ */ React.createElement(Btn, { variant: "danger", size: "sm", onClick: () => setConfirmAll(true) }, /* @__PURE__ */ React.createElement(Icon, { n: "alert", s: 13 }), " \uC804\uCCB4 \uCD08\uAE30\uD654") : /* @__PURE__ */ React.createElement("div", { style: { background: "#FEE2E2", borderRadius: 8, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.danger, marginBottom: 4 } }, "\u26A0\uFE0F \uC815\uB9D0\uB85C \uD6C8\uB828\uC0DD ", students.length, "\uBA85\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, marginBottom: 10 } }, "\uCD08\uAE30\uD654 \uC804\uC5D0 \uBC18\uB4DC\uC2DC \uBC31\uC5C5\uC744 \uBA3C\uC800 \uBC1B\uC544\uB450\uC138\uC694."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => setConfirmAll(false) }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { variant: "danger", size: "sm", onClick: () => {
        onResetAll();
        onClose();
      } }, "\uB124, \uC804\uCCB4 \uC0AD\uC81C\uD569\uB2C8\uB2E4")))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.mu, textAlign: "center", padding: "4px 0" } }, "\u{1F4A1} \uCD08\uAE30\uD654 \uC804\uC5D0 \uBC18\uB4DC\uC2DC \uBC31\uC5C5\uC744 \uBA3C\uC800 \uBC1B\uC544\uB450\uC138\uC694"))))
    );
  };
  const INIT_ACCOUNTS = [
    { id: 1, name: "\uAD00\uB9AC\uC790", role: "admin", pw: "admin1234" },
    { id: 2, name: "\uAE40\uB2F4\uB2F9", role: "staff", pw: "gjf2026" },
    { id: 3, name: "\uC774\uB2F4\uB2F9", role: "staff", pw: "gjf2026" }
  ];
  const LoginScreen = ({ onLogin, accounts }) => {
    const [selId, setSelId] = useState(accounts[0]?.id || 1);
    const [pw, setPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [shaking, setShaking] = useState(false);
    const [showNotice, setShowNotice] = useState(false);
    const handleLogin = () => {
      if (!agreed) {
        setError("\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1\xB7\uC774\uC6A9 \uB3D9\uC758\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.");
        return;
      }
      const acc = accounts.find((a) => a.id === selId);
      if (!acc || acc.pw !== pw) {
        setError("\uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        setPw("");
        return;
      }
      onLogin(acc);
    };
    const inp = {
      width: "100%",
      padding: "11px 14px",
      border: `1.5px solid ${T.bd}`,
      borderRadius: 10,
      fontSize: 14,
      outline: "none",
      color: T.tx,
      background: "#fff",
      fontFamily: "inherit",
      transition: "border-color .15s"
    };
    return /* @__PURE__ */ React.createElement("div", { style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#7C2D12 0%,#EA580C 40%,#F97316 70%,#FED7AA 100%)",
      backgroundSize: "400% 400%",
      animation: "loginBg 12s ease infinite",
      fontFamily: "'Pretendard',-apple-system,sans-serif",
      padding: 20
    } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 440, animation: "fadeUp .5s ease" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 64,
      height: 64,
      borderRadius: 18,
      background: "rgba(255,255,255,.2)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,.2)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 28 } }, "\u{1F393}")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-.3px" } }, "\uACBD\uAE30\uBD81\uBD80 \uC9C1\uC5C5\uAD50\uC721"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 4 } }, "\uD559\uC0AC\uAD00\uB9AC\uC2DC\uC2A4\uD15C v2026")), /* @__PURE__ */ React.createElement("div", { style: {
      background: "rgba(255,255,255,.96)",
      borderRadius: 20,
      padding: "30px 32px",
      boxShadow: "0 24px 64px rgba(0,0,0,.25)",
      animation: shaking ? "shake .4s ease" : "none"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: T.tx, marginBottom: 22, textAlign: "center" } }, "\u{1F510} \uB2F4\uB2F9\uC790 \uB85C\uADF8\uC778"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 700, color: T.mu, display: "block", marginBottom: 6 } }, "\uB2F4\uB2F9\uC790 \uC120\uD0DD"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, accounts.map((a) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: a.id,
        type: "button",
        onClick: () => {
          setSelId(a.id);
          setError("");
        },
        style: {
          padding: "8px 16px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          transition: "all .15s",
          background: selId === a.id ? T.p : T.s3,
          color: selId === a.id ? "#fff" : T.mu,
          boxShadow: selId === a.id ? "0 4px 12px rgba(234,88,12,.3)" : "none"
        }
      },
      a.name,
      a.role === "admin" && /* @__PURE__ */ React.createElement("span", { style: {
        marginLeft: 5,
        fontSize: 9,
        background: "rgba(255,255,255,.2)",
        padding: "1px 5px",
        borderRadius: 4
      } }, "\uAD00\uB9AC\uC790")
    )))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 700, color: T.mu, display: "block", marginBottom: 6 } }, "\uBE44\uBC00\uBC88\uD638"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: showPw ? "text" : "password",
        value: pw,
        onChange: (e) => {
          setPw(e.target.value);
          setError("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") handleLogin();
        },
        placeholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694",
        style: {
          ...inp,
          paddingRight: 44,
          borderColor: error ? T.danger : T.bd
        }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowPw((v) => !v),
        style: {
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: T.mu,
          fontSize: 16,
          padding: 0
        }
      },
      showPw ? "\u{1F648}" : "\u{1F441}\uFE0F"
    )), error && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, fontSize: 11, color: T.danger, fontWeight: 600 } }, "\u26A0\uFE0F ", error)), /* @__PURE__ */ React.createElement("div", { style: {
      marginBottom: 20,
      padding: "12px 14px",
      borderRadius: 10,
      background: "#FFF7ED",
      border: `1px solid ${T.pl}50`
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        id: "piAgree",
        checked: agreed,
        onChange: (e) => setAgreed(e.target.checked),
        style: { marginTop: 2, accentColor: T.p, width: 15, height: 15, cursor: "pointer", flexShrink: 0 }
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: "piAgree", style: { fontSize: 11, color: T.tx, lineHeight: 1.7, cursor: "pointer" } }, "\uC774 \uC2DC\uC2A4\uD15C\uC740 ", /* @__PURE__ */ React.createElement("b", null, "\uD6C8\uB828\uC0DD \uAC1C\uC778\uC815\uBCF4"), "\uB97C \uD3EC\uD568\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.", /* @__PURE__ */ React.createElement("br", null), "\u300C\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95\u300D\uC5D0 \uB530\uB77C \uC5C5\uBB34 \uBAA9\uC801 \uC678 \uC0AC\uC6A9\xB7\uC720\uCD9C\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: T.p, fontWeight: 700 } }, "\uBCF8\uC778\uC740 \uC774\uB97C \uC900\uC218\uD560 \uAC83\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowNotice((v) => !v),
        style: {
          marginTop: 8,
          fontSize: 10,
          color: T.p,
          background: "transparent",
          border: `1px solid ${T.pl}60`,
          borderRadius: 5,
          padding: "2px 8px",
          cursor: "pointer"
        }
      },
      showNotice ? "\u25B2 \uC811\uAE30" : "\u25BC \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68 \uBCF4\uAE30"
    ), showNotice && /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 8,
      padding: "10px 12px",
      background: "#fff",
      borderRadius: 8,
      border: `1px solid ${T.bd}`,
      fontSize: 10,
      color: T.mu,
      lineHeight: 1.8
    } }, /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, "\uC218\uC9D1 \uD56D\uBAA9:"), " \uC131\uBA85, \uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638, \uC8FC\uC18C, \uC5F0\uB77D\uCC98, \uCD9C\uACB0\uC815\uBCF4", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, "\uC218\uC9D1 \uBAA9\uC801:"), " \uC9C1\uC5C5\uD6C8\uB828 \uD559\uC0AC\uAD00\uB9AC \uBC0F \uC218\uB8CC\uC99D \uBC1C\uAE09", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, "\uBCF4\uC720 \uAE30\uAC04:"), " \uD6C8\uB828 \uC885\uB8CC \uD6C4 3\uB144", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.tx } }, "\uB2F4\uB2F9\uBD80\uC11C:"), " \uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80 \uBD81\uBD80\uAD50\uC721\uD300", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: T.danger } }, "\u26A0 \uBB34\uB2E8 \uBC18\uCD9C\xB7\uC720\uCD9C \uC2DC \uAD00\uB828 \uBC95\uB839\uC5D0 \uB530\uB77C \uCC98\uBC8C \uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("button", { onClick: handleLogin, style: {
      width: "100%",
      padding: "13px 0",
      borderRadius: 11,
      border: "none",
      background: agreed ? `linear-gradient(135deg,${T.sb},${T.p})` : T.s3,
      color: agreed ? "#fff" : T.mu,
      fontSize: 14,
      fontWeight: 800,
      cursor: agreed ? "pointer" : "not-allowed",
      boxShadow: agreed ? "0 6px 20px rgba(234,88,12,.35)" : "none",
      transition: "all .2s",
      letterSpacing: "1px"
    } }, "\uB85C\uADF8\uC778"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, fontSize: 10, color: T.mu, textAlign: "center" } }, "\uBE44\uBC00\uBC88\uD638 \uBD84\uC2E4 \uC2DC \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD558\uC138\uC694 \xB7 \uCD08\uAE30 \uBE44\uBC00\uBC88\uD638: ", /* @__PURE__ */ React.createElement("code", { style: { background: T.s3, padding: "1px 5px", borderRadius: 4 } }, "gjf2026"))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 16, fontSize: 10, color: "rgba(255,255,255,.4)" } }, "\xA9 2026 \uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80 \xB7 \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638 \uC2DC\uC2A4\uD15C")));
  };
  const MAX_VISIBLE_LOGS = 100;
  const AuditLogTab = ({ auditLog }) => {
    const [logFilter, setLogFilter] = useState({ who: "all", days: 30, q: "" });
    const [detailLog, setDetailLog] = useState(null);
    const cutoff = new Date(Date.now() - logFilter.days * 864e5).toISOString().slice(0, 16).replace("T", " ");
    const allUsers = [...new Set(auditLog.map((e) => e.who))];
    const visible = auditLog.filter((e) => {
      if (e.when < cutoff) return false;
      if (logFilter.who !== "all" && e.who !== logFilter.who) return false;
      if (logFilter.q && !e.action.includes(logFilter.q) && !(e.detail || "").includes(logFilter.q)) return false;
      return true;
    });
    const actionBg = (a) => {
      if (a.includes("\uB4F1\uB85D") || a.includes("\uCD94\uAC00") || a.includes("\uB85C\uADF8\uC778")) return "#ECFDF5";
      if (a.includes("\uC218\uC815") || a.includes("\uBCC0\uACBD")) return "#FFFBEB";
      if (a.includes("\uC0AD\uC81C") || a.includes("\uCD08\uAE30\uD654") || a.includes("\uB85C\uADF8\uC544\uC6C3")) return "#FEF2F2";
      return T.s3;
    };
    const actionColor = (a) => {
      if (a.includes("\uB4F1\uB85D") || a.includes("\uCD94\uAC00") || a.includes("\uB85C\uADF8\uC778")) return T.ok;
      if (a.includes("\uC218\uC815") || a.includes("\uBCC0\uACBD")) return T.warn;
      if (a.includes("\uC0AD\uC81C") || a.includes("\uCD08\uAE30\uD654") || a.includes("\uB85C\uADF8\uC544\uC6C3")) return T.danger;
      return T.mu;
    };
    const sel = {
      padding: "6px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 11,
      outline: "none",
      background: T.s2,
      cursor: "pointer",
      color: T.tx
    };
    return /* @__PURE__ */ React.createElement("div", null, detailLog && /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 2e3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: () => setDetailLog(null)
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            background: T.s,
            borderRadius: 16,
            width: 460,
            maxWidth: "96vw",
            maxHeight: "75vh",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,.3)",
            animation: "fadeUp .2s ease"
          },
          onClick: (e) => e.stopPropagation()
        },
        /* @__PURE__ */ React.createElement("div", { style: {
          background: `linear-gradient(135deg,${T.sb},${T.p})`,
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#fff" } }, "\u{1F4CB} \uBCC0\uACBD \uC0C1\uC138"), /* @__PURE__ */ React.createElement("button", { onClick: () => setDetailLog(null), style: {
          width: 26,
          height: 26,
          borderRadius: 6,
          border: "none",
          background: "rgba(255,255,255,.15)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 13 }))),
        /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px", overflowY: "auto", maxHeight: "calc(75vh - 56px)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", borderRadius: 8, background: T.s2, border: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 4 } }, "\uC791\uC5C5"), /* @__PURE__ */ React.createElement(Chip, { label: detailLog.action, bg: actionBg(detailLog.action), color: actionColor(detailLog.action) })), /* @__PURE__ */ React.createElement("div", { style: { padding: "8px 12px", borderRadius: 8, background: T.s2, border: `1px solid ${T.bd}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginBottom: 4 } }, "\uB2F4\uB2F9\uC790 \xB7 \uC2DC\uAC01"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: T.tx } }, detailLog.who), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, detailLog.when))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: T.mu, marginBottom: 6 } }, "\uC0C1\uC138 \uB0B4\uC6A9"), /* @__PURE__ */ React.createElement("pre", { style: {
          background: T.s2,
          border: `1px solid ${T.bd}`,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 12,
          color: T.tx,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          lineHeight: 1.6
        } }, detailLog.detail))
      )
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("select", { value: logFilter.who, onChange: (e) => setLogFilter((f) => ({ ...f, who: e.target.value })), style: sel }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "\uC804\uCCB4 \uC0AC\uC6A9\uC790"), allUsers.map((u) => /* @__PURE__ */ React.createElement("option", { key: u, value: u }, u))), /* @__PURE__ */ React.createElement("select", { value: logFilter.days, onChange: (e) => setLogFilter((f) => ({ ...f, days: +e.target.value })), style: sel }, /* @__PURE__ */ React.createElement("option", { value: 7 }, "\uCD5C\uADFC 7\uC77C"), /* @__PURE__ */ React.createElement("option", { value: 30 }, "\uCD5C\uADFC 30\uC77C"), /* @__PURE__ */ React.createElement("option", { value: 90 }, "\uCD5C\uADFC 90\uC77C"), /* @__PURE__ */ React.createElement("option", { value: 365 }, "\uCD5C\uADFC 1\uB144")), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: logFilter.q,
        onChange: (e) => setLogFilter((f) => ({ ...f, q: e.target.value })),
        placeholder: "\u{1F50D} \uAC80\uC0C9...",
        style: { ...sel, flex: 1, minWidth: 100 }
      }
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: T.mu, flexShrink: 0 } }, "\uCD1D ", visible.length, "\uAC74"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          if (!window.confirm("\uAC10\uC0AC \uB85C\uADF8\uB97C \uCD08\uAE30\uD654\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) return;
          safeLocal.remove("gjf_audit_log");
          window.location.reload();
        },
        style: {
          fontSize: 10,
          color: T.danger,
          background: "transparent",
          border: `1px solid #FECACA`,
          borderRadius: 6,
          padding: "4px 10px",
          cursor: "pointer"
        }
      },
      "\uCD08\uAE30\uD654"
    )), visible.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: T.mu, padding: "30px 0", fontSize: 12 } }, auditLog.length === 0 ? "\uC544\uC9C1 \uAE30\uB85D\uB41C \uC774\uB825\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" : "\uD544\uD130 \uC870\uAC74\uC5D0 \uB9DE\uB294 \uB85C\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4") : /* @__PURE__ */ React.createElement("div", { style: { borderRadius: 10, border: `1px solid ${T.bd}`, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "grid",
      gridTemplateColumns: "72px 1fr 88px 36px",
      padding: "8px 12px",
      background: T.s2,
      borderBottom: `1px solid ${T.bd}`,
      fontSize: 10,
      fontWeight: 700,
      color: T.mu
    } }, /* @__PURE__ */ React.createElement("div", null, "\uB2F4\uB2F9\uC790"), /* @__PURE__ */ React.createElement("div", null, "\uB0B4\uC6A9"), /* @__PURE__ */ React.createElement("div", null, "\uC2DC\uAC01"), /* @__PURE__ */ React.createElement("div", null)), visible.slice(0, MAX_VISIBLE_LOGS).map((e) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: e.id,
        className: "row-hover",
        style: {
          display: "grid",
          gridTemplateColumns: "72px 1fr 88px 36px",
          padding: "9px 12px",
          borderBottom: `1px solid ${T.bd}`,
          alignItems: "center"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 11,
        fontWeight: 600,
        color: T.tx,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, e.who),
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Chip, { label: e.action, bg: actionBg(e.action), color: actionColor(e.action) }), /* @__PURE__ */ React.createElement("div", { style: {
        fontSize: 10,
        color: T.mu,
        marginTop: 3,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      } }, e.detail)),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: T.mu, lineHeight: 1.5 } }, e.when?.slice(0, 16).replace("T", "\n") || ""),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setDetailLog(e),
          style: {
            fontSize: 10,
            color: T.p,
            cursor: "pointer",
            border: "none",
            background: "none",
            fontWeight: 700,
            padding: "4px 0"
          }
        },
        "\uC0C1\uC138"
      )
    )), visible.length > MAX_VISIBLE_LOGS && /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", textAlign: "center", fontSize: 11, color: T.mu, background: T.s2 } }, "\uCD5C\uADFC ", MAX_VISIBLE_LOGS, "\uAC74\uB9CC \uD45C\uC2DC (\uC804\uCCB4 ", visible.length, "\uAC74)")));
  };
  const AccountMgmt = ({ accounts, onSave, onClose, currentUser, auditLog = [] }) => {
    const [list, setList] = useState(accounts.map((a) => ({ ...a })));
    const [editIdx, setEditIdx] = useState(null);
    const [newPw, setNewPw] = useState("");
    const [newPw2, setNewPw2] = useState("");
    const [pwErr, setPwErr] = useState("");
    const [addForm, setAddForm] = useState({ name: "", role: "staff", pw: "", pw2: "" });
    const [showAdd, setShowAdd] = useState(false);
    const [tab, setTab] = useState("accounts");
    const inp = {
      width: "100%",
      padding: "8px 10px",
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      fontSize: 12,
      outline: "none",
      color: T.tx,
      background: T.s2,
      fontFamily: "inherit"
    };
    const savePw = (idx) => {
      if (newPw.length < 4) {
        setPwErr("\uBE44\uBC00\uBC88\uD638\uB294 4\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.");
        return;
      }
      if (newPw !== newPw2) {
        setPwErr("\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        return;
      }
      const updated = list.map((a, i) => i === idx ? { ...a, pw: newPw } : a);
      setList(updated);
      setEditIdx(null);
      setNewPw("");
      setNewPw2("");
      setPwErr("");
    };
    const delAccount = (idx) => {
      if (list[idx].id === currentUser.id) {
        alert("\uD604\uC7AC \uB85C\uADF8\uC778 \uC911\uC778 \uACC4\uC815\uC740 \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      if (!window.confirm(`"${list[idx].name}" \uACC4\uC815\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;
      setList(list.filter((_, i) => i !== idx));
    };
    const addAccount = () => {
      if (!addForm.name.trim()) {
        alert("\uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694.");
        return;
      }
      if (addForm.pw.length < 4) {
        alert("\uBE44\uBC00\uBC88\uD638\uB294 4\uC790 \uC774\uC0C1");
        return;
      }
      if (addForm.pw !== addForm.pw2) {
        alert("\uBE44\uBC00\uBC88\uD638 \uBD88\uC77C\uCE58");
        return;
      }
      setList((p) => [...p, { id: Date.now(), name: addForm.name.trim(), role: addForm.role, pw: addForm.pw }]);
      setAddForm({ name: "", role: "staff", pw: "", pw2: "" });
      setShowAdd(false);
    };
    const roleColor = (r) => r === "admin" ? T.p : T.ok;
    const roleLabel = (r) => r === "admin" ? "\uAD00\uB9AC\uC790" : "\uB2F4\uB2F9\uC790";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        background: T.s,
        borderRadius: 18,
        width: 500,
        maxWidth: "96vw",
        maxHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,.3)",
        overflow: "hidden",
        animation: "fadeUp .2s ease"
      } }, /* @__PURE__ */ React.createElement("div", { style: {
        background: `linear-gradient(135deg,${T.sb},${T.p})`,
        padding: "16px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff" } }, "\u{1F464} \uACC4\uC815 \uAD00\uB9AC"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 2 } }, "\uAD00\uB9AC\uC790 \uC804\uC6A9 \xB7 \uB2F4\uB2F9\uC790 \uACC4\uC815 \uCD94\uAC00/\uC218\uC815/\uC0AD\uC81C")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: "rgba(255,255,255,.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "x", s: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px 0", borderBottom: `1px solid ${T.bd}`, background: T.s2 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 2, background: T.s3, borderRadius: 12, padding: 4 } }, [{ id: "accounts", icon: "\u{1F464}", label: "\uACC4\uC815 \uAD00\uB9AC" }, { id: "audit", icon: "\u{1F4CB}", label: "\uAC10\uC0AC \uB85C\uADF8" }].map((t) => {
        const active = tab === t.id;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: t.id,
            onClick: () => setTab(t.id),
            "aria-current": active ? "page" : void 0,
            className: `tab-pill${active ? " tab-pill-active" : ""}`,
            style: {
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "8px 10px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 9,
              background: active ? T.s : "transparent",
              color: active ? T.p : T.mu,
              boxShadow: active ? TAB_PILL_SHADOW : "none"
            }
          },
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14 }, "aria-hidden": "true" }, t.icon),
          /* @__PURE__ */ React.createElement("span", null, t.label),
          active && /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: {
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: T.p,
            flexShrink: 0,
            marginLeft: 2
          } })
        );
      }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10 } }, tab === "accounts" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: {
        padding: "10px 14px",
        borderRadius: 8,
        background: "#FFF7ED",
        border: `1px solid ${T.pl}60`,
        fontSize: 11,
        color: "#92400E"
      } }, "\u{1F512} ", /* @__PURE__ */ React.createElement("b", null, "\uBE44\uBC00\uBC88\uD638\uB294 4\uC790 \uC774\uC0C1"), "\uC73C\uB85C \uC124\uC815\uD558\uC138\uC694. \uC2E4\uC81C \uC6B4\uC601 \uC2DC \uBC31\uC5D4\uB4DC \uC11C\uBC84 \uC778\uC99D\uC73C\uB85C \uAD50\uCCB4\uB97C \uAD8C\uC7A5\uD569\uB2C8\uB2E4."), list.map((acc, idx) => /* @__PURE__ */ React.createElement("div", { key: acc.id, style: {
        padding: "14px 16px",
        borderRadius: 10,
        border: `1px solid ${editIdx === idx ? T.p : T.bd}`,
        background: T.s2
      } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: editIdx === idx ? 12 : 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        flexShrink: 0,
        background: `${roleColor(acc.role)}18`,
        color: roleColor(acc.role),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 900
      } }, acc.name[0]), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, display: "flex", alignItems: "center", gap: 7 } }, acc.name, acc.id === currentUser.id && /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 9,
        background: T.pbg,
        color: T.p,
        padding: "1px 6px",
        borderRadius: 4,
        fontWeight: 700
      } }, "\uD604\uC7AC")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 3 } }, /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 10,
        background: `${roleColor(acc.role)}15`,
        color: roleColor(acc.role),
        padding: "1px 7px",
        borderRadius: 4,
        fontWeight: 700
      } }, roleLabel(acc.role)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, "\uBE44\uBC00\uBC88\uD638: ", "\u2022".repeat(Math.min(acc.pw.length, 8))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setEditIdx(editIdx === idx ? null : idx);
            setNewPw("");
            setNewPw2("");
            setPwErr("");
          },
          style: {
            padding: "5px 10px",
            borderRadius: 7,
            border: `1px solid ${T.bd}`,
            background: "transparent",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            color: editIdx === idx ? T.p : T.mu
          }
        },
        editIdx === idx ? "\uB2EB\uAE30" : "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD"
      ), acc.id !== currentUser.id && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => delAccount(idx),
          style: {
            padding: "5px 10px",
            borderRadius: 7,
            border: "1px solid #FECACA",
            background: "transparent",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            color: T.danger
          }
        },
        "\uC0AD\uC81C"
      ))), editIdx === idx && /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "12px 14px",
        borderRadius: 8,
        background: "#fff",
        border: `1px solid ${T.bd}`
      } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "password",
          value: newPw,
          onChange: (e) => {
            setNewPw(e.target.value);
            setPwErr("");
          },
          placeholder: "\uC0C8 \uBE44\uBC00\uBC88\uD638 (4\uC790 \uC774\uC0C1)",
          style: inp
        }
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "password",
          value: newPw2,
          onChange: (e) => {
            setNewPw2(e.target.value);
            setPwErr("");
          },
          placeholder: "\uC0C8 \uBE44\uBC00\uBC88\uD638 \uD655\uC778",
          style: inp
        }
      ), pwErr && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: T.danger } }, "\u26A0\uFE0F ", pwErr), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => {
        setEditIdx(null);
        setNewPw("");
        setNewPw2("");
        setPwErr("");
      } }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: () => savePw(idx) }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 12 }), " \uBCC0\uACBD \uC800\uC7A5"))))), showAdd ? /* @__PURE__ */ React.createElement("div", { style: {
        padding: "14px 16px",
        borderRadius: 10,
        border: `1.5px dashed ${T.p}`,
        background: T.pbg,
        display: "flex",
        flexDirection: "column",
        gap: 9
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.p } }, "\uC0C8 \uACC4\uC815 \uCD94\uAC00"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          value: addForm.name,
          onChange: (e) => setAddForm((p) => ({ ...p, name: e.target.value })),
          placeholder: "\uC774\uB984 (\uC608: \uBC15\uB2F4\uB2F9)",
          style: inp
        }
      ), /* @__PURE__ */ React.createElement(
        "select",
        {
          value: addForm.role,
          onChange: (e) => setAddForm((p) => ({ ...p, role: e.target.value })),
          style: { ...inp, cursor: "pointer" }
        },
        /* @__PURE__ */ React.createElement("option", { value: "staff" }, "\uB2F4\uB2F9\uC790"),
        /* @__PURE__ */ React.createElement("option", { value: "admin" }, "\uAD00\uB9AC\uC790")
      )), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "password",
          value: addForm.pw,
          onChange: (e) => setAddForm((p) => ({ ...p, pw: e.target.value })),
          placeholder: "\uBE44\uBC00\uBC88\uD638 (4\uC790 \uC774\uC0C1)",
          style: inp
        }
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "password",
          value: addForm.pw2,
          onChange: (e) => setAddForm((p) => ({ ...p, pw2: e.target.value })),
          placeholder: "\uBE44\uBC00\uBC88\uD638 \uD655\uC778",
          style: inp
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", size: "sm", onClick: () => setShowAdd(false) }, "\uCDE8\uC18C"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", onClick: addAccount }, /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 12 }), " \uCD94\uAC00"))) : /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setShowAdd(true),
          style: {
            padding: "12px 0",
            borderRadius: 10,
            border: `2px dashed ${T.bd}`,
            background: "transparent",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: T.mu,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { n: "plus", s: 14 }),
        " \uC0C8 \uB2F4\uB2F9\uC790 \uACC4\uC815 \uCD94\uAC00"
      )) : (
        /* ── 감사 로그 탭 ── */
        /* @__PURE__ */ React.createElement(AuditLogTab, { auditLog })
      )), /* @__PURE__ */ React.createElement("div", { style: {
        padding: "13px 22px",
        borderTop: `1px solid ${T.bd}`,
        display: "flex",
        justifyContent: "flex-end",
        background: T.s2
      } }, tab === "accounts" ? /* @__PURE__ */ React.createElement(Btn, { onClick: () => {
        onSave(list);
        onClose();
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "check", s: 13 }), " \uBCC0\uACBD\uC0AC\uD56D \uC800\uC7A5") : /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "\uB2EB\uAE30")))
    );
  };
  const ProgressMgmt = ({ students, courses }) => {
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const [filterStatus, setFilterStatus] = useState("\uC804\uCCB4");
    const courseData = courses.map((c) => {
      const cs = students.filter((s) => s.cid === c.id);
      const enrolled = cs.length;
      const rateCs = cs.filter((s) => !isDropoutStudent(s));
      const avgRate = rateCs.length ? Math.round(rateCs.reduce((a, b) => a + b.rate, 0) / rateCs.length) : 0;
      const isActive = c.dateFrom && c.dateFrom <= todayStr && (!c.dateTo || c.dateTo >= todayStr);
      const isEnded = c.dateTo && c.dateTo < todayStr;
      const status = isActive ? "\uC9C4\uD589\uC911" : isEnded ? "\uC885\uB8CC" : "\uC608\uC815";
      let datePct = 0;
      if (c.dateFrom && c.dateTo) {
        const start = new Date(c.dateFrom).getTime();
        const end = new Date(c.dateTo).getTime();
        const cur = Math.min(today.getTime(), end);
        datePct = start < end ? Math.round(Math.max(0, (cur - start) / (end - start) * 100)) : 0;
      } else if (isActive) {
        datePct = 50;
      } else if (isEnded) {
        datePct = 100;
      }
      let daysLeft = null;
      if (c.dateTo && !isEnded) {
        daysLeft = Math.max(0, Math.round((new Date(c.dateTo) - today) / 864e5));
      }
      return { ...c, enrolled, avgRate, rateCount: rateCs.length, isActive, isEnded, status, datePct, daysLeft };
    }).sort((a, b) => (a.dateFrom || "9").localeCompare(b.dateFrom || "9") || a.name.localeCompare(b.name));
    const filtered = filterStatus === "\uC804\uCCB4" ? courseData : courseData.filter((c) => c.status === filterStatus);
    const activeCnt = courseData.filter((c) => c.isActive).length;
    const endedCnt = courseData.filter((c) => c.isEnded).length;
    const upcomingCnt = courseData.filter((c) => !c.isActive && !c.isEnded && c.dateFrom).length;
    const noDateCnt = courseData.filter((c) => !c.dateFrom).length;
    const GANTT_YEAR = 2026;
    const MONTHS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    const yearStart = (/* @__PURE__ */ new Date(`${GANTT_YEAR}-01-01`)).getTime();
    const yearEnd = (/* @__PURE__ */ new Date(`${GANTT_YEAR}-12-31`)).getTime();
    const yearSpan = yearEnd - yearStart;
    const todayPct = ((Math.min(today.getTime(), yearEnd) - yearStart) / yearSpan * 100).toFixed(2);
    const ganttPct = (dateStr) => {
      if (!dateStr) return null;
      return ((new Date(dateStr).getTime() - yearStart) / yearSpan * 100).toFixed(2);
    };
    const STATUS_COLORS2 = { "\uC9C4\uD589\uC911": T.ok, "\uC608\uC815": T.info, "\uC885\uB8CC": T.mu };
    const STATUS_BG = { "\uC9C4\uD589\uC911": "#F0FDF4", "\uC608\uC815": "#EFF6FF", "\uC885\uB8CC": T.s3 };
    return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement(SectionHead, { title: "\uC9C4\uD589\uACBD\uACFC", sub: "\uACFC\uC815\uBCC4 \uAD50\uC721 \uC9C4\uD589 \uD604\uD669 \uBC0F Gantt \uD0C0\uC784\uB77C\uC778" }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 18 } }, [
      { label: "\uC804\uCCB4 \uACFC\uC815", val: `${courseData.length}\uAC1C`, sub: "\uCD1D \uAC1C\uC124 \uACFC\uC815", color: T.p },
      { label: "\uC9C4\uD589\uC911", val: `${activeCnt}\uAC1C`, sub: "\uD604\uC7AC \uC6B4\uC601 \uC911", color: T.ok },
      { label: "\uC608\uC815", val: `${upcomingCnt}\uAC1C`, sub: "\uAC1C\uAC15 \uC608\uC815", color: T.info },
      { label: "\uC885\uB8CC", val: `${endedCnt}\uAC1C`, sub: "\uAD50\uC721 \uC644\uB8CC", color: T.mu },
      { label: "\uBBF8\uC9C0\uC815", val: `${noDateCnt}\uAC1C`, sub: "\uAE30\uAC04 \uBBF8\uD655\uC815", color: T.warn }
    ].map((k, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      background: T.s,
      borderRadius: 12,
      border: `1.5px solid ${k.color}20`,
      padding: "14px 16px",
      display: "flex",
      gap: 10,
      alignItems: "center",
      backgroundImage: `linear-gradient(145deg,#fff,${k.color}08)`
    } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: T.tx, lineHeight: 1 } }, k.val), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu, marginTop: 3 } }, k.label), k.sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: k.color, fontWeight: 700 } }, k.sub))))), /* @__PURE__ */ React.createElement(Card, { style: { padding: "18px 20px", marginBottom: 16, overflow: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: T.tx, marginBottom: 14 } }, "\u{1F4C5} ", GANTT_YEAR, "\uB144 \uACFC\uC815 \uD0C0\uC784\uB77C\uC778", /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 8, fontSize: 10, color: T.mu, fontWeight: 400 } }, "\uC624\uB298 \uAE30\uC900 \uC9C4\uD589 \uD604\uD669")), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 600 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", marginBottom: 6, paddingLeft: 150 } }, MONTHS.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      flex: new Date(GANTT_YEAR, i + 1, 0).getDate(),
      textAlign: "center",
      fontSize: 10,
      fontWeight: 700,
      color: T.mu,
      borderLeft: `1px solid ${T.bd}`,
      paddingTop: 2
    } }, m, "\uC6D4"))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, today.getFullYear() === GANTT_YEAR && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: `calc(150px + ${todayPct}%)`,
      width: 2,
      background: "#EF4444",
      zIndex: 3,
      pointerEvents: "none"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: -18,
      left: -16,
      fontSize: 9,
      fontWeight: 800,
      color: "#EF4444",
      background: "#FEE2E2",
      border: "1px solid #FECACA",
      borderRadius: 4,
      padding: "1px 4px",
      whiteSpace: "nowrap"
    } }, "\uC624\uB298")), courseData.filter((c) => c.dateFrom).map((c, idx) => {
      const left = ganttPct(c.dateFrom);
      const right = c.dateTo ? ganttPct(c.dateTo) : null;
      const width = right !== null ? Math.max(0, right - left) : 3;
      const stColor = STATUS_COLORS2[c.status] || T.mu;
      return /* @__PURE__ */ React.createElement("div", { key: c.id, style: { display: "flex", alignItems: "center", marginBottom: 5 } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            width: 150,
            flexShrink: 0,
            paddingRight: 8,
            fontSize: 10,
            fontWeight: 600,
            color: T.tx,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          },
          title: c.name
        },
        /* @__PURE__ */ React.createElement("span", { style: {
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: 2,
          background: c.cc || stColor,
          marginRight: 4,
          flexShrink: 0
        } }),
        c.name.length > 14 ? c.name.slice(0, 14) + "\u2026" : c.name
      ), /* @__PURE__ */ React.createElement("div", { style: {
        flex: 1,
        position: "relative",
        height: 22,
        background: T.s3,
        borderRadius: 4,
        overflow: "visible"
      } }, MONTHS.map((_, mi) => {
        const firstDay = new Date(GANTT_YEAR, mi, 1);
        const pct = ((firstDay.getTime() - yearStart) / yearSpan * 100).toFixed(2);
        return mi === 0 ? null : /* @__PURE__ */ React.createElement("div", { key: mi, style: {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pct}%`,
          width: 1,
          background: T.bd,
          zIndex: 1
        } });
      }), /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: 3,
            bottom: 3,
            left: `${left}%`,
            width: `${width}%`,
            minWidth: 4,
            background: c.isEnded ? `${stColor}80` : `linear-gradient(90deg,${c.cc || stColor},${c.cc || stColor}cc)`,
            borderRadius: 4,
            zIndex: 2,
            overflow: "hidden",
            boxShadow: c.isActive ? `0 0 0 1.5px ${c.cc || stColor}` : "none"
          },
          title: `${c.name}
${formatCoursePeriod(c)}
\uC9C4\uD589\uB960: ${c.datePct}%`
        },
        width > 5 && /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: 5,
          overflow: "hidden"
        } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" } }, c.datePct, "%"))
      )));
    }), courseData.filter((c) => !c.dateFrom).length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, fontSize: 10, color: T.mu, paddingLeft: 150 } }, "\u203B \uAE30\uAC04 \uBBF8\uC9C0\uC815 \uACFC\uC815 ", courseData.filter((c) => !c.dateFrom).length, "\uAC1C \uC81C\uC678")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" } }, ["\uC804\uCCB4", "\uC9C4\uD589\uC911", "\uC608\uC815", "\uC885\uB8CC"].map((s) => /* @__PURE__ */ React.createElement("button", { key: s, onClick: () => setFilterStatus(s), style: {
      padding: "6px 14px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      transition: "all .15s",
      background: filterStatus === s ? T.p : T.s3,
      color: filterStatus === s ? "#fff" : T.mu
    } }, s, /* @__PURE__ */ React.createElement("span", { style: {
      marginLeft: 5,
      fontSize: 10,
      color: filterStatus === s ? "rgba(255,255,255,.8)" : T.mu
    } }, s === "\uC804\uCCB4" ? courseData.length : s === "\uC9C4\uD589\uC911" ? activeCnt : s === "\uC608\uC815" ? upcomingCnt : endedCnt)))), /* @__PURE__ */ React.createElement(Card, { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: `2px solid ${T.bd}` } }, ["\uACFC\uC815\uBA85", "\uAD50\uC721\uAE30\uAC04", "\uAE30\uAC04 \uC9C4\uD589\uB960", "\uD6C8\uB828\uC0DD", "\uD3C9\uADE0 \uCD9C\uC11D\uB960", "\uC794\uC5EC\uC77C", "\uC0C1\uD0DC"].map((h) => /* @__PURE__ */ React.createElement("th", { key: h, style: {
      padding: "9px 12px",
      textAlign: "left",
      fontSize: 10,
      color: T.mu,
      fontWeight: 700,
      whiteSpace: "nowrap"
    } }, h)))), /* @__PURE__ */ React.createElement("tbody", null, filtered.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", color: T.mu, padding: "32px 0", fontSize: 13 } }, "\uD574\uB2F9\uD558\uB294 \uACFC\uC815\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.")) : filtered.map((c) => {
      const stColor = STATUS_COLORS2[c.status] || T.mu;
      const stBg = STATUS_BG[c.status] || T.s3;
      return /* @__PURE__ */ React.createElement("tr", { key: c.id, style: {
        borderBottom: `1px solid ${T.bd}`,
        background: c.isActive ? `${T.pbg}60` : "transparent"
      } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        flexShrink: 0,
        background: c.cc,
        display: "inline-block"
      } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: T.tx } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: T.mu } }, c.code, " \xB7 ", c.cat)))), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px", color: T.mu, whiteSpace: "nowrap", fontSize: 11 } }, formatCoursePeriod(c), c.hours > 0 && /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 10 } }, c.hours, "\uC2DC\uAC04")), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px", minWidth: 120 } }, c.dateFrom ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, "\uAE30\uAC04 \uC9C4\uD589\uB960"), /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 11,
        fontWeight: 800,
        color: c.datePct >= 80 ? T.ok : c.datePct >= 40 ? T.warn : T.info
      } }, c.datePct, "%")), /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: T.bd, borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
        height: "100%",
        width: `${c.datePct}%`,
        background: c.datePct >= 80 ? T.ok : c.datePct >= 40 ? T.warn : T.info,
        borderRadius: 3,
        transition: "width .4s"
      } }))) : /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, "\u2014")), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, color: T.tx } }, c.enrolled, "\uBA85"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: T.mu } }, "/", c.tgt, "\uBA85")), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px", textAlign: "center" } }, c.rateCount > 0 ? /* @__PURE__ */ React.createElement("span", { style: {
        fontWeight: 700,
        color: c.avgRate >= 80 ? T.ok : c.avgRate >= 70 ? T.warn : T.danger
      } }, c.avgRate, "%") : /* @__PURE__ */ React.createElement("span", { style: { color: T.mu } }, "\u2014")), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px", textAlign: "center", fontSize: 11 } }, c.isEnded ? /* @__PURE__ */ React.createElement("span", { style: { color: T.mu } }, "\uC644\uB8CC") : c.daysLeft !== null ? /* @__PURE__ */ React.createElement("span", { style: {
        fontWeight: 700,
        color: c.daysLeft <= 7 ? T.danger : c.daysLeft <= 30 ? T.warn : T.ok
      } }, "D-", c.daysLeft) : /* @__PURE__ */ React.createElement("span", { style: { color: T.mu } }, "\u2014")), /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("span", { style: {
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 10,
        fontSize: 10,
        fontWeight: 700,
        color: stColor,
        background: stBg,
        border: `1px solid ${stColor}30`
      } }, c.status)));
    })))));
  };
  const NAV_ITEMS = [
    { id: "dash", label: "\uB300\uC2DC\uBCF4\uB4DC", icon: "dash" },
    { id: "courses", label: "\uACFC\uC815 \uD604\uD669", icon: "book" },
    { id: "progress", label: "\uC9C4\uD589\uACBD\uACFC", icon: "cal" },
    { id: "students", label: "\uD6C8\uB828\uC0DD \uAD00\uB9AC", icon: "people" },
    { id: "instructors", label: "\uAC15\uC0AC \uAD00\uB9AC", icon: "award" },
    { id: "rooms", label: "\uAC15\uC758\uC2E4 \uAD00\uB9AC", icon: "cal" },
    { id: "attendance", label: "\uCD9C\uACB0 \uAD00\uB9AC", icon: "check" },
    { id: "completion", label: "\uC218\uB8CC \uAD00\uB9AC", icon: "check" },
    { id: "cert", label: "\uC99D\uBA85\uC11C \uBC1C\uAE09", icon: "dl" }
  ];
  const MobileCheckin = () => {
    const params = new URLSearchParams(window.location.search);
    const cidParam = params.get("cid");
    const cidNum = Number(cidParam);
    const date = params.get("date") || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const type = params.get("type") || "in";
    const token = params.get("t");
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [status, setStatus] = useState("loading");
    const [checkedId, setCheckedId] = useState(null);
    const [checkedTime, setCheckedTime] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [nowStr, setNowStr] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [nameInput, setNameInput] = useState("");
    const [phoneInput, setPhoneInput] = useState("");
    const [matchErr, setMatchErr] = useState("");
    const [matchedStudent, setMatchedStudent] = useState(null);
    useEffect(() => {
      const tick = () => {
        const n = /* @__PURE__ */ new Date();
        setNowStr(`${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:${String(n.getSeconds()).padStart(2, "0")}`);
      };
      tick();
      const id = setInterval(tick, 1e3);
      return () => clearInterval(id);
    }, []);
    useEffect(() => {
      const init = async () => {
        try {
          const { data: cData, error: cErr } = await sbGet("courses", `select=${COURSE_LIST_SELECT}&id=eq.${cidNum}`);
          let c;
          if (!cErr && cData && cData.length > 0) {
            c = toCourse(cData[0]);
          } else {
            const local = COURSES.find((x) => Number(x.id) === cidNum);
            if (!local) {
              setStatus("error");
              setErrMsg("\uACFC\uC815\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
              return;
            }
            c = local;
          }
          const expectedToken = `${c.code}-${date}-${type.toUpperCase()}-${QR_TOKEN_SUFFIX}`;
          if (token) {
            let decodedToken = token;
            try {
              decodedToken = decodeURIComponent(token);
            } catch (_e) {
            }
            if (decodedToken.trim() !== expectedToken.trim()) {
              console.warn("QR \uD1A0\uD070 \uBD88\uC77C\uCE58 (\uACBD\uACE0\uB9CC):", decodedToken, "vs", expectedToken);
            }
          }
          setCourse(c);
          const { data: sData, error: sErr } = await sbGet("students", `select=*&cid=eq.${c.id}&order=name`);
          if (sErr) {
            const msg = sErr?.message || String(sErr);
            if (msg.includes("schema cache") && msg.includes("cid")) {
              throw new Error("DB \uC124\uC815 \uC624\uB958: Supabase \uB300\uC2DC\uBCF4\uB4DC \u2192 Settings \u2192 API \u2192 Schema Cache \u2192 Reload \uBC84\uD2BC\uC744 \uD074\uB9AD\uD55C \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.");
            }
            console.warn("\uD559\uC0DD \uBAA9\uB85D \uB85C\uB4DC \uC624\uB958 (SEED \uD3F4\uBC31):", sErr?.message || sErr);
            const fallback = SEED_STUDENTS.filter((s) => Number(s.cid) === Number(c.id));
            setStudents(fallback.map(toStudent));
          } else {
            const list = sData && sData.length > 0 ? sData.map(toStudent) : SEED_STUDENTS.filter((s) => Number(s.cid) === Number(c.id)).map(toStudent);
            setStudents(list);
          }
          setStatus("identifying");
        } catch (e) {
          setStatus("error");
          setErrMsg(e.message || "\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
        }
      };
      if (cidNum) init();
      else {
        setStatus("error");
        setErrMsg("\uC62C\uBC14\uB974\uC9C0 \uC54A\uC740 QR \uCF54\uB4DC\uC785\uB2C8\uB2E4.");
      }
    }, []);
    const handleCheckin = async (student) => {
      setStatus("loading");
      try {
        const { data: existingData } = await sbGet(
          "attendance",
          `select=id,check_in,check_out,status,manual_add_hours,manual_deduct_hours,manual_reason,manual_memo,manual_updated_at&student_id=eq.${student.id}&date=eq.${date}&limit=1`
        );
        const existing = existingData?.[0] || null;
        if (type === "in" && existing?.check_in) {
          setCheckedId(student.id);
          setCheckedTime(existing.check_in);
          setStatus("duplicate");
          return;
        }
        if (type === "out" && existing?.check_out) {
          setCheckedId(student.id);
          setCheckedTime(existing.check_out);
          setStatus("duplicate");
          return;
        }
        const now = /* @__PURE__ */ new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        let attStatus = existing?.status || "U";
        if (type === "in") {
          attStatus = "O";
        } else if (type === "out" && existing?.check_in) {
          try {
            const inParts = existing.check_in.match(/^(\d{1,2}):(\d{2})$/);
            const outParts = time.match(/^(\d{1,2}):(\d{2})$/);
            const schedFrom = course?.schedTimeFrom || "";
            const schedTo = course?.schedTimeTo || "";
            const fromParts = schedFrom.match(/^(\d{1,2}):(\d{2})$/);
            const toParts = schedTo.match(/^(\d{1,2}):(\d{2})$/);
            if (inParts && outParts && fromParts && toParts) {
              const inMins = parseInt(inParts[1]) * 60 + parseInt(inParts[2]);
              const outMins = parseInt(outParts[1]) * 60 + parseInt(outParts[2]);
              const totalDay = parseInt(toParts[1]) * 60 + parseInt(toParts[2]) - (parseInt(fromParts[1]) * 60 + parseInt(fromParts[2]));
              const attended = outMins - inMins;
              attStatus = totalDay > 0 && attended < totalDay * 0.5 ? "A" : existing?.status || "O";
            } else {
              attStatus = existing?.status || "O";
            }
          } catch (_e) {
            attStatus = existing?.status || "O";
          }
        }
        const { error } = await sbUpsert("attendance", [{
          course_id: cidNum || null,
          student_id: student.id,
          date,
          status: attStatus,
          check_in: type === "in" ? time : existing?.check_in || null,
          check_out: type === "out" ? time : existing?.check_out || null,
          method: "qr",
          manual_add_hours: existing?.manual_add_hours || 0,
          manual_deduct_hours: existing?.manual_deduct_hours || 0,
          manual_reason: existing?.manual_reason || null,
          manual_memo: existing?.manual_memo || null,
          manual_updated_at: existing?.manual_updated_at || null
        }], "student_id,date,course_id");
        if (error) throw error;
        setCheckedId(student.id);
        setCheckedTime(time);
        setStatus("success");
      } catch (e) {
        setStatus("error");
        setErrMsg(e.message || "\uC800\uC7A5 \uC624\uB958");
      }
    };
    const typeLabel = type === "in" ? "\uC785\uC2E4" : "\uD1F4\uC2E4";
    const typeColor = type === "in" ? "#2563EB" : "#9A3412";
    const fmtDate = (d) => {
      if (!d) return "";
      const [y, m, dd] = d.split("-");
      return `${y}\uB144 ${m}\uC6D4 ${dd}\uC77C`;
    };
    useEffect(() => {
      if (status !== "success") return;
      setCountdown(3);
      const iv = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setStatus("identifying");
            setNameInput("");
            setPhoneInput("");
            setMatchErr("");
            setMatchedStudent(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(iv);
    }, [status]);
    const containerStyle = {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: `linear-gradient(160deg,${typeColor}18 0%,#F8FAFC 50%,#FFF7ED 100%)`,
      fontFamily: "'Pretendard',-apple-system,sans-serif",
      padding: "20px 16px"
    };
    if (status === "loading") return /* @__PURE__ */ React.createElement("div", { style: containerStyle }, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 100, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 48, animation: "fadeIn .5s ease" } }, "\u23F3"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, fontSize: 14, color: "#64748B", fontWeight: 600 } }, "\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694\u2026"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, fontSize: 11, color: "#94A3B8" } }, "Supabase\uC640 \uC5F0\uACB0 \uC911\uC785\uB2C8\uB2E4")));
    if (status === "expired") return /* @__PURE__ */ React.createElement("div", { style: containerStyle }, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 80, textAlign: "center", maxWidth: 320 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 64 } }, "\u23F0"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#1E293B", marginTop: 16 } }, "QR \uCF54\uB4DC\uAC00 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#64748B", marginTop: 10, lineHeight: 1.6 } }, "\uB2F4\uB2F9\uC790\uC5D0\uAC8C \uC0C8 QR \uCF54\uB4DC\uB97C \uC694\uCCAD\uD558\uC138\uC694.")));
    if (status === "error") return /* @__PURE__ */ React.createElement("div", { style: containerStyle }, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 80, textAlign: "center", maxWidth: 320 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 64 } }, "\u274C"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#1E293B", marginTop: 16 } }, "\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#64748B", marginTop: 10 } }, errMsg), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => window.location.reload(),
        style: {
          marginTop: 20,
          padding: "12px 24px",
          borderRadius: 12,
          border: "none",
          background: typeColor,
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer"
        }
      },
      "\uB2E4\uC2DC \uC2DC\uB3C4"
    )));
    if (status === "success" || status === "duplicate") {
      const s = students.find((x) => x.id === checkedId);
      const isDup = status === "duplicate";
      return /* @__PURE__ */ React.createElement("div", { style: containerStyle }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 400, textAlign: "center", marginBottom: 20, marginTop: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94A3B8", letterSpacing: 1 } }, "\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80")), /* @__PURE__ */ React.createElement("div", { style: {
        width: "100%",
        maxWidth: 400,
        textAlign: "center",
        background: "#fff",
        borderRadius: 24,
        padding: "36px 28px",
        boxShadow: "0 12px 48px rgba(0,0,0,.10)",
        border: `1px solid ${typeColor}20`
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 64, marginBottom: 8 } }, isDup ? "\u{1F514}" : "\u2705"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, fontWeight: 900, color: "#1E293B" } }, isDup ? "\uC774\uBBF8 \uCCB4\uD06C\uB418\uC5C8\uC2B5\uB2C8\uB2E4" : `${typeLabel} \uC644\uB8CC!`), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: typeColor, marginTop: 10 } }, s?.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#64748B", marginTop: 8, lineHeight: 1.8 } }, course?.name, /* @__PURE__ */ React.createElement("br", null), fmtDate(date), " \xB7 ", typeLabel), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, fontSize: 22, fontWeight: 900, color: typeColor, letterSpacing: 2 } }, checkedTime), /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 16,
        padding: "10px 16px",
        borderRadius: 12,
        background: isDup ? "#FFF7ED" : `${typeColor}12`,
        border: `1px solid ${isDup ? "#FED7AA" : typeColor + "30"}`,
        fontSize: 12,
        color: isDup ? "#9A3412" : typeColor,
        fontWeight: 700,
        lineHeight: 1.6
      } }, isDup ? /* @__PURE__ */ React.createElement("span", null, "\u26A0\uFE0F ", checkedTime, "\uC5D0 \uC774\uBBF8 ", typeLabel, " \uCC98\uB9AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", /* @__PURE__ */ React.createElement("br", null), "\uC911\uBCF5 \uAE30\uB85D\uC740 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.") : "\u{1F4E1} \uB2F4\uB2F9\uC790 \uD654\uBA74\uC5D0 \uC2E4\uC2DC\uAC04 \uBC18\uC601\uB429\uB2C8\uB2E4"), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setStatus("identifying");
            setNameInput("");
            setPhoneInput("");
            setMatchErr("");
            setMatchedStudent(null);
          },
          style: {
            marginTop: 16,
            padding: "13px 28px",
            borderRadius: 12,
            border: "none",
            background: isDup ? "#F1F5F9" : typeColor,
            color: isDup ? "#64748B" : "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }
        },
        `\u2190 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30${!isDup && countdown > 0 ? ` (${countdown})` : ""}`
      )));
    }
    const handleIdentify = () => {
      setMatchErr("");
      const nameTrim = nameInput.trim();
      const phoneTrim = phoneInput.replace(/[^0-9]/g, "");
      if (!nameTrim) {
        setMatchErr("\uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694.");
        return;
      }
      if (!phoneTrim) {
        setMatchErr("\uD734\uB300\uD3F0 \uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694.");
        return;
      }
      const found = students.find((s) => {
        const sPhone = (s.phone || "").replace(/[^0-9]/g, "");
        return s.name === nameTrim && sPhone === phoneTrim;
      });
      if (!found) {
        setMatchErr("\uC77C\uCE58\uD558\uB294 \uAD50\uC721\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.\n\uC774\uB984\uACFC \uD734\uB300\uD3F0 \uBC88\uD638\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
        return;
      }
      setMatchedStudent(found);
      setStatus("confirming");
    };
    if (status === "identifying") return /* @__PURE__ */ React.createElement("div", { style: containerStyle }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 420, marginTop: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94A3B8", letterSpacing: 1, marginBottom: 6 } }, "\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80"), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 24,
      fontWeight: 900,
      color: "#1E293B",
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 4
    } }, /* @__PURE__ */ React.createElement("span", null, type === "in" ? "\u{1F4E5}" : "\u{1F4E4}"), typeLabel, " \uCD9C\uC11D \uCCB4\uD06C"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#64748B", fontWeight: 600 } }, course?.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94A3B8" } }, fmtDate(date)), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 15,
      fontWeight: 900,
      color: typeColor,
      letterSpacing: 2,
      background: `${typeColor}10`,
      padding: "3px 10px",
      borderRadius: 8
    } }, "\u{1F550} ", nowStr))), /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      maxWidth: 420,
      marginTop: 20,
      background: "#fff",
      borderRadius: 20,
      padding: "28px 24px",
      boxShadow: "0 8px 40px rgba(0,0,0,.09)",
      border: `1px solid ${typeColor}20`
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: 16,
      fontWeight: 800,
      color: "#1E293B",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 8
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 22 } }, "\u{1F64B}"), " \uBCF8\uC778 \uD655\uC778"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 } }, "\uC774\uB984"), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: nameInput,
        onChange: (e) => {
          setNameInput(e.target.value);
          setMatchErr("");
        },
        onKeyDown: (e) => e.key === "Enter" && handleIdentify(),
        placeholder: "\uD64D\uAE38\uB3D9",
        autoFocus: true,
        style: {
          width: "100%",
          padding: "15px 16px",
          borderRadius: 12,
          border: `1.5px solid ${nameInput ? typeColor + "60" : "#E2E8F0"}`,
          fontSize: 18,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          color: "#1E293B",
          fontWeight: 700
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 12, fontWeight: 700, color: "#64748B", display: "block", marginBottom: 6 } }, "\uD734\uB300\uD3F0 \uBC88\uD638"), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: phoneInput,
        onChange: (e) => {
          setPhoneInput(e.target.value);
          setMatchErr("");
        },
        onKeyDown: (e) => e.key === "Enter" && handleIdentify(),
        placeholder: "010-0000-0000",
        inputMode: "tel",
        style: {
          width: "100%",
          padding: "15px 16px",
          borderRadius: 12,
          border: `1.5px solid ${phoneInput ? typeColor + "60" : "#E2E8F0"}`,
          fontSize: 18,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          color: "#1E293B",
          fontWeight: 700
        }
      }
    )), matchErr && /* @__PURE__ */ React.createElement("div", { style: {
      padding: "12px 14px",
      borderRadius: 10,
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      fontSize: 13,
      color: "#DC2626",
      fontWeight: 600,
      marginBottom: 16,
      whiteSpace: "pre-line"
    } }, "\u26A0\uFE0F ", matchErr), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleIdentify,
        style: {
          width: "100%",
          padding: "16px",
          borderRadius: 14,
          border: "none",
          background: typeColor,
          color: "#fff",
          fontWeight: 800,
          fontSize: 17,
          cursor: "pointer",
          letterSpacing: 0.5
        }
      },
      typeLabel,
      " \uCD9C\uC11D \uD655\uC778 \u2192"
    )), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 24, fontSize: 10, color: "#CBD5E1", textAlign: "center" } }, "\xA9 2026 \uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80"));
    if (status === "confirming" && matchedStudent) return /* @__PURE__ */ React.createElement("div", { style: containerStyle }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      maxWidth: 420,
      marginTop: 20,
      background: "#fff",
      borderRadius: 20,
      padding: "28px 24px",
      boxShadow: "0 8px 40px rgba(0,0,0,.09)",
      border: `1px solid ${typeColor}20`
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#94A3B8", marginBottom: 16 } }, "\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80 \xB7 ", course?.name), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 72,
      height: 72,
      borderRadius: 20,
      background: `${typeColor}18`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 32,
      fontWeight: 900,
      color: typeColor,
      margin: "0 auto 12px"
    } }, matchedStudent.name[0]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: "#1E293B" } }, matchedStudent.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#94A3B8", marginTop: 4 } }, matchedStudent.phone || ""), /* @__PURE__ */ React.createElement("div", { style: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: 700,
      color: typeColor,
      background: `${typeColor}12`,
      padding: "8px 20px",
      borderRadius: 20,
      display: "inline-block"
    } }, fmtDate(date), " \xB7 ", typeLabel)), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleCheckin(matchedStudent),
        style: {
          width: "100%",
          padding: "16px",
          borderRadius: 14,
          border: "none",
          background: typeColor,
          color: "#fff",
          fontWeight: 800,
          fontSize: 17,
          cursor: "pointer",
          letterSpacing: 0.5,
          marginBottom: 10
        }
      },
      "\u2705 \uB9DE\uC2B5\uB2C8\uB2E4 \u2014 ",
      typeLabel,
      " \uCC98\uB9AC"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setStatus("identifying");
          setMatchedStudent(null);
          setMatchErr("");
        },
        style: {
          width: "100%",
          padding: "13px",
          borderRadius: 14,
          border: `1.5px solid #E2E8F0`,
          background: "#F8FAFC",
          color: "#64748B",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer"
        }
      },
      "\u2190 \uB2E4\uC2DC \uC785\uB825"
    )));
    return null;
  };
  class RealtimeManager {
    constructor() {
      this.subscriptions = /* @__PURE__ */ new Map();
      this._refCount = 0;
    }
    _nextRef() {
      return String(++this._refCount);
    }
    subscribe(table, callbacks = {}) {
      if (!ENABLE_REALTIME) return;
      if (this.subscriptions.has(table)) return;
      const { onInsert, onUpdate, onDelete, onStatus } = callbacks;
      const channel = `realtime:public:${table}`;
      const joinRef = this._nextRef();
      const state = {
        intentionallyClosed: false,
        heartbeatId: null,
        ws: null,
        retryDelay: 2e3,
        // 지수 backoff 초기값
        subIds: []
        // phx_reply에서 받은 subscription IDs
      };
      this.subscriptions.set(table, state);
      const send = (obj) => {
        if (state.ws?.readyState === WebSocket.OPEN) {
          state.ws.send(JSON.stringify(obj));
        }
      };
      const connect = () => {
        if (state.intentionallyClosed) return;
        const ws = new WebSocket(
          `wss://${SB_URL.replace("https://", "")}/realtime/v1/websocket?apikey=${SB_KEY}&vsn=1.0.0`
        );
        state.ws = ws;
        ws.onopen = () => {
          state.retryDelay = 2e3;
          console.log(`\u2705 [Realtime] ${table} \uC5F0\uACB0\uB428`);
          onStatus?.("connected");
          send({
            topic: channel,
            event: "phx_join",
            payload: {
              config: {
                broadcast: { self: false },
                presence: { key: "" },
                postgres_changes: [{ event: "*", schema: "public", table }]
              },
              access_token: SB_KEY
            },
            ref: joinRef,
            join_ref: joinRef
          });
          state.heartbeatId = setInterval(() => {
            send({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this._nextRef() });
          }, 25e3);
        };
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === "phx_reply" && msg.ref === joinRef) {
              if (msg.payload?.status === "ok") {
                state.subIds = (msg.payload.response?.postgres_changes || []).map((c) => c.id);
                console.log(`\u{1F514} [Realtime] ${table} \uAD6C\uB3C5 \uD655\uC778 IDs:`, state.subIds);
              } else {
                console.error(`\u274C [Realtime] ${table} \uAD6C\uB3C5 \uC2E4\uD328:`, msg.payload?.response);
                onStatus?.("error");
              }
              return;
            }
            if (msg.event === "postgres_changes" && msg.payload?.data) {
              const ids = msg.payload.ids || [];
              if (state.subIds.length > 0 && !ids.some((id) => state.subIds.includes(id))) return;
              const { type: eventType, record: newRecord, old_record: oldRecord } = msg.payload.data;
              switch (eventType) {
                case "INSERT":
                  onInsert?.(newRecord);
                  break;
                case "UPDATE":
                  onUpdate?.(newRecord, oldRecord);
                  break;
                case "DELETE":
                  onDelete?.(oldRecord);
                  break;
              }
            }
          } catch (err) {
            console.error(`[Realtime] ${table} \uD30C\uC2F1 \uC624\uB958:`, err);
          }
        };
        ws.onerror = () => {
          console.warn(`\u26A0\uFE0F [Realtime] ${table} \uC18C\uCF13 \uC624\uB958`);
          onStatus?.("error");
        };
        ws.onclose = (ev) => {
          clearInterval(state.heartbeatId);
          state.heartbeatId = null;
          if (!state.intentionallyClosed) {
            console.warn(`\u{1F50C} [Realtime] ${table} \uC5F0\uACB0 \uB04A\uAE40 (code:${ev.code}) \u2014 ${state.retryDelay / 1e3}\uCD08 \uD6C4 \uC7AC\uC5F0\uACB0`);
            onStatus?.("disconnected");
            setTimeout(connect, state.retryDelay);
            state.retryDelay = Math.min(state.retryDelay * 2, 3e4);
          }
        };
      };
      connect();
    }
    unsubscribe(table) {
      const state = this.subscriptions.get(table);
      if (!state) return;
      state.intentionallyClosed = true;
      clearInterval(state.heartbeatId);
      state.heartbeatId = null;
      state.ws?.close();
      this.subscriptions.delete(table);
    }
    unsubscribeAll() {
      this.subscriptions.forEach((state) => {
        state.intentionallyClosed = true;
        clearInterval(state.heartbeatId);
        state.heartbeatId = null;
        state.ws?.close();
      });
      this.subscriptions.clear();
    }
  }
  const realtimeManager = new RealtimeManager();
  const SyncPanel = ({ dbStatus = "loading", rtStatus = "pending", lastOp = null, count = 0 }) => {
    const row = (icon, label, ok, pending, msg) => {
      const color = ok ? "#16A34A" : pending ? "#F59E0B" : "#DC2626";
      const bg = ok ? "#F0FDF4" : pending ? "#FFFBEB" : "#FEF2F2";
      const bd = ok ? "#BBF7D0" : pending ? "#FDE68A" : "#FECACA";
      return /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 6,
        background: bg,
        border: `1px solid ${bd}`,
        fontSize: 11,
        color
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, icon), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, label), msg && /* @__PURE__ */ React.createElement("span", { style: { color: "#6B7280", fontWeight: 400, fontSize: 10 } }, msg));
    };
    const dbOk = dbStatus === "ok";
    const dbPending = dbStatus === "loading";
    const rtOk = rtStatus === "connected";
    const rtPending = rtStatus === "pending";
    const opIcon = !lastOp ? null : lastOp.status === "ok" ? "\u2705" : "\u274C";
    const opLabel = !lastOp ? null : { add: "\uCD94\uAC00", edit: "\uC218\uC815", delete: "\uC0AD\uC81C" }[lastOp.type] || lastOp.type;
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, alignItems: "center" } }, row(
      dbPending ? "\u23F3" : dbOk ? "\u2705" : "\u274C",
      dbPending ? "DB \uB85C\uB529\uC911\u2026" : dbOk ? `DB \uB85C\uB4DC \uC644\uB8CC (${count}\uAC74)` : "DB \uB85C\uB4DC \uC2E4\uD328",
      dbOk,
      dbPending
    ), row(
      rtPending ? "\u{1F504}" : rtOk ? "\u{1F517}" : "\u26A0\uFE0F",
      rtPending ? "\uC2E4\uC2DC\uAC04 \uC5F0\uACB0\uC911\u2026" : rtOk ? "\uC2E4\uC2DC\uAC04 \uC5F0\uACB0\uB428" : "\uC2E4\uC2DC\uAC04 \uB04A\uAE40",
      rtOk,
      rtPending
    ), storageBlocked && row("\u{1F4BE}", "\uC2A4\uD1A0\uB9AC\uC9C0 \uCC28\uB2E8 (\uC778\uBA54\uBAA8\uB9AC)", false, false, "\uC0C8\uB85C\uACE0\uCE68 \uC2DC \uC138\uC158 \uCD08\uAE30\uD654"), lastOp && row(
      opIcon,
      `\uB9C8\uC9C0\uB9C9 ${opLabel}: ${lastOp.status === "ok" ? "\uC131\uACF5" : "\uC2E4\uD328"}`,
      lastOp.status === "ok",
      false,
      lastOp.msg ? `(${lastOp.msg})` : ""
    ));
  };
  function App() {
    const [accounts, setAccounts] = useState(INIT_ACCOUNTS);
    const [currentUser, setCurrentUser] = useState(() => {
      try {
        return JSON.parse(safeSession.get("gjf_user") || "null");
      } catch (e) {
        console.warn("\uC138\uC158 \uBCF5\uC6D0 \uC2E4\uD328:", e);
        return null;
      }
    });
    const [showAccMgr, setShowAccMgr] = useState(false);
    const [piDismissed, setPiDismissed] = useState(false);
    const [stgBannerDismissed, setStgBannerDismissed] = useState(false);
    const [page, setPage] = useState("dash");
    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState(COURSES);
    const [overrides, setOverrides] = useState([]);
    const [editTarget, setEditTarget] = useState(null);
    const [showNew, setShowNew] = useState(false);
    const [showDataMgr, setShowDataMgr] = useState(false);
    const [previewState, setPreviewState] = useState({
      isOpen: false,
      docHtml: "",
      docType: "",
      orientation: "portrait",
      meta: {}
    });
    window._showPrintPreview = (html, docType, orientation) => {
      const pendingMeta = window._pendingPreviewMeta || {};
      window._pendingPreviewMeta = null;
      setPreviewState({ isOpen: true, docHtml: html, docType, orientation, meta: pendingMeta });
    };
    const [auditLog, setAuditLog] = useState(() => {
      try {
        return JSON.parse(safeLocal.get("gjf_audit_log") || "[]");
      } catch {
        return [];
      }
    });
    const addAudit = useCallback((action, detail, user) => {
      const entry = {
        id: Date.now(),
        who: user || "\uC2DC\uC2A4\uD15C",
        when: (/* @__PURE__ */ new Date()).toLocaleString("ko-KR"),
        action,
        detail
      };
      setAuditLog((prev) => {
        const next = [entry, ...prev].slice(0, 300);
        try {
          safeLocal.set("gjf_audit_log", JSON.stringify(next));
        } catch {
        }
        return next;
      });
    }, []);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState("");
    const loadDataRef = useRef(null);
    const coursesRef = useRef(courses);
    const studentsRef = useRef(students);
    const overridesRef = useRef(overrides);
    useEffect(() => {
      coursesRef.current = courses;
    }, [courses]);
    useEffect(() => {
      studentsRef.current = students;
    }, [students]);
    useEffect(() => {
      overridesRef.current = overrides;
    }, [overrides]);
    useEffect(() => {
      window._coursesRef = coursesRef;
    }, []);
    useEffect(() => {
      window._studentsRef = studentsRef;
    }, []);
    useEffect(() => {
      window._overridesRef = overridesRef;
    }, []);
    useEffect(() => {
      window._setStudents = setStudents;
    }, [setStudents]);
    useEffect(() => {
      const loadAccounts = async () => {
        try {
          const { data, error } = await sbGet("accounts", "select=*&order=id");
          if (error) throw error;
          if (data && data.length > 0) {
            setAccounts(data.map(toAccount));
            console.log("\u2705 \uACC4\uC815 \uB85C\uB4DC \uC644\uB8CC:", data.length, "\uAC1C");
          }
        } catch (err) {
          console.error("\u274C \uACC4\uC815 \uB85C\uB4DC \uC2E4\uD328:", err);
          setAccounts(INIT_ACCOUNTS);
        }
      };
      loadAccounts();
    }, []);
    useEffect(() => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      const diagErr = (e) => {
        const msg = e?.message || String(e) || "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958";
        const code = e?.code || "";
        if (code === "PGRST204" || msg.includes("schema cache"))
          return `\uC2A4\uD0A4\uB9C8 \uCE90\uC2DC \uC624\uB958

\uC0C8 \uCEEC\uB7FC\uC774 \uCD94\uAC00\uB41C \uD6C4 PostgREST \uCE90\uC2DC\uB97C \uAC31\uC2E0\uD574\uC57C \uD569\uB2C8\uB2E4.
Supabase \uB300\uC2DC\uBCF4\uB4DC \u2192 API \u2192 Schema Cache \u2192 Reload \uB97C \uD074\uB9AD\uD558\uC138\uC694.`;
        if (e?.status === 403 || msg.includes("permission denied") || msg.includes("row-level security"))
          return `\uAD8C\uD55C \uC624\uB958 (RLS)

Supabase \uB300\uC2DC\uBCF4\uB4DC SQL Editor\uC5D0\uC11C
supabase-setup.sql \uC758 "RLS \uD574\uC81C" \uAD6C\uBB38\uC744 \uC2E4\uD589\uD558\uC138\uC694.`;
        if (e?.status === 503 || msg.includes("project is paused") || msg.includes("upstream connect error"))
          return `Supabase \uD504\uB85C\uC81D\uD2B8\uAC00 \uC77C\uC2DC\uC815\uC9C0 \uC0C1\uD0DC\uC785\uB2C8\uB2E4.

Supabase \uB300\uC2DC\uBCF4\uB4DC\uC5D0\uC11C \uD504\uB85C\uC81D\uD2B8\uB97C \uB2E4\uC2DC \uD65C\uC131\uD654\uD558\uC138\uC694.
(\uBB34\uB8CC \uD50C\uB79C\uC740 1\uC8FC\uC77C \uBBF8\uC0AC\uC6A9 \uC2DC \uC790\uB3D9 \uC815\uC9C0\uB429\uB2C8\uB2E4)`;
        if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ECONNREFUSED"))
          return `\uB124\uD2B8\uC6CC\uD06C \uC624\uB958

Supabase \uD504\uB85C\uC81D\uD2B8 URL\uC744 \uD655\uC778\uD558\uAC70\uB098 \uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uC810\uAC80\uD558\uC138\uC694.
\uD604\uC7AC URL: ${SB_URL}`;
        return `DB \uC5F0\uACB0 \uC624\uB958

${msg}`;
      };
      const load = async () => {
        setLoading(true);
        setDbError("");
        try {
          const [cRes, sRes, ovRes] = await Promise.all([
            sbGet("courses", `select=${COURSE_LIST_SELECT}&order=id`),
            sbGet("students", "select=*&order=id"),
            sbGet("course_schedule_overrides", "select=*&order=date")
          ]);
          if (cRes.error) throw cRes.error;
          if (sRes.error) throw sRes.error;
          const loadedCourses = (cRes.data || []).map(toCourse);
          if (loadedCourses.length > 0) setCourses(loadedCourses);
          const loadedStudents = (sRes.data || []).map(toStudent);
          setStudents(loadedStudents);
          if (ovRes?.error) {
            console.warn("\uC624\uBC84\uB77C\uC774\uB4DC \uB85C\uB4DC \uC2E4\uD328:", ovRes.error);
            setOverrides([]);
          } else {
            const loadedOverrides = (ovRes?.data || []).map(toOverride).filter(Boolean);
            setOverrides(loadedOverrides);
            overridesRef.current = loadedOverrides;
          }
          setLoading(false);
          await loadHolidays().catch(console.warn);
        } catch (e) {
          setDbError(diagErr(e));
          setLoading(false);
        }
      };
      loadDataRef.current = load;
      load();
    }, [currentUser]);
    useEffect(() => {
      if (!currentUser) return;
      realtimeManager.subscribe("students", {
        onInsert: (newRecord) => {
          setStudents((prev) => {
            const existing = prev.find((s) => s.id === newRecord.id);
            if (existing) {
              console.log("\u{1F504} \uD6C8\uB828\uC0DD \uC5C5\uB370\uC774\uD2B8 (\uC2E4\uC2DC\uAC04):", newRecord.name);
              return prev.map((s) => s.id === newRecord.id ? toStudent(newRecord) : s);
            }
            console.log("\u{1F195} \uD6C8\uB828\uC0DD \uCD94\uAC00 (\uC2E4\uC2DC\uAC04):", newRecord.name);
            return [...prev, toStudent(newRecord)];
          });
        },
        onUpdate: (newRecord) => {
          setStudents((prev) => prev.map(
            (s) => s.id === newRecord.id ? toStudent(newRecord) : s
          ));
          console.log("\u270F\uFE0F \uD6C8\uB828\uC0DD \uC218\uC815 (\uC2E4\uC2DC\uAC04):", newRecord.name);
        },
        onDelete: (oldRecord) => {
          setStudents((prev) => prev.filter((s) => s.id !== oldRecord.id));
          console.log("\u{1F5D1}\uFE0F \uD6C8\uB828\uC0DD \uC0AD\uC81C (\uC2E4\uC2DC\uAC04):", oldRecord.name);
        }
      });
      realtimeManager.subscribe("courses", {
        onInsert: (newRecord) => {
          setCourses((prev) => {
            const existing = prev.find((c) => c.id === newRecord.id);
            if (existing) {
              console.log("\u{1F504} \uACFC\uC815 \uC5C5\uB370\uC774\uD2B8 (\uC2E4\uC2DC\uAC04):", newRecord.name);
              return prev.map((c) => c.id === newRecord.id ? toCourse(newRecord) : c);
            }
            console.log("\u{1F195} \uACFC\uC815 \uCD94\uAC00 (\uC2E4\uC2DC\uAC04):", newRecord.name);
            return [...prev, toCourse(newRecord)];
          });
        },
        onUpdate: (newRecord) => {
          setCourses((prev) => prev.map((c) => c.id === newRecord.id ? toCourse(newRecord) : c));
          console.log("\u270F\uFE0F \uACFC\uC815 \uC218\uC815 (\uC2E4\uC2DC\uAC04):", newRecord.name);
        },
        onDelete: (oldRecord) => {
          setCourses((prev) => prev.filter((c) => c.id !== oldRecord.id));
          console.log("\u{1F5D1}\uFE0F \uACFC\uC815 \uC0AD\uC81C (\uC2E4\uC2DC\uAC04):", oldRecord.name);
        }
      });
      realtimeManager.subscribe("accounts", {
        onInsert: (newRecord) => {
          setAccounts((prev) => {
            if (prev.find((a) => a.id === newRecord.id))
              return prev.map((a) => a.id === newRecord.id ? toAccount(newRecord) : a);
            console.log("\u{1F195} \uACC4\uC815 \uCD94\uAC00 (\uC2E4\uC2DC\uAC04):", newRecord.name);
            return [...prev, toAccount(newRecord)];
          });
        },
        onUpdate: (newRecord) => {
          setAccounts((prev) => prev.map((a) => a.id === newRecord.id ? toAccount(newRecord) : a));
          console.log("\u270F\uFE0F \uACC4\uC815 \uC218\uC815 (\uC2E4\uC2DC\uAC04):", newRecord.name);
        },
        onDelete: (oldRecord) => {
          setAccounts((prev) => prev.filter((a) => a.id !== oldRecord.id));
          console.log("\u{1F5D1}\uFE0F \uACC4\uC815 \uC0AD\uC81C (\uC2E4\uC2DC\uAC04):", oldRecord.name);
        }
      });
      return () => realtimeManager.unsubscribeAll();
    }, [currentUser]);
    const isStudentSchemaErr = (e) => {
      const m = e?.message || e?.hint || JSON.stringify(e);
      return m.includes("schema cache") || m.includes("Could not find");
    };
    const addStudents = useCallback(async (newOnes) => {
      const bodies = newOnes.map(fromStudent);
      let { data, error } = await sbInsert("students", bodies);
      if (error && isStudentSchemaErr(error)) {
        const m = error?.message || "";
        const badCol = (m.match(/column ['"`]?(\w+)['"`]?/) || m.match(/'(\w+)'.*schema/) || [])[1] || "cid";
        console.warn("\u26A0\uFE0F students \uC2A4\uD0A4\uB9C8 \uCE90\uC2DC \uC624\uB958 (\uCEEC\uB7FC:", badCol, ") \u2014 Supabase \u2192 Settings \u2192 API \u2192 Reload schema");
        const fallback = bodies.map((b) => {
          const f = { ...b };
          delete f[badCol];
          return f;
        });
        ({ data, error } = await sbInsert("students", fallback));
      }
      if (error) {
        alert("\uC800\uC7A5 \uC624\uB958:\n" + fmtSaveError(error));
        console.error("\u274C \uD559\uC0DD \uC800\uC7A5 \uC2E4\uD328:", error);
        return;
      }
      if (data && data.length > 0) {
        setStudents((prev) => {
          const newIds = new Set(data.map((r) => r.id));
          const filtered = prev.filter((s) => !newIds.has(s.id));
          return [...filtered, ...data.map(toStudent)];
        });
      } else {
        const { data: fresh, error: fetchErr } = await sbGet("students", "select=*&order=id");
        if (fetchErr) {
          console.error("\u274C \uD559\uC0DD \uBAA9\uB85D \uC7AC\uC870\uD68C \uC2E4\uD328:", fetchErr);
        } else if (fresh) {
          setStudents(fresh.map(toStudent));
        }
      }
      addAudit("\uD6C8\uB828\uC0DD \uB4F1\uB85D", `${newOnes.length}\uBA85 \uB4F1\uB85D (${newOnes.map((s) => s.name).join(", ")})`, currentUser?.name);
      console.log("\u2705 \uD559\uC0DD \uC800\uC7A5 \uC644\uB8CC:", (data || []).length, "\uBA85");
    }, [addAudit, currentUser]);
    const updateStudent = useCallback(async (updated) => {
      let body = fromStudent(updated);
      let { error } = await sbUpdate("students", `id=eq.${updated.id}`, body);
      if (error && isStudentSchemaErr(error)) {
        console.warn("\u26A0\uFE0F students.cid \uC2A4\uD0A4\uB9C8 \uCE90\uC2DC \uC624\uB958 \u2014 Supabase \uB300\uC2DC\uBCF4\uB4DC \u2192 Settings \u2192 API \u2192 Schema Cache \u2192 Reload");
        const { cid, ...fallback } = body;
        ({ error } = await sbUpdate("students", `id=eq.${updated.id}`, fallback));
      }
      if (error) {
        alert("\uC218\uC815 \uC624\uB958: " + (error.message || JSON.stringify(error)));
        return;
      }
      setStudents((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      addAudit("\uD6C8\uB828\uC0DD \uC218\uC815", `${updated.name} \uC815\uBCF4 \uC218\uC815`, currentUser?.name);
    }, [addAudit, currentUser]);
    const deleteStudent = useCallback(async (id) => {
      if (!window.confirm("\uC774 \uD6C8\uB828\uC0DD\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) return;
      const target = students.find((s) => s.id === id);
      const { error } = await sbDelete("students", `id=eq.${id}`);
      if (error) {
        alert("\uC0AD\uC81C \uC624\uB958: " + (error.message || JSON.stringify(error)));
        return;
      }
      setStudents((prev) => prev.filter((s) => s.id !== id));
      addAudit("\uD6C8\uB828\uC0DD \uC0AD\uC81C", `${target?.name || id} \uC0AD\uC81C`, currentUser?.name);
    }, [students, addAudit, currentUser]);
    const resetData = useCallback(async () => {
      const { error } = await sbDelete("students", "id=gte.0");
      if (error) {
        alert("\uCD08\uAE30\uD654 \uC624\uB958: " + (error.message || JSON.stringify(error)));
        return;
      }
      setStudents([]);
      addAudit("\uC804\uCCB4 \uCD08\uAE30\uD654", "\uBAA8\uB4E0 \uD6C8\uB828\uC0DD \uB370\uC774\uD130 \uC0AD\uC81C", currentUser?.name);
    }, [addAudit, currentUser]);
    const resetCoursStudents = useCallback(async (cid) => {
      const { error } = await sbDelete("students", `cid=eq.${cid}`);
      if (error) {
        alert("\uCD08\uAE30\uD654 \uC624\uB958: " + (error.message || JSON.stringify(error)));
        return;
      }
      setStudents((prev) => prev.filter((s) => s.cid !== cid));
      addAudit("\uACFC\uC815 \uCD08\uAE30\uD654", `\uACFC\uC815 ID ${cid} \uD6C8\uB828\uC0DD \uC0AD\uC81C`, currentUser?.name);
    }, [addAudit, currentUser]);
    const addCourse = useCallback(async (c) => {
      const { data, error } = await sbInsert("courses", fromCourse(c));
      if (error) {
        alert("\uACFC\uC815 \uC800\uC7A5 \uC624\uB958: " + (error.message || JSON.stringify(error)));
        console.error("\u274C \uACFC\uC815 \uC800\uC7A5 \uC2E4\uD328:", error);
        return;
      }
      if (data && data.id) {
        setCourses((prev) => {
          const filtered = prev.filter((x) => x.id !== data.id);
          return [...filtered, toCourse(data)];
        });
      } else {
        const { data: fresh } = await sbGet("courses", `select=${COURSE_LIST_SELECT}&order=id`);
        if (fresh && fresh.length > 0) setCourses(fresh.map(toCourse));
      }
      addAudit("\uACFC\uC815 \uB4F1\uB85D", `${c.name} (${c.code}) \uCD94\uAC00`, currentUser?.name);
      console.log("\u2705 \uACFC\uC815 \uC800\uC7A5 \uC644\uB8CC:", data?.name);
    }, [addAudit, currentUser]);
    const updateCourse = useCallback(async (c) => {
      const { error } = await sbUpdate("courses", `id=eq.${c.id}`, fromCourse(c));
      if (error) {
        alert("\uACFC\uC815 \uC218\uC815 \uC624\uB958: " + (error.message || JSON.stringify(error)));
        console.error("\u274C \uACFC\uC815 \uC218\uC815 \uC2E4\uD328:", error);
        return;
      }
      addAudit("\uACFC\uC815 \uC218\uC815", `${c.name} (${c.code}) \uC815\uBCF4 \uC218\uC815`, currentUser?.name);
      console.log("\u2705 \uACFC\uC815 \uC218\uC815 \uC644\uB8CC:", c.name);
      setCourses((prev) => prev.map((x) => x.id === c.id ? c : x));
    }, [addAudit, currentUser]);
    const deleteCourse = useCallback(async (id) => {
      const target = courses.find((c) => c.id === id);
      const { error } = await sbDelete("courses", `id=eq.${id}`);
      if (error) {
        alert("\uACFC\uC815 \uC0AD\uC81C \uC624\uB958: " + (error.message || JSON.stringify(error)));
        console.error("\u274C \uACFC\uC815 \uC0AD\uC81C \uC2E4\uD328:", error);
        return;
      }
      addAudit("\uACFC\uC815 \uC0AD\uC81C", `${target?.name || id} \uC0AD\uC81C`, currentUser?.name);
      console.log("\u2705 \uACFC\uC815 \uC0AD\uC81C \uC644\uB8CC: ID", id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }, [courses, addAudit, currentUser]);
    const recalculateAttendanceRate = useCallback(async (courseId) => {
      try {
        const course = coursesRef.current.find((c) => Number(c.id) === Number(courseId));
        if (!course) return;
        const courseStudents = studentsRef.current.filter((s) => Number(s.cid) === Number(courseId));
        await batchRecalculateAllHours(courseStudents, [course]);
      } catch (err) {
        console.warn("\uC2DC\uAC04 \uAE30\uC900 \uC7AC\uACC4\uC0B0 \uC2E4\uD328:", err.message || err);
      }
    }, []);
    const urlMode = new URLSearchParams(window.location.search).get("mode");
    if (urlMode === "checkin") {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(GStyle, null), /* @__PURE__ */ React.createElement(MobileCheckin, null));
    }
    if (!currentUser) {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(GStyle, null), /* @__PURE__ */ React.createElement(LoginScreen, { accounts, onLogin: (user) => {
        try {
          safeSession.set("gjf_user", JSON.stringify(user));
        } catch {
        }
        setCurrentUser(user);
        setPiDismissed(false);
        addAudit("\uB85C\uADF8\uC778", `${user.name} \uB85C\uADF8\uC778`, user.name);
      } }));
    }
    if (loading || dbError) {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(GStyle, null), /* @__PURE__ */ React.createElement("div", { style: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#7C2D12,#EA580C,#FFF7ED)",
        fontFamily: "'Pretendard',-apple-system,sans-serif"
      } }, loading && !dbError ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: {
        width: 56,
        height: 56,
        borderRadius: 16,
        background: "rgba(255,255,255,.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 26,
        marginBottom: 20,
        animation: "ping 1.5s ease infinite"
      } }, "\u{1F393}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 8 } }, "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\u2026"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "rgba(255,255,255,.6)" } }, "Supabase \uC5F0\uACB0 \uC911 \xB7 \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694")) : null, dbError && /* @__PURE__ */ React.createElement("div", { style: {
        marginTop: 20,
        padding: "18px 24px",
        background: "#FEF2F2",
        borderRadius: 12,
        fontSize: 12,
        color: "#DC2626",
        maxWidth: 400,
        textAlign: "left",
        lineHeight: 1.8,
        whiteSpace: "pre-line",
        boxShadow: "0 4px 20px rgba(0,0,0,.15)"
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 14, marginBottom: 8 } }, "\u26A0\uFE0F \uC5F0\uB3D9 \uC624\uB958"), dbError, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setDbError("");
            setLoading(false);
          },
          style: {
            padding: "6px 14px",
            borderRadius: 7,
            border: "1px solid #DC2626",
            background: "#fff",
            color: "#DC2626",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700
          }
        },
        "\uC624\uB958 \uD655\uC778 \uD6C4 \uC9C4\uC785"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            if (loadDataRef.current) loadDataRef.current();
          },
          style: {
            padding: "6px 14px",
            borderRadius: 7,
            border: "none",
            background: "#DC2626",
            color: "#fff",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700
          }
        },
        "\uC7AC\uC2DC\uB3C4"
      )))));
    }
    const renderPage = () => {
      switch (page) {
        case "dash":
          return /* @__PURE__ */ React.createElement(Dashboard, { students, courses });
        case "courses":
          return /* @__PURE__ */ React.createElement(CourseList, { courses, onAdd: addCourse, onUpdate: updateCourse, onDelete: deleteCourse });
        case "progress":
          return /* @__PURE__ */ React.createElement(ProgressMgmt, { students, courses });
        case "students":
          return /* @__PURE__ */ React.createElement(StudentMgmt, { students, courses, onAdd: addStudents, onEdit: setEditTarget, onUpdate: updateStudent, onDelete: deleteStudent, onNew: () => setShowNew(true), currentUser });
        case "instructors":
          return /* @__PURE__ */ React.createElement(InstructorMgmt, { courses, onUpdateCourse: updateCourse });
        case "rooms":
          return /* @__PURE__ */ React.createElement(RoomMgmt, { courses });
        case "attendance":
          return /* @__PURE__ */ React.createElement(AttendanceMgmt, { students, courses, overrides, setOverrides, onRatesUpdated: recalculateAttendanceRate });
        case "completion":
          return /* @__PURE__ */ React.createElement(CompletionMgmt, { students, courses });
        case "cert":
          return /* @__PURE__ */ React.createElement(CertMgmt, { students, courses, currentUser, addAudit });
        default:
          return null;
      }
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(GStyle, null), /* @__PURE__ */ React.createElement(
      PrintPreviewModal,
      {
        isOpen: previewState.isOpen,
        docHtml: previewState.docHtml,
        docType: previewState.docType,
        orientation: previewState.orientation,
        meta: previewState.meta,
        onClose: () => setPreviewState((p) => ({ ...p, isOpen: false }))
      }
    ), showNew && /* @__PURE__ */ React.createElement(
      EditModal,
      {
        student: null,
        isNew: true,
        courses,
        onSave: (s) => addStudents([s]),
        onClose: () => setShowNew(false)
      }
    ), editTarget && /* @__PURE__ */ React.createElement(
      EditModal,
      {
        student: editTarget,
        courses,
        onSave: updateStudent,
        onClose: () => setEditTarget(null)
      }
    ), showDataMgr && /* @__PURE__ */ React.createElement(
      DataManager,
      {
        students,
        courses,
        onResetAll: resetData,
        onResetCourse: resetCoursStudents,
        onClose: () => setShowDataMgr(false)
      }
    ), showAccMgr && currentUser.role === "admin" && /* @__PURE__ */ React.createElement(
      AccountMgmt,
      {
        accounts,
        currentUser,
        auditLog,
        onSave: async (updated) => {
          try {
            console.log("Saving accounts...");
            const { data: existingRows, error: loadErr } = await sbGet("accounts", "select=id&order=id");
            if (loadErr) throw loadErr;
            const existingIds = new Set((existingRows || []).map((r) => Number(r.id)));
            const nextIds = new Set(updated.map((a) => Number(a.id)));
            const removedIds = [...existingIds].filter((id) => !nextIds.has(id));
            const { error: upsertErr } = await sbUpsert("accounts", updated.map(fromAccount), "id");
            if (upsertErr) throw upsertErr;
            for (const id of removedIds) {
              const { error: delErr } = await sbDelete("accounts", `id=eq.${id}`);
              if (delErr) throw delErr;
            }
            const { data: freshRows, error: freshErr } = await sbGet("accounts", "select=*&order=id");
            if (freshErr) throw freshErr;
            const savedAccounts = (freshRows || []).map(toAccount);
            setAccounts(savedAccounts);
            setCurrentUser((prev) => savedAccounts.find((a) => a.id === prev.id) || prev);
            addAudit("Account update", `Saved account list (${savedAccounts.length})`, currentUser?.name);
            console.log("Accounts saved:", savedAccounts.length);
          } catch (err) {
            console.error("Account save failed:", err);
            alert("Account save failed: changes were not saved to Supabase.\n\n" + fmtSaveError(err));
          }
        },
        onClose: () => setShowAccMgr(false)
      }
    ), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      height: "100vh",
      background: "linear-gradient(160deg,#FED7AA 0%,#FDBA74 10%,#FFF7ED 40%,#F8FAFC 70%,#FFEDD5 100%)",
      fontFamily: "'Pretendard',-apple-system,sans-serif",
      overflow: "hidden",
      flexDirection: "column"
    } }, !piDismissed && /* @__PURE__ */ React.createElement("div", { style: {
      background: "linear-gradient(90deg,#7C2D12,#B91C1C)",
      padding: "7px 22px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 11,
      color: "#fff",
      flexShrink: 0
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\u{1F512}"), /* @__PURE__ */ React.createElement("span", { className: "pi-banner-text" }, /* @__PURE__ */ React.createElement("b", null, "\uAC1C\uC778\uC815\uBCF4 \uC8FC\uC758:"), " \uC774 \uC2DC\uC2A4\uD15C\uC740 \uD6C8\uB828\uC0DD \uAC1C\uC778\uC815\uBCF4\uB97C \uD3EC\uD568\uD569\uB2C8\uB2E4. \uC5C5\uBB34 \uBAA9\uC801 \uC678 \uC0AC\uC6A9\xB7\uC720\uCD9C\xB7\uCEA1\uCC98\uB97C \uC5C4\uAE08\uD569\uB2C8\uB2E4. \uC704\uBC18 \uC2DC \u300C\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95\u300D\uC5D0 \uB530\uB77C \uCC98\uBC8C\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("span", { className: "pi-banner-icon", style: { display: "none", fontSize: 11 } }, "\uAC1C\uC778\uC815\uBCF4 \uC8FC\uC758 \u2014 \uC678\uBD80 \uC720\uCD9C \uAE08\uC9C0"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setPiDismissed(true),
        style: {
          marginLeft: "auto",
          background: "rgba(255,255,255,.15)",
          border: "none",
          color: "#fff",
          borderRadius: 5,
          padding: "2px 10px",
          cursor: "pointer",
          fontSize: 11,
          flexShrink: 0
        }
      },
      "\uD655\uC778"
    )), storageBlocked && !stgBannerDismissed && /* @__PURE__ */ React.createElement("div", { style: {
      background: "linear-gradient(90deg,#78350F,#D97706)",
      padding: "7px 22px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 11,
      color: "#fff",
      flexShrink: 0
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "\uC2A4\uD1A0\uB9AC\uC9C0 \uCC28\uB2E8:"), " \uBE0C\uB77C\uC6B0\uC800\uC758 \uCD94\uC801 \uBC29\uC9C0(Tracking Prevention) \uC124\uC815\uC73C\uB85C \uC778\uD574 \uB85C\uCEEC \uC800\uC7A5\uC18C \uC811\uADFC\uC774 \uCC28\uB2E8\uB410\uC2B5\uB2C8\uB2E4.", " ", /* @__PURE__ */ React.createElement("b", null, "\uB85C\uADF8\uC778 \uC138\uC158\uC774 \uC0C8\uB85C\uACE0\uCE68 \uC2DC \uCD08\uAE30\uD654"), "\uB418\uBA70, \uAC10\uC0AC \uB85C\uADF8\uAC00 \uBCF4\uC874\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", " ", "Edge: ", /* @__PURE__ */ React.createElement("b", null, "\uC124\uC815 \u2192 \uAC1C\uC778\uC815\uBCF4 \u2192 \uCD94\uC801 \uBC29\uC9C0 \u2192 \uADE0\uD615\uC7A1\uD78C"), " \uB610\uB294 \uC774 \uC0AC\uC774\uD2B8\uB97C \uC608\uC678\uB85C \uCD94\uAC00.", " ", "Safari: ", /* @__PURE__ */ React.createElement("b", null, "\uC124\uC815 \u2192 \uAC1C\uC778\uC815\uBCF4 \u2192 \uC0AC\uC774\uD2B8 \uAC04 \uCD94\uC801 \uBC29\uC9C0 \uD574\uC81C"), " \uB610\uB294 \uC774 \uC0AC\uC774\uD2B8\uB97C \uC2E0\uB8B0\uD558\uB3C4\uB85D \uC124\uC815\uD558\uC138\uC694."), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setStgBannerDismissed(true),
        style: {
          marginLeft: "auto",
          background: "rgba(255,255,255,.15)",
          border: "none",
          color: "#fff",
          borderRadius: 5,
          padding: "2px 10px",
          cursor: "pointer",
          fontSize: 11,
          flexShrink: 0
        }
      },
      "\uB2EB\uAE30"
    )), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `sidebar-overlay${mobileSidebar ? " active" : ""}`,
        onClick: () => setMobileSidebar(false)
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", overflow: "hidden", position: "relative" } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `app-sidebar${mobileSidebar ? " mobile-open" : ""}`,
        style: {
          width: collapsed ? 64 : 240,
          flexShrink: 0,
          background: `linear-gradient(175deg,${T.sb} 0%,#9A3412 40%,${T.p} 75%,#F97316 100%)`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "4px 0 32px rgba(124,45,18,.3)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        padding: collapsed ? "16px 0" : "16px 18px",
        borderBottom: "1px solid rgba(255,255,255,.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between"
      } }, !collapsed && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "-.3px" } }, "\uACBD\uAE30\uBD81\uBD80 \uC9C1\uC5C5\uAD50\uC721"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, marginTop: 3 } }, /* @__PURE__ */ React.createElement("span", { style: {
        background: "rgba(253,186,116,.3)",
        color: "#FED7AA",
        padding: "1px 6px",
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 700
      } }, "2026"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "rgba(255,255,255,.45)" } }, "\uD559\uC0AC\uAD00\uB9AC\uC2DC\uC2A4\uD15C"))), /* @__PURE__ */ React.createElement("button", { onClick: () => setCollapsed(!collapsed), style: {
        width: 28,
        height: 28,
        borderRadius: 6,
        background: "rgba(255,255,255,.12)",
        border: "none",
        color: "rgba(255,255,255,.7)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "bars", s: 14 }))),
      /* @__PURE__ */ React.createElement("nav", { style: { flex: 1, padding: "10px 0", overflowY: "auto" } }, NAV_ITEMS.map((item) => {
        const active = page === item.id;
        return /* @__PURE__ */ React.createElement("button", { key: item.id, className: "btn-nav", onClick: () => {
          setPage(item.id);
          setMobileSidebar(false);
        }, style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "13px 0" : "11px 18px",
          justifyContent: collapsed ? "center" : "flex-start",
          background: active ? "rgba(255,255,255,.15)" : "transparent",
          border: "none",
          cursor: "pointer",
          borderLeft: active ? "3px solid #FED7AA" : "3px solid transparent",
          color: active ? "#fff" : "rgba(255,255,255,.5)",
          fontWeight: active ? 700 : 400,
          fontSize: 13
        } }, /* @__PURE__ */ React.createElement(Icon, { n: item.icon, s: 16 }), !collapsed && /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap" } }, item.label), active && !collapsed && /* @__PURE__ */ React.createElement("div", { style: {
          marginLeft: "auto",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#FED7AA",
          flexShrink: 0
        } }));
      })),
      !collapsed && /* @__PURE__ */ React.createElement("div", { style: { padding: "13px 18px", borderTop: "1px solid rgba(255,255,255,.1)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: 34,
        height: 34,
        borderRadius: 10,
        flexShrink: 0,
        background: "rgba(255,255,255,.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,.85)"
      } }, /* @__PURE__ */ React.createElement(Icon, { n: "user", s: 15 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, currentUser.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "rgba(255,255,255,.4)" } }, currentUser.role === "admin" ? "\uAD00\uB9AC\uC790" : "\uB2F4\uB2F9\uC790", " \xB7 \uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8"))), currentUser.role === "admin" && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setShowAccMgr(true),
          style: {
            width: "100%",
            padding: "7px 0",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.08)",
            color: "rgba(255,255,255,.75)",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 6
          }
        },
        "\u{1F464} \uACC4\uC815 \uAD00\uB9AC"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            if (window.confirm("\uB85C\uADF8\uC544\uC6C3 \uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) {
              safeSession.remove("gjf_user");
              addAudit("\uB85C\uADF8\uC544\uC6C3", `${currentUser.name} \uB85C\uADF8\uC544\uC6C3`, currentUser.name);
              setCurrentUser(null);
            }
          },
          style: {
            width: "100%",
            padding: "7px 0",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.08)",
            color: "rgba(255,255,255,.75)",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600
          }
        },
        "\u{1F6AA} \uB85C\uADF8\uC544\uC6C3"
      ))
    ), /* @__PURE__ */ React.createElement("div", { className: "app-main", style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
      height: 52,
      background: "rgba(255,255,255,.92)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${T.bd}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
      flexShrink: 0,
      gap: 8
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "mobile-menu-btn",
        onClick: () => setMobileSidebar(true),
        style: {
          width: 34,
          height: 34,
          borderRadius: 8,
          border: `1px solid ${T.bd}`,
          background: T.s2,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.mu,
          flexShrink: 0
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { n: "bars", s: 16 })
    ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: T.mu, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", { className: "header-title-full", style: { color: T.p, fontWeight: 700 } }, "\uACBD\uAE30\uB3C4\uC77C\uC790\uB9AC\uC7AC\uB2E8 \uBD81\uBD80\uC0AC\uC5C5\uBCF8\uBD80"), /* @__PURE__ */ React.createElement("span", { className: "header-title-full", style: { margin: "0 6px", color: T.bd } }, "\xB7"), /* @__PURE__ */ React.createElement("span", { className: "header-title-full" }, "\uC9C1\uC5C5\uAD50\uC721 \uD559\uC0AC\uAD00\uB9AC\uC2DC\uC2A4\uD15C v2026"), /* @__PURE__ */ React.createElement("span", { className: "header-title-short", style: { display: "none", color: T.p, fontWeight: 800, fontSize: 13 } }, "\uACBD\uAE30\uBD81\uBD80 LMS"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        title: "\uAC1C\uC778\uC815\uBCF4 \uD3EC\uD568 \uC2DC\uC2A4\uD15C \u2014 \uC678\uBD80 \uC720\uCD9C \uAE08\uC9C0",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 8px",
          borderRadius: 6,
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          fontSize: 10,
          color: T.danger,
          fontWeight: 700,
          cursor: "default",
          whiteSpace: "nowrap"
        }
      },
      "\u{1F512} ",
      /* @__PURE__ */ React.createElement("span", { className: "header-title-full" }, "\uAC1C\uC778\uC815\uBCF4 \uC8FC\uC758")
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowDataMgr(true), style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "6px 12px",
      background: T.s3,
      border: `1px solid ${T.bd}`,
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700,
      color: T.mu,
      transition: "all .15s",
      whiteSpace: "nowrap"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "dl", s: 13 }), " ", /* @__PURE__ */ React.createElement("span", { className: "header-title-full" }, "\uB370\uC774\uD130 \uAD00\uB9AC")), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 10px",
      background: T.pbg,
      borderRadius: 8,
      border: `1px solid rgba(234,88,12,.15)`
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: 24,
      height: 24,
      borderRadius: 6,
      background: `linear-gradient(135deg,${T.pm},${T.p})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    } }, /* @__PURE__ */ React.createElement(Icon, { n: "user", s: 12 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: T.p, whiteSpace: "nowrap" } }, currentUser.name), currentUser.role === "admin" && /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 9,
      background: T.p,
      color: "#fff",
      padding: "1px 5px",
      borderRadius: 3,
      whiteSpace: "nowrap"
    } }, "\uAD00\uB9AC\uC790")))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "18px 20px" } }, renderPage())))));
  }
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ React.createElement(App, null));
})();
