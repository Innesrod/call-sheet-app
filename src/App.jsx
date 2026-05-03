import React, { useState } from "react";

const STORAGE_KEY = "cif-call-sheet-project-weather";

function createDay(number) {
  return {
    id: Date.now() + Math.random(),
    label: `Day ${number}`,
    date: "",
    callTime: "8:30 AM",
    lunch: "",
    wrap: "",
    weatherTemp: "",
    weatherConditions: "",
    sunTimes: "",
    schedule: [
      { time: "8:30 AM", activity: "Crew Call / Load In", location: "", notes: "" },
      { time: "11:00 AM", activity: "Room Ready", location: "", notes: "" },
    ],
  };
}

const createCrewMember = () => ({
  id: Date.now() + Math.random(),
  name: "",
  role: "",
  callTime: "",
  phone: "",
  responsibility: "",
});

const createClient = () => ({
  id: Date.now() + Math.random(),
  name: "",
  role: "",
  callTime: "",
  contact: "",
  notes: "",
});

const createLocation = () => ({
  id: Date.now() + Math.random(),
  name: "",
  address: "",
  parking: "",
  loadIn: "",
  notes: "",
});
const weatherCodeToText = (code) => {
  const codes = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorms",
  };

  return codes[code] || "Forecast available";
};

const formatWeatherTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};
const getMapLink = (address) =>
  address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "";

function loadProject() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveProject(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const saved = loadProject();

  const [projectName, setProjectName] = useState(saved?.projectName || "");
  const [clientName, setClientName] = useState(saved?.clientName || "");
  const [logo, setLogo] = useState(saved?.logo || "");

  const [shootDays, setShootDays] = useState(saved?.shootDays || [createDay(1)]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const [crew, setCrew] = useState(
    saved?.crew || [{ ...createCrewMember(), role: "DP / Producer", callTime: "8:30 AM" }]
  );

  const [clients, setClients] = useState(
    saved?.clients || [{ ...createClient(), role: "Client Contact", callTime: "No Call" }]
  );

  const [locations, setLocations] = useState(
    saved?.locations || [{ ...createLocation(), name: "Main Location" }]
  );

  const activeDay = shootDays[activeDayIndex];

  const currentProject = {
    projectName,
    clientName,
    logo,
    shootDays,
    crew,
    clients,
    locations,
  };

  const handleSave = () => {
    saveProject(currentProject);
    alert("Project saved.");
  };

  const handleReset = () => {
    if (!confirm("Reset this project? This clears the saved browser project.")) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const updateDay = (field, value) => {
    setShootDays((days) =>
      days.map((day, index) =>
        index === activeDayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const updateScheduleItem = (itemIndex, field, value) => {
    setShootDays((days) =>
      days.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          schedule: day.schedule.map((item, index) =>
            index === itemIndex ? { ...item, [field]: value } : item
          ),
        };
      })
    );
  };

  const addShootDay = () => {
    setShootDays((days) => {
      const next = [...days, createDay(days.length + 1)];
      setActiveDayIndex(next.length - 1);
      return next;
    });
  };

  const removeActiveDay = () => {
    if (shootDays.length === 1) return;
    setShootDays((days) => {
      const next = days.filter((_, index) => index !== activeDayIndex);
      setActiveDayIndex(0);
      return next;
    });
  };

  const addScheduleItem = () => {
    setShootDays((days) =>
      days.map((day, index) =>
        index === activeDayIndex
          ? { ...day, schedule: [...day.schedule, { time: "", activity: "", location: "", notes: "" }] }
          : day
      )
    );
  };

  const removeScheduleItem = (itemIndex) => {
    setShootDays((days) =>
      days.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          schedule:
            day.schedule.length > 1
              ? day.schedule.filter((_, index) => index !== itemIndex)
              : day.schedule,
        };
      })
    );
  };

  const updateCrew = (index, field, value) =>
    setCrew((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const updateClient = (index, field, value) =>
    setClients((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const updateLocation = (index, field, value) =>
    setLocations((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const handleLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };
const autoFillWeather = async () => {
  const location = locations.find((item) => item.address || item.name);

  if (!location) {
    alert("Please add a location first.");
    return;
  }

  if (!activeDay.date) {
    alert("Please add a shoot date first.");
    return;
  }

  const address = location.address || "";
  const name = location.name || "";

  const addressParts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const weatherQueries = [
    address,
    addressParts.slice(-2).join(", "),
    addressParts.slice(-1).join(", "),
    name,
  ].filter(Boolean);

  try {
    let place = null;

    for (const query of weatherQueries) {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );

      const geoData = await geoResponse.json();

      if (geoData?.results?.[0]) {
        place = geoData.results[0];
        break;
      }
    }

    if (!place) {
      alert("Could not find weather. Try using City, State only.");
      return;
    }

    const forecastResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&timezone=auto&start_date=${activeDay.date}&end_date=${activeDay.date}`
    );

    const forecastData = await forecastResponse.json();
    const dayIndex = forecastData?.daily?.time?.indexOf(activeDay.date);

    if (dayIndex < 0) {
      alert("Forecast is not available for that date yet.");
      return;
    }

    updateDay(
      "weatherTemp",
      `${Math.round(forecastData.daily.temperature_2m_max[dayIndex])}° / ${Math.round(forecastData.daily.temperature_2m_min[dayIndex])}°`
    );

    updateDay(
      "weatherConditions",
      weatherCodeToText(forecastData.daily.weather_code[dayIndex])
    );

    updateDay(
      "sunTimes",
      `Sunrise ${formatWeatherTime(forecastData.daily.sunrise[dayIndex])} / Sunset ${formatWeatherTime(forecastData.daily.sunset[dayIndex])}`
    );

    
  } catch (error) {
    alert("Weather lookup failed. You can still enter it manually.");
  }
};
  const handlePrint = () => window.print();

  return (
    <div style={styles.page}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .preview { box-shadow: none !important; border: none !important; }
          .day-section, .people-section, .location-section { page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print" style={styles.editor}>
        <h1>CIF Call Sheet Builder</h1>
        <p style={styles.muted}>Phase 6: Manual Weather Fields</p>

        <Section title="Project Info">
          <Input label="Project Name" value={projectName} onChange={setProjectName} />
          <Input label="Client Name" value={clientName} onChange={setClientName} />
        </Section>

        <Section title="Logo / Branding">
          <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
          {logo && <img src={logo} alt="Logo" style={styles.logoPreview} />}
          {logo && <button onClick={() => setLogo("")} style={styles.smallDangerButton}>Clear Logo</button>}
        </Section>

        <Section title="Save / Reset">
          <button onClick={handleSave} style={styles.printButton}>Save Project</button>
          <button onClick={handleReset} style={styles.dangerButton}>Reset Project</button>
        </Section>

        <Section title="Shoot Days">
          <div style={styles.dayTabs}>
            {shootDays.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setActiveDayIndex(index)}
                style={{ ...styles.tabButton, ...(index === activeDayIndex ? styles.activeTab : {}) }}
              >
                {day.label}
              </button>
            ))}
          </div>
          <button onClick={addShootDay} style={styles.secondaryButton}>+ Add Shoot Day</button>
          {shootDays.length > 1 && <button onClick={removeActiveDay} style={styles.dangerButton}>Remove Active Day</button>}
        </Section>

        <Section title={`Active Day: ${activeDay.label}`}>
          <Input label="Day Label" value={activeDay.label} onChange={(v) => updateDay("label", v)} />
          <Input label="Shoot Date" type="date" value={activeDay.date} onChange={(v) => updateDay("date", v)} />
          <Input label="Crew Call" value={activeDay.callTime} onChange={(v) => updateDay("callTime", v)} />
          <Input label="Lunch" value={activeDay.lunch} onChange={(v) => updateDay("lunch", v)} />
          <Input label="Wrap" value={activeDay.wrap} onChange={(v) => updateDay("wrap", v)} />

          <div style={styles.weatherBox}>
            <h3 style={styles.weatherTitle}>Weather</h3>

            <button onClick={autoFillWeather} style={styles.secondaryButton}>
            Auto Fill Weather
            </button>
            <Input label="Weather Temp" value={activeDay.weatherTemp} onChange={(v) => updateDay("weatherTemp", v)} placeholder="Example: 72° / 48°" />
            <Input label="Weather Conditions" value={activeDay.weatherConditions} onChange={(v) => updateDay("weatherConditions", v)} placeholder="Example: Sunny, light wind" />
            <Input label="Sunrise / Sunset" value={activeDay.sunTimes} onChange={(v) => updateDay("sunTimes", v)} placeholder="Example: Sunrise 6:18 AM / Sunset 7:44 PM" />
          </div>
        </Section>

        <Section title="Schedule">
          {activeDay.schedule.map((item, index) => (
            <div key={index} style={styles.card}>
              <Input label="Time" value={item.time} onChange={(v) => updateScheduleItem(index, "time", v)} />
              <Input label="Activity" value={item.activity} onChange={(v) => updateScheduleItem(index, "activity", v)} />
              <Input label="Location" value={item.location} onChange={(v) => updateScheduleItem(index, "location", v)} />
              <Textarea label="Notes" value={item.notes} onChange={(v) => updateScheduleItem(index, "notes", v)} />
              <button onClick={() => removeScheduleItem(index)} style={styles.smallDangerButton}>Remove</button>
            </div>
          ))}
          <button onClick={addScheduleItem} style={styles.secondaryButton}>+ Add Schedule Item</button>
        </Section>

        <Section title="Locations / Maps">
          {locations.map((location, index) => (
            <div key={location.id} style={styles.card}>
              <Input label="Location Name" value={location.name} onChange={(v) => updateLocation(index, "name", v)} />
              <Textarea label="Address" value={location.address} onChange={(v) => updateLocation(index, "address", v)} />
              {location.address && <a href={getMapLink(location.address)} target="_blank" rel="noreferrer">Open in Google Maps</a>}
              <Textarea label="Parking" value={location.parking} onChange={(v) => updateLocation(index, "parking", v)} />
              <Textarea label="Load-In" value={location.loadIn} onChange={(v) => updateLocation(index, "loadIn", v)} />
              <Textarea label="Notes" value={location.notes} onChange={(v) => updateLocation(index, "notes", v)} />
              <button onClick={() => setLocations((items) => items.length > 1 ? items.filter((_, i) => i !== index) : items)} style={styles.smallDangerButton}>Remove Location</button>
            </div>
          ))}
          <button onClick={() => setLocations((items) => [...items, createLocation()])} style={styles.secondaryButton}>+ Add Location</button>
        </Section>

        <Section title="Crew / Vendors">
          {crew.map((member, index) => (
            <div key={member.id} style={styles.card}>
              <Input label="Name" value={member.name} onChange={(v) => updateCrew(index, "name", v)} />
              <Input label="Role" value={member.role} onChange={(v) => updateCrew(index, "role", v)} />
              <Input label="Call Time" value={member.callTime} onChange={(v) => updateCrew(index, "callTime", v)} />
              <Input label="Phone" value={member.phone} onChange={(v) => updateCrew(index, "phone", v)} />
              <Textarea label="Responsibilities" value={member.responsibility} onChange={(v) => updateCrew(index, "responsibility", v)} />
              <button onClick={() => setCrew((items) => items.length > 1 ? items.filter((_, i) => i !== index) : items)} style={styles.smallDangerButton}>Remove Crew</button>
            </div>
          ))}
          <button onClick={() => setCrew((items) => [...items, createCrewMember()])} style={styles.secondaryButton}>+ Add Crew</button>
        </Section>

        <Section title="Clients / Talent">
          {clients.map((client, index) => (
            <div key={client.id} style={styles.card}>
              <Input label="Name" value={client.name} onChange={(v) => updateClient(index, "name", v)} />
              <Input label="Role" value={client.role} onChange={(v) => updateClient(index, "role", v)} />
              <Input label="Call Time" value={client.callTime} onChange={(v) => updateClient(index, "callTime", v)} />
              <Input label="Contact Info" value={client.contact} onChange={(v) => updateClient(index, "contact", v)} />
              <Textarea label="Notes" value={client.notes} onChange={(v) => updateClient(index, "notes", v)} />
              <button onClick={() => setClients((items) => items.length > 1 ? items.filter((_, i) => i !== index) : items)} style={styles.smallDangerButton}>Remove Client</button>
            </div>
          ))}
          <button onClick={() => setClients((items) => [...items, createClient()])} style={styles.secondaryButton}>+ Add Client</button>
        </Section>

        <button onClick={handlePrint} style={styles.printButton}>Print / Save as PDF</button>
      </div>

      <div className="preview" style={styles.preview}>
        <div style={styles.previewHeader}>
          <div>
            <div style={styles.eyebrow}>Production Call Sheet</div>
            <h1 style={styles.previewTitle}>Project: {projectName || "Name"}</h1>
            <h2 style={styles.projectTitle}>CALL SHEET</h2>
            <p style={styles.clientText}>Client: {clientName || "Name"}</p>
          </div>
          {logo ? <img src={logo} alt="Logo" style={styles.logoImage} /> : <div style={styles.logoBox}>CIF</div>}
        </div>

        {shootDays.map((day) => (
          <div key={day.id} className="day-section" style={styles.daySection}>
            <div style={styles.dayHeader}>
              <div>
                <div style={styles.eyebrow}>{day.label}</div>
                <h2 style={styles.dayTitle}>{formatDate(day.date)}</h2>
              </div>
              <div style={styles.dayMeta}>
                <div><strong>Crew Call:</strong> {day.callTime || "TBD"}</div>
                <div><strong>Lunch:</strong> {day.lunch || "TBD"}</div>
                <div><strong>Wrap:</strong> {day.wrap || "TBD"}</div>
              </div>
            </div>

            <div style={styles.previewWeatherBox}>
              <strong>Weather:</strong> {day.weatherTemp || "TBD"} — {day.weatherConditions || "TBD"}
              <br />
              <strong>Sun:</strong> {day.sunTimes || "TBD"}
            </div>

            <Table
              headers={["Time", "Schedule", "Location", "Notes"]}
              rows={day.schedule.map((item) => [item.time, item.activity, item.location, item.notes])}
            />
          </div>
        ))}

        <PreviewSection title="Locations / Parking / Load-In">
          {locations.map((location, index) => (
            <div key={location.id} style={styles.locationCard}>
              <h3>{location.name || `Location ${index + 1}`}</h3>
              <p><strong>Address:</strong> {location.address ? <a href={getMapLink(location.address)} target="_blank" rel="noreferrer">{location.address}</a> : "TBD"}</p>
              <p><strong>Parking:</strong> {location.parking || "TBD"}</p>
              <p><strong>Load-In:</strong> {location.loadIn || "TBD"}</p>
              <p><strong>Notes:</strong> {location.notes || "—"}</p>
            </div>
          ))}
        </PreviewSection>

        <PreviewSection title="Crew / Vendors">
          <Table headers={["Name", "Role", "Call", "Phone", "Responsibilities"]} rows={crew.map((m) => [m.name, m.role, m.callTime, m.phone, m.responsibility])} />
        </PreviewSection>

        <PreviewSection title="Clients / Talent">
          <Table headers={["Name", "Role", "Call", "Contact", "Notes"]} rows={clients.map((c) => [c.name, c.role, c.callTime, c.contact, c.notes])} />
        </PreviewSection>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return <div style={styles.section}><h2>{title}</h2><div style={styles.sectionBody}>{children}</div></div>;
}

function PreviewSection({ title, children }) {
  return <div style={styles.peopleSection}><h2 style={styles.previewSectionTitle}>{title}</h2>{children}</div>;
}

function Input({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label style={styles.label}>
      {label}
      <input type={type} value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={styles.input} />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label style={styles.label}>
      {label}
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} style={styles.textarea} />
    </label>
  );
}

function Table({ headers, rows }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>{headers.map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j} style={j === 0 ? styles.tdStrong : styles.td}>{cell || "—"}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function formatDate(value) {
  if (!value) return "Shoot Date TBD";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "Shoot Date TBD"
    : date.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

const styles = {
  page: { minHeight: "100vh", background: "#f1f5f9", padding: 24, fontFamily: "Arial, sans-serif", color: "#0f172a", display: "grid", gridTemplateColumns: "420px 1fr", gap: 24 },
  editor: { display: "flex", flexDirection: "column", gap: 16 },
  muted: { color: "#64748b", marginTop: -10 },
  section: { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  sectionBody: { display: "flex", flexDirection: "column", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: "bold", textTransform: "uppercase", color: "#64748b" },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14 },
  textarea: { padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, minHeight: 70 },
  card: { border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", gap: 10 },
  weatherBox: { border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", gap: 10 },
  weatherTitle: { margin: 0, fontSize: 16 },
  previewWeatherBox: { border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 16, lineHeight: 1.5 },
  dayTabs: { display: "flex", flexWrap: "wrap", gap: 8 },
  tabButton: { padding: "8px 12px", borderRadius: 999, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold" },
  activeTab: { background: "#0f172a", color: "white" },
  secondaryButton: { padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold" },
  dangerButton: { padding: "10px 12px", borderRadius: 12, border: "1px solid #fecaca", background: "#fff1f2", color: "#be123c", cursor: "pointer", fontWeight: "bold" },
  smallDangerButton: { padding: "8px 10px", borderRadius: 10, border: "1px solid #fecaca", background: "#fff1f2", color: "#be123c", cursor: "pointer", fontWeight: "bold" },
  printButton: { padding: "14px 18px", borderRadius: 16, background: "#0f172a", color: "white", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: 16 },
  preview: { background: "white", borderRadius: 20, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", alignSelf: "start" },
  previewHeader: { display: "flex", justifyContent: "space-between", gap: 24, borderBottom: "8px solid #020617", paddingBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 3, color: "#64748b" },
  previewTitle: { fontSize: 28, margin: "8px 0", color: "#020617" },
  projectTitle: { margin: 0, fontSize: 18, color: "#020617" },
  clientText: { color: "#020617", fontWeight: "900", fontSize: 18 },
  logoBox: { width: 90, height: 90, background: "#020617", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: 28, borderRadius: 16 },
  logoPreview: { maxWidth: 160, maxHeight: 80, objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: 12, padding: 8 },
  logoImage: { maxWidth: 160, maxHeight: 90, objectFit: "contain" },
  daySection: { marginTop: 32 },
  dayHeader: { display: "flex", justifyContent: "space-between", gap: 24, borderBottom: "2px solid #020617", paddingBottom: 14, marginBottom: 16 },
  dayTitle: { margin: "4px 0 0 0", fontSize: 28 },
  dayMeta: { textAlign: "right", fontSize: 14, color: "#475569", lineHeight: 1.6 },
  peopleSection: { marginTop: 36 },
  previewSectionTitle: { borderBottom: "4px solid #020617", paddingBottom: 8, marginBottom: 16, fontSize: 24 },
  locationCard: { border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, marginBottom: 16, background: "#f8fafc", lineHeight: 1.5 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", background: "#020617", color: "white", padding: "10px 12px", fontSize: 12, textTransform: "uppercase" },
  td: { borderTop: "1px solid #e2e8f0", padding: "10px 12px", verticalAlign: "top" },
  tdStrong: { borderTop: "1px solid #e2e8f0", padding: "10px 12px", verticalAlign: "top", fontWeight: "900" },
};
