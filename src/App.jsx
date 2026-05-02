import React, { useState } from "react";
const STORAGE_KEY = "cif-call-sheet-project";

function saveToBrowser(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromBrowser() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

const createDay = (number) => ({
  id: Date.now() + Math.random(),
  label: `Day ${number}`,
  date: "",
  callTime: "8:30 AM",
  lunch: "",
  wrap: "",
  schedule: [
    { time: "8:30 AM", activity: "Crew Call / Load In", location: "", notes: "" },
    { time: "11:00 AM", activity: "Room Ready", location: "", notes: "" },
  ],
});

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

const getMapLink = (address) => {
  if (!address) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

export default function App() {
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [logo, setLogo] = useState("");

  const [shootDays, setShootDays] = useState([createDay(1)]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const [crew, setCrew] = useState([
    {
      ...createCrewMember(),
      role: "DP / Producer",
      callTime: "8:30 AM",
    },
  ]);

  const [clients, setClients] = useState([
    {
      ...createClient(),
      role: "Client Contact",
      callTime: "No Call",
    },
  ]);

  const [locations, setLocations] = useState([
    {
      ...createLocation(),
      name: "Main Location",
    },
  ]);

  const activeDay = shootDays[activeDayIndex];

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
          ? {
              ...day,
              schedule: [
                ...day.schedule,
                { time: "", activity: "", location: "", notes: "" },
              ],
            }
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

  const updateCrew = (crewIndex, field, value) => {
    setCrew((items) =>
      items.map((item, index) =>
        index === crewIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const addCrewMember = () => {
    setCrew((items) => [...items, createCrewMember()]);
  };

  const removeCrewMember = (crewIndex) => {
    setCrew((items) =>
      items.length > 1 ? items.filter((_, index) => index !== crewIndex) : items
    );
  };

  const updateClient = (clientIndex, field, value) => {
    setClients((items) =>
      items.map((item, index) =>
        index === clientIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const addClient = () => {
    setClients((items) => [...items, createClient()]);
  };

  const removeClient = (clientIndex) => {
    setClients((items) =>
      items.length > 1 ? items.filter((_, index) => index !== clientIndex) : items
    );
  };

  const updateLocation = (locationIndex, field, value) => {
    setLocations((items) =>
      items.map((item, index) =>
        index === locationIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const addLocation = () => {
    setLocations((items) => [...items, createLocation()]);
  };

  const removeLocation = (locationIndex) => {
    setLocations((items) =>
      items.length > 1 ? items.filter((_, index) => index !== locationIndex) : items
    );
  };

  const handleLogoUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setLogo(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogo("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }

            body {
              background: white;
            }

            .preview {
              box-shadow: none !important;
              border: none !important;
            }

            .day-section,
            .people-section,
            .location-section {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="no-print" style={styles.editor}>
        <h1>CIF Call Sheet Builder</h1>
        <p style={styles.muted}>Stable version: Days, Schedule, Crew, Clients, Locations, Logo</p>

        <Section title="Project Info">
          <Input
            label="Project Name"
            value={projectName}
            onChange={setProjectName}
            placeholder="Example: Climb to End Cancer"
          />
          <Input
            label="Client Name"
            value={clientName}
            onChange={setClientName}
            placeholder="Example: American Cancer Society"
          />
        </Section>

        <Section title="Logo / Branding">
          <label style={styles.label}>
            Upload CIF Logo
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleLogoUpload(event.target.files?.[0])}
              style={styles.input}
            />
          </label>

          {logo ? (
            <>
              <img src={logo} alt="CIF Logo" style={styles.logoPreview} />
              <button onClick={clearLogo} style={styles.smallDangerButton}>
                Clear Logo
              </button>
            </>
          ) : (
            <p style={styles.helperText}>No logo uploaded yet. CIF fallback will show.</p>
          )}
        </Section>

        <Section title="Shoot Days">
          <div style={styles.dayTabs}>
            {shootDays.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setActiveDayIndex(index)}
                style={{
                  ...styles.tabButton,
                  ...(index === activeDayIndex ? styles.activeTab : {}),
                }}
              >
                {day.label || `Day ${index + 1}`}
              </button>
            ))}
          </div>

          <button onClick={addShootDay} style={styles.secondaryButton}>
            + Add Shoot Day
          </button>

          {shootDays.length > 1 && (
            <button onClick={removeActiveDay} style={styles.dangerButton}>
              Remove Active Day
            </button>
          )}
        </Section>

        <Section title={`Active Day: ${activeDay.label}`}>
          <Input
            label="Day Label"
            value={activeDay.label}
            onChange={(value) => updateDay("label", value)}
          />

          <Input
            label="Shoot Date"
            type="date"
            value={activeDay.date}
            onChange={(value) => updateDay("date", value)}
          />

          <Input
            label="Crew Call"
            value={activeDay.callTime}
            onChange={(value) => updateDay("callTime", value)}
          />

          <Input
            label="Lunch"
            value={activeDay.lunch}
            onChange={(value) => updateDay("lunch", value)}
          />

          <Input
            label="Wrap"
            value={activeDay.wrap}
            onChange={(value) => updateDay("wrap", value)}
          />
        </Section>

        <Section title="Schedule">
          {activeDay.schedule.map((item, index) => (
            <div key={index} style={styles.card}>
              <Input
                label="Time"
                value={item.time}
                onChange={(value) => updateScheduleItem(index, "time", value)}
              />

              <Input
                label="Activity"
                value={item.activity}
                onChange={(value) => updateScheduleItem(index, "activity", value)}
              />

              <Input
                label="Location"
                value={item.location}
                onChange={(value) => updateScheduleItem(index, "location", value)}
                placeholder="Example: Main Location"
              />

              <Textarea
                label="Notes"
                value={item.notes}
                onChange={(value) => updateScheduleItem(index, "notes", value)}
              />

              <button
                onClick={() => removeScheduleItem(index)}
                style={styles.smallDangerButton}
              >
                Remove Schedule Item
              </button>
            </div>
          ))}

          <button onClick={addScheduleItem} style={styles.secondaryButton}>
            + Add Schedule Item
          </button>
        </Section>

        <Section title="Locations / Maps">
          {locations.map((location, index) => (
            <div key={location.id} style={styles.card}>
              <Input
                label="Location Name"
                value={location.name}
                onChange={(value) => updateLocation(index, "name", value)}
                placeholder="Example: Main Studio"
              />

              <Textarea
                label="Address"
                value={location.address}
                onChange={(value) => updateLocation(index, "address", value)}
                placeholder="Full address or city/state"
              />

              {location.address && (
                <a
                  href={getMapLink(location.address)}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.mapLink}
                >
                  Open in Google Maps
                </a>
              )}

              <Textarea
                label="Parking"
                value={location.parking}
                onChange={(value) => updateLocation(index, "parking", value)}
                placeholder="Parking lot, garage, access notes"
              />

              <Textarea
                label="Load-In"
                value={location.loadIn}
                onChange={(value) => updateLocation(index, "loadIn", value)}
                placeholder="Where crew should unload / enter"
              />

              <Textarea
                label="Location Notes"
                value={location.notes}
                onChange={(value) => updateLocation(index, "notes", value)}
              />

              <button
                onClick={() => removeLocation(index)}
                style={styles.smallDangerButton}
              >
                Remove Location
              </button>
            </div>
          ))}

          <button onClick={addLocation} style={styles.secondaryButton}>
            + Add Location
          </button>
        </Section>

        <Section title="Crew / Vendors">
          {crew.map((member, index) => (
            <div key={member.id} style={styles.card}>
              <Input
                label="Name"
                value={member.name}
                onChange={(value) => updateCrew(index, "name", value)}
                placeholder="Crew member name"
              />

              <Input
                label="Role"
                value={member.role}
                onChange={(value) => updateCrew(index, "role", value)}
                placeholder="Example: Audio Tech"
              />

              <Input
                label="Call Time"
                value={member.callTime}
                onChange={(value) => updateCrew(index, "callTime", value)}
                placeholder="Example: 8:30 AM"
              />

              <Input
                label="Phone"
                value={member.phone}
                onChange={(value) => updateCrew(index, "phone", value)}
                placeholder="Example: (555) 123-4567"
              />

              <Textarea
                label="Responsibilities"
                value={member.responsibility}
                onChange={(value) => updateCrew(index, "responsibility", value)}
              />

              <button
                onClick={() => removeCrewMember(index)}
                style={styles.smallDangerButton}
              >
                Remove Crew Member
              </button>
            </div>
          ))}

          <button onClick={addCrewMember} style={styles.secondaryButton}>
            + Add Crew / Vendor
          </button>
        </Section>

        <Section title="Clients / Talent">
          {clients.map((client, index) => (
            <div key={client.id} style={styles.card}>
              <Input
                label="Name"
                value={client.name}
                onChange={(value) => updateClient(index, "name", value)}
                placeholder="Client or talent name"
              />

              <Input
                label="Role"
                value={client.role}
                onChange={(value) => updateClient(index, "role", value)}
                placeholder="Example: Interview Subject"
              />

              <Input
                label="Call Time"
                value={client.callTime}
                onChange={(value) => updateClient(index, "callTime", value)}
                placeholder="Example: 10:00 AM"
              />

              <Input
                label="Contact Info"
                value={client.contact}
                onChange={(value) => updateClient(index, "contact", value)}
                placeholder="Phone or email"
              />

              <Textarea
                label="Notes"
                value={client.notes}
                onChange={(value) => updateClient(index, "notes", value)}
              />

              <button
                onClick={() => removeClient(index)}
                style={styles.smallDangerButton}
              >
                Remove Client / Talent
              </button>
            </div>
          ))}

          <button onClick={addClient} style={styles.secondaryButton}>
            + Add Client / Talent
          </button>
        </Section>

        <button onClick={handlePrint} style={styles.printButton}>
          Print / Save as PDF
        </button>
      </div>

      <div className="preview" style={styles.preview}>
        <div style={styles.previewHeader}>
          <div>
            <div style={styles.eyebrow}>Production Call Sheet</div>
            <h1 style={{ fontSize: 28, margin: "8px 0", color: "black", fontWeight: 900 }}>
  Project: {projectName || "Name"}
</h1>

<h2 style={{ margin: 0, fontSize: 18, color: "black", fontWeight: 900 }}>
  CALL SHEET
</h2>

<p style={{ color: "black", fontWeight: 900, fontSize: 18, marginTop: 10 }}>
  Client: {clientName || "Name"}
</p>
          </div>

          {logo ? (
            <img src={logo} alt="CIF Logo" style={styles.logoImage} />
          ) : (
            <div style={styles.logoBox}>CIF</div>
          )}
        </div>

        {shootDays.map((day) => (
          <div key={day.id} className="day-section" style={styles.daySection}>
            <div style={styles.dayHeader}>
              <div>
                <div style={styles.eyebrow}>{day.label || "Shoot Day"}</div>
                <h2 style={styles.dayTitle}>{formatDate(day.date)}</h2>
              </div>

              <div style={styles.dayMeta}>
                <div>
                  <strong>Crew Call:</strong> {day.callTime || "TBD"}
                </div>
                <div>
                  <strong>Lunch:</strong> {day.lunch || "TBD"}
                </div>
                <div>
                  <strong>Wrap:</strong> {day.wrap || "TBD"}
                </div>
              </div>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Schedule</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Notes</th>
                </tr>
              </thead>

              <tbody>
                {day.schedule.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.tdStrong}>{item.time || "TBD"}</td>
                    <td style={styles.td}>{item.activity || "Schedule Item"}</td>
                    <td style={styles.td}>{item.location || "—"}</td>
                    <td style={styles.td}>{item.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="location-section" style={styles.peopleSection}>
          <h2 style={styles.previewSectionTitle}>Locations / Parking / Load-In</h2>

          {locations.map((location, index) => (
            <div key={location.id} style={styles.locationCard}>
              <h3 style={styles.locationTitle}>
                {location.name || `Location ${index + 1}`}
              </h3>

              <p>
                <strong>Address:</strong>{" "}
                {location.address ? (
                  <a
                    href={getMapLink(location.address)}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.previewMapLink}
                  >
                    {location.address}
                  </a>
                ) : (
                  "Address TBD"
                )}
              </p>

              <p>
                <strong>Parking:</strong> {location.parking || "Parking TBD"}
              </p>

              <p>
                <strong>Load-In:</strong> {location.loadIn || "Load-in TBD"}
              </p>

              <p>
                <strong>Notes:</strong> {location.notes || "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="people-section" style={styles.peopleSection}>
          <h2 style={styles.previewSectionTitle}>Crew / Vendors</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Call</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Responsibilities</th>
              </tr>
            </thead>

            <tbody>
              {crew.map((member) => (
                <tr key={member.id}>
                  <td style={styles.tdStrong}>{member.name || "Crew Member"}</td>
                  <td style={styles.td}>{member.role || "—"}</td>
                  <td style={styles.td}>{member.callTime || "—"}</td>
                  <td style={styles.td}>{member.phone || "—"}</td>
                  <td style={styles.td}>{member.responsibility || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="people-section" style={styles.peopleSection}>
          <h2 style={styles.previewSectionTitle}>Clients / Talent</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Call</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Notes</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td style={styles.tdStrong}>{client.name || "Client / Talent"}</td>
                  <td style={styles.td}>{client.role || "—"}</td>
                  <td style={styles.td}>{client.callTime || "—"}</td>
                  <td style={styles.td}>{client.contact || "—"}</td>
                  <td style={styles.td}>{client.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label style={styles.label}>
      {label}
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder = "" }) {
  return (
    <label style={styles.label}>
      {label}
      <textarea
        value={value || ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={styles.textarea}
      />
    </label>
  );
}

function formatDate(value) {
  if (!value) return "Shoot Date TBD";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Shoot Date TBD";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: 24,
  },
  editor: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  muted: {
    color: "#64748b",
    marginTop: -10,
  },
  helperText: {
    color: "#64748b",
    fontSize: 13,
    margin: 0,
  },
  section: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: 18,
  },
  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    color: "#0f172a",
    textTransform: "none",
    fontWeight: "normal",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    minHeight: 70,
    resize: "vertical",
    color: "#0f172a",
    textTransform: "none",
    fontWeight: "normal",
  },
  card: {
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  dayTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  tabButton: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  activeTab: {
    background: "#0f172a",
    color: "white",
  },
  secondaryButton: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  dangerButton: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
    cursor: "pointer",
    fontWeight: "bold",
  },
  smallDangerButton: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
    cursor: "pointer",
    fontWeight: "bold",
  },
  printButton: {
    padding: "14px 18px",
    borderRadius: 16,
    background: "#0f172a",
    color: "white",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 16,
  },
  mapLink: {
    color: "#1d4ed8",
    fontWeight: "bold",
    fontSize: 13,
  },
  previewMapLink: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  preview: {
    background: "white",
    borderRadius: 20,
    padding: 32,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    alignSelf: "start",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    borderBottom: "8px solid #020617",
    paddingBottom: 24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 3,
    color: "#64748b",
  },
  previewTitle: {
    fontSize: 28,
    margin: "8px 0",
    letterSpacing: -0.5,
    color: "#020617",
  },
  projectTitle: {
    margin: 0,
    fontSize: 18,
    color: "#020617",
  },
  clientText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 10,
  },
  logoBox: {
    width: 90,
    height: 90,
    background: "#020617",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: 28,
    borderRadius: 16,
    flexShrink: 0,
  },
  logoPreview: {
    maxWidth: 160,
    maxHeight: 80,
    objectFit: "contain",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 8,
    background: "white",
  },
  logoImage: {
    maxWidth: 160,
    maxHeight: 90,
    objectFit: "contain",
    flexShrink: 0,
  },
  daySection: {
    marginTop: 32,
  },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    borderBottom: "2px solid #020617",
    paddingBottom: 14,
    marginBottom: 16,
  },
  dayTitle: {
    margin: "4px 0 0 0",
    fontSize: 28,
  },
  dayMeta: {
    textAlign: "right",
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
  },
  peopleSection: {
    marginTop: 36,
  },
  previewSectionTitle: {
    borderBottom: "4px solid #020617",
    paddingBottom: 8,
    marginBottom: 16,
    fontSize: 24,
  },
  locationCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    background: "#f8fafc",
    lineHeight: 1.5,
  },
  locationTitle: {
    margin: "0 0 8px 0",
    fontSize: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    background: "#020617",
    color: "white",
    padding: "10px 12px",
    fontSize: 12,
    textTransform: "uppercase",
  },
  td: {
    borderTop: "1px solid #e2e8f0",
    padding: "10px 12px",
    verticalAlign: "top",
  },
  tdStrong: {
    borderTop: "1px solid #e2e8f0",
    padding: "10px 12px",
    verticalAlign: "top",
    fontWeight: "900",
  },
};
