import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iuyulottqtbcysrvakdr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eXVsb3R0cXRiY3lzcnZha2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDA5ODMsImV4cCI6MjEwNDU3Njk4M30.N4usQOn90-QtEpSWULPZ-kXt6204xmajf1HQ7Of55bQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRESIDENT_PASSWORD = "ocbusinesstimeline";
const ROLES = { PRESIDENT: "President/VP", CABINET: "Cabinet" };

const WEEKS = [
  { label: "Sep 8",  date: "Sep 8"  },
  { label: "Sep 14", date: "Sep 14" },
  { label: "Sep 16", date: "Sep 16" },
  { label: "Sep 21", date: "Sep 21" },
  { label: "Sep 23", date: "Sep 23" },
  { label: "Sep 24", date: "Sep 24" },
  { label: "Sep 28", date: "Sep 28" },
  { label: "Sep 30", date: "Sep 30" },
  { label: "Oct 1",  date: "Oct 1"  },
  { label: "Oct 5",  date: "Oct 5"  },
  { label: "Oct 7",  date: "Oct 7"  },
  { label: "Oct 8",  date: "Oct 8"  },
  { label: "Oct 12", date: "Oct 12" },
  { label: "Oct 14", date: "Oct 14" },
  { label: "Oct 15", date: "Oct 15" },
  { label: "Oct 19", date: "Oct 19" },
  { label: "Oct 21", date: "Oct 21" },
  { label: "Oct 26", date: "Oct 26" },
  { label: "Oct 29", date: "Oct 29" },
  { label: "Nov 9",  date: "Nov 9"  },
  { label: "Nov 16", date: "Nov 16" },
  { label: "Nov 23", date: "Nov 23 (Thanksgiving)" },
  { label: "Dec 7",  date: "Dec 7"  },
];

const DEFAULT_TYPES: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  event:     { label: "Event",       color: "#6C63FF", bg: "#EEF0FF", dot: "#6C63FF" },
  cabinet:   { label: "Cabinet Mtg", color: "#F59E0B", bg: "#FFF8E6", dot: "#F59E0B" },
  deadline:  { label: "Deadline",    color: "#EF4444", bg: "#FFF0F0", dot: "#EF4444" },
  asg:       { label: "ASG Meeting", color: "#0EA5E9", bg: "#E0F4FF", dot: "#0EA5E9" },
  ioc:       { label: "IOC Meeting", color: "#10B981", bg: "#E0FFF5", dot: "#10B981" },
  outreach:  { label: "Outreach",    color: "#8B5CF6", bg: "#F3EEFF", dot: "#8B5CF6" },
  fundraiser:{ label: "Fundraiser",  color: "#EC4899", bg: "#FFF0F8", dot: "#EC4899" },
};

const TYPE_COLORS = [
  "#6C63FF","#F59E0B","#EF4444","#0EA5E9","#10B981","#8B5CF6","#EC4899",
  "#F97316","#14B8A6","#6366F1","#84CC16","#D946EF","#0284C7","#DC2626",
];

const SEED_ITEMS = [
  { week: "Sep 8",  type: "cabinet",    title: "Fall Kickoff Cabinet Meeting — Trainings, Semester Plan, Website Review", load: 1 },
  { week: "Sep 14", type: "deadline",   title: "Facilities Request Deadline — Oct 5 Mixer & Oct 26 Night Market (submit with Gabby)", load: 3 },
  { week: "Sep 14", type: "outreach",   title: "Ask Josiah — IOC Agenda Deadline for Sept 28 Presentation", load: 1 },
  { week: "Sep 14", type: "outreach",   title: "Website Launch — Present to Cabinet for Review & Feedback", load: 1 },
  { week: "Sep 16", type: "asg",        title: "Submit ASG Agenda Request — Oct 1 ASG Meeting (Night Market collaboration)", load: 2 },
  { week: "Sep 21", type: "outreach",   title: "Meet with Amparo — Present Oct 5 & Oct 26 Plans, ASG Collaboration for Night Market", load: 3 },
  { week: "Sep 21", type: "outreach",   title: "Meet with Josiah — Get on IOC Agenda for Sept 28 Presentation", load: 2 },
  { week: "Sep 21", type: "cabinet",    title: "Cabinet Check-In — Flyers, Logistics, ASG/IOC Prep, Marketing Strategy", load: 2 },
  { week: "Sep 23", type: "asg",        title: "Submit ASG Agenda Request — Collaboration Ask for Sept 24 ASG Meeting", load: 1 },
  { week: "Sep 24", type: "asg",        title: "ASG Meeting — Request Collaboration, Projector/Blowup, Officer Roles for Night Market", load: 2 },
  { week: "Sep 28", type: "ioc",        title: "IOC Meeting — Ask Clubs to RSVP Collaboration, Gauge Materials & Attendance Estimates", load: 3 },
  { week: "Sep 28", type: "deadline",   title: "IOC Funding Expected — Save Funding Form for Next Meeting (need accurate numbers first)", load: 2 },
  { week: "Sep 30", type: "asg",        title: "Submit ASG Agenda Request — Oct 8 Meeting: Night Market Updates, Playlist, Marketing & Officer Roles", load: 1 },
  { week: "Oct 1",  type: "asg",        title: "ASG Meeting — Updates: Club Interest, Student Headcount Estimates, Vendor Participation", load: 2 },
  { week: "Oct 5",  type: "event",      title: "Back in Business Mixer — Fall Welcome Event (Wed 12–1pm, campus location TBD)", load: 3 },
  { week: "Oct 5",  type: "ioc",        title: "IOC Meeting — Request Funding (if tabled earlier, push for approval here)", load: 3 },
  { week: "Oct 7",  type: "deadline",   title: "Submit Flyers to ASG (for Oct 15 Meeting approval) + Ensure All Required Forms Are In", load: 2 },
  { week: "Oct 8",  type: "asg",        title: "ASG Meeting — Night Market Updates, Playlist, Marketing Strategy & Officer Support Roles", load: 2 },
  { week: "Oct 12", type: "ioc",        title: "IOC Meeting — Give Updates, Begin Flyer Distribution to IOC Officers, Coordinate Marketing", load: 2 },
  { week: "Oct 14", type: "asg",        title: "Submit ASG Agenda Request — Last-Minute Updates or Changes Before Event", load: 1 },
  { week: "Oct 15", type: "asg",        title: "ASG Meeting — Present All Forms & Event Strategy (11 days out) / Worst Case: ASG Funding Approved Here", load: 3 },
  { week: "Oct 19", type: "ioc",        title: "IOC Meeting — Market Event to IOC Officers, Final Updates & Coordination", load: 2 },
  { week: "Oct 21", type: "asg",        title: "Submit ASG Agenda Request — Oct 29 Post-Event Debrief (Success, Turnout, Spring Plans)", load: 1 },
  { week: "Oct 26", type: "event",      title: "🎃 Nightmare on Condor Night Market — Halloween / Día de los Muertos HSI Event (Quad, date/time TBD)", load: 3 },
  { week: "Oct 29", type: "asg",        title: "ASG Meeting — Post-Event Debrief: Turnout, Successes, Lessons Learned & Spring Night Market Plans", load: 2 },
  { week: "Nov 9",  type: "cabinet",    title: "Cabinet Check-In — Semester Debrief, Spring Planning Kickoff", load: 1 },
  { week: "Nov 16", type: "deadline",   title: "ASG Funding & Budget Deadlines — Spring Semester Planning", load: 2 },
  { week: "Dec 7",  type: "event",      title: "End-of-Semester Celebration — Cabinet & Members", load: 2 },
];

const LOAD_LABELS: Record<number, string> = { 1: "Low", 2: "Medium", 3: "High" };
const LOAD_COLORS: Record<number, string> = { 1: "#10B981", 2: "#F59E0B", 3: "#EF4444" };

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid #D1D5DB", borderRadius: 8,
  padding: "8px 10px", fontSize: 13, boxSizing: "border-box", outline: "none",
  background: "#FFFFFF", color: "#111827",
};

interface Note { id: number; item_id: number; author: string; text: string; created_at: string }
interface Item { id: number; week: string; type: string; title: string; load: number }
interface CustomType { key: string; label: string; color: string; bg: string; dot: string }

function LoadBar({ items, typeMeta }: { items: Item[], typeMeta: Record<string, {label:string;color:string;bg:string;dot:string}> }) {
  const total = items.reduce((s, i) => s + i.load, 0);
  const pct = Math.min((total / 8) * 100, 100);
  const color = total <= 2 ? "#10B981" : total <= 5 ? "#F59E0B" : "#EF4444";
  const label = total === 0 ? "Clear" : total <= 2 ? "Manageable" : total <= 5 ? "Busy" : "Heavy";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 10, color, fontWeight: 700, minWidth: 60 }}>{label}</span>
    </div>
  );
}

function NoteModal({ item, notes, onClose, onAddNote, onDeleteNote, loadingNotes, typeMeta }: {
  item: Item; notes: Note[]; onClose: () => void;
  onAddNote: (author: string, text: string) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
  loadingNotes: boolean;
  typeMeta: Record<string, {label:string;color:string;bg:string;dot:string}>;
}) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<number|null>(null);
  const meta = typeMeta[item.type] || { label: item.type, color: "#6B7280", bg: "#F3F4F6", dot: "#6B7280" };
  const handlePost = async () => {
    if (!text.trim() || !author.trim()) return;
    setPosting(true);
    await onAddNote(author.trim(), text.trim());
    setText(""); setAuthor(""); setPosting(false);
  };
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await onDeleteNote(id);
    setDeletingId(null);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,12,30,0.55)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:440, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,0.2)", maxHeight:"80vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div style={{ flex:1, marginRight:12 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:meta.color, textTransform:"uppercase", marginBottom:4 }}>{meta.label} · {item.week}</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#111827", lineHeight:1.3 }}>{item.title}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, color:"#9CA3AF", cursor:"pointer", flexShrink:0 }}>×</button>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:8, textTransform:"uppercase" }}>Cabinet Notes</div>
          {loadingNotes ? <div style={{ fontSize:13, color:"#9CA3AF" }}>Loading...</div>
            : notes.length === 0 ? <div style={{ fontSize:13, color:"#9CA3AF", fontStyle:"italic" }}>No notes yet — be the first.</div>
            : notes.map(n => (
              <div key={n.id} style={{ background:"#F9FAFB", borderRadius:8, padding:"8px 12px", marginBottom:6, fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:700, color:"#374151" }}>{n.author}: </span>
                  <span style={{ color:"#4B5563" }}>{n.text}</span>
                  <div style={{ fontSize:10, color:"#9CA3AF", marginTop:2 }}>{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <button onClick={() => handleDelete(n.id)} disabled={deletingId === n.id}
                  style={{ background:"none", border:"none", color: deletingId===n.id ? "#D1D5DB" : "#EF4444", cursor: deletingId===n.id ? "not-allowed" : "pointer", fontSize:16, padding:"0 2px", flexShrink:0, lineHeight:1 }}
                  title="Delete note">
                  {deletingId === n.id ? "..." : "×"}
                </button>
              </div>
            ))}
        </div>
        <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:8, textTransform:"uppercase" }}>Add a Note</div>
          <input placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} style={{ ...inputStyle, marginBottom:8 }} />
          <textarea placeholder="Leave a thought, question, or update..." value={text} onChange={e => setText(e.target.value)} rows={3} style={{ ...inputStyle, resize:"none" as const }} />
          <button onClick={handlePost} disabled={posting}
            style={{ marginTop:8, background: posting ? "#9CA3AF" : "#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontWeight:700, fontSize:13, cursor: posting ? "not-allowed" : "pointer", float:"right" }}>
            {posting ? "Posting..." : "Post Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemFormModal({ item, onClose, onSave, title, typeMeta, isPresident }: {
  item?: Item; onClose: () => void;
  onSave: (f: Omit<Item,"id"> | Item) => Promise<void>;
  title: string;
  typeMeta: Record<string, {label:string;color:string;bg:string;dot:string}>;
  isPresident: boolean;
}) {
  const [form, setForm] = useState<Omit<Item,"id"> | Item>(
    item || { week: WEEKS[0].date, type: Object.keys(typeMeta)[0], title: "", load: 2 }
  );
  const [saving, setSaving] = useState(false);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const [newTypeColor, setNewTypeColor] = useState(TYPE_COLORS[0]);
  const [onAddType, setOnAddType] = useState<((key: string, label: string, color: string) => void) | null>(null);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,12,30,0.55)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:460, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:17, fontWeight:800, color:"#111827", marginBottom:18 }}>{title}</div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:5, textTransform:"uppercase" }}>Week</div>
          <select value={(form as any).week} onChange={e=>setForm({...form,week:e.target.value})} style={inputStyle}>
            {WEEKS.map(w=><option key={w.date} value={w.date}>{w.date}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, textTransform:"uppercase" }}>Type</div>
            {isPresident && (
              <button onClick={()=>setShowNewType(!showNewType)}
                style={{ fontSize:11, color:"#6C63FF", background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>
                {showNewType ? "Cancel" : "+ New Type"}
              </button>
            )}
          </div>
          {showNewType ? (
            <div style={{ background:"#F9FAFB", borderRadius:8, padding:12, marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:6 }}>New category name</div>
              <input value={newTypeLabel} onChange={e=>setNewTypeLabel(e.target.value)} placeholder="e.g. Workshop, Speaker, Campus Fair..." style={{ ...inputStyle, marginBottom:8 }} />
              <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:6 }}>Color</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                {TYPE_COLORS.map(c => (
                  <div key={c} onClick={()=>setNewTypeColor(c)}
                    style={{ width:22, height:22, borderRadius:"50%", background:c, cursor:"pointer",
                      border: newTypeColor===c ? "3px solid #111827" : "2px solid transparent" }} />
                ))}
              </div>
              <button onClick={()=>{
                if (!newTypeLabel.trim()) return;
                if (onAddType) onAddType(newTypeLabel.toLowerCase().replace(/\s+/g,"-"), newTypeLabel.trim(), newTypeColor);
                setForm({...form, type: newTypeLabel.toLowerCase().replace(/\s+/g,"-")});
                setShowNewType(false); setNewTypeLabel("");
              }}
                style={{ width:"100%", background:"#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:"8px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Add Category
              </button>
            </div>
          ) : (
            <select value={(form as any).type} onChange={e=>setForm({...form,type:e.target.value})} style={inputStyle}>
              {Object.entries(typeMeta).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          )}
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:5, textTransform:"uppercase" }}>Title</div>
          <input value={(form as any).title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Item name..." style={inputStyle} />
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:0.5, marginBottom:5, textTransform:"uppercase" }}>Effort</div>
          <select value={(form as any).load} onChange={e=>setForm({...form,load:Number(e.target.value)})} style={inputStyle}>
            <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
          </select>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, background:"#F3F4F6", color:"#374151", border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
          <button disabled={saving} onClick={async ()=>{
            if((form as any).title.trim()){ setSaving(true); await onSave(form); onClose(); }
          }}
            style={{ flex:2, background: saving ? "#9CA3AF" : "#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:13, cursor: saving?"not-allowed":"pointer" }}>
            {saving ? "Saving..." : title === "Add to Timeline" ? "Add to Plan" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [show, setShow] = useState(false);
  const check = () => { if (pw === PRESIDENT_PASSWORD) onSuccess(); else { setErr(true); setPw(""); } };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,12,30,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:360, maxWidth:"92vw", boxShadow:"0 24px 64px rgba(0,0,0,0.25)", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", fontSize:22, color:"#9CA3AF", cursor:"pointer" }}>×</button>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:"#6C63FF", textTransform:"uppercase", marginBottom:8 }}>President / VP Access</div>
        <div style={{ fontSize:18, fontWeight:800, color:"#111827", marginBottom:4 }}>Enter Password</div>
        <div style={{ fontSize:13, color:"#6B7280", marginBottom:20 }}>Add, edit, and delete timeline items.</div>
        <div style={{ position:"relative", marginBottom: err ? 6 : 16 }}>
          <input type={show ? "text" : "password"} value={pw}
            onChange={e=>{ setPw(e.target.value); setErr(false); }}
            onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Password"
            style={{ ...inputStyle, paddingRight:44, border: err ? "1.5px solid #EF4444" : "1.5px solid #D1D5DB" }} />
          <button onClick={()=>setShow(!show)}
            style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6B7280", fontSize:12, fontWeight:600 }}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {err && <div style={{ fontSize:12, color:"#EF4444", marginBottom:12 }}>Incorrect password.</div>}
        <button onClick={check} style={{ width:"100%", background:"#6C63FF", color:"#fff", border:"none", borderRadius:8, padding:"10px", fontWeight:700, fontSize:14, cursor:"pointer" }}>Unlock</button>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<string>(() => {
    try { return localStorage.getItem("bc_role") || ROLES.CABINET; } catch { return ROLES.CABINET; }
  });
  const [showPwModal, setShowPwModal] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [customTypes, setCustomTypes] = useState<CustomType[]>(() => {
    try { return JSON.parse(localStorage.getItem("bc_custom_types") || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: "note"|"add"|"edit"; item?: Item } | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [loadingNotes, setLoadingNotes] = useState(false);

  const typeMeta = {
    ...DEFAULT_TYPES,
    ...Object.fromEntries(customTypes.map(t => [t.key, { label: t.label, color: t.color, bg: t.bg, dot: t.dot }]))
  };

  useEffect(() => {
    initItems(); fetchNotes();
    const channel = supabase.channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => fetchNotes())
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("items").select("*").order("created_at", { ascending: true });
    if (data) setItems(data as Item[]);
  };
  const initItems = async () => {
    const { data } = await supabase.from("items").select("*");
    if (data && data.length === 0) { await supabase.from("items").insert(SEED_ITEMS); await fetchItems(); }
    else if (data) setItems(data as Item[]);
    setLoading(false);
  };
  const fetchNotes = async () => {
    const { data } = await supabase.from("notes").select("*").order("created_at", { ascending: true });
    if (data) setNotes(data as Note[]);
  };
  const addNote = async (itemId: number, author: string, text: string) => {
    await supabase.from("notes").insert({ item_id: itemId, author, text });
    await fetchNotes();
  };
  const deleteNote = async (id: number) => {
    await supabase.from("notes").delete().eq("id", id);
    await fetchNotes();
  };
  const addItem = async (form: Omit<Item,"id">) => {
    await supabase.from("items").insert(form); await fetchItems();
  };
  const editItem = async (updated: Item) => {
    await supabase.from("items").update({ week: updated.week, type: updated.type, title: updated.title, load: updated.load }).eq("id", updated.id);
    await fetchItems();
  };
  const removeItem = async (id: number) => {
    await supabase.from("items").delete().eq("id", id); await fetchItems();
  };
  const addCustomType = (key: string, label: string, color: string) => {
    const bg = color + "22";
    const newType: CustomType = { key, label, color, bg, dot: color };
    const updated = [...customTypes.filter(t => t.key !== key), newType];
    setCustomTypes(updated);
    try { localStorage.setItem("bc_custom_types", JSON.stringify(updated)); } catch {}
  };

  const handleRoleClick = (r: string) => {
    if (r === ROLES.PRESIDENT && role !== ROLES.PRESIDENT) setShowPwModal(true);
    else if (r === ROLES.CABINET) { setRole(ROLES.CABINET); try { localStorage.setItem("bc_role", ROLES.CABINET); } catch {} }
  };

  const filteredItems = filterType === "all" ? items : items.filter(i => i.type === filterType);
  const weekMap: Record<string, Item[]> = {};
  WEEKS.forEach(w => { weekMap[w.date] = []; });
  filteredItems.forEach(item => { (weekMap[item.week] = weekMap[item.week] || []).push(item); });
  const notesForItem = (id: number) => notes.filter(n => n.item_id === id);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0D1136", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#8B92C9", fontSize:16, fontWeight:600, fontFamily:"Inter,sans-serif" }}>Loading semester plan...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0D1136", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} onSuccess={() => {
        setRole(ROLES.PRESIDENT);
        try { localStorage.setItem("bc_role", ROLES.PRESIDENT); } catch {}
        setShowPwModal(false);
      }} />}

      <div style={{ background:"linear-gradient(135deg,#0D1136 0%,#1a1f5e 100%)", padding:"36px 28px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:"#6C63FF", textTransform:"uppercase", marginBottom:8 }}>Oxnard College Business Club</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ margin:0, fontSize:28, fontWeight:900, color:"#FFFFFF", lineHeight:1.1 }}>Fall 2026 <span style={{ color:"#6C63FF" }}>Semester Plan</span></h1>
              <p style={{ margin:"6px 0 0", color:"#8B92C9", fontSize:13 }}>Sep 8 – Dec 7 · Full logistics timeline</p>
            </div>
            <div style={{ display:"flex", background:"rgba(255,255,255,0.07)", borderRadius:10, padding:4, gap:4 }}>
              {Object.values(ROLES).map(r => (
                <button key={r} onClick={() => handleRoleClick(r)}
                  style={{ padding:"7px 14px", borderRadius:7, border:"none", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s",
                    background: role === r ? "#6C63FF" : "transparent", color: role === r ? "#fff" : "#8B92C9" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:12, marginTop:22, flexWrap:"wrap" }}>
            {[
              { label:"Events",       val: items.filter(i=>i.type==="event").length,    color:"#6C63FF" },
              { label:"ASG Meetings", val: items.filter(i=>i.type==="asg").length,      color:"#0EA5E9" },
              { label:"IOC Meetings", val: items.filter(i=>i.type==="ioc").length,      color:"#10B981" },
              { label:"Deadlines",    val: items.filter(i=>i.type==="deadline").length, color:"#EF4444" },
              { label:"Total Items",  val: items.length,                                color:"#8B92C9" },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 16px", minWidth:80 }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, color:"#8B92C9", fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:"#111538", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"12px 28px" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:"#8B92C9", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>Filter:</span>
          {([["all","All"], ...Object.entries(typeMeta).map(([k,v])=>[k,v.label])] as [string,string][]).map(([k,l]) => (
            <button key={k} onClick={() => setFilterType(k)}
              style={{ padding:"5px 12px", borderRadius:20,
                border: `1.5px solid ${filterType===k ? (typeMeta[k]?.color||"#6C63FF") : "rgba(255,255,255,0.1)"}`,
                background: filterType===k ? (typeMeta[k]?.bg||"#EEF0FF") : "transparent",
                color: filterType===k ? (typeMeta[k]?.color||"#6C63FF") : "#8B92C9",
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

      <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 20px 60px" }}>
        {WEEKS.map(week => {
          const weekItems = weekMap[week.date] || [];
          const isThanksgiving = week.date.includes("Nov 23");
          return (
            <div key={week.date} style={{ display:"flex", gap:0, marginBottom:4 }}>
              <div style={{ width:76, flexShrink:0, paddingTop:14, paddingRight:14, textAlign:"right" }}>
                <div style={{ fontSize:11, fontWeight:700, color: isThanksgiving ? "#F59E0B" : "#8B92C9" }}>{week.label}</div>
                {isThanksgiving && <div style={{ fontSize:9, color:"#F59E0B", fontWeight:600 }}>BREAK</div>}
              </div>
              <div style={{ width:1, background:"rgba(255,255,255,0.08)", flexShrink:0, position:"relative", marginTop:18 }}>
                <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:8, height:8, borderRadius:"50%",
                  background: weekItems.length>0 ? "#6C63FF" : "rgba(255,255,255,0.1)", border:"2px solid #0D1136" }} />
              </div>
              <div style={{ flex:1, paddingLeft:14, paddingBottom:6, paddingTop:10 }}>
                {isThanksgiving && weekItems.length===0 && (
                  <div style={{ fontSize:12, color:"#F59E0B", opacity:0.6, fontStyle:"italic", padding:"6px 0" }}>Thanksgiving — no club activities</div>
                )}
                {weekItems.length>1 && <LoadBar items={weekItems} typeMeta={typeMeta} />}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {weekItems.map(item => {
                    const meta = typeMeta[item.type] || { label: item.type, color: "#6B7280", bg: "#F3F4F6", dot: "#6B7280" };
                    const itemNotes = notesForItem(item.id);
                    return (
                      <div key={item.id}
                        onClick={() => { setLoadingNotes(true); setModal({ type:"note", item }); setTimeout(()=>setLoadingNotes(false),300); }}
                        style={{ background:"#1a1f5e", borderRadius:10, padding:"10px 14px", minWidth:200, maxWidth:360, flex:"1 1 200px",
                          border:`1.5px solid ${meta.color}22`, cursor:"pointer", transition:"transform 0.15s,box-shadow 0.15s", boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}
                        onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 6px 24px ${meta.color}33`; }}
                        onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 10px rgba(0,0,0,0.2)"; }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:meta.dot, flexShrink:0 }} />
                            <span style={{ fontSize:10, fontWeight:700, color:meta.color, textTransform:"uppercase", letterSpacing:0.5 }}>{meta.label}</span>
                          </div>
                          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                            {itemNotes.length>0 && (
                              <span style={{ fontSize:10, background:"rgba(108,99,255,0.2)", color:"#6C63FF", borderRadius:10, padding:"1px 7px", fontWeight:700 }}>
                                {itemNotes.length} note{itemNotes.length>1?"s":""}
                              </span>
                            )}
                            {role===ROLES.PRESIDENT && (
                              <>
                                <button onClick={e=>{ e.stopPropagation(); setModal({ type:"edit", item }); }}
                                  style={{ background:"rgba(108,99,255,0.15)", border:"none", color:"#6C63FF", cursor:"pointer", fontSize:11, padding:"2px 8px", borderRadius:5, fontWeight:700 }}>
                                  Edit
                                </button>
                                <button onClick={e=>{ e.stopPropagation(); removeItem(item.id); }}
                                  style={{ background:"rgba(239,68,68,0.12)", border:"none", color:"#EF4444", cursor:"pointer", fontSize:13, padding:"1px 6px", borderRadius:5, fontWeight:700 }}>
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#E8EAFF", lineHeight:1.3 }}>{item.title}</div>
                        <div style={{ marginTop:6 }}>
                          <div style={{ fontSize:10, color:LOAD_COLORS[item.load], fontWeight:700 }}>● {LOAD_LABELS[item.load]} effort</div>
                        </div>
                      </div>
                    );
                  })}
                  {weekItems.length===0 && !isThanksgiving && (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.1)", padding:"6px 0", fontStyle:"italic" }}>Open</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ marginTop:32, background:"#1a1f5e", borderRadius:14, padding:"18px 22px", display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#8B92C9", textTransform:"uppercase", letterSpacing:0.5 }}>Legend</span>
          {Object.entries(typeMeta).map(([k,v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:v.dot }} />
              <span style={{ fontSize:12, color:"#C7CBF0", fontWeight:600 }}>{v.label}</span>
            </div>
          ))}
          <div style={{ marginLeft:"auto", fontSize:11, color:"#8B92C9" }}>Click any card to leave notes</div>
        </div>
      </div>

      {modal?.type==="note" && modal.item && (
        <NoteModal item={modal.item} notes={notesForItem(modal.item.id)} loadingNotes={loadingNotes}
          typeMeta={typeMeta} onClose={() => setModal(null)}
          onAddNote={(author, text) => addNote(modal.item!.id, author, text)}
          onDeleteNote={deleteNote} />
      )}
      {modal?.type==="add" && (
        <ItemFormModal title="Add to Timeline" typeMeta={typeMeta} isPresident={role===ROLES.PRESIDENT}
          onClose={() => setModal(null)} onSave={f => addItem(f as Omit<Item,"id">)} />
      )}
      {modal?.type==="edit" && modal.item && (
        <ItemFormModal title="Edit Item" item={modal.item} typeMeta={typeMeta} isPresident={role===ROLES.PRESIDENT}
          onClose={() => setModal(null)} onSave={f => editItem(f as Item)} />
      )}
    </div>
  );
}
