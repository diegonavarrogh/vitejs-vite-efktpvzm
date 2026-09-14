import { useState } from "react";

interface Building {
  id: string;
  name: string;
  code: string;
  category: "academic" | "admin" | "services" | "arts" | "athletics";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  isCircle?: boolean;
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
  { id: "llrc", name: "Library / Learning Resource Center", code: "LLRC", category: "academic", x: 280, y: 310, radius: 46, isCircle: true, desc: "Distinctive circular library building with tutoring and computer labs." },
  { id: "condor", name: "Condor Hall", code: "CH", category: "academic", x: 420, y: 330, width: 140, height: 110, desc: "Central campus building hosting lecture halls, STEM labs, and classrooms." },
  { id: "ss", name: "Student Services", code: "SS", category: "services", x: 600, y: 220, width: 75, height: 100, desc: "Admissions, Financial Aid, Counseling, EOPS, and Cashier." },
  { id: "cafe", name: "Condor Cafe & Bookstore", code: "CAFE", category: "services", x: 600, y: 340, width: 70, height: 50, desc: "Campus dining, coffee bar, and student bookstore." },
  { id: "pab", name: "Performing Arts Building & Digital Media", code: "PAB", category: "arts", x: 200, y: 110, width: 110, height: 80, desc: "Auditorium, OCTV studio, and digital media production labs." },
  { id: "mch", name: "Oxnard Middle College High", code: "OMCH", category: "academic", x: 370, y: 150, width: 140, height: 45, desc: "Middle College High School classrooms and administrative offices." },
  { id: "la", name: "Liberal Arts Building", code: "LA", category: "academic", x: 490, y: 550, width: 120, height: 80, desc: "Humanities, Social Sciences, and Communication classrooms." },
  { id: "ls", name: "Letters & Science Building", code: "L&S", category: "academic", x: 330, y: 510, width: 120, height: 65, desc: "General education science labs and faculty offices." },
  { id: "dental", name: "Dental Hygiene Clinic & Building", code: "DH", category: "services", x: 190, y: 560, width: 90, height: 65, desc: "Community dental hygiene clinic and health science classrooms." },
  { id: "cdc", name: "Child Development Center", code: "CDC", category: "services", x: 730, y: 90, width: 95, height: 75, desc: "Childcare facility and early childhood education learning lab." },
  { id: "admin", name: "Administration & Campus Center", code: "ADM", category: "admin", x: 570, y: 430, width: 100, height: 75, desc: "President's office, administrative services, and campus operations." },
];

const PARKING_LOTS: ParkingLot[] = [
  { id: "lot-c-d", name: "Lot C & D (East / Athletic Fields)", x: 740, y: 440, width: 170, height: 210, occupancy: "Low", spotsAvailable: 425 },
  { id: "lot-e-f", name: "Lot E & F (Simpson Dr / Student Services)", x: 720, y: 190, width: 45, height: 180, occupancy: "High", spotsAvailable: 42 },
  { id: "lot-g", name: "Lot G (North Campus Rd)", x: 360, y: 60, width: 120, height: 50, occupancy: "Moderate", spotsAvailable: 88 },
];

const EVENTS: EventPin[] = [
  { id: "evt-1", title: "🎃 Nightmare on Condor Night Market", location: "Central Quad Lawn", x: 360, y: 390, date: "Oct 26" },
  { id: "evt-2", title: "Back in Business Mixer", location: "Central Quad Plaza", x: 450, y: 280, date: "Oct 5" },
  { id: "evt-3", title: "ASG Collaboration Briefing", location: "Student Services", x: 635, y: 270, date: "Oct 15" },
];

export default function CampusTrafficMap() {
  const [selectedItem, setSelectedItem] = useState<SelectedItemState | null>({
    type: "building",
    data: BUILDINGS[1], // Default to Condor Hall
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
      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#FFFFFF" }}>Oxnard College Campus Map</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8B92C9" }}>4000 S. Rose Ave · True Geographic Layout</p>
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

      {/* Map Canvas */}
      <div style={{ position: "relative", width: "100%", background: "#0B0E28", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <svg viewBox="0 0 960 700" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="960" height="700" fill="#0B0E28" />
          <rect width="960" height="700" fill="url(#grid)" />

          {/* Athletic Fields (Far East) */}
          <rect x="740" y="190" width="170" height="210" rx="8" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="4 4" />
          <text x="825" y="300" fill="#10B981" fontSize="11" fontWeight="700" textAnchor="middle" opacity="0.6">ATHLETIC FIELDS</text>

          {/* S. ROSE AVE (WEST / LEFT ROAD) */}
          <rect x="100" y="0" width="28" height="700" fill="#1A1F4C" />
          <line x1="114" y1="0" x2="114" y2="700" stroke="#F59E0B" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
          <text x="108" y="350" fill="#8B92C9" fontSize="11" fontWeight="700" transform="rotate(-90 108 350)">S. ROSE AVENUE</text>

          {/* N CAMPUS RD (NORTH / TOP ROAD) */}
          <rect x="0" y="20" width="960" height="24" fill="#1A1F4C" />
          <line x1="0" y1="32" x2="960" y2="32" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="480" y="16" fill="#8B92C9" fontSize="10" fontWeight="700" textAnchor="middle">N CAMPUS RD</text>

          {/* S CAMPUS RD (SOUTH / BOTTOM ROAD) */}
          <rect x="0" y="660" width="960" height="24" fill="#1A1F4C" />
          <line x1="0" y1="672" x2="960" y2="672" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="480" y="654" fill="#8B92C9" fontSize="10" fontWeight="700" textAnchor="middle">S CAMPUS RD</text>

          {/* SIMPSON DR (INTERIOR EAST ROAD) */}
          <rect x="690" y="20" width="20" height="640" fill="#1A1F4C" />
          <text x="704" y="350" fill="#8B92C9" fontSize="10" fontWeight="700" transform="rotate(90 704 350)">SIMPSON DR</text>

          {/* Walkways & Central Quad Lawn */}
          <path d="M 128 320 L 690 320 M 420 44 L 420 660 M 280 200 L 600 500" stroke="rgba(255,255,255,0.05)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 340 280 Q 420 260 520 280 Q 540 380 480 470 Q 360 480 340 380 Z" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" />
          <text x="430" y="390" fill="#10B981" fontSize="10" fontWeight="800" textAnchor="middle" opacity="0.8">CENTRAL QUAD</text>

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
                />
                <text x={lot.x + 8} y={lot.y + 18} fill="#A5B4FC" fontSize="10" fontWeight="700">{lot.name.split(" ")[0]} {lot.name.split(" ")[1]}</text>
                {showTraffic && (
                  <g>
                    <circle cx={lot.x + lot.width - 12} cy={lot.y + 12} r="4" fill={statusColor} />
                    <text x={lot.x + 8} y={lot.y + lot.height - 8} fill="#9CA3AF" fontSize="9">{lot.spotsAvailable} spots</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Buildings */}
          {filteredBuildings.map((b) => {
            const isSelected = selectedItem?.data?.id === b.id;
            return (
              <g key={b.id} onClick={() => setSelectedItem({ type: "building", data: b })} style={{ cursor: "pointer" }}>
                {b.isCircle ? (
                  <circle
                    cx={b.x} cy={b.y} r={b.radius}
                    fill={isSelected ? "#6C63FF" : "#1E2556"}
                    stroke={isSelected ? "#A5B4FC" : "rgba(255,255,255,0.2)"}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                ) : (
                  <rect
                    x={b.x} y={b.y} width={b.width} height={b.height} rx="8"
                    fill={isSelected ? "#6C63FF" : "#1E2556"}
                    stroke={isSelected ? "#A5B4FC" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                )}
                <text
                  x={b.isCircle ? b.x : b.x + (b.width || 0) / 2}
                  y={b.isCircle ? b.y - 2 : b.y + (b.height || 0) / 2 - 2}
                  fill={isSelected ? "#FFF" : "#E8EAFF"}
                  fontSize="10" fontWeight="800" textAnchor="middle">
                  {b.code}
                </text>
                <text
                  x={b.isCircle ? b.x : b.x + (b.width || 0) / 2}
                  y={b.isCircle ? b.y + 10 : b.y + (b.height || 0) / 2 + 10}
                  fill={isSelected ? "#E0E7FF" : "#8B92C9"}
                  fontSize="8" fontWeight="600" textAnchor="middle">
                  {b.name.length > 18 ? b.name.slice(0, 16) + "..." : b.name}
                </text>
              </g>
            );
          })}

          {/* Event Pins */}
          {showEvents && EVENTS.map((evt) => (
            <g key={evt.id} onClick={() => setSelectedItem({ type: "event", data: evt })} style={{ cursor: "pointer" }}>
              <circle cx={evt.x} cy={evt.y} r="13" fill="#EC4899" opacity="0.3">
                <animate attributeName="r" values="9;16;9" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={evt.x} cy={evt.y} r="7" fill="#EC4899" stroke="#FFF" strokeWidth="2" />
              <text x={evt.x} y={evt.y - 12} fill="#FFF" fontSize="10" fontWeight="800" textAnchor="middle" style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }}>
                {evt.date}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Selected Item Drawer */}
      {selectedItem && (
        <div style={{ marginTop: 16, background: "#1A1F4C", borderRadius: 12, padding: 16, border: "1px solid rgba(108,99,255,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6C63FF", marginBottom: 4 }}>
              {selectedItem.type === "building" ? `Building · ${(selectedItem.data as Building).code}` : selectedItem.type === "parking" ? "Parking Density" : "Scheduled Event Pin"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>
              {"name" in selectedItem.data ? selectedItem.data.name : selectedItem.data.title}
            </div>
            <div style={{ fontSize: 12, color: "#A5B4FC", marginTop: 4 }}>
              {selectedItem.type === "building" && (selectedItem.data as Building).desc}
              {selectedItem.type === "parking" && `Capacity: ${(selectedItem.data as ParkingLot).spotsAvailable} open stalls (${(selectedItem.data as ParkingLot).occupancy} Density).`}
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
