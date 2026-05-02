import React, { useState } from "react";

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

export default function App() {
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [shootDays, setShootDays] = useState([createDay(1)]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

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

            .day-section {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="no-print" style={styles.editor}>
        <h1>CIF Call Sheet Builder</h1>
        <p style={styles.muted}>Phase 1: Multi-day shoot + schedule</p>

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
                onChange={(value) =>
                  updateScheduleItem(index, "time", value)
                }
              />

              <Input
                label="Activity"
                value={item.activity}
                onChange={(value) =>
                  updateScheduleItem(index, "activity", value)
                }
              />

              <Input
                label="Location"
                value={item.location}
                onChange={(value) =>
                  updateScheduleItem(index, "location", value)
                }
              />

              <Textarea
                label="Notes"
                value={item.notes}
                onChange={(value) =>
                  updateScheduleItem(index, "notes", value)
                }
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

        <button onClick={handlePrint} style={styles.printButton}>
          Print / Save as PDF
        </button>
      </div>

      <div className="preview" style={styles.preview}>
        <div style={styles.previewHeader}>
          <div>
            <div style={styles.eyebrow}>Production Call Sheet</div>
            <h1 style={styles.previewTitle}>CALL SHEET</h1>
            <h2 style={styles.projectTitle}>
              {projectName || "Project Name"}
            </h2>
            <p style={styles.clientText}>{clientName || "Client Name"}</p>
          </div>

          <div style={styles.logoBox}>CIF</div>
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

function Textarea({ label, value, onChange }) {
  return (
    <label style={styles.label}>
      {label}
      <textarea
        value={value || ""}
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
    fontSize: 48,
    margin: "8px 0",
    letterSpacing: -2,
  },
  projectTitle: {
    margin: 0,
    fontSize: 22,
  },
  clientText: {
    color: "#64748b",
    fontWeight: "bold",
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
