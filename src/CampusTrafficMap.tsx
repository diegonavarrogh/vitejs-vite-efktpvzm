import { useState } from "react";

interface Building {
  id: string;
  name: string;
  code: string;
  category: "academic" | "admin" | "services" | "arts" | "athletics";
  x: number;
  y: number;
  width: number;
  height: number;
  desc: string;
}

interface ParkingLot {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  occupancy: "Low" | "Moderate" | "High";
  spotsAvailable: number;
}

interface EventPin {
  id: string;
  title: string;
  location: string;
  x: number;
  y: number;
  date: string;
}

type MapDetailData = Building | ParkingLot | EventPin;

interface SelectedItemState {
  type: "building" | "parking" | "event";
  data: MapDetailData;
}

const BUILDINGS: Building[] = [
  { id: "quad", name: "Central Quad & Plaza", code: "QUAD", category: "services", x: 410, y: 310, width: 140, height: 110, desc: "Main campus hub; host location for Night Market & Back in Business Mixer." },
  { id: "llrc", name: "Library & Learning Resource Center", code: "LLRC", category: "academic", x: 400, y: 170, width: 160, height: 100, desc: "Library, tutoring center, computer labs, and quiet study spaces." },
  { id: "ss", name: "Student Services & Clocktower", code: "SS", category: "services", x: 600, y: 290, width: 130, height: 100, desc: "Admissions, Financial Aid, Counseling, EOPS, and Student Business Office." },
  { id: "ch", name: "Condor Hall", code: "CH", category: "academic", x: 410, y: 450, width: 150, height: 90, desc: "STEM classrooms, lecture halls, computer labs, and faculty offices." },
  { id: "admin", name: "Administration & Campus Police", code: "A", category: "admin", x: 600, y: 170, width: 120, height: 80, desc: "President's Office, Vice Presidents, Business Office, and Campus Safety." },
  { id: "la", name: "Liberal Arts & Letters Science", code: "LA/LS", category: "academic", x: 250, y: 290, width: 120, height: 110, desc: "Humanities, Social Sciences, Communication, and General Education classrooms." },
  { id: "pab", name: "Performing Arts Center", code: "PAB", category: "arts", x: 230, y: 160, width: 130, height: 90, desc: "Auditorium, OCTV Studio, Digital Media Center, and Black Box Theater." },
  { id: "oe", name: "Occupational Education & Auto Tech", code: "OE/AT", category: "academic", x: 600, y: 460, width: 140, height: 110, desc: "Automotive Technology, Culinary Arts, Hospitality, and Trade Programs." },
  { id: "pe", name: "Physical Education & Gymnasium", code: "PE/GYM", category: "athletics", x: 240, y: 450, width: 130, height: 110, desc: "Gymnasium, Fitness Center, Athletics Offices, and Locker Rooms." },
  { id: "cdc", name: "Child Development Center", code: "CDC", category: "services", x: 100, y: 150, width: 90, height: 70, desc: "Early Childhood Education lab and childcare facilities." },
  { id: "ad", name: "Art & Design Complex / McNish", code: "AD/MN", category: "arts", x: 770, y: 390, width: 100, height: 80, desc: "Art studios, ceramics lab, and the McNish Art Gallery." },
];

const PARKING_LOTS: ParkingLot[] = [
  { id: "lot-a", name: "Lot A (North-East / Rose Ave)", x: 760, y: 140, width: 130, height: 210, occupancy: "Moderate", spotsAvailable: 112 },
  { id: "lot-b", name: "Lot B (South-East / Rose Ave)", x: 760, y: 490, width: 130, height: 150, occupancy: "High", spotsAvailable: 34 },
  { id: "lot-c", name: "Lot C (South / Simpson Dr)", x: 240, y: 590, width: 310, height: 60, occupancy: "Low", spotsAvailable: 240 },
  { id: "lot-d", name: "Lot D (West / Athletic Fields)", x: 100, y: 260, width: 90, height: 270, occupancy: "Low", spotsAvailable: 185 },
  { id: "lot-e", name: "Lot E / F (North-West / PAB)", x: 210, y: 80, width: 180, height: 50, occupancy: "Moderate", spotsAvailable: 78 },
];

const EVENTS: EventPin[] = [
  { id: "evt-1", title: "🎃 Nightmare on Condor Night Market", location: "Central Quad", x: 480, y: 360, date: "Oct 26" },
  { id: "evt-2", title: "Back in Business Mixer", location: "Central Quad", x: 440, y: 330, date: "Oct 5" },
  { id: "evt-3", title: "ASG Collaboration Briefing", location: "Student Services (SS)", x: 660, y: 340, date: "Oct 15" },
];

export default function CampusTrafficMap() {
  const [selectedItem, setSelectedItem] = useState<SelectedItemState | null>({
    type: "building",
    data: BUILDINGS[0],
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showEvents, setShowEvents] = useState<boolean>(true);

  const getOccupancyColor = (occ: "Low" | "Moderate" | "High") => {
    switch (occ) {
      case "Low": return "#10B981";
      case "Moderate": return "#F59E0B";
      case "High": return "#EF4444";
    }
  };

  const filteredBuildings = BUILDINGS.filter(
    (b) => filterCategory === "all" || b.category === filterCategory
  );

  return (
    <div style={{ background: "#111538", borderRadius: 16, padding: 20, color: "#E8EAFF", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#FFFFFF" }}>Oxnard College Campus Map</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8B92C9" }}>4000 S. Rose Ave · Geographic Layout & Traffic Flow</p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: showTraffic ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
              color: showTraffic ? "#10B981" : "#8B92C9"
            }}>
            {showTraffic ? "● Parking Density On" : "○ Parking Density Off"}
          </button>
          <button
            onClick={() => setShowEvents(!showEvents)}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: showEvents ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.05)",
              color: showEvents ? "#6C63FF" : "#8B92C9"
            }}>
            {showEvents ? "✦ Event Markers On" : "✧ Event Markers Off"}
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          { key: "all", label: "All Buildings" },
          { key: "academic", label: "Academic" },
          { key: "services", label: "Student Services" },
          { key: "admin", label: "Administration" },
          { key: "arts", label: "Arts & Culture" },
          { key: "athletics", label: "Athletics" },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(cat.key)}
            style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
              background: filterCategory === cat.key ? "#6C63FF" : "rgba(255,255,255,0.06)",
              color: filterCategory === cat.key ? "#FFF" : "#8B92C9"
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Interactive Vector Map Canvas */}
      <div style={{ position: "relative", width: "100%", background: "#0D102D", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <svg viewBox="0 0 960 680" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            </pattern>
            <radialGradient id="quadGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="960" height="680" fill="#0D102D" />
          <rect width="960" height="680" fill="url(#grid)" />

          {/* Perimeter Roads */}
          {/* S Rose Ave (East) */}
          <rect x="910" y="0" width="30" height="680" fill="#1A1F4C" />
          <line x1="925" y1="0" x2="925" y2="680" stroke="#F59E0B" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
          <text x="920" y="340" fill="#6B7280" fontSize="11" fontWeight="700" transform="rotate(90 920 340)">S. ROSE AVENUE</text>

          {/* College Park Dr / N Campus Rd (North) */}
          <rect x="0" y="20" width="910" height="24" fill="#1A1F4C" />
          <line x1="0" y1="32" x2="910" y2="32" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="450" y="16" fill="#6B7280" fontSize="10" fontWeight="700">COLLEGE PARK DRIVE / NORTH CAMPUS ROAD</text>

          {/* South Campus Rd (South) */}
          <rect x="0" y="650" width="910" height="24" fill="#1A1F4C" />
          <line x1="0" y1="662" x2="910" y2="662" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="450" y="644" fill="#6B7280" fontSize="10" fontWeight="700">SOUTH CAMPUS ROAD / SIMPSON DR</text>

          {/* Bard Rd (West) */}
          <rect x="20" y="20" width="24" height="640" fill="#1A1F4C" />
          <text x="14" y="340" fill="#6B7280" fontSize="10" fontWeight="700" transform="rotate(-90 14 340)">BARD ROAD</text>

          {/* Walkways & Campus Plazas */}
          <path d="M 240 345 L 750 345 M 480 170 L 480 540 M 350 220 L 610 480" stroke="rgba(255,255,255,0.07)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Central Quad Lawn */}
          <rect x="410" y="310" width="140" height="110" rx="12" fill="url(#quadGlow)" />

          {/* Parking Lots */}
          {PARKING_LOTS.map((lot) => {
            const isSelected = selectedItem?.data?.id === lot.id;
            const statusColor = getOccupancyColor(lot.occupancy);
            return (
              <g key={lot.id} onClick={() => setSelectedItem({ type: "parking", data: lot })} style={{ cursor: "pointer" }}>
                <rect
                  x={lot.x} y={lot.y} width={lot.width} height={lot.height} rx="8"
                  fill={isSelected ? "rgba(108,99,255,0.25)" : "rgba(30,37,86,0.7)"}
                  stroke={isSelected ? "#6C63FF" : showTraffic ? statusColor : "rgba(255,255,255,0.15)"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={showTraffic ? undefined : "4 3"}
                />
                <text x={lot.x + 8} y={lot.y + 18} fill="#A5B4FC" fontSize="10" fontWeight="700">{lot.name.split(" ")[0]} {lot.name.split(" ")[1]}</text>
                {showTraffic && (
                  <g>
                    <circle cx={lot.x + lot.width - 14} cy={lot.y + 14} r="5" fill={statusColor} />
                    <text x={lot.x + 8} y={lot.y + lot.height - 8} fill="#9CA3AF" fontSize="9">{lot.spotsAvailable} spots</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Buildings */}
          {filteredBuildings.map((b) => {
            const isSelected = selectedItem?.data?.id === b.id;
            const isQuad = b.id === "quad";
            return (
              <g key={b.id} onClick={() => setSelectedItem({ type: "building", data: b })} style={{ cursor: "pointer" }}>
                <rect
                  x={b.x} y={b.y} width={b.width} height={b.height} rx="10"
                  fill={isSelected ? "#6C63FF" : isQuad ? "rgba(16,185,129,0.15)" : "#1E2556"}
                  stroke={isSelected ? "#A5B4FC" : isQuad ? "#10B981" : "rgba(255,255,255,0.12)"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <text x={b.x + b.width / 2} y={b.y + b.height / 2 - 4} fill={isSelected ? "#FFF" : "#E8EAFF"} fontSize="11" fontWeight="800" textAnchor="middle">
                  {b.code}
                </text>
                <text x={b.x + b.width / 2} y={b.y + b.height / 2 + 10} fill={isSelected ? "#E0E7FF" : "#8B92C9"} fontSize="9" fontWeight="600" textAnchor="middle">
                  {b.name.length > 20 ? b.name.slice(0, 18) + "..." : b.name}
                </text>
              </g>
            );
          })}

          {/* Event Pins */}
          {showEvents && EVENTS.map((evt) => (
            <g key={evt.id} onClick={() => setSelectedItem({ type: "event", data: evt })} style={{ cursor: "pointer" }}>
              <circle cx={evt.x} cy={evt.y} r="14" fill="#EC4899" opacity="0.3">
                <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={evt.x} cy={evt.y} r="8" fill="#EC4899" stroke="#FFF" strokeWidth="2" />
              <text x={evt.x} y={evt.y - 14} fill="#FFF" fontSize="10" fontWeight="800" textAnchor="middle" style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }}>
                {evt.date}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Selected Item Detail Drawer */}
      {selectedItem && (
        <div style={{ marginTop: 16, background: "#1A1F4C", borderRadius: 12, padding: 16, border: "1px solid rgba(108,99,255,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6C63FF", marginBottom: 4 }}>
              {selectedItem.type === "building" ? `Building Details · ${(selectedItem.data as Building).code}` : selectedItem.type === "parking" ? "Parking Density Info" : "Scheduled Event Pin"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>
              {"name" in selectedItem.data ? selectedItem.data.name : selectedItem.data.title}
            </div>
            <div style={{ fontSize: 12, color: "#A5B4FC", marginTop: 4 }}>
              {selectedItem.type === "building" && (selectedItem.data as Building).desc}
              {selectedItem.type === "parking" && `Capacity: ${(selectedItem.data as ParkingLot).spotsAvailable} open stalls currently available (${(selectedItem.data as ParkingLot).occupancy} Traffic Density).`}
              {selectedItem.type === "event" && `Location: ${(selectedItem.data as EventPin).location} — Date: ${(selectedItem.data as EventPin).date}`}
            </div>
          </div>

          <button
            onClick={() => setSelectedItem(null)}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#8B92C9", borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
