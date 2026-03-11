import { useState, useMemo } from "react";

/* ─── 상수 정의 ─────────────────────────────────────────── */
const 출석률기준 = {
  위험: 70,
  주의: 80,
  정상: 80,
  수료기준: 80
};

const 사업정보 = {
  연도: 2026,
  총예산: "278,500천원",
  출연금비율: "100%",
  주관기관: "경기도일자리재단 북부사업본부"
};

/* ─── Google Fonts (Pretendard) ─────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, #root { font-family: 'Pretendard', -apple-system, sans-serif !important; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
    input, select, button { font-family: inherit; }
    
    /* 포커스 스타일 추가 */
    button:focus-visible, input:focus-visible, select:focus-visible {
      outline: 2px solid #0F766E;
      outline-offset: 2px;
    }
    
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 
      50% { opacity: 0.5; }
    }
    .anim { animation: fadeUp 0.3s ease both; }
  `}</style>
);

/* ─── 실제 매뉴얼 기반 과정 데이터 ──────────────────────── */
const COURSES = [
  { id:1,  category:"늘봄강사양성", catColor:"#0F766E", name:"초등 피지컬 코딩강사 양성",    code:"NB-01", period:"6~7월",  method:"블렌디드", hours:92,  target:20, completionGoal:18, employGoal:12 },
  { id:2,  category:"늘봄강사양성", catColor:"#0F766E", name:"AI 딥러닝 전문강사 양성",       code:"NB-02", period:"6~8월",  method:"블렌디드", hours:104, target:20, completionGoal:18, employGoal:12 },
  { id:3,  category:"늘봄강사양성", catColor:"#0F766E", name:"늘봄학교 창의융합교육강사 양성", code:"NB-03", period:"4~6월",  method:"대면",     hours:140, target:20, completionGoal:18, employGoal:12 },
  { id:4,  category:"지역연계·기여", catColor:"#059669", name:"ERP·지게차 물류관리 실무자 양성",code:"JY-01", period:"3~5월",  method:"대면",     hours:182, target:15, completionGoal:14, employGoal:9  },
  { id:5,  category:"지역연계·기여", catColor:"#059669", name:"승강기 전문가 양성",            code:"JY-02", period:"5~6월",  method:"대면",     hours:80,  target:15, completionGoal:14, employGoal:9  },
  { id:6,  category:"지역연계·기여", catColor:"#059669", name:"중장년 기회강사 양성",          code:"JY-03", period:"5~7월",  method:"블렌디드", hours:83,  target:15, completionGoal:14, employGoal:9  },
  { id:7,  category:"지역연계·기여", catColor:"#059669", name:"미지정 공모과정 (지역연계)",    code:"JY-04", period:"-",     method:"-",       hours:0,   target:20, completionGoal:18, employGoal:12 },
  { id:8,  category:"사무분야",      catColor:"#7C3AED", name:"행정회계 사무 OA (1기)",        code:"SM-01", period:"3~5월",  method:"대면",     hours:200, target:20, completionGoal:18, employGoal:12 },
  { id:9,  category:"사무분야",      catColor:"#7C3AED", name:"행정회계 사무 OA (2기)",        code:"SM-02", period:"7~9월",  method:"대면",     hours:200, target:20, completionGoal:18, employGoal:12 },
  { id:10, category:"식품분야",      catColor:"#DC2626", name:"HACCP 전문인력 양성",           code:"FD-01", period:"4~5월",  method:"대면",     hours:112, target:20, completionGoal:18, employGoal:12 },
  { id:11, category:"IT 신직무",     catColor:"#2563EB", name:"AI 시대의 캐릭터 크리에이터 양성",code:"IT-01",period:"8~9월",  method:"비대면",   hours:108, target:20, completionGoal:18, employGoal:12 },
  { id:12, category:"IT 신직무",     catColor:"#2563EB", name:"미지정 공모과정 (IT-A)",        code:"IT-02", period:"-",     method:"-",       hours:0,   target:20, completionGoal:18, employGoal:12 },
  { id:13, category:"IT 신직무",     catColor:"#2563EB", name:"미지정 공모과정 (IT-B)",        code:"IT-03", period:"-",     method:"-",       hours:0,   target:15, completionGoal:14, employGoal:9  },
];

/* 샘플 훈련생 - 개선된 버전 */
const makeStudents = () => {
  const names = ["김민준","이서연","박지훈","최수아","정우진","강다은","윤서준","임지수","한예린","오민혁","송지아","류성민","백수빈","조현우","나은서","권태양","문지원","엄채원","신동현","허예은"];
  const students = [];
  let globalId = 1;
  
  COURSES.forEach(c => {
    const count = Math.max(3, Math.min(c.target, 6));
    for (let i = 0; i < count; i++) {
      const rate = Math.round((55 + Math.random() * 45) * 10) / 10;
      students.push({
        id: globalId++,
        courseId: c.id,
        name: names[i % names.length], // 수정: 각 과정마다 처음부터 시작
        birth: `199${Math.floor(Math.random()*9)+1}-${String(Math.floor(Math.random()*12)+1).padStart(2,"0")}-${String(Math.floor(Math.random()*28)+1).padStart(2,"0")}`,
        phone: `010-${String(Math.floor(Math.random()*9000)+1000)}-${String(Math.floor(Math.random()*9000)+1000)}`,
        attendRate: rate,
        status: rate >= 출석률기준.정상 ? "수강중" : rate < 출석률기준.위험 ? "위험" : "주의",
        attend: Math.floor(rate/100*20),
        absent: 20 - Math.floor(rate/100*20),
      });
    }
  });
  return students;
};

const STUDENTS = makeStudents();

/* ─── 색상 팔레트 (따뜻한 오렌지) ───────────────────── */
const C = {
  primary: "#EA580C",
  primaryMid: "#F97316",
  primaryLight: "#FB923C",
  primaryBg: "#FFF7ED",
  sidebar: "#9A3412",
  sidebarMid: "#C2410C",
  accent: "#F59E0B",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  surface: "#FFFFFF",
  surface2: "#F8FAFC",
  border: "#E2E8F0",
  text: "#1E293B",
  muted: "#64748B",
};

/* ─── 아이콘 ─────────────────────────────────────────────── */
const I = ({ n, s=16 }) => {
  const d = {
    dash:     <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    course:   <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    people:   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    cal:      <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    check2:   <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    award:    <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
    alert:    <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    search:   <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    bell:     <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    plus:     <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    bars:     <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    info:     <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    check:    <polyline points="20 6 9 17 4 12"/>,
    x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    trend:    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>,
    filter:   <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  };
  return (
    <svg 
      width={s} 
      height={s} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{flexShrink:0, display:"block"}}
      aria-hidden="true"
    >
      {d[n]}
    </svg>
  );
};

/* ─── 공통 UI ────────────────────────────────────────────── */
const Tag = ({ label, bg, color, size=11 }) => (
  <span 
    style={{
      background:bg, 
      color, 
      fontSize:size, 
      fontWeight:700,
      padding:"2px 8px", 
      borderRadius:20, 
      letterSpacing:"0.2px", 
      whiteSpace:"nowrap"
    }}
    role="status"
    aria-label={label}
  >
    {label}
  </span>
);

const statusColor = (rate) => {
  if (rate >= 출석률기준.정상) return C.primary;
  if (rate >= 출석률기준.주의) return C.warning;
  return C.danger;
};

const statusLabel = (rate) => {
  if (rate >= 출석률기준.정상) return "정상";
  if (rate >= 출석률기준.주의) return "주의";
  return "위험";
};

const RateBar = ({ rate, h=6 }) => {
  const col = statusColor(rate);
  return (
    <div 
      style={{
        width:"100%",
        height:h,
        background:"#E2E8F0",
        borderRadius:h,
        overflow:"hidden"
      }}
      role="progressbar"
      aria-valuenow={rate}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`출석률 ${rate}%`}
    >
      <div style={{
        height:"100%",
        width:`${rate}%`,
        background:col,
        borderRadius:h,
        transition:"width 1s ease"
      }}/>
    </div>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{
    background:C.surface, 
    borderRadius:12, 
    border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(15,118,110,0.06), 0 4px 12px rgba(0,0,0,0.04)",
    ...style
  }}>
    {children}
  </div>
);

const KPI = ({ label, value, sub, icon, color, badge }) => (
  <Card style={{padding:"20px 22px", display:"flex", gap:14, alignItems:"flex-start"}}>
    <div 
      style={{
        width:46,
        height:46,
        borderRadius:12,
        flexShrink:0,
        background:`${color}15`, 
        color,
        display:"flex",
        alignItems:"center",
        justifyContent:"center"
      }}
      aria-hidden="true"
    >
      <I n={icon} s={22}/>
    </div>
    <div style={{flex:1, minWidth:0}}>
      <div style={{display:"flex", alignItems:"baseline", gap:4, flexWrap:"wrap"}}>
        <span style={{fontSize:26, fontWeight:800, color:C.text, lineHeight:1}}>{value}</span>
        {badge && <Tag label={badge} bg={`${color}15`} color={color} size={10}/>}
      </div>
      <div style={{fontSize:12, color:C.muted, marginTop:3}}>{label}</div>
      {sub && <div style={{fontSize:11, color, marginTop:2, fontWeight:600}}>{sub}</div>}
    </div>
  </Card>
);

const SectionHeader = ({ title, sub, action }) => (
  <div style={{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"flex-end",
    marginBottom:20
  }}>
    <div>
      <h2 style={{fontSize:20, fontWeight:800, color:C.text, letterSpacing:"-0.3px"}}>{title}</h2>
      {sub && <p style={{fontSize:13, color:C.muted, marginTop:3}}>{sub}</p>}
    </div>
    {action}
  </div>
);

/* ─── 대시보드 ───────────────────────────────────────────── */
const Dashboard = ({ courses, students }) => {
  const totalTarget = courses.reduce((a,b)=>a+b.target,0);
  const totalGoalCompletion = courses.reduce((a,b)=>a+b.completionGoal,0);
  const totalGoalEmploy = courses.reduce((a,b)=>a+b.employGoal,0);
  const enrolled = students.length;
  const atRisk = students.filter(s=>s.attendRate < 출석률기준.주의).length;
  const avgRate = enrolled ? (students.reduce((a,b)=>a+b.attendRate,0)/enrolled).toFixed(1) : 0;
  
  const catSummary = {};
  courses.forEach(c=>{
    if(!catSummary[c.category]) catSummary[c.category]={color:c.catColor, cnt:0, target:0};
    catSummary[c.category].cnt++;
    catSummary[c.category].target+=c.target;
  });
  
  const topRisk = [...students]
    .filter(s=>s.attendRate < 출석률기준.정상)
    .sort((a,b)=>a.attendRate-b.attendRate)
    .slice(0,6);
  
  return (
    <div className="anim">
      {/* KPI 행 */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
        gap:14,
        marginBottom:24
      }}>
        <KPI label="총 모집 목표" value={`${totalTarget}명`} icon="people" color={C.primary} sub="13개 과정" badge={사업정보.연도}/>
        <KPI label="수료 목표 (90%)" value={`${totalGoalCompletion}명`} icon="check2" color="#059669" sub="과정별 합산"/>
        <KPI label="취업 목표 (65%)" value={`${totalGoalEmploy}명`} icon="trend" color={C.accent} sub="수료자 기준"/>
        <KPI label="현재 위험 훈련생" value={`${atRisk}명`} icon="alert" color={C.danger} sub={`출석률 ${출석률기준.주의}% 미만`}/>
        <KPI label="평균 출석률" value={`${avgRate}%`} icon="cal" color={C.info} sub="전체 훈련생 기준"/>
      </div>
      
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16}}>
        {/* 분야별 현황 */}
        <Card style={{padding:22}}>
          <div style={{fontSize:13, fontWeight:700, color:C.text, marginBottom:16, display:"flex", gap:8, alignItems:"center"}}>
            <I n="course" s={15}/> 분야별 과정 현황
          </div>
          {Object.entries(catSummary).map(([cat,info])=>(
            <div key={cat} style={{display:"flex", alignItems:"center", gap:12, marginBottom:12}}>
              <div style={{width:3, height:32, background:info.color, borderRadius:2, flexShrink:0}} aria-hidden="true"/>
              <div style={{flex:1}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                  <span style={{fontSize:12, fontWeight:600, color:C.text}}>{cat}</span>
                  <span style={{fontSize:11, color:C.muted}}>{info.cnt}개 과정 · 목표 {info.target}명</span>
                </div>
                <div style={{height:5, background:"#E2E8F0", borderRadius:3, overflow:"hidden"}} role="progressbar" aria-label={`${cat} 비율`}>
                  <div style={{height:"100%", width:`${(info.target/totalTarget)*100}%`, background:info.color, borderRadius:3}}/>
                </div>
              </div>
            </div>
          ))}
          <div style={{marginTop:16, padding:"12px 14px", background:"#FFF7ED", borderRadius:8, border:"1px solid #FFEDD5"}}>
            <div style={{fontSize:11, color:C.muted, marginBottom:2}}>사업 전체 예산</div>
            <div style={{fontSize:16, fontWeight:800, color:C.primary}}>{사업정보.총예산}</div>
            <div style={{fontSize:11, color:C.muted, marginTop:1}}>출연금 {사업정보.출연금비율} · {사업정보.주관기관}</div>
          </div>
        </Card>
        
        {/* 수료 위험 훈련생 */}
        <Card style={{padding:22}}>
          <div style={{fontSize:13, fontWeight:700, color:C.text, marginBottom:14, display:"flex", gap:8, alignItems:"center"}}>
            <I n="alert" s={15}/> 수료 위험 훈련생
            <span style={{marginLeft:"auto", fontSize:11, color:C.muted}}>출석률 {출석률기준.정상}% 미만</span>
          </div>
          {topRisk.length===0 && (
            <div style={{textAlign:"center", color:C.muted, padding:"32px 0", fontSize:13}}>
              위험 훈련생이 없습니다 🎉
            </div>
          )}
          {topRisk.map(s=>{
            const c = courses.find(x=>x.id===s.courseId);
            const rate = s.attendRate;
            const isHighRisk = rate < 출석률기준.위험;
            return (
              <div 
                key={s.id} 
                style={{
                  display:"flex", 
                  alignItems:"center", 
                  gap:12, 
                  padding:"10px 12px", 
                  borderRadius:8, 
                  marginBottom:6,
                  background: isHighRisk ? "#FEF2F2" : "#FFFBEB",
                  border:`1px solid ${isHighRisk ? "#FECACA" : "#FDE68A"}`
                }}
              >
                <div 
                  style={{
                    width:32, 
                    height:32, 
                    borderRadius:8, 
                    flexShrink:0,
                    background: isHighRisk ? "#FEE2E2" : "#FEF3C7",
                    display:"flex", 
                    alignItems:"center", 
                    justifyContent:"center",
                    color: isHighRisk ? C.danger : C.warning, 
                    fontSize:14, 
                    fontWeight:800
                  }}
                  aria-label={`출석률 ${Math.round(rate)}%`}
                >
                  {Math.round(rate)}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:700, color:C.text}}>{s.name}</div>
                  <div style={{fontSize:10, color:C.muted, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                    {c?.name}
                  </div>
                </div>
                <Tag 
                  label={isHighRisk ? "위험" : "주의"} 
                  bg={isHighRisk ? "#FEE2E2" : "#FEF3C7"} 
                  color={isHighRisk ? C.danger : C.warning}
                />
              </div>
            );
          })}
        </Card>
      </div>
      
      {/* 2026 사업 목표 */}
      <Card style={{padding:22}}>
        <div style={{fontSize:13, fontWeight:700, color:C.text, marginBottom:16, display:"flex", gap:8, alignItems:"center"}}>
          <I n="info" s={15}/> {사업정보.연도} 사업 개요
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12}}>
          {[
            {label:"사업기간", v:`${사업정보.연도}.01 ~ 12월`},
            {label:"사업대상", v:"만 18세 이상 미취업 경기도민"},
            {label:"총 사업량", v:"13개 과정 / 240명"},
            {label:"수료율 목표", v:"90% 이상"},
            {label:"취업률 목표", v:"65% 이상"},
            {label:"만족도 목표", v:"PCSI 90점 이상"},
          ].map(({label,v})=>(
            <div key={label} style={{padding:"12px 14px", background:C.surface2, borderRadius:8, border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10, color:C.muted, marginBottom:4}}>{label}</div>
              <div style={{fontSize:13, fontWeight:700, color:C.text}}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ─── 과정 목록 ──────────────────────────────────────────── */
const CourseList = () => {
  const [sel, setSel] = useState(null);
  const cats = ["전체", ...new Set(COURSES.map(c=>c.category))];
  const [catFilter, setCatFilter] = useState("전체");
  
  const filtered = catFilter==="전체" ? COURSES : COURSES.filter(c=>c.category===catFilter);
  const totalTarget = COURSES.reduce((a,b)=>a+b.target,0);
  
  return (
    <div className="anim">
      <SectionHeader
        title="과정 현황"
        sub={`${사업정보.연도}년 경기북부 직업교육 13개 과정`}
        action={
          <div style={{display:"flex", gap:6, fontSize:12, fontWeight:600, color:C.muted}}>
            전체 {COURSES.length}개 · 목표 {totalTarget}명
          </div>
        }
      />
      
      {/* 분야 필터 */}
      <div style={{display:"flex", gap:8, marginBottom:18, flexWrap:"wrap"}} role="tablist" aria-label="과정 분야 필터">
        {cats.map(cat=>(
          <button 
            key={cat} 
            onClick={()=>setCatFilter(cat)} 
            role="tab"
            aria-selected={catFilter===cat}
            aria-label={`${cat} 과정 보기`}
            style={{
              padding:"6px 14px",
              borderRadius:20,
              border:"none",
              cursor:"pointer",
              fontSize:12,
              fontWeight:600,
              transition:"all 0.15s",
              background: catFilter===cat ? C.primary : "#F1F5F9",
              color: catFilter===cat ? "#fff" : C.muted
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14}}>
        {filtered.map(c=>(
          <Card 
            key={c.id} 
            style={{
              padding:20,
              cursor:"pointer",
              transition:"all 0.2s",
              borderLeft:`4px solid ${c.catColor}`,
              transform: sel===c.id ? "translateY(-2px)" : "none",
              boxShadow: sel===c.id ? `0 6px 20px ${c.catColor}25` : "0 1px 4px rgba(0,0,0,0.06)"
            }} 
            onClick={()=>setSel(sel===c.id ? null : c.id)}
            role="button"
            tabIndex={0}
            aria-label={`${c.name} 과정 상세보기`}
            onKeyDown={(e)=>e.key==='Enter' && setSel(sel===c.id ? null : c.id)}
          >
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10}}>
              <Tag label={c.category} bg={`${c.catColor}12`} color={c.catColor}/>
              <Tag label={c.method||"-"} bg="#F1F5F9" color={C.muted}/>
            </div>
            <div style={{fontSize:14, fontWeight:700, color:C.text, marginBottom:6, lineHeight:1.4}}>
              {c.name}
            </div>
            <div style={{fontSize:11, color:C.muted, marginBottom:12}}>
              {c.code} · {c.period} · {c.hours}시간
            </div>
            <div style={{display:"flex", gap:8}}>
              {[
                {l:"교육", v:c.target},
                {l:"수료목표", v:c.completionGoal},
                {l:"취업목표", v:c.employGoal}
              ].map(({l,v})=>(
                <div 
                  key={l} 
                  style={{
                    flex:1, 
                    textAlign:"center", 
                    padding:"8px 4px", 
                    background:C.surface2, 
                    borderRadius:6, 
                    border:`1px solid ${C.border}`
                  }}
                >
                  <div style={{fontSize:16, fontWeight:800, color:C.text}}>{v}</div>
                  <div style={{fontSize:9, color:C.muted, marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ─── 훈련생 관리 ─────────────────────────────────────────── */
const StudentsView = ({ students, courses }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState(0);
  const [riskOnly, setRiskOnly] = useState(false);
  
  const filtered = useMemo(() => 
    students.filter(s=>{
      const c = courses.find(x=>x.id===s.courseId);
      if(catFilter && s.courseId!==catFilter) return false;
      if(riskOnly && s.attendRate >= 출석률기준.정상) return false;
      if(search && !s.name.includes(search) && !s.phone.includes(search)) return false;
      return true;
    }), 
    [students, catFilter, riskOnly, search]
  );
  
  return (
    <div className="anim">
      <SectionHeader
        title="훈련생 관리"
        sub="등록된 훈련생 현황 및 출석 상태"
        action={
          <button 
            style={{
              display:"flex",
              alignItems:"center",
              gap:6,
              padding:"8px 16px",
              background:C.primary,
              color:"#fff",
              border:"none",
              borderRadius:8,
              cursor:"pointer",
              fontSize:12,
              fontWeight:700
            }}
            aria-label="훈련생 등록"
          >
            <I n="plus" s={13}/> 훈련생 등록
          </button>
        }
      />
      
      {/* 필터 바 */}
      <Card style={{padding:"14px 18px", marginBottom:16, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap"}}>
        <div style={{position:"relative"}}>
          <input 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
            placeholder="이름 · 연락처 검색"
            aria-label="훈련생 검색"
            style={{
              paddingLeft:36,
              paddingRight:12,
              paddingTop:7,
              paddingBottom:7,
              width:180,
              border:`1px solid ${C.border}`,
              borderRadius:8,
              fontSize:12,
              outline:"none",
              background:C.surface2
            }}
          />
          <div style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:C.muted}}>
            <I n="search" s={13}/>
          </div>
        </div>
        
        <select 
          value={catFilter} 
          onChange={e=>setCatFilter(+e.target.value)} 
          aria-label="과정 필터"
          style={{
            padding:"7px 12px",
            border:`1px solid ${C.border}`,
            borderRadius:8,
            fontSize:12,
            outline:"none",
            background:C.surface2,
            color:C.text,
            cursor:"pointer"
          }}
        >
          <option value={0}>전체 과정</option>
          {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        
        <button 
          onClick={()=>setRiskOnly(!riskOnly)} 
          aria-pressed={riskOnly}
          aria-label="위험 훈련생만 보기"
          style={{
            display:"flex",
            alignItems:"center",
            gap:5,
            padding:"7px 14px",
            border:`1px solid ${riskOnly ? C.danger : C.border}`,
            borderRadius:8,
            background: riskOnly ? "#FEF2F2" : C.surface2,
            color: riskOnly ? C.danger : C.muted,
            cursor:"pointer",
            fontSize:12,
            fontWeight:600,
            transition:"all 0.15s"
          }}
        >
          <I n="alert" s={13}/> 위험만 보기
        </button>
        
        <span style={{marginLeft:"auto", fontSize:12, color:C.muted, fontWeight:600}}>
          총 {filtered.length}명
        </span>
      </Card>
      
      <Card style={{overflow:"hidden"}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.surface2, borderBottom:`1px solid ${C.border}`}}>
              {["이름","과정명","출석률","현황","연락처","상태"].map(h=>(
                <th 
                  key={h} 
                  scope="col"
                  style={{
                    padding:"11px 16px",
                    textAlign: h==="이름"||h==="과정명" ? "left" : "center",
                    fontSize:11,
                    color:C.muted,
                    fontWeight:700,
                    letterSpacing:"0.3px"
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i)=>{
              const c = courses.find(x=>x.id===s.courseId);
              const col = statusColor(s.attendRate);
              return (
                <tr 
                  key={s.id} 
                  style={{
                    borderBottom:`1px solid ${C.border}`,
                    background: i%2===0 ? C.surface : C.surface2,
                    transition:"background 0.1s"
                  }}
                >
                  <td style={{padding:"12px 16px", fontSize:13, fontWeight:700, color:C.text}}>
                    <div style={{display:"flex", alignItems:"center", gap:8}}>
                      <div 
                        style={{
                          width:28,
                          height:28,
                          borderRadius:8,
                          flexShrink:0,
                          background:`${col}20`,
                          color:col,
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          fontSize:10,
                          fontWeight:800
                        }}
                        aria-hidden="true"
                      >
                        {s.name[0]}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td style={{padding:"12px 16px", fontSize:11, color:C.muted, maxWidth:200}}>
                    <div style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                      {c?.name}
                    </div>
                    <div style={{color:c?.catColor, fontWeight:600, marginTop:1, fontSize:10}}>
                      {c?.category}
                    </div>
                  </td>
                  <td style={{padding:"12px 16px", textAlign:"center"}}>
                    <div style={{fontSize:15, fontWeight:800, color:col}}>{s.attendRate}%</div>
                    <RateBar rate={s.attendRate} h={4}/>
                  </td>
                  <td style={{padding:"12px 16px", textAlign:"center", fontSize:11, color:C.muted}}>
                    출{s.attend}일 / 결{s.absent}일
                  </td>
                  <td style={{padding:"12px 16px", textAlign:"center", fontSize:11, color:C.muted}}>
                    {s.phone}
                  </td>
                  <td style={{padding:"12px 16px", textAlign:"center"}}>
                    <Tag 
                      label={statusLabel(s.attendRate)}
                      bg={s.attendRate >= 출석률기준.정상 ? "#ECFDF5" : s.attendRate >= 출석률기준.주의 ? "#FFFBEB" : "#FEF2F2"}
                      color={col}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div style={{padding:"48px", textAlign:"center", color:C.muted, fontSize:13}}>
            검색 결과가 없습니다
          </div>
        )}
      </Card>
    </div>
  );
};

/* ─── 출결 관리 ──────────────────────────────────────────── */
const DATES = ["2026-03-02","2026-03-03","2026-03-04","2026-03-05","2026-03-06","2026-03-09","2026-03-10","2026-03-11","2026-03-12","2026-03-13"];
const ATT = { O:"출석", L:"지각", A:"결석", E:"외출" };
const ATT_COLOR = { O:C.primary, L:C.warning, A:C.danger, E:"#7C3AED" };
const ATT_BG    = { O:"#ECFDF5", L:"#FFFBEB", A:"#FEF2F2", E:"#F5F3FF" };

const makeInitAtt = () => {
  const r = {};
  DATES.forEach(d => {
    r[d]={};
    STUDENTS.filter(s=>s.courseId===4).forEach(s=>{
      const v=Math.random(); 
      r[d][s.id]=v>0.88?"A":v>0.8?"L":"O";
    });
  });
  return r;
};

const AttendanceView = ({ students, courses }) => {
  const [course, setCourse] = useState(courses[3]||courses[0]);
  const [att, setAtt] = useState(() => makeInitAtt()); // 수정: 함수로 감싸기
  const [date, setDate] = useState(DATES[DATES.length-1]);
  
  const list = students.filter(s=>s.courseId===course.id);
  const toggle = (sid, v) => setAtt(p=>({...p, [date]:{...p[date], [sid]:v}}));
  
  const dayAgg = d => {
    const vals = Object.values(att[d]||{});
    return { 
      O:vals.filter(v=>v==="O").length, 
      L:vals.filter(v=>v==="L").length, 
      A:vals.filter(v=>v==="A").length 
    };
  };
  
  return (
    <div className="anim">
      <SectionHeader
        title="출결 관리"
        sub={`일별 50% 미만 수강 시 결석 처리 (${사업정보.연도} 개정)`}
      />
      
      {/* 출결 기준 안내 */}
      <div style={{
        background:"#FFFBEB",
        border:"1px solid #FDE68A",
        borderRadius:10,
        padding:"12px 16px",
        marginBottom:18,
        display:"flex",
        gap:10,
        alignItems:"flex-start",
        fontSize:12,
        color:"#92400E"
      }} role="alert">
        <I n="info" s={14}/>
        <span>
          <b>{사업정보.연도} 개정 출결 기준:</b> 1일 훈련시간의 50% 미만 수강 시 무조건 결석 (지각환산 폐지) · 총 교육시간 <b>{출석률기준.수료기준}% 이상 출석 시 수료</b>
        </span>
      </div>
      
      {/* 과정 탭 */}
      <div style={{display:"flex", gap:8, marginBottom:18, flexWrap:"wrap"}} role="tablist" aria-label="과정 선택">
        {courses.slice(0,6).map(c=>(
          <button 
            key={c.id} 
            onClick={()=>setCourse(c)} 
            role="tab"
            aria-selected={course.id===c.id}
            aria-label={`${c.name} 과정`}
            style={{
              padding:"7px 14px",
              borderRadius:20,
              border:"none",
              cursor:"pointer",
              fontSize:11,
              fontWeight:600,
              transition:"all 0.15s",
              whiteSpace:"nowrap",
              background: course.id===c.id ? c.catColor : "#F1F5F9",
              color: course.id===c.id ? "#fff" : C.muted
            }}
          >
            {c.name.length>16 ? c.name.slice(0,16)+"…" : c.name}
          </button>
        ))}
      </div>
      
      <div style={{display:"flex", gap:16}}>
        {/* 날짜 패널 */}
        <Card style={{width:160, flexShrink:0, padding:14}}>
          <div style={{fontSize:11, fontWeight:700, color:C.muted, marginBottom:10, letterSpacing:"0.5px"}}>
            수업일
          </div>
          {DATES.map(d=>{
            const agg = dayAgg(d);
            const active = date===d;
            return (
              <div 
                key={d} 
                onClick={()=>setDate(d)} 
                role="button"
                tabIndex={0}
                aria-label={`${d} 출결 입력, 출석 ${agg.O}명, 지각 ${agg.L}명, 결석 ${agg.A}명`}
                aria-pressed={active}
                onKeyDown={(e)=>e.key==='Enter' && setDate(d)}
                style={{
                  padding:"8px 10px",
                  borderRadius:8,
                  marginBottom:4,
                  cursor:"pointer",
                  background: active ? C.primary : "transparent",
                  color: active ? "#fff" : C.text,
                  transition:"all 0.15s"
                }}
              >
                <div style={{fontSize:12, fontWeight:700}}>{d.slice(5)}</div>
                <div style={{fontSize:9, opacity:0.75, marginTop:1}}>
                  출{agg.O} 지{agg.L} 결{agg.A}
                </div>
              </div>
            );
          })}
        </Card>
        
        {/* 출결 테이블 */}
        <Card style={{flex:1, overflow:"hidden"}}>
          <div style={{
            padding:"14px 18px",
            borderBottom:`1px solid ${C.border}`,
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center"
          }}>
            <div style={{fontSize:13, fontWeight:700, color:C.text}}>
              📅 {date} 출결 입력
            </div>
            <div style={{display:"flex", gap:6}}>
              {Object.entries(ATT).map(([k,v])=>(
                <Tag key={k} label={v} bg={ATT_BG[k]} color={ATT_COLOR[k]}/>
              ))}
            </div>
          </div>
          <table style={{width:"100%", borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:C.surface2}}>
                {["이름","누적출석률","당일 출결 입력"].map(h=>(
                  <th 
                    key={h} 
                    scope="col"
                    style={{
                      padding:"10px 16px",
                      textAlign: h==="이름" ? "left" : "center",
                      fontSize:11,
                      color:C.muted,
                      fontWeight:700,
                      borderBottom:`1px solid ${C.border}`
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(s=>{
                const cur = (att[date]||{})[s.id]||"O";
                return (
                  <tr key={s.id} style={{borderBottom:`1px solid #F1F5F9`}}>
                    <td style={{padding:"12px 16px", fontSize:13, fontWeight:700, color:C.text}}>
                      {s.name}
                      {s.attendRate < 출석률기준.정상 && (
                        <span style={{marginLeft:6, fontSize:10, color:C.danger}} aria-label="출석률 주의">⚠</span>
                      )}
                    </td>
                    <td style={{padding:"12px 16px", textAlign:"center"}}>
                      <div style={{fontSize:14, fontWeight:800, color:statusColor(s.attendRate)}}>
                        {s.attendRate}%
                      </div>
                      <RateBar rate={s.attendRate} h={3}/>
                    </td>
                    <td style={{padding:"12px 16px", textAlign:"center"}}>
                      <div 
                        style={{display:"flex", gap:5, justifyContent:"center"}} 
                        role="radiogroup" 
                        aria-label={`${s.name} 출결 상태`}
                      >
                        {Object.entries(ATT).map(([k,v])=>(
                          <button 
                            key={k} 
                            onClick={()=>toggle(s.id,k)} 
                            role="radio"
                            aria-checked={cur===k}
                            aria-label={v}
                            style={{
                              width:44,
                              height:30,
                              border:"none",
                              borderRadius:6,
                              cursor:"pointer",
                              fontSize:11,
                              fontWeight:700,
                              transition:"all 0.15s",
                              background: cur===k ? ATT_COLOR[k] : C.surface2,
                              color: cur===k ? "#fff" : C.muted
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

/* ─── 수료 관리 ──────────────────────────────────────────── */
const CompletionView = ({ students, courses }) => {
  const [course, setCourse] = useState(courses[3]||courses[0]);
  const [threshold, setThreshold] = useState(출석률기준.수료기준);
  const [overrides, setOverrides] = useState({});
  
  const list = students.filter(s=>s.courseId===course.id);
  const getResult = s => {
    if (overrides[s.id] !== undefined && overrides[s.id] !== "") {
      return overrides[s.id];
    }
    return s.attendRate >= threshold ? "수료" : "미수료";
  };
  
  const autoJudge = () => {
    const j = {};
    list.forEach(s=>{ 
      j[s.id] = s.attendRate >= threshold ? "수료" : "미수료"; 
    });
    setOverrides(j);
  };
  
  const completed = list.filter(s=>getResult(s)==="수료").length;
  const rate = list.length ? Math.round(completed/list.length*100) : 0;
  
  return (
    <div className="anim">
      <SectionHeader
        title="수료 관리"
        sub="출석률 기준 자동 판정 · 수동 조정 가능"
      />
      
      <div style={{display:"flex", gap:8, marginBottom:18, flexWrap:"wrap"}} role="tablist" aria-label="과정 선택">
        {courses.slice(0,6).map(c=>(
          <button 
            key={c.id} 
            onClick={()=>setCourse(c)} 
            role="tab"
            aria-selected={course.id===c.id}
            style={{
              padding:"7px 14px",
              borderRadius:20,
              border:"none",
              cursor:"pointer",
              fontSize:11,
              fontWeight:600,
              background: course.id===c.id ? c.catColor : "#F1F5F9",
              color: course.id===c.id ? "#fff" : C.muted,
              whiteSpace:"nowrap"
            }}
          >
            {c.name.length>14 ? c.name.slice(0,14)+"…" : c.name}
          </button>
        ))}
      </div>
      
      {/* 판정 컨트롤 */}
      <div style={{display:"flex", gap:14, marginBottom:20, flexWrap:"wrap"}}>
        <Card style={{flex:1, minWidth:260, padding:"18px 22px", display:"flex", gap:20, alignItems:"center"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12, color:C.muted, marginBottom:8, fontWeight:600}}>
              수료 기준 출석률
            </div>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              <input 
                type="range" 
                min={60} 
                max={95} 
                step={5} 
                value={threshold}
                onChange={e=>setThreshold(+e.target.value)}
                aria-label="수료 기준 출석률"
                aria-valuemin={60}
                aria-valuemax={95}
                aria-valuenow={threshold}
                style={{flex:1, accentColor:C.primary}}
              />
              <span style={{fontSize:24, fontWeight:900, color:C.primary, minWidth:52}}>
                {threshold}%
              </span>
            </div>
            <div style={{fontSize:11, color:C.muted, marginTop:4}}>
              ※ 매뉴얼 기준: 총 교육시간의 {출석률기준.수료기준}% 이상
            </div>
          </div>
          <button 
            onClick={autoJudge} 
            aria-label="자동 판정 실행"
            style={{
              padding:"10px 20px",
              background:C.primary,
              color:"#fff",
              border:"none",
              borderRadius:8,
              cursor:"pointer",
              fontWeight:700,
              fontSize:12,
              whiteSpace:"nowrap",
              flexShrink:0
            }}
          >
            자동 판정
          </button>
        </Card>
        
        <Card style={{
          padding:"18px 22px",
          minWidth:160,
          display:"flex",
          flexDirection:"column",
          justifyContent:"center",
          alignItems:"center"
        }}>
          <div style={{fontSize:11, color:C.muted, marginBottom:4}}>수료율</div>
          <div style={{
            fontSize:36,
            fontWeight:900,
            color: rate>=90 ? C.primary : rate>=80 ? "#059669" : C.danger,
            lineHeight:1
          }}>
            {rate}%
          </div>
          <div style={{fontSize:12, color:C.muted, marginTop:4}}>
            {completed}/{list.length}명 수료
          </div>
          <Tag 
            label={rate>=90 ? "목표달성" : "목표미달"} 
            bg={rate>=90 ? "#ECFDF5" : "#FEF2F2"} 
            color={rate>=90 ? C.primary : C.danger} 
            size={10}
          />
        </Card>
        
        <Card style={{padding:"18px 22px", minWidth:160, display:"flex", flexDirection:"column", justifyContent:"center"}}>
          <div style={{fontSize:11, color:C.muted, marginBottom:4}}>과정 목표</div>
          <div style={{fontSize:18, fontWeight:800, color:C.text}}>
            {course.completionGoal}명 수료
          </div>
          <div style={{fontSize:11, color:C.muted, marginTop:2}}>
            {course.employGoal}명 취업 목표
          </div>
        </Card>
      </div>
      
      {/* 판정 테이블 */}
      <Card style={{overflow:"hidden"}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.surface2}}>
              {["이름","출석률","자동판정","최종결과","비고"].map(h=>(
                <th 
                  key={h} 
                  scope="col"
                  style={{
                    padding:"11px 16px",
                    textAlign: h==="이름" ? "left" : "center",
                    fontSize:11,
                    color:C.muted,
                    fontWeight:700,
                    borderBottom:`1px solid ${C.border}`
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(s=>{
              const auto = s.attendRate >= threshold ? "수료" : "미수료";
              const final = getResult(s);
              const isOverridden = overrides[s.id] !== undefined && overrides[s.id] !== "" && overrides[s.id] !== auto;
              
              return (
                <tr key={s.id} style={{borderBottom:`1px solid #F1F5F9`}}>
                  <td style={{padding:"13px 16px", fontSize:13, fontWeight:700, color:C.text}}>
                    {s.name}
                  </td>
                  <td style={{padding:"13px 16px", textAlign:"center"}}>
                    <div style={{fontSize:15, fontWeight:800, color:statusColor(s.attendRate)}}>
                      {s.attendRate}%
                    </div>
                    <RateBar rate={s.attendRate} h={3}/>
                  </td>
                  <td style={{padding:"13px 16px", textAlign:"center"}}>
                    <Tag 
                      label={auto}
                      bg={auto==="수료" ? "#ECFDF5" : "#FEF2F2"}
                      color={auto==="수료" ? C.primary : C.danger}
                    />
                  </td>
                  <td style={{padding:"13px 16px", textAlign:"center"}}>
                    <div 
                      style={{display:"flex", gap:6, justifyContent:"center"}} 
                      role="radiogroup" 
                      aria-label={`${s.name} 수료 판정`}
                    >
                      {["수료","미수료"].map(v=>(
                        <button 
                          key={v} 
                          onClick={()=>setOverrides(p=>({...p, [s.id]:v}))} 
                          role="radio"
                          aria-checked={final===v}
                          style={{
                            padding:"5px 14px",
                            border:"none",
                            borderRadius:6,
                            cursor:"pointer",
                            fontWeight:700,
                            fontSize:12,
                            transition:"all 0.15s",
                            background: final===v ? (v==="수료" ? C.primary : C.danger) : "#F1F5F9",
                            color: final===v ? "#fff" : C.muted
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td style={{padding:"13px 16px", textAlign:"center", fontSize:11}}>
                    {isOverridden && <Tag label="수동조정" bg="#FFFBEB" color={C.warning}/>}
                    {s.attendRate < 60 && !isOverridden && (
                      <Tag label="재참여 1년 제한 검토" bg="#FEF2F2" color={C.danger} size={10}/>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ─── 수료증 발급 ─────────────────────────────────────────── */
const CertificateView = ({ students, courses }) => {
  const [course, setCourse] = useState(courses[3]||courses[0]);
  const [issued, setIssued] = useState({});
  const [preview, setPreview] = useState(null);
  
  const eligible = students.filter(s=>s.courseId===course.id && s.attendRate >= 출석률기준.수료기준);
  
  const issue = s => {
    const no = `GGJF-${course.code}-${String(s.id).padStart(4,"0")}`;
    const cert = { 
      no, 
      date:`${사업정보.연도}-09-01`, 
      issuedAt: new Date().toLocaleDateString("ko-KR") 
    };
    setIssued(p=>({...p, [s.id]:cert}));
    setPreview({ s, cert, course });
  };
  
  const today = new Date().toLocaleDateString("ko-KR");
  
  return (
    <div className="anim">
      <SectionHeader
        title="수료증 발급"
        sub="수료 판정 완료 훈련생 대상 수료증 발급 및 출력"
      />
      
      <div style={{display:"flex", gap:8, marginBottom:18, flexWrap:"wrap"}} role="tablist" aria-label="과정 선택">
        {courses.slice(0,6).map(c=>(
          <button 
            key={c.id} 
            onClick={()=>setCourse(c)} 
            role="tab"
            aria-selected={course.id===c.id}
            style={{
              padding:"7px 14px",
              borderRadius:20,
              border:"none",
              cursor:"pointer",
              fontSize:11,
              fontWeight:600,
              background: course.id===c.id ? c.catColor : "#F1F5F9",
              color: course.id===c.id ? "#fff" : C.muted,
              whiteSpace:"nowrap"
            }}
          >
            {c.name.length>14 ? c.name.slice(0,14)+"…" : c.name}
          </button>
        ))}
      </div>
      
      <div style={{display:"flex", gap:16}}>
        <div style={{flex:1}}>
          <Card style={{overflow:"hidden"}}>
            <div style={{
              padding:"14px 18px",
              borderBottom:`1px solid ${C.border}`,
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center"
            }}>
              <span style={{fontSize:13, fontWeight:700, color:C.text}}>
                수료 대상자 ({eligible.length}명)
              </span>
              <button 
                onClick={()=>eligible.forEach(s=>issue(s))} 
                aria-label="전체 수료증 발급"
                style={{
                  padding:"6px 16px",
                  background:C.primary,
                  color:"#fff",
                  border:"none",
                  borderRadius:6,
                  cursor:"pointer",
                  fontWeight:700,
                  fontSize:12
                }}
              >
                전체 발급
              </button>
            </div>
            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:C.surface2}}>
                  {["이름","출석률","수료증 번호","발급일","발급"].map(h=>(
                    <th 
                      key={h} 
                      scope="col"
                      style={{
                        padding:"10px 16px",
                        textAlign: h==="이름" ? "left" : "center",
                        fontSize:11,
                        color:C.muted,
                        fontWeight:700,
                        borderBottom:`1px solid ${C.border}`
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eligible.map(s=>{
                  const cert = issued[s.id];
                  return (
                    <tr key={s.id} style={{borderBottom:`1px solid #F1F5F9`}}>
                      <td style={{padding:"12px 16px", fontSize:13, fontWeight:700, color:C.text}}>
                        <div style={{display:"flex", alignItems:"center", gap:8}}>
                          <div 
                            style={{
                              width:28,
                              height:28,
                              borderRadius:"50%",
                              flexShrink:0,
                              background:`${C.primary}15`,
                              color:C.primary,
                              display:"flex",
                              alignItems:"center",
                              justifyContent:"center",
                              fontSize:10,
                              fontWeight:800
                            }}
                            aria-hidden="true"
                          >
                            {s.name[0]}
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td style={{padding:"12px 16px", textAlign:"center", fontSize:14, fontWeight:800, color:C.primary}}>
                        {s.attendRate}%
                      </td>
                      <td style={{padding:"12px 16px", textAlign:"center", fontSize:11, color:C.muted, fontFamily:"monospace"}}>
                        {cert?.no||"—"}
                      </td>
                      <td style={{padding:"12px 16px", textAlign:"center", fontSize:11, color:C.muted}}>
                        {cert?.date||"—"}
                      </td>
                      <td style={{padding:"12px 16px", textAlign:"center"}}>
                        {cert ? (
                          <button 
                            onClick={()=>setPreview({s, cert, course})} 
                            aria-label={`${s.name} 수료증 미리보기`}
                            style={{
                              padding:"4px 12px",
                              background:C.primaryBg,
                              color:C.primary,
                              border:`1px solid ${C.primaryMid}40`,
                              borderRadius:6,
                              cursor:"pointer",
                              fontWeight:700,
                              fontSize:11
                            }}
                          >
                            미리보기
                          </button>
                        ) : (
                          <button 
                            onClick={()=>issue(s)} 
                            aria-label={`${s.name} 수료증 발급`}
                            style={{
                              padding:"4px 12px",
                              background:C.primary,
                              color:"#fff",
                              border:"none",
                              borderRadius:6,
                              cursor:"pointer",
                              fontWeight:700,
                              fontSize:11
                            }}
                          >
                            발급
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
        
        {/* 수료증 미리보기 */}
        {preview && (
          <div style={{width:300, flexShrink:0}}>
            <Card style={{padding:0, overflow:"hidden", border:`1px solid ${C.primaryMid}60`}}>
              {/* 헤더 */}
              <div style={{
                background:`linear-gradient(135deg, #134E4A 0%, ${C.primary} 40%, ${C.primaryLight} 100%)`,
                padding:"24px 22px 20px",
                textAlign:"center",
                color:"#fff",
                position:"relative"
              }}>
                <button 
                  onClick={()=>setPreview(null)} 
                  aria-label="미리보기 닫기"
                  style={{
                    position:"absolute",
                    top:10,
                    right:12,
                    background:"rgba(255,255,255,0.2)",
                    border:"none",
                    borderRadius:6,
                    width:26,
                    height:26,
                    cursor:"pointer",
                    color:"#fff",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center"
                  }}
                >
                  <I n="x" s={13}/>
                </button>
                <div style={{
                  width:52,
                  height:52,
                  borderRadius:16,
                  margin:"0 auto 12px",
                  background:"rgba(255,255,255,0.2)",
                  backdropFilter:"blur(8px)",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize:24
                }} aria-hidden="true">
                  🎓
                </div>
                <div style={{fontSize:20, fontWeight:900, letterSpacing:"4px"}}>수 료 증</div>
                <div style={{fontSize:10, opacity:0.7, marginTop:4, letterSpacing:"1px"}}>
                  CERTIFICATE OF COMPLETION
                </div>
              </div>
              
              {/* 본문 */}
              <div style={{padding:20}}>
                <div style={{
                  textAlign:"center",
                  padding:"16px",
                  background:`linear-gradient(135deg, ${C.primaryBg}, #FFEDD5)`,
                  borderRadius:10,
                  marginBottom:16,
                  border:`1px solid ${C.primaryLight}40`
                }}>
                  <div style={{fontSize:11, color:C.muted, marginBottom:4}}>
                    위 사람은 아래 교육과정을 성실히 수료하였기에
                  </div>
                  <div style={{fontSize:22, fontWeight:900, color:C.text, letterSpacing:"-0.5px"}}>
                    {preview.s.name}
                  </div>
                  <div style={{fontSize:11, color:C.muted, marginTop:2}}>
                    이 수료증을 드립니다.
                  </div>
                </div>
                
                <div style={{fontSize:12, lineHeight:2.2, color:C.text}}>
                  {[
                    ["과정명", preview.course.name],
                    ["과정코드", preview.course.code],
                    ["교육기간", `${preview.course.period} (${preview.course.hours}시간)`],
                    ["수료번호", preview.cert.no],
                    ["발급일자", preview.cert.date],
                    ["출석률", `${preview.s.attendRate}%`],
                  ].map(([k,v])=>(
                    <div 
                      key={k} 
                      style={{
                        display:"flex",
                        gap:8,
                        borderBottom:`1px dashed ${C.border}`,
                        paddingBottom:2
                      }}
                    >
                      <span style={{color:C.muted, minWidth:56, fontSize:11}}>{k}</span>
                      <span style={{
                        fontWeight:700,
                        fontSize:11,
                        color: k==="출석률" ? C.primary : C.text
                      }}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div style={{textAlign:"center", marginTop:16, paddingTop:14, borderTop:`1px solid ${C.border}`}}>
                  <div style={{
                    display:"inline-flex",
                    alignItems:"center",
                    gap:6,
                    padding:"6px 14px",
                    background:C.primaryBg,
                    borderRadius:20,
                    border:`1px solid ${C.primaryLight}50`
                  }}>
                    <div style={{
                      width:20,
                      height:20,
                      borderRadius:4,
                      background:C.primary,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }} aria-hidden="true">
                      <I n="award" s={11}/>
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:11, fontWeight:800, color:C.primary}}>
                        경기도일자리재단
                      </div>
                      <div style={{fontSize:9, color:C.muted}}>
                        북부사업본부 북부교육팀
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── 레이아웃 ───────────────────────────────────────────── */
const NAV = [
  { id:"dash",       label:"대시보드",   icon:"dash"   },
  { id:"courses",    label:"과정 현황",  icon:"course" },
  { id:"students",   label:"훈련생 관리", icon:"people" },
  { id:"attendance", label:"출결 관리",  icon:"cal"    },
  { id:"completion", label:"수료 관리",  icon:"check2" },
  { id:"certificate",label:"수료증 발급",icon:"award"  },
];

export default function App() {
  const [page, setPage] = useState("dash");
  const [collapsed, setCollapsed] = useState(false);
  
  const renderPage = () => {
    if(page==="dash")        return <Dashboard courses={COURSES} students={STUDENTS}/>;
    if(page==="courses")     return <CourseList/>;
    if(page==="students")    return <StudentsView students={STUDENTS} courses={COURSES}/>;
    if(page==="attendance")  return <AttendanceView students={STUDENTS} courses={COURSES}/>;
    if(page==="completion")  return <CompletionView students={STUDENTS} courses={COURSES}/>;
    if(page==="certificate") return <CertificateView students={STUDENTS} courses={COURSES}/>;
  };
  
  return (
    <>
      <FontLoader/>
      <div style={{
        display:"flex", 
        height:"100vh",
        background:"linear-gradient(160deg,#FFEDD5 0%,#FED7AA 15%,#FFF7ED 45%,#F1F5F9 75%,#FFEDD5 100%)",
        fontFamily:"'Pretendard',-apple-system,sans-serif",
        overflow:"hidden"
      }}>
        {/* ── 사이드바 ───────────────────────────────── */}
        <nav 
          style={{
            width: collapsed ? 64 : 240, 
            flexShrink:0,
            background:`linear-gradient(180deg, #9A3412 0%, ${C.primary} 55%, #F97316 100%)`,
            display:"flex", 
            flexDirection:"column",
            transition:"width 0.25s ease",
            overflow:"hidden",
            boxShadow:"4px 0 24px rgba(234,88,12,0.25)"
          }}
          aria-label="주 메뉴"
        >
          {/* 로고 */}
          <div style={{
            padding: collapsed ? "16px 0" : "16px 18px",
            borderBottom:"1px solid rgba(255,255,255,0.1)",
            display:"flex", 
            alignItems:"center",
            justifyContent: collapsed ? "center" : "space-between"
          }}>
            {!collapsed && (
              <div>
                <div style={{
                  fontSize:13, 
                  fontWeight:900, 
                  color:"#fff",
                  letterSpacing:"-0.3px", 
                  lineHeight:1.2
                }}>
                  경기북부 직업교육
                </div>
                <div style={{
                  fontSize:10, 
                  color:"rgba(255,255,255,0.5)",
                  marginTop:2, 
                  display:"flex",
                  alignItems:"center",
                  gap:4
                }}>
                  <span style={{
                    background:"rgba(251,146,60,0.3)", 
                    color:"#FDBA74",
                    padding:"1px 5px", 
                    borderRadius:4, 
                    fontSize:9, 
                    fontWeight:700
                  }}>
                    {사업정보.연도}
                  </span>
                  학사관리시스템
                </div>
              </div>
            )}
            <button 
              onClick={()=>setCollapsed(!collapsed)} 
              aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              aria-expanded={!collapsed}
              style={{
                width:28,
                height:28,
                borderRadius:6,
                background:"rgba(255,255,255,0.1)",
                border:"none",
                color:"rgba(255,255,255,0.6)",
                cursor:"pointer",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                flexShrink:0
              }}
            >
              <I n="bars" s={14}/>
            </button>
          </div>
          
          {/* 네비 */}
          <div style={{flex:1, padding:"10px 0", overflowY:"auto"}}>
            {NAV.map(item=>{
              const active = page===item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={()=>setPage(item.id)} 
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  style={{
                    width:"100%", 
                    display:"flex", 
                    alignItems:"center",
                    gap:10, 
                    padding: collapsed ? "13px 0" : "11px 18px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    border:"none", 
                    cursor:"pointer",
                    borderLeft: active ? "3px solid #FDBA74" : "3px solid transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.45)",
                    transition:"all 0.15s",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <I n={item.icon} s={16}/>
                  {!collapsed && <span style={{fontSize:13, whiteSpace:"nowrap"}}>{item.label}</span>}
                  {active && !collapsed && (
                    <div style={{
                      marginLeft:"auto",
                      width:5,
                      height:5,
                      borderRadius:"50%",
                      background:"#FDBA74"
                    }} aria-hidden="true"/>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* 하단 유저 */}
          {!collapsed && (
            <div style={{
              padding:"14px 18px",
              borderTop:"1px solid rgba(255,255,255,0.1)",
              display:"flex",
              alignItems:"center",
              gap:10
            }}>
              <div style={{
                width:32,
                height:32,
                borderRadius:10,
                flexShrink:0,
                background:"rgba(255,255,255,0.15)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                color:"rgba(255,255,255,0.9)"
              }} aria-hidden="true">
                <I n="user" s={15}/>
              </div>
              <div>
                <div style={{fontSize:12, fontWeight:700, color:"#fff"}}>북부교육팀</div>
                <div style={{fontSize:9, color:"rgba(255,255,255,0.4)"}}>경기도일자리재단</div>
              </div>
            </div>
          )}
        </nav>
        
        {/* ── 메인 ───────────────────────────────────── */}
        <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden"}}>
          {/* 상단 헤더 */}
          <header style={{
            height:52, 
            background:"rgba(255,255,255,0.9)",
            backdropFilter:"blur(12px)",
            borderBottom:`1px solid ${C.border}`,
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            padding:"0 22px", 
            flexShrink:0
          }}>
            <div style={{fontSize:12, color:C.muted}}>
              <span style={{color:C.primary, fontWeight:700}}>경기도일자리재단 북부사업본부</span>
              <span style={{margin:"0 6px", color:C.border}}>·</span>
              <span style={{fontWeight:500}}>직업교육 학사관리시스템 v{사업정보.연도}</span>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:14}}>
              <button 
                style={{position:"relative", color:C.muted, cursor:"pointer", background:"none", border:"none"}}
                aria-label="알림"
              >
                <I n="bell" s={17}/>
              </button>
              <div style={{
                display:"flex",
                alignItems:"center",
                gap:8,
                padding:"5px 10px",
                background:C.primaryBg,
                borderRadius:8
              }}>
                <div style={{
                  width:24,
                  height:24,
                  borderRadius:6,
                  background:C.primary,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center"
                }} aria-hidden="true">
                  <I n="user" s={12}/>
                </div>
                <span style={{fontSize:11, fontWeight:700, color:C.primary}}>담당자</span>
              </div>
            </div>
          </header>
          
          {/* 페이지 */}
          <main 
            style={{flex:1, overflowY:"auto", padding:22}}
            role="main"
            aria-label="메인 콘텐츠"
          >
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}
