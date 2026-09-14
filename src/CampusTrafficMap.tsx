import { useState, useMemo } from "react";

/* ============================================================
   CAMPUS TRAFFIC MAP — production component
   Building shapes traced from satellite imagery + confirmed by
   Diego against real campus knowledge. Traffic numbers computed
   directly from the Fall 2026 schedule CSV (real enrollment,
   not estimates) via a Location -> building crosswalk.

   IMPORTANT HONESTY NOTE, read before wiring this in:
   The traffic numbers only capture buildings that host SCHEDULED
   CLASSES in the registrar's data. Buildings people use for other
   reasons — the Library, Cafeteria, Bookstore, McNish Gallery,
   M&O, Student Services counters, Admin Annex outside a few
   classrooms, PAB outside THTR/FTVE productions — will show 0 or
   near-0 here, not because they're empty, but because this data
   source can't see foot traffic that isn't a scheduled class.
   Those buildings render in muted gray with a note instead of a
   heat color, so nobody mistakes "no data" for "confirmed empty."

   Drop this file in alongside App.tsx — see the integration
   notes in the comment block at the bottom.
   ============================================================ */

const DAYS: { key: string; label: string }[] = [
  { key: "M", label: "Mon" },
  { key: "T", label: "Tue" },
  { key: "W", label: "Wed" },
  { key: "R", label: "Thu" },
  { key: "F", label: "Fri" },
];

const SLOTS = [
  { key: "morning", label: "10:20am" },
  { key: "midday", label: "12:30pm" },
  { key: "afternoon", label: "4:00pm" },
  { key: "evening", label: "6:30pm" },
];

// Computed from the Fall 2026 schedule CSV: sum of actual enrollment (Act)
// for every section meeting at that building, on that day, covering that
// exact clock time. Buildings not present here had zero matching sections.
const TRAFFIC: Record<string, Record<string, Record<string, number>>> = {"M": {"morning": {"ad": 19, "admin": 0, "at": 64, "ch": 18, "culinary": 0, "dh": 20, "field": 0, "la": 0, "ls": 29, "oe-main": 0, "pab": 0, "pegym": 0, "ss": 0}, "midday": {"ad": 19, "admin": 0, "at": 0, "ch": 36, "culinary": 0, "dh": 0, "field": 0, "la": 32, "ls": 0, "oe-main": 0, "pab": 0, "pegym": 39, "ss": 0}, "afternoon": {"ad": 35, "admin": 0, "at": 0, "ch": 0, "culinary": 0, "dh": 0, "field": 53, "la": 0, "ls": 0, "oe-main": 0, "pab": 0, "pegym": 11, "ss": 0}, "evening": {"ad": 35, "admin": 0, "at": 17, "ch": 98, "culinary": 27, "dh": 0, "field": 1, "la": 0, "ls": 19, "oe-main": 0, "pab": 0, "pegym": 28, "ss": 0}}, "T": {"morning": {"ad": 0, "admin": 0, "at": 65, "ch": 39, "culinary": 10, "dh": 16, "field": 0, "la": 0, "ls": 27, "oe-main": 0, "pab": 0, "pegym": 0, "ss": 0}, "midday": {"ad": 0, "admin": 0, "at": 0, "ch": 0, "culinary": 10, "dh": 0, "field": 0, "la": 32, "ls": 36, "oe-main": 0, "pab": 0, "pegym": 15, "ss": 0}, "afternoon": {"ad": 19, "admin": 0, "at": 34, "ch": 44, "culinary": 0, "dh": 0, "field": 0, "la": 0, "ls": 24, "oe-main": 0, "pab": 0, "pegym": 11, "ss": 0}, "evening": {"ad": 19, "admin": 0, "at": 28, "ch": 80, "culinary": 28, "dh": 0, "field": 0, "la": 0, "ls": 24, "oe-main": 0, "pab": 0, "pegym": 0, "ss": 0}}, "W": {"morning": {"ad": 19, "admin": 0, "at": 71, "ch": 0, "culinary": 18, "dh": 0, "field": 0, "la": 0, "ls": 77, "oe-main": 0, "pab": 0, "pegym": 0, "ss": 0}, "midday": {"ad": 19, "admin": 0, "at": 0, "ch": 36, "culinary": 0, "dh": 0, "field": 0, "la": 32, "ls": 0, "oe-main": 0, "pab": 0, "pegym": 39, "ss": 0}, "afternoon": {"ad": 35, "admin": 0, "at": 0, "ch": 0, "culinary": 0, "dh": 0, "field": 53, "la": 31, "ls": 0, "oe-main": 18, "pab": 0, "pegym": 11, "ss": 0}, "evening": {"ad": 35, "admin": 0, "at": 0, "ch": 98, "culinary": 27, "dh": 0, "field": 1, "la": 40, "ls": 48, "oe-main": 0, "pab": 0, "pegym": 28, "ss": 0}}, "R": {"morning": {"ad": 0, "admin": 0, "at": 65, "ch": 39, "culinary": 0, "dh": 0, "field": 0, "la": 0, "ls": 52, "oe-main": 0, "pab": 0, "pegym": 0, "ss": 18}, "midday": {"ad": 0, "admin": 0, "at": 0, "ch": 0, "culinary": 0, "dh": 0, "field": 0, "la": 0, "ls": 36, "oe-main": 0, "pab": 0, "pegym": 15, "ss": 0}, "afternoon": {"ad": 19, "admin": 0, "at": 34, "ch": 44, "culinary": 0, "dh": 0, "field": 53, "la": 0, "ls": 24, "oe-main": 0, "pab": 13, "pegym": 11, "ss": 0}, "evening": {"ad": 19, "admin": 0, "at": 28, "ch": 71, "culinary": 28, "dh": 0, "field": 0, "la": 0, "ls": 43, "oe-main": 0, "pab": 13, "pegym": 0, "ss": 0}}, "F": {"morning": {"ad": 16, "admin": 0, "at": 24, "ch": 34, "culinary": 0, "dh": 0, "field": 0, "la": 0, "ls": 27, "oe-main": 0, "pab": 0, "pegym": 0, "ss": 0}, "midday": {"ad": 16, "admin": 0, "at": 0, "ch": 0, "culinary": 0, "dh": 0, "field": 0, "la": 0, "ls": 0, "oe-main": 0, "pab": 0, "pegym": 15, "ss": 19}, "afternoon": {"ad": 0, "admin": 0, "at": 0, "ch": 0, "culinary": 0, "dh": 0, "field": 0, "la": 0, "ls": 3, "oe-main": 0, "pab": 0, "pegym": 11, "ss": 0}, "evening": {"ad": 0, "admin": 0, "at": 0, "ch": 0, "culinary": 0, "dh": 0, "field": 0, "la": 0, "ls": 0, "oe-main": 0, "pab": 0, "pegym": 0, "ss": 0}}};

interface Shape {
  id: string;
  name: string;
  short: string;
  path: string;
  fillRule?: string;
  label: [number, number];
  dataKey?: string;
  note?: string;
  noClassData?: boolean;
}

const SHAPES: Shape[] = [
  { id: "pab", name: "Performing Arts Building", short: "PAB",
    path: "M40,60 L150,55 L165,90 L150,130 L60,140 L40,110 Z", label: [95, 95],
    note: "Only THTR/FTVE production sections show here — most PAB activity (rehearsals, events, general use) isn't in the class schedule." },
  { id: "admin", name: "Administration (near Campus Police)", short: "A",
    path: "M25,150 H62 V182 H25 Z", label: [43, 166] },
  { id: "omchs", name: "Middle College High School", short: "OMCHS",
    path: "M190,45 H255 V85 H190 Z", label: [222, 68], noClassData: true },
  { id: "cdc", name: "Child Development Center", short: "CDC",
    path: "M270,40 H320 V70 H270 Z", label: [295, 58], noClassData: true },
  { id: "raq", name: "Raquetball Courts", short: "RQ",
    path: "M340,40 H400 V60 H340 Z", label: [370, 52], noClassData: true },
  { id: "pegym", name: "PE / Gymnasium", short: "PE/GYM",
    path: "M330,70 H430 V150 H390 V180 H330 Z", label: [375, 120] },
  { id: "ss", name: "Student Services (same building as Welcome Center)", short: "SS",
    path: "M25,190 H65 V230 H25 Z", label: [45, 210] },
  { id: "library", name: "Library / Learning Resource Center", short: "LIB",
    path: "M65,110 H120 V145 H65 Z", label: [92, 127], noClassData: true,
    note: "Not a scheduled-class building — real foot traffic (study rooms incl. Study Room 130, tutoring) isn't captured here." },
  { id: "library-rotunda", name: "Library rotunda (tutoring and study rooms, incl. Study Room 130)", short: "LIB", dataKey: "library",
    path: "M45,75 A18,18 0 1 1 45,111 A18,18 0 1 1 45,75 Z", label: [45, 96], noClassData: true },
  { id: "ls", name: "Letters and Science", short: "L&S",
    path: "M122,110 H160 V145 H122 Z", label: [141, 127] },
  { id: "ch", name: "Condor Hall", short: "CH",
    path: "M120,150 H210 V220 H120 Z M140,168 H190 V202 H140 Z", fillRule: "evenodd", label: [165, 185] },
  { id: "cafeteria", name: "Cafeteria", short: "CAF",
    path: "M225,175 L260,160 L295,175 L260,190 Z", label: [260, 175], noClassData: true },
  { id: "oe-main", name: "Occupational Ed / CTE (main hall)", short: "OE",
    path: "M215,225 L300,205 L330,240 L245,262 Z", label: [270, 235] },
  { id: "oe-wing", name: "Occupational Education Building", short: "OE-2", dataKey: "oe-main",
    path: "M245,265 H320 V300 H245 Z", label: [282, 282] },
  { id: "culinary", name: "Culinary Arts / Restaurant Mgmt (The Bistro, OE-12)", short: "CUL",
    path: "M195,265 H240 V300 H195 Z", label: [217, 282] },
  { id: "bookstore", name: "Bookstore", short: "BK",
    path: "M328,215 H360 V255 H328 Z", label: [344, 235], noClassData: true },
  { id: "la", name: "Liberal Arts", short: "LA",
    path: "M95,255 H190 V330 H150 V370 H95 Z", label: [135, 300] },
  { id: "ad", name: "Art and Design Complex (North Hall / North Hall-7 / South Hall)", short: "AD",
    path: "M260,330 H360 V395 H260 Z", label: [310, 362] },
  { id: "mcnish", name: "McNish Gallery (part of Art and Design Complex)", short: "MN", dataKey: "ad",
    path: "M65,340 H95 V365 H65 Z", label: [80, 352], noClassData: true },
  { id: "dh", name: "Dental Health", short: "DH",
    path: "M280,410 H320 V440 H280 Z", label: [300, 425] },
  { id: "mo", name: "Maintenance and Operations", short: "M&O",
    path: "M160,400 H210 V430 H190 V460 H160 Z", label: [180, 425], noClassData: true },
  { id: "at", name: "Automotive Technology", short: "AT",
    path: "M340,400 H460 V465 H340 Z", label: [400, 432] },
];

const VENUES: { id: string; name: string; x: number; y: number; relTo: string }[] = [
  { id: "v-pab-main", name: "PAB Main Stage", x: 80, y: 80, relTo: "pab" },
  { id: "v-pab-black", name: "PAB Black Box Theater", x: 120, y: 100, relTo: "pab" },
  { id: "v-llrc", name: "LLRC-101 (naming inconsistency — actual library study rooms are LLR-111 to LLR-131)", x: 92, y: 127, relTo: "library" },
  { id: "v-study130", name: "Study Room 130 (capacity 7, used for cabinet meetings — LibCal-confirmed)", x: 45, y: 96, relTo: "library" },
  { id: "v-lounge", name: "Student Lounge (Admin Annex — exact spot unconfirmed)", x: 43, y: 166, relTo: "admin" },
  { id: "v-bistro", name: "The Bistro (OE-12)", x: 270, y: 235, relTo: "oe-main" },
  { id: "v-asg", name: "ASG Building (Gordo's Hot Chicken: 48 signed in — exact spot unconfirmed)", x: 43, y: 180, relTo: "admin" },
];

function lerp(a: number, b: number, t: number) { return Math.round(a + (b - a) * t); }
function mix(c1: string, c2: string, t: number) {
  return "#" + [0, 1, 2].map((i) => {
    const v = lerp(parseInt(c1.slice(1 + i * 2, 3 + i * 2), 16), parseInt(c2.slice(1 + i * 2, 3 + i * 2), 16), t);
    return v.toString(16).padStart(2, "0");
  }).join("");
}
const STOPS = ["#3C3489", "#534AB7", "#7F77DD", "#D85A30", "#E24B4A"];
function heatColor(v: number, max: number) {
  const t = Math.max(0, Math.min(1, v / max));
  const seg = t * (STOPS.length - 1);
  const i = Math.floor(seg);
  if (i >= STOPS.length - 1) return STOPS[STOPS.length - 1];
  return mix(STOPS[i], STOPS[i + 1], seg - i);
}

const GROUNDS = { x: 20, y: 20, w: 720, h: 440 };
const FIELD = { x: 560, y: 60, w: 150, h: 150 };
const MAX_TRAFFIC = 100; // scale ceiling for the heat ramp, tune as real numbers grow

export default function CampusTrafficMap() {
  const [day, setDay] = useState("W");
  const [slot, setSlot] = useState("midday");
  const [selected, setSelected] = useState<{ kind: "building" | "venue"; id: string } | null>(null);

  const vals = TRAFFIC[day][slot];

  const { busiest, total } = useMemo(() => {
    const seen = new Set<string>();
    let busiestShape: Shape = SHAPES[0];
    let busiestVal = -1;
    let sum = 0;
    SHAPES.forEach((s) => {
      const key = s.dataKey || s.id;
      if (seen.has(key)) return;
      seen.add(key);
      const v = vals[key] || 0;
      sum += v;
      if (v > busiestVal) { busiestVal = v; busiestShape = s; }
    });
    return { busiest: { shape: busiestShape, val: busiestVal }, total: sum };
  }, [day, slot]);

  const quietestVenue = useMemo(() => {
    return VENUES.map((v) => {
      const rel = SHAPES.find((s) => s.id === v.relTo)!;
      const key = rel.dataKey || rel.id;
      return { v, val: vals[key] || 0 };
    }).sort((a, b) => a.val - b.val)[0];
  }, [day, slot]);

  const detail = useMemo(() => {
    if (!selected) return null;
    if (selected.kind === "venue") {
      const v = VENUES.find((x) => x.id === selected.id)!;
      return { title: v.name, body: "Bookable through the Facilities Request form." };
    }
    const s = SHAPES.find((x) => x.id === selected.id)!;
    if (s.noClassData) {
      return { title: s.name, body: s.note || "Not a scheduled-class building — no traffic data available from this source." };
    }
    const key = s.dataKey || s.id;
    const v = vals[key] || 0;
    const slotLabel = SLOTS.find((sl) => sl.key === slot)!.label;
    const dayLabel = DAYS.find((d) => d.key === day)!.label;
    return { title: s.name, body: `About ${v} students on-site, ${dayLabel} at ${slotLabel}.`, note: s.note };
  }, [selected, day, slot]);

  return (
    <div style={{ background: "#0B0E2E", borderRadius: 18, padding: 22, maxWidth: 780, fontFamily: "Inter,-apple-system,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: "#6C63FF", textTransform: "uppercase", marginBottom: 3 }}>OC Business Club</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F2FC" }}>Campus traffic map</div>
          <div style={{ fontSize: 10.5, color: "#5A6099", marginTop: 2 }}>Live from the Fall 2026 schedule — real enrollment, real buildings</div>
        </div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 9, padding: 3, gap: 2 }}>
          {DAYS.map((d) => (
            <button key={d.key} onClick={() => setDay(d.key)}
              style={{ padding: "6px 12px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer",
                background: day === d.key ? "#6C63FF" : "transparent", color: day === d.key ? "#fff" : "#8B92C9" }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {SLOTS.map((s) => (
          <button key={s.key} onClick={() => setSlot(s.key)}
            style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${slot === s.key ? "#6C63FF" : "rgba(255,255,255,0.14)"}`,
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: slot === s.key ? "#6C63FF" : "transparent", color: slot === s.key ? "#fff" : "#8B92C9" }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard label="Busiest building" value={`${busiest.shape.name} (${busiest.val})`} />
        <StatCard label="Est. students on-site" value={`${total} students`} />
        <StatCard label="Quietest bookable venue" value={quietestVenue.v.name} accent="#7ED9B9" />
      </div>

      <div style={{ background: "#0F1230", borderRadius: 14, padding: 14, border: "0.5px solid rgba(255,255,255,0.06)" }}>
        <svg viewBox="0 0 760 480" style={{ width: "100%", height: "auto", display: "block" }}>
          <rect x={GROUNDS.x} y={GROUNDS.y} width={GROUNDS.w} height={GROUNDS.h} rx={14} fill="#151A3E" />
          <rect x={FIELD.x} y={FIELD.y} width={FIELD.w} height={FIELD.h} rx={10} fill="#1B2A22" stroke="#2A3F32" strokeWidth={1} />
          <text x={FIELD.x + FIELD.w / 2} y={FIELD.y + FIELD.h / 2} textAnchor="middle" fill="#4C6656" fontSize={10.5} fontWeight={500}>Fields</text>
          <path d="M60,140 H430 M165,45 V465 M120,255 H360" stroke="#1E2348" strokeWidth={7} fill="none" />

          {SHAPES.map((s) => {
            const key = s.dataKey || s.id;
            const v = vals[key] || 0;
            const fill = s.noClassData ? "#2A2F52" : heatColor(v, MAX_TRAFFIC);
            const stroke = s.noClassData ? "#454B7A" : "#0B0E2E";
            return (
              <g key={s.id} style={{ cursor: "pointer" }} onClick={() => setSelected({ kind: "building", id: s.id })}>
                <path d={s.path} fillRule={s.fillRule as any} fill={fill} stroke={stroke} strokeWidth={1.5} opacity={0.92} />
                <text x={s.label[0]} y={s.label[1]} textAnchor="middle" fill={s.noClassData ? "#8B92C9" : "#0B0E2E"} fontSize={9} fontWeight={600}>{s.short}</text>
              </g>
            );
          })}

          {VENUES.map((v) => (
            <g key={v.id} style={{ cursor: "pointer" }} onClick={() => setSelected({ kind: "venue", id: v.id })}>
              <path transform={`translate(${v.x - 6},${v.y - 6})`} d="M6 0 L7.4 4.2 L12 4.6 L8.5 7.5 L9.6 12 L6 9.3 L2.4 12 L3.5 7.5 L0 4.6 L4.6 4.2 Z" fill="#F5C744" stroke="#0B0E2E" strokeWidth={0.75} />
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#7B82B5" }}>Traffic</span>
          <div style={{ display: "flex", borderRadius: 4, overflow: "hidden" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ width: 9, height: 9, background: heatColor((i / 11) * MAX_TRAFFIC, MAX_TRAFFIC) }} />
            ))}
          </div>
        </div>
        <LegendItem color="#F5C744" label="Bookable venue" diamond />
        <LegendItem color="#2A2F52" border="#454B7A" label="No class-schedule data" />
      </div>

      <div style={{ marginTop: 14, background: "#141838", borderRadius: 11, padding: "14px 16px", border: "0.5px solid rgba(255,255,255,0.08)", minHeight: 52 }}>
        {detail ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F2FC" }}>{detail.title}</div>
            <div style={{ fontSize: 12, color: "#8B92C9", marginTop: 2 }}>{detail.body}</div>
            {(detail as any).note && <div style={{ fontSize: 11, color: "#F0C674", marginTop: 4 }}>{(detail as any).note}</div>}
          </>
        ) : (
          <div style={{ fontSize: 12, color: "#7B82B5" }}>Click any building or venue marker for details.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#141838", borderRadius: 11, padding: "12px 14px", border: "0.5px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: 10, color: "#7B82B5", fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: accent || "#F1F2FC" }}>{value}</div>
    </div>
  );
}

function LegendItem({ color, border, label, diamond }: { color: string; border?: string; label: string; diamond?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {diamond ? (
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0 L7.4 4.2 L12 4.6 L8.5 7.5 L9.6 12 L6 9.3 L2.4 12 L3.5 7.5 L0 4.6 L4.6 4.2 Z" fill={color} /></svg>
      ) : (
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: border ? `1px solid ${border}` : undefined, display: "inline-block" }} />
      )}
      <span style={{ fontSize: 11, color: "#7B82B5" }}>{label}</span>
    </div>
  );
}

/* ============================================================
   INTEGRATION — same pattern as EventPlannerGuide.tsx

   1) Import it near your other imports:
        import CampusTrafficMap from "./CampusTrafficMap";

   2) Extend your view toggle to a third option:
        const [view, setView] = useState<"timeline" | "guide" | "map">("timeline");

   3) Add a third tab button next to Timeline / Event Planning Guide:
        <button onClick={() => setView("map")}
          style={{ ...same style pattern..., background: view==="map" ? "#6C63FF" : "transparent" }}>
          Campus Map
        </button>

   4) Render it alongside the other two:
        {view === "map" && <CampusTrafficMap />}

   No Supabase tables needed — this is pure client-side data, same
   as EventPlannerGuide. If you want the President/VP role to be
   able to correct a building's shape or add a new venue without
   editing code, that would need a small Supabase table (e.g.
   `map_overrides`) and a form gated behind your existing password
   modal — say the word and I'll build that layer next.

   TO REFRESH THE TRAFFIC DATA next semester: re-run the same
   Location -> building crosswalk against the new schedule CSV
   and swap the TRAFFIC object. I can regenerate this in one pass
   whenever you have the new semester's export.
   ============================================================ */
