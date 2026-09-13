import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────────────────
// STEP: Replace these two values with your own from Supabase dashboard
const SUPABASE_URL = "https://iuyulottqtbcysrvakdr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eXVsb3R0cXRiY3lzcnZha2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDA5ODMsImV4cCI6MjEwNDU3Njk4M30.N4usQOn90-QtEpSWULPZ-kXt6204xmajf1HQ7Of55bQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Constants ─────────────────────────────────────────────────────────────────
const PRESIDENT_PASSWORD = "ocbusinesstimeline";
const ROLES = { PRESIDENT: "President/VP", CABINET: "Cabinet" };

const WEEKS = [
  { label: "Aug 25", date: "Aug 25" },
  { label: "Sep 1",  date: "Sep 1"  },
  { label: "Sep 8",  date: "Sep 8"  },
  { label: "Sep 15", date: "Sep 15" },
  { label: "Sep 22", date: "Sep 22" },
  { label: "Sep 29", date: "Sep 29" },
  { label: "Oct 6",  date: "Oct 6"  },
  { label: "Oct 13", date: "Oct 13" },
  { label: "Oct 20", date: "Oct 20" },
  { label: "Oct 27", date: "Oct 27" },
  { label: "Nov 3",  date: "Nov 3"  },
  { label: "Nov 10", date: "Nov 10" },
  { label: "Nov 17", date: "Nov 17" },
  { label: "Nov 24", date: "Nov 24 (Thanksgiving)" },
  { label: "Dec 1",  date: "Dec 1"  },
  { label: "Dec 8",  date: "Dec 8"  },
];

const TYPE_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  event:    { label: "Event",       color: "#6C63FF", bg: "#EEF0FF", dot: "#6C63FF" },
  workshop: { label: "Workshop",    color: "#0EA5E9", bg: "#E0F4FF", dot: "#0EA5E9" },
  fieldtrip:{ label: "Field Trip",  color: "#10B981", bg: "#E0FFF5", dot: "#10B981" },
  cabinet:  { label: "Cabinet Mtg", color: "#F59E0B", bg: "#FFF8E6", dot: "#F59E0B" },
  deadline: { label: "Deadline",    color: "#EF4444", bg: "#FFF0F0", dot: "#EF4444" },
};

const INITIAL_ITEMS = [
  { id: 1,  week: "Sep 8",  type: "cabinet",   title: "Fall Kickoff Cabinet Meeting",    load: 1 },
  { id: 2,  week: "Sep 15", type: "event",      title: "Fall Welcome / Recruitment Event",load: 3 },
  { id: 3,  week: "Sep 29", type: "workshop",   title: "Workshop TBD",                   load: 2 },
  { id: 4,  week: "Oct 6",  type: "cabinet",    title: "Cabinet Check-In #1",             load: 1 },
  { id: 5,  week: "Oct 13", type: "event",      title: "Networking Night",                load: 3 },
  { id: 6,  week: "Oct 20", type: "fieldtrip",  title: "Business Site Visit TBD",         load: 2 },
  { id: 7,  week: "Nov 3",  type: "cabinet",    title: "Cabinet Check-In #2",             load: 1 },
  { id: 8,  week: "Nov 10", type: "event",      title: "Fall Main Event / Panel",         load: 3 },
  { id: 9,  week: "Nov 17", type: "deadline",   title: "ASG Funding Deadline",            load: 1 },
  { id: 10, week: "Dec 1",  type: "cabinet",    title: "End-of-Semester Debrief",         load: 2 },
  { id: 11, week: "Dec 8",  type: "event",      title: "End-of-Semester Mixer",           load: 2 },
];

const LOAD_LABELS: Record<number, string> = { 1: "Low", 2: "Medium", 3: "High" };
const LOAD_COLORS: Record<number, string> = { 1: "#10B981", 2: "#F59E0B", 3: "#EF4444" };

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 8,
  padding: "8px 10px", fontSize: 13, boxSizing: "border-box",
  outline: "none", background: "#FAFAFA",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Note  { id: number; item_id: number; author: string; text: string; created_at: string }
interface Item  { id: number; week: string; type: string; title: string; load: number }

// ── Sub-components ────────────────────────────────────────────────────────────
function LoadBar({ items }: { items: Item[] }) {
  const total = items.reduce((s, i) => s + i.load, 0);
  const pct   = Math.min((total / 6) * 100, 100);
  const color = total <= 2 ? "#10B981" : total <= 4 ? "#F59E0B" : "#EF4444";
  const label = total === 0 ? "Clear" : total <= 2 ? "Manageable" : total <= 4 ? "Busy" : "Heavy";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 4, background: "#E5E7EB", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 10, color, fontWeight: 700, minWidth: 60 }}>{label}</span>
    </div>
  );
}

function NoteModal({ item, notes, onClose, onAddNote, loadingNotes }: {
  item: Item; notes: Note[]; onClose: () => void;
  onAddNote: (author: string, text: string) => Promise<void>;
  loadingNotes: boolean;
}) {
  const [text, setText]     = useState("");
  const [author, setAuthor] = useState("");
  const [posting, setPosting] = useState(false);
  const meta = TYPE_META[item.type];

  const handlePost = async () => {
    if (!text.trim() || !author.trim()) return;
    setPosting(true);
    await onAddNote(author.trim(), text.trim());
    setText(""); setAuthor(""); setPosting(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,12,30,0.55)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:420, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:meta.color, textTransform:"uppercase", marginBottom:4 }}>
              {meta.label} · {item.week}
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:"#0D1136" }}>{item.title}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, color:"#9CA3AF", cursor:"pointer" }}>×</button>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:8, textTransform:"uppercase" }}>Cabinet Notes</div>
          {loadingNotes ? (
            <div style={{ fontSize:13, color:"#9CA3AF" }}>Loading notes...</div>
          ) : notes.length === 0 ? (
            <div style={{ fontSize:13, color:"#9CA3AF", fontStyle:"italic" }}>No notes yet — be the first to add one.</div>
          ) : (
            notes.map(n => (
              <div key={n.id} style={{ background:"#F9FAFB", borderRadius:8, padding:"8px 12px", marginBottom:6, fontSize:13 }}>
                <span style={{ fontWeight:700, color:"#374151" }}>{n.author}: </span>
                <span style={{ color:"#4B5563" }}>{n.text}</span>
                <div style={{ fontSize:10, color:"#9CA3AF", marginTop:2 }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:8, textTransform:"uppercase" }}>Add a Note</div>
          <input placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} style={{ ...inputStyle, marginBottom:8 }} />
          <textarea placeholder="Leave a thought, question, or heads-up..." value={text} onChange={e => setText(e.target.value)}
            rows={3} style={{ ...inputStyle, resize:"none" }} />
          <button onClick={handlePost} disabled={posting}
            style={{ marginTop:8, background: posting ? "#9CA3AF" : "#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontWeight:700, fontSize:13, cursor: posting ? "not-allowed" : "pointer", float:"right" }}>
            {posting ? "Posting..." : "Post Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ onClose, onAdd }: { onClose: () => void; onAdd: (form: Omit<Item,"id">) => void }) {
  const [form, setForm] = useState({ week: WEEKS[0].date, type: "event", title: "", load: 2 });
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,12,30,0.55)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:400, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:17, fontWeight:800, color:"#0D1136", marginBottom:18 }}>Add to Timeline</div>
        {([
          { label:"Week",   el: <select value={form.week} onChange={e=>setForm({...form,week:e.target.value})} style={inputStyle}>{WEEKS.map(w=><option key={w.date} value={w.date}>{w.date}</option>)}</select> },
          { label:"Type",   el: <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={inputStyle}>{Object.entries(TYPE_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select> },
          { label:"Title",  el: <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Event name..." style={inputStyle} /> },
          { label:"Effort", el: <select value={form.load} onChange={e=>setForm({...form,load:Number(e.target.value)})} style={inputStyle}><option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option></select> },
        ] as {label:string;el:React.ReactNode}[]).map(({label,el})=>(
          <div key={label} style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:5, textTransform:"uppercase" }}>{label}</div>
            {el}
          </div>
        ))}
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, background:"#F3F4F6", color:"#374151", border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{ if(form.title.trim()){ onAdd(form as Omit<Item,"id">); onClose(); } }}
            style={{ flex:2, background:"#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:13, cursor:"pointer" }}>
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw]     = useState("");
  const [err, setErr]   = useState(false);
  const check = () => {
    if (pw === PRESIDENT_PASSWORD) { onSuccess(); }
    else { setErr(true); setPw(""); }
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,12,30,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:360, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,0.25)" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:"#6C63FF", textTransform:"uppercase", marginBottom:8 }}>President / VP Access</div>
        <div style={{ fontSize:18, fontWeight:800, color:"#0D1136", marginBottom:4 }}>Enter Password</div>
        <div style={{ fontSize:13, color:"#6B7280", marginBottom:20 }}>This view allows adding and removing timeline items.</div>
        <input type="password" value={pw} onChange={e=>{ setPw(e.target.value); setErr(false); }}
          onKeyDown={e=>e.key==="Enter"&&check()}
          placeholder="Password"
          style={{ ...inputStyle, marginBottom: err ? 6 : 16, border: err ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB" }} />
        {err && <div style={{ fontSize:12, color:"#EF4444", marginBottom:12 }}>Incorrect password. Try again.</div>}
        <button onClick={check}
          style={{ width:"100%", background:"#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:"10px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          Unlock
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole]           = useState<string>(ROLES.CABINET);
  const [showPwModal, setShowPwModal] = useState(false);
  const [items, setItems]         = useState<Item[]>(INITIAL_ITEMS);
  const [notes, setNotes]         = useState<Note[]>([]);
  const [modal, setModal]         = useState<{ type: "note"|"add"; item?: Item } | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [nextId, setNextId]       = useState(100);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Load all notes on mount
  useEffect(() => {
    fetchNotes();
    // Subscribe to realtime updates
    const channel = supabase
      .channel("notes-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => fetchNotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchNotes = async () => {
    const { data } = await supabase.from("notes").select("*").order("created_at", { ascending: true });
    if (data) setNotes(data as Note[]);
  };

  const addNote = async (itemId: number, author: string, text: string) => {
    await supabase.from("notes").insert({ item_id: itemId, author, text });
    await fetchNotes();
  };

  const addItem = (form: Omit<Item,"id">) => {
    setItems(prev => [...prev, { id: nextId, ...form }]);
    setNextId(n => n + 1);
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const handleRoleClick = (r: string) => {
    if (r === ROLES.PRESIDENT && role !== ROLES.PRESIDENT) { setShowPwModal(true); }
    else if (r === ROLES.CABINET) { setRole(ROLES.CABINET); }
  };

  const filteredItems = filterType === "all" ? items : items.filter(i => i.type === filterType);
  const weekMap: Record<string, Item[]> = {};
  WEEKS.forEach(w => { weekMap[w.date] = []; });
  filteredItems.forEach(item => { (weekMap[item.week] = weekMap[item.week] || []).push(item); });

  const notesForItem = (id: number) => notes.filter(n => n.item_id === id);

  return (
    <div style={{ minHeight:"100vh", background:"#0D1136", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      {showPwModal && (
        <PasswordModal onSuccess={() => { setRole(ROLES.PRESIDENT); setShowPwModal(false); }} />
      )}

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0D1136 0%,#1a1f5e 100%)", padding:"36px 28px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:"#6C63FF", textTransform:"uppercase", marginBottom:8 }}>
            Oxnard College Business Club
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ margin:0, fontSize:28, fontWeight:900, color:"#FFFFFF", lineHeight:1.1 }}>
                Fall 2026 <span style={{ color:"#6C63FF" }}>Semester Plan</span>
              </h1>
              <p style={{ margin:"6px 0 0", color:"#8B92C9", fontSize:13 }}>Aug 25 – Dec 12 · Workload-aware timeline</p>
            </div>
            <div style={{ display:"flex", background:"rgba(255,255,255,0.07)", borderRadius:10, padding:4, gap:4 }}>
              {Object.values(ROLES).map(r => (
                <button key={r} onClick={() => handleRoleClick(r)}
                  style={{ padding:"7px 14px", borderRadius:7, border:"none", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s",
                    background: role === r ? "#6C63FF" : "transparent",
                    color: role === r ? "#fff" : "#8B92C9" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:14, marginTop:22, flexWrap:"wrap" }}>
            {[
              { label:"Events",           val: items.filter(i=>i.type==="event").length,   color:"#6C63FF" },
              { label:"Cabinet Mtgs",     val: items.filter(i=>i.type==="cabinet").length, color:"#F59E0B" },
              { label:"High-Effort Items",val: items.filter(i=>i.load===3).length,         color:"#EF4444" },
              { label:"Total Items",      val: items.length,                               color:"#10B981" },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 16px", minWidth:90 }}>
                <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:11, color:"#8B92C9", fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background:"#111538", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"12px 28px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:"#8B92C9", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>Filter:</span>
          {([["all","All"], ...Object.entries(TYPE_META).map(([k,v])=>[k,v.label])] as [string,string][]).map(([k,l]) => (
            <button key={k} onClick={() => setFilterType(k)}
              style={{ padding:"5px 12px", borderRadius:20,
                border: `1.5px solid ${filterType===k ? (TYPE_META[k]?.color||"#6C63FF") : "rgba(255,255,255,0.1)"}`,
                background: filterType===k ? (TYPE_META[k]?.bg||"#EEF0FF") : "transparent",
                color: filterType===k ? (TYPE_META[k]?.color||"#6C63FF") : "#8B92C9",
                fontWeight:700, fontSize:11, cursor:"pointer" }}>
              {l}
            </button>
          ))}
          {role === ROLES.PRESIDENT && (
            <button onClick={() => setModal({ type:"add" })}
              style={{ marginLeft:"auto", background:"#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:"7px 16px", fontWeight:700, fontSize:12, cursor:"pointer" }}>
              + Add Item
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 60px" }}>
        {WEEKS.map(week => {
          const weekItems = weekMap[week.date] || [];
          const isThanksgiving = week.date.includes("Nov 24");
          return (
            <div key={week.date} style={{ display:"flex", gap:0, marginBottom:6 }}>
              <div style={{ width:80, flexShrink:0, paddingTop:14, paddingRight:16, textAlign:"right" }}>
                <div style={{ fontSize:12, fontWeight:700, color: isThanksgiving ? "#F59E0B" : "#8B92C9" }}>{week.label}</div>
                {isThanksgiving && <div style={{ fontSize:9, color:"#F59E0B", fontWeight:600 }}>BREAK</div>}
              </div>
              <div style={{ width:1, background:"rgba(255,255,255,0.08)", flexShrink:0, position:"relative", marginTop:18 }}>
                <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:8, height:8, borderRadius:"50%",
                  background: weekItems.length>0 ? "#6C63FF" : "rgba(255,255,255,0.1)", border:"2px solid #0D1136" }} />
              </div>
              <div style={{ flex:1, paddingLeft:16, paddingBottom:8, paddingTop:10 }}>
                {isThanksgiving && weekItems.length===0 && (
                  <div style={{ fontSize:12, color:"#F59E0B", opacity:0.6, fontStyle:"italic", padding:"6px 0" }}>Thanksgiving — no club activities</div>
                )}
                {weekItems.length>1 && <div style={{ marginBottom:6 }}><LoadBar items={weekItems} /></div>}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {weekItems.map(item => {
                    const meta = TYPE_META[item.type];
                    const itemNotes = notesForItem(item.id);
                    return (
                      <div key={item.id}
                        onClick={() => { setLoadingNotes(true); setModal({ type:"note", item }); setTimeout(()=>setLoadingNotes(false),300); }}
                        style={{ background:"#1a1f5e", borderRadius:10, padding:"10px 14px", minWidth:180, maxWidth:300, flex:"1 1 180px",
                          border:`1.5px solid ${meta.color}22`, cursor:"pointer", transition:"transform 0.15s,box-shadow 0.15s",
                          boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}
                        onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 6px 24px ${meta.color}33`; }}
                        onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 10px rgba(0,0,0,0.2)"; }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:meta.dot, flexShrink:0 }} />
                            <span style={{ fontSize:10, fontWeight:700, color:meta.color, textTransform:"uppercase", letterSpacing:0.5 }}>{meta.label}</span>
                          </div>
                          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                            {itemNotes.length>0 && (
                              <span style={{ fontSize:10, background:"rgba(108,99,255,0.2)", color:"#6C63FF", borderRadius:10, padding:"1px 7px", fontWeight:700 }}>
                                {itemNotes.length} note{itemNotes.length>1?"s":""}
                              </span>
                            )}
                            {role===ROLES.PRESIDENT && (
                              <button onClick={e=>{ e.stopPropagation(); removeItem(item.id); }}
                                style={{ background:"none", border:"none", color:"#4B5563", cursor:"pointer", fontSize:14, padding:0 }}>×</button>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#E8EAFF", lineHeight:1.3 }}>{item.title}</div>
                        <div style={{ marginTop:8 }}>
                          <div style={{ fontSize:10, color:LOAD_COLORS[item.load], fontWeight:700 }}>● {LOAD_LABELS[item.load]} effort</div>
                        </div>
                      </div>
                    );
                  })}
                  {weekItems.length===0 && !isThanksgiving && (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.1)", padding:"6px 0", fontStyle:"italic" }}>Open week</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ marginTop:32, background:"#1a1f5e", borderRadius:14, padding:"18px 22px", display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#8B92C9", textTransform:"uppercase", letterSpacing:0.5 }}>Legend</span>
          {Object.entries(TYPE_META).map(([k,v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:v.dot }} />
              <span style={{ fontSize:12, color:"#C7CBF0", fontWeight:600 }}>{v.label}</span>
            </div>
          ))}
          <div style={{ marginLeft:"auto", fontSize:11, color:"#8B92C9" }}>Click any card to view / leave notes</div>
        </div>
      </div>

      {/* Modals */}
      {modal?.type==="note" && modal.item && (
        <NoteModal
          item={modal.item}
          notes={notesForItem(modal.item.id)}
          loadingNotes={loadingNotes}
          onClose={() => setModal(null)}
          onAddNote={(author, text) => addNote(modal.item!.id, author, text)}
        />
      )}
      {modal?.type==="add" && (
        <AddItemModal onClose={() => setModal(null)} onAdd={addItem} />
      )}
    </div>
  );
}
