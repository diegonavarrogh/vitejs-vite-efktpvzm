import { useState, useEffect, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   CABINET TASKS — running task tracker
   ============================================================ */

const SUPABASE_URL = "https://iuyulottqtbcysrvakdr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eXVsb3R0cXRiY3lzcnZha2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDA5ODMsImV4cCI6MjEwNDU3Njk4M30.N4usQOn90-QtEpSWULPZ-kXt6204xmajf1HQ7Of55bQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PEOPLE = [
  "President (Diego)",
  "VP (Blanca)",
  "IOC Representative (Joaquin)",
  "Treasurer (Rigo)",
  "Secretary (Yaneli)",
  "Operations Oversight Officer (Robert)",
  "Business Affairs Officer (Thali)",
];

const PRESIDENT = "President (Diego)";
const VP = "VP (Blanca)";
const IOC = "IOC Representative (Joaquin)";
const TREASURER = "Treasurer (Rigo)";
const SECRETARY = "Secretary (Yaneli)";
const OPS = "Operations Oversight Officer (Robert)";
const BAO = "Business Affairs Officer (Thali)";

const SEED_TASKS: { category: string; deadline: string; notes?: string; people: string[] }[] = [
  { category: "Flyers & marketing strategy for high turnout", deadline: "Sep 21", people: [SECRETARY, PRESIDENT, IOC, TREASURER] },
  { category: "IOC funding & donations — logistics, who and from where", deadline: "Sep 21", notes: "Assignees inferred as Treasurer + Operations Oversight Officer from \"R/R\" in the source doc — worth confirming.", people: [TREASURER, OPS, VP, BAO, PRESIDENT] },
  { category: "Facilities form requests — confirmation", deadline: "Sep 13", notes: "Doc marks Oct 5 & Oct 26 requests as already finished.", people: [PRESIDENT] },
  { category: "Day-of event structure & officer roles (setup/clean)", deadline: "Sep 21", people: [PRESIDENT, OPS, VP, SECRETARY, IOC] },
  { category: "Ask clubs/student vendors at IOC meeting for collaboration", deadline: "Sep 21", notes: "Ties to the Sept 28 IOC meeting.", people: [IOC, BAO, TREASURER, PRESIDENT, VP] },
  { category: "Explain ASG benefit in collaborating & support needed", deadline: "Sep 21", people: [BAO, PRESIDENT, VP] },
  { category: "Timeline of website priorities through Oct 26", deadline: "Sep 21", people: [BAO, PRESIDENT, VP, SECRETARY] },
  { category: "Submit Oct 5 & Oct 26 facilities requests with Gabby", deadline: "Sep 13", people: [PRESIDENT] },
  { category: "Publish club website, input full timeline", deadline: "Sep 12", people: [PRESIDENT] },
  { category: "Create Operations Oversight Officer position for Robert", deadline: "Sep 14", people: [PRESIDENT] },
  { category: "Meet with Josiah & Thali — IOC training, get on Sept 28 agenda", deadline: "Sep 14", people: [PRESIDENT, BAO] },
  { category: "Fill and present website, ask cabinet for review & feedback", deadline: "Sep 14", people: [PRESIDENT] },
  { category: "Work with Secretary/IOC Rep/Treasurer/BAO on flyers & marketing plan", deadline: "Sep 14–18", people: [PRESIDENT, SECRETARY, IOC, TREASURER, BAO] },
  { category: "Get officer task assignments locked in for both events", deadline: "Sep 14–21", people: [PRESIDENT] },
  { category: "Meet with Amparo, present plan, relay feedback to board", deadline: "Sep 21", people: [PRESIDENT] },
  { category: "Confirm ready to roll out Oct 5 marketing", deadline: "Sep 21", people: [PRESIDENT] },
  { category: "Ask Joaquin: OK to push Oct 26 event to Nov 4?", deadline: "ASAP", notes: "Still an open question in the source doc, not a confirmed decision.", people: [PRESIDENT, IOC] },
  { category: "Idea: Art students do Dia de los Muertos / Halloween face painting for the HSI event", deadline: "TBD", notes: "Not yet assigned — pitched as an idea to open the event to fall + Dia de los Muertos vibes, not just Halloween.", people: [PRESIDENT] },
];

interface Task { id: number; category: string; deadline: string; notes: string | null }
interface Assignment { id: number; task_id: number; person: string; status: string; completed_at: string | null }

const inputStyle: CSSProperties = {
  width: "100%", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 8,
  padding: "8px 10px", fontSize: 13, boxSizing: "border-box", outline: "none",
  background: "#1a1f5e", color: "#E8EAFF",
};

function WhoAmIPicker({ me, setMe }: { me: string; setMe: (p: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "#8B92C9", fontWeight: 600 }}>I am:</span>
      <select value={me} onChange={(e) => setMe(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "6px 10px" }}>
        <option value="">Select your role…</option>
        {PEOPLE.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const color = pct === 100 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#6C63FF";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.2s" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 60, textAlign: "right" }}>{done}/{total} done</span>
    </div>
  );
}

function AddTaskModal({ onClose, onSave }: { onClose: () => void; onSave: (category: string, deadline: string, notes: string, people: string[]) => Promise<void> }) {
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const togglePerson = (p: string) => setPeople((cur) => cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,12,30,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#141838", borderRadius: 16, padding: 24, width: 420, maxWidth: "92vw", border: "0.5px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F2FC", marginBottom: 16 }}>Add a Task</div>
        <Label>Task / category</Label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Book DJ for Night Market" style={{ ...inputStyle, marginBottom: 10 }} />
        <Label>Deadline</Label>
        <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="e.g. Sep 28" style={{ ...inputStyle, marginBottom: 10 }} />
        <Label>Notes (optional)</Label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any context worth flagging" style={{ ...inputStyle, marginBottom: 10 }} />
        <Label>Assign to</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {PEOPLE.map((p) => (
            <button key={p} onClick={() => togglePerson(p)}
              style={{ padding: "5px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: `1.5px solid ${people.includes(p) ? "#6C63FF" : "rgba(255,255,255,0.15)"}`,
                background: people.includes(p) ? "#6C63FF" : "transparent", color: people.includes(p) ? "#fff" : "#8B92C9" }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "#C7CBF0", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button disabled={saving || !category.trim() || people.length === 0}
            onClick={async () => { setSaving(true); await onSave(category.trim(), deadline.trim(), notes.trim(), people); setSaving(false); onClose(); }}
            style={{ flex: 2, background: saving ? "#4A4F7A" : "#6C63FF", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "#8B92C9", letterSpacing: 0.5, marginBottom: 5, textTransform: "uppercase" }}>{children}</div>;
}

export default function CabinetTasks({ isPresident }: { isPresident: boolean }) {
  const [me, setMe] = useState<string>(() => { try { return localStorage.getItem("bc_me") || ""; } catch { return ""; } });
  const [view, setView] = useState<"person" | "task">("person");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const start = async () => {
      await init();
      await fetchAll();
    };

    start();

    const channel = supabase
      .channel("cabinet-tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_assignments" },
        () => fetchAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setMeAndStore = (p: string) => { setMe(p); try { localStorage.setItem("bc_me", p); } catch {} };

  const fetchAll = async () => {
    const [tasksResult, assignmentsResult] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: true }),
      supabase.from("task_assignments").select("*"),
    ]);

    if (tasksResult.error) {
      console.error("Failed to load tasks:", tasksResult.error);
    }
    if (assignmentsResult.error) {
      console.error("Failed to load assignments:", assignmentsResult.error);
    }
    if (tasksResult.data) {
      setTasks(tasksResult.data as Task[]);
    }
    if (assignmentsResult.data) {
      setAssignments(assignmentsResult.data as Assignment[]);
    }
    setLoading(false);
  };

  const init = async () => {
    const { data } = await supabase.from("tasks").select("id");
    if (data && data.length === 0) {
      for (const seed of SEED_TASKS) {
        const { data: inserted } = await supabase.from("tasks")
          .insert({ category: seed.category, deadline: seed.deadline, notes: seed.notes || null }).select();
        if (inserted && inserted[0]) {
          const taskId = inserted[0].id;
          await supabase.from("task_assignments").insert(seed.people.map((p) => ({ task_id: taskId, person: p, status: "todo" })));
        }
      }
      await fetchAll();
    }
  };

  const toggleStatus = async (assignment: Assignment) => {
    const newStatus = assignment.status === "done" ? "todo" : "done";
    const { error } = await supabase
      .from("task_assignments")
      .update({
        status: newStatus,
        completed_at: newStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", assignment.id);

    if (error) {
      console.error("Failed to update assignment:", error);
      return;
    }
    await fetchAll();
  };

  const addTask = async (category: string, deadline: string, notes: string, people: string[]) => {
    const { data: inserted } = await supabase.from("tasks").insert({ category, deadline, notes: notes || null }).select();
    if (inserted && inserted[0]) {
      await supabase.from("task_assignments").insert(people.map((p) => ({ task_id: inserted[0].id, person: p, status: "todo" })));
    }
  };

  const assignmentsForTask = (taskId: number) => assignments.filter((a) => a.task_id === taskId);
  const overall = useMemo(() => {
    const done = assignments.filter((a) => a.status === "done").length;
    return { done, total: assignments.length };
  }, [assignments]);

  const peopleWithTasks = useMemo(() => {
    const set = new Set(assignments.map((a) => a.person));
    return PEOPLE.filter((p) => set.has(p));
  }, [assignments]);

  if (loading) return <div style={{ color: "#8B92C9", fontSize: 13, padding: 20 }}>Loading tasks…</div>;

  return (
    <div style={{ background: "#0B0E2E", borderRadius: 18, padding: 22, maxWidth: 780, fontFamily: "Inter,-apple-system,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: "#6C63FF", textTransform: "uppercase", marginBottom: 3 }}>OC Business Club</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F2FC" }}>Cabinet Tasks</div>
          <div style={{ fontSize: 10.5, color: "#5A6099", marginTop: 2 }}>Everyone can see all tasks — you can only check off your own</div>
        </div>
        <WhoAmIPicker me={me} setMe={setMeAndStore} />
      </div>

      <div style={{ background: "#141838", borderRadius: 11, padding: "12px 14px", marginBottom: 14, border: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 10, color: "#7B82B5", fontWeight: 500, marginBottom: 6 }}>Overall progress</div>
        <ProgressBar done={overall.done} total={overall.total} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 9, padding: 3, gap: 2 }}>
          {(["person", "task"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "6px 14px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: view === v ? "#6C63FF" : "transparent", color: view === v ? "#fff" : "#8B92C9" }}>
              {v === "person" ? "By Person" : "By Task"}
            </button>
          ))}
        </div>
        {isPresident && (
          <button onClick={() => setShowAdd(true)}
            style={{ background: "#6C63FF", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            + Add Task
          </button>
        )}
      </div>

      {!me && (
        <div style={{ background: "#3A2A14", border: "0.5px solid #6B4A1E", borderRadius: 9, padding: "8px 12px", marginBottom: 14, fontSize: 11, color: "#F0C674" }}>
          Pick your role above to check off your own tasks. You can still see everyone's status either way.
        </div>
      )}

      {view === "person" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {peopleWithTasks.map((person) => {
            const mine = assignments.filter((a) => a.person === person);
            const doneCount = mine.filter((a) => a.status === "done").length;
            const isMe = person === me;
            return (
              <div key={person} style={{ background: "#141838", borderRadius: 11, padding: "14px 16px", border: `0.5px solid ${isMe ? "#6C63FF66" : "rgba(255,255,255,0.08)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F2FC" }}>{person}{isMe && <span style={{ color: "#6C63FF", fontWeight: 500 }}> (you)</span>}</div>
                  <span style={{ fontSize: 11, color: "#7B82B5" }}>{doneCount}/{mine.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {mine.map((a) => {
                    const t = tasks.find((tk) => tk.id === a.task_id);
                    if (!t) return null;
                    return <TaskRow key={a.id} task={t} assignment={a} canToggle={isMe} onToggle={() => toggleStatus(a)} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((t) => {
            const rows = assignmentsForTask(t.id);
            return (
              <div key={t.id} style={{ background: "#141838", borderRadius: 11, padding: "14px 16px", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F2FC" }}>{t.category}</div>
                  <span style={{ fontSize: 10, color: "#8B92C9", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" }}>{t.deadline}</span>
                </div>
                {t.notes && <div style={{ fontSize: 11, color: "#F0C674", marginBottom: 8 }}>{t.notes}</div>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {rows.map((a) => (
                    <button key={a.id} onClick={() => a.person === me && toggleStatus(a)}
                      disabled={a.person !== me}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        border: `1.5px solid ${a.status === "done" ? "#10B98166" : "rgba(255,255,255,0.15)"}`,
                        background: a.status === "done" ? "#10B98122" : "transparent",
                        color: a.status === "done" ? "#7ED9B9" : "#8B92C9",
                        cursor: a.person === me ? "pointer" : "default" }}>
                      {a.status === "done" ? "✓" : "○"} {a.person}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onSave={addTask} />}
    </div>
  );
}

function TaskRow({ task, assignment, canToggle, onToggle }: { task: Task; assignment: Assignment; canToggle: boolean; onToggle: () => void }) {
  const done = assignment.status === "done";
  return (
    <div onClick={() => canToggle && onToggle()}
      style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px", borderRadius: 7,
        cursor: canToggle ? "pointer" : "default", background: canToggle ? "rgba(108,99,255,0.06)" : "transparent" }}>
      <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: `1.5px solid ${done ? "#10B981" : "#4A4F7A"}`, background: done ? "#10B981" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {done && <span style={{ color: "#0B0E2E", fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, color: done ? "#7B82B5" : "#E8EAFF", textDecoration: done ? "line-through" : "none" }}>{task.category}</div>
        <div style={{ fontSize: 10, color: "#5A6099", marginTop: 1 }}>{task.deadline}{task.notes ? ` · ${task.notes}` : ""}</div>
      </div>
    </div>
  );
}
