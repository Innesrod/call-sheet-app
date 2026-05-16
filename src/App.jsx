import React, { useState } from "react";
import html2pdf from "html2pdf.js";

const CREW_LIBRARY_KEY = "cif-call-sheet-crew-library-v1";
const LAST_PROJECT_KEY = "cif-call-sheet-last-project-v1";

function createDay(number) {
  return {
    id: Date.now() + Math.random(),
    label: `Day ${number}`,
    date: "",
    callTime: "8:30 AM",
    lunch: "",
    wrap: "",
    weatherLocation: "",
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

const createAttachment = () => ({
  id: Date.now() + Math.random(),
  name: "",
  url: "",
  notes: "",
});

const getMapLink = (address) =>
  address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "";

function loadCrewLibrary() {
  try {
    const saved = localStorage.getItem(CREW_LIBRARY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCrewLibrary(library) {
  localStorage.setItem(CREW_LIBRARY_KEY, JSON.stringify(library));
}

function formatDate(value) {
  if (!value) return "Shoot Date TBD";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Shoot Date TBD";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function createBlankProject() {
  return {
    projectName: "",
    clientName: "",
    logo: "",
    shootDays: [createDay(1)],
    crew: [{ ...createCrewMember(), role: "DP / Producer", callTime: "8:30 AM" }],
    clients: [{ ...createClient(), role: "Client Contact", callTime: "No Call" }],
    locations: [{ ...createLocation(), name: "Main Location" }],
    attachments: [createAttachment()],
  };
}

export default function App() {
  const blankProject = createBlankProject();

  const [projectName, setProjectName] = useState(blankProject.projectName);
  const [clientName, setClientName] = useState(blankProject.clientName);
  const [logo, setLogo] = useState(blankProject.logo);
  const [shootDays, setShootDays] = useState(blankProject.shootDays);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [crew, setCrew] = useState(blankProject.crew);
  const [clients, setClients] = useState(blankProject.clients);
  const [locations, setLocations] = useState(blankProject.locations);
  const [attachments, setAttachments] = useState(blankProject.attachments);

  const [crewLibrary, setCrewLibrary] = useState(loadCrewLibrary());
  const [selectedCrewLibraryId, setSelectedCrewLibraryId] = useState("");

  const activeDay = shootDays[activeDayIndex] || shootDays[0];

  const currentProject = {
    projectName,
    clientName,
    logo,
    shootDays,
    crew,
    clients,
    locations,
    attachments,
  };

  const loadProjectIntoEditor = (project) => {
    setProjectName(project.projectName || "");
    setClientName(project.clientName || "");
    setLogo(project.logo || "");
    setShootDays(project.shootDays || [createDay(1)]);
    setCrew(project.crew || []);
    setClients(project.clients || []);
    setLocations(project.locations || []);
    setAttachments(project.attachments || []);
    setActiveDayIndex(0);
    localStorage.setItem(LAST_PROJECT_KEY, project.projectName || "Imported Project");
  };

  const handleExportProjectJson = () => {
    const safeName = projectName || "call-sheet-project";
    const fileName = `${safeName}.json`;

    const dataStr = JSON.stringify(currentProject, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleImportProjectJson = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedProject = JSON.parse(e.target.result);

        if (!importedProject || typeof importedProject !== "object") {
          alert("Invalid project file.");
          return;
        }

        loadProjectIntoEditor(importedProject);
        alert("Project opened successfully.");
      } catch (error) {
        alert("Could not open project file.");
        console.error(error);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const handleNewProject = () => {
    if (!confirm("Start a new blank project? Unsaved changes will be lost.")) return;
    loadProjectIntoEditor(createBlankProject());
  };
const handleOpenCrewLibraryFile = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const importedCrewLibrary = JSON.parse(e.target.result);

      if (!Array.isArray(importedCrewLibrary)) {
        alert("Invalid crew library file.");
        return;
      }

      saveCrewLibrary(importedCrewLibrary);
      setCrewLibrary(importedCrewLibrary);
      alert("Crew library opened successfully.");
    } catch (error) {
      alert("Could not open crew library file.");
      console.error(error);
    }
  };

  reader.readAsText(file);
  event.target.value = "";
};
  const downloadCrewLibraryFile = (library) => {
  const dataStr = JSON.stringify(library, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "CIF-Crew-Library.json";
  link.click();

  URL.revokeObjectURL(url);
};

const saveCrewMemberToLibrary = (member) => {
  if (!member.name.trim()) {
    alert("Enter a crew name before saving to library.");
    return;
  }

  const existingIndex = crewLibrary.findIndex(
    (saved) => saved.name.trim().toLowerCase() === member.name.trim().toLowerCase()
  );

  let updatedLibrary;

  if (existingIndex >= 0) {
    updatedLibrary = crewLibrary.map((saved, index) =>
      index === existingIndex ? { ...member, id: saved.id } : saved
    );
    alert(`${member.name} updated in crew library. Replace the shared Google Drive crew file with the downloaded version.`);
  } else {
    updatedLibrary = [
      ...crewLibrary,
      {
        ...member,
        id: Date.now() + Math.random(),
      },
    ];
    alert(`${member.name} saved to crew library. Replace the shared Google Drive crew file with the downloaded version.`);
  }

  saveCrewLibrary(updatedLibrary);
  setCrewLibrary(updatedLibrary);
  downloadCrewLibraryFile(updatedLibrary);
};

   
  const addCrewFromLibrary = () => {
    if (!selectedCrewLibraryId) {
      alert("Select a saved crew member first.");
      return;
    }

    const member = crewLibrary.find((m) => String(m.id) === String(selectedCrewLibraryId));

    if (!member) {
      alert("Crew member not found.");
      return;
    }

    setCrew((items) => [
      ...items,
      {
        ...member,
        id: Date.now() + Math.random(),
      },
    ]);

    setSelectedCrewLibraryId("");
  };

  const deleteCrewFromLibrary = () => {
    if (!selectedCrewLibraryId) {
      alert("Select a saved crew member to delete.");
      return;
    }

    const member = crewLibrary.find((m) => String(m.id) === String(selectedCrewLibraryId));

    if (!member) {
      alert("Crew member not found.");
      return;
    }

    if (!confirm(`Delete "${member.name}" from the crew library?`)) return;

    const updatedLibrary = crewLibrary.filter(
      (m) => String(m.id) !== String(selectedCrewLibraryId)
    );

    saveCrewLibrary(updatedLibrary);
    setCrewLibrary(updatedLibrary);
    setSelectedCrewLibraryId("");
    alert("Crew member deleted from library.");
  };

  const loadSelectedCrewForEditing = () => {
    if (!selectedCrewLibraryId) {
      alert("Select a saved crew member first.");
      return;
    }

    const member = crewLibrary.find((m) => String(m.id) === String(selectedCrewLibraryId));

    if (!member) {
      alert("Crew member not found.");
      return;
    }

    setCrew((items) => [
      {
        ...member,
        id: member.id,
      },
      ...items,
    ]);

    alert(`${member.name} loaded into crew list for editing.`);
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
          ? {
              ...day,
              schedule: [...day.schedule, { time: "", activity: "", location: "", notes: "" }],
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

  const updateCrew = (index, field, value) =>
    setCrew((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const updateClient = (index, field, value) =>
    setClients((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const updateLocation = (index, field, value) =>
    setLocations((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const updateAttachment = (index, field, value) =>
    setAttachments((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const handleLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const autoFillWeather = async () => {
    const weatherLocation = activeDay.weatherLocation?.trim();

    if (!weatherLocation) {
      alert("Enter weather location, such as Daytona Beach, FL or full address.");
      return;
    }

    if (!activeDay.date) {
      alert("Please add a shoot date first.");
      return;
    }

    const API_KEY = "8809bc59713d4cd6a5b162755260305";

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
          weatherLocation
        )}&days=7`
      );

      const data = await response.json();

      if (!data || data.error) {
        alert("Weather not found. Try city/state or full address.");
        return;
      }

      const forecastDay = data.forecast.forecastday.find((d) => d.date === activeDay.date);

      if (!forecastDay) {
        alert("Forecast not available for that date yet.");
        return;
      }

      updateDay(
        "weatherTemp",
        `${Math.round(forecastDay.day.maxtemp_f)}° / ${Math.round(forecastDay.day.mintemp_f)}°`
      );

      updateDay("weatherConditions", forecastDay.day.condition.text);

      updateDay(
        "sunTimes",
        `Sunrise ${forecastDay.astro.sunrise} / Sunset ${forecastDay.astro.sunset}`
      );
    } catch {
      alert("Weather lookup failed.");
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    const element = document.querySelector(".preview");

    if (!element) {
      alert("Could not find call sheet preview.");
      return;
    }

    const options = {
      margin: 0.25,
      filename: `${projectName || "call-sheet"}-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="app-page" style={styles.page}>
      <style>{`
        @media print {
          .no-print { display: none !important; }

          .app-page {
            display: block !important;
            padding: 0 !important;
            background: white !important;
          }

          body { background: white; margin: 0; }

          .preview {
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0.35in !important;
            margin: 0 auto !important;
          }

          .day-section, .people-section, .location-section, .attachments-section {
            page-break-inside: avoid;
          }

          a { color: black; text-decoration: none; }
        }

        @page {
          size: letter;
          margin: 0.35in;
        }
      `}</style>

      <div className="no-print" style={styles.editor}>
        <h1>CIF Call Sheet Builder</h1>
        <p style={styles.muted}>Google Drive Project File Workflow</p>

        <Section title="Project Manager">
          <Input
            label="Project Name"
            value={projectName}
            onChange={setProjectName}
            placeholder="Example: ACS Flagstaff Event"
          />

          <button onClick={handleExportProjectJson} style={styles.printButton}>
            Save Project File
          </button>

          <button
            type="button"
            onClick={() => document.getElementById("importProjectFileInput").click()}
            style={styles.secondaryButton}
          >
            Open Project File
          </button>

          <input
            id="importProjectFileInput"
            type="file"
            accept=".json"
            onChange={handleImportProjectJson}
            style={{ display: "none" }}
          />

          <button onClick={handleNewProject} style={styles.secondaryButton}>
            New Blank Project
          </button>
        </Section>

        <Section title="Project Info">
         <Input label="Session Name" value={projectName} onChange={setProjectName} />
          <Input label="Client Name" value={clientName} onChange={setClientName} />
        </Section>

        <Section title="Logo / Branding">
          <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
          {logo && <img src={logo} alt="Logo" style={styles.logoPreview} />}
          {logo && <button onClick={() => setLogo("")} style={styles.smallDangerButton}>Clear Logo</button>}
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
          {shootDays.length > 1 && (
            <button onClick={removeActiveDay} style={styles.dangerButton}>
              Remove Active Day
            </button>
          )}
        </Section>

        <Section title={`Active Day: ${activeDay.label}`}>
          <Input label="Day Label" value={activeDay.label} onChange={(v) => updateDay("label", v)} />
          <Input label="Shoot Date" type="date" value={activeDay.date} onChange={(v) => updateDay("date", v)} />
          <Input label="Crew Call" value={activeDay.callTime} onChange={(v) => updateDay("callTime", v)} />
          <Input label="Lunch" value={activeDay.lunch} onChange={(v) => updateDay("lunch", v)} />
          <Input label="Wrap" value={activeDay.wrap} onChange={(v) => updateDay("wrap", v)} />

          <div style={styles.weatherBox}>
            <h3 style={styles.weatherTitle}>Weather</h3>
            <p style={styles.helpText}>
              Use city/state or full address. Example: Daytona Beach, FL or 3637 Cardinal Blvd, Daytona Beach, FL.
            </p>
            <Input
              label="Weather Location"
              value={activeDay.weatherLocation}
              onChange={(v) => updateDay("weatherLocation", v)}
              placeholder="Example: Daytona Beach, FL"
            />
            <button onClick={autoFillWeather} style={styles.secondaryButton}>Auto Fill Weather</button>
            <Input label="Weather Temp" value={activeDay.weatherTemp} onChange={(v) => updateDay("weatherTemp", v)} />
            <Input label="Weather Conditions" value={activeDay.weatherConditions} onChange={(v) => updateDay("weatherConditions", v)} />
            <Input label="Sunrise / Sunset" value={activeDay.sunTimes} onChange={(v) => updateDay("sunTimes", v)} />
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
              <Textarea label="Full Shoot Address" value={location.address} onChange={(v) => updateLocation(index, "address", v)} />
              {location.address && (
                <a href={getMapLink(location.address)} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              )}
              <Textarea label="Parking" value={location.parking} onChange={(v) => updateLocation(index, "parking", v)} />
              <Textarea label="Load-In" value={location.loadIn} onChange={(v) => updateLocation(index, "loadIn", v)} />
              <Textarea label="Notes" value={location.notes} onChange={(v) => updateLocation(index, "notes", v)} />
              <button
                onClick={() =>
                  setLocations((items) => (items.length > 1 ? items.filter((_, i) => i !== index) : items))
                }
                style={styles.smallDangerButton}
              >
                Remove Location
              </button>
            </div>
          ))}
          <button onClick={() => setLocations((items) => [...items, createLocation()])} style={styles.secondaryButton}>
            + Add Location
          </button>
        </Section>

        <Section title="Attachments / Documents">
          {attachments.map((attachment, index) => (
            <div key={attachment.id} style={styles.card}>
              <Input label="Document Name" value={attachment.name} onChange={(v) => updateAttachment(index, "name", v)} />
              <Input label="Document Link" value={attachment.url} onChange={(v) => updateAttachment(index, "url", v)} />
              <Textarea label="Notes" value={attachment.notes} onChange={(v) => updateAttachment(index, "notes", v)} />
              <button
                onClick={() =>
                  setAttachments((items) => (items.length > 1 ? items.filter((_, i) => i !== index) : items))
                }
                style={styles.smallDangerButton}
              >
                Remove Document
              </button>
            </div>
          ))}
          <button onClick={() => setAttachments((items) => [...items, createAttachment()])} style={styles.secondaryButton}>
            + Add Document
          </button>
        </Section>

       <Section title="Crew / Vendors">
  <div style={styles.card}>
    <h3 style={{ margin: 0 }}>Crew Library</h3>

    <button
      type="button"
      onClick={() => document.getElementById("crewLibraryFileInput").click()}
      style={styles.secondaryButton}
    >
      Open Crew Library
    </button>

    <input
      id="crewLibraryFileInput"
      type="file"
      accept=".json"
      onChange={handleOpenCrewLibraryFile}
      style={{ display: "none" }}
    />

    <label style={styles.label}>
      Select Saved Crew Member
      <select
        value={selectedCrewLibraryId}
        onChange={(e) => setSelectedCrewLibraryId(e.target.value)}
        style={styles.input}
      >
        <option value="">Select crew member...</option>
        {crewLibrary.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name || "Unnamed"} — {member.role || "No Role"}
          </option>
        ))}
      </select>
    </label>

    <button onClick={addCrewFromLibrary} style={styles.secondaryButton}>
      Add Saved Crew Member
    </button>

    <button onClick={loadSelectedCrewForEditing} style={styles.secondaryButton}>
      Load Selected Crew for Editing
    </button>

    <button onClick={deleteCrewFromLibrary} style={styles.dangerButton}>
      Delete Selected Saved Crew
    </button>
  </div>

  {crew.map((member, index) => (
    <div key={member.id} style={styles.card}>
      <Input label="Name" value={member.name} onChange={(v) => updateCrew(index, "name", v)} />
      <Input label="Role" value={member.role} onChange={(v) => updateCrew(index, "role", v)} />
      <Input label="Call Time" value={member.callTime} onChange={(v) => updateCrew(index, "callTime", v)} />
      <Input label="Phone" value={member.phone} onChange={(v) => updateCrew(index, "phone", v)} />
      <Textarea label="Responsibilities" value={member.responsibility} onChange={(v) => updateCrew(index, "responsibility", v)} />

      <button onClick={() => saveCrewMemberToLibrary(member)} style={styles.secondaryButton}>
        Save Crew Member
      </button>

      <button
        onClick={() => setCrew((items) => items.filter((_, i) => i !== index))}
        style={styles.smallDangerButton}
      >
        Remove Crew from This Call Sheet
      </button>
    </div>
  ))}

  <button onClick={() => setCrew((items) => [...items, createCrewMember()])} style={styles.secondaryButton}>
    + Add New Crew Member
  </button>
</Section>
        <Section title="Clients / Talent">
          {clients.map((client, index) => (
            <div key={client.id} style={styles.card}>
              <Input label="Name" value={client.name} onChange={(v) => updateClient(index, "name", v)} />
              <Input label="Role" value={client.role} onChange={(v) => updateClient(index, "role", v)} />
              <Input label="Call Time" value={client.callTime} onChange={(v) => updateClient(index, "callTime", v)} />
              <Input label="Contact Info" value={client.contact} onChange={(v) => updateClient(index, "contact", v)} />
              <Textarea label="Notes" value={client.notes} onChange={(v) => updateClient(index, "notes", v)} />
              <button
                onClick={() => setClients((items) => (items.length > 1 ? items.filter((_, i) => i !== index) : items))}
                style={styles.smallDangerButton}
              >
                Remove Client
              </button>
            </div>
          ))}
          <button onClick={() => setClients((items) => [...items, createClient()])} style={styles.secondaryButton}>
            + Add Client
          </button>
        </Section>

        <button onClick={handlePrint} style={styles.printButton}>Print</button>
        <button onClick={handleDownloadPdf} style={styles.printButton}>Download PDF</button>
      </div>

      <div className="preview" style={styles.preview}>
        <div style={styles.previewHeader}>
          <div>
            <div style={styles.eyebrow}>Production Call Sheet</div>
            <h1 style={styles.previewTitle}>{projectName || "Session Name"}</h1>
            <div style={styles.headerMetaRow}>
              <span><strong>Client:</strong> {clientName || "Client Name"}</span>
              <span><strong>Shoot Days:</strong> {shootDays.length}</span>
            </div>
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
              <strong>Weather Location:</strong> {day.weatherLocation || "TBD"}
              <br />
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
              <p>
                <strong>Address:</strong>{" "}
                {location.address ? (
                  <a href={getMapLink(location.address)} target="_blank" rel="noreferrer">
                    {location.address}
                  </a>
                ) : (
                  "TBD"
                )}
              </p>
              <p><strong>Parking:</strong> {location.parking || "TBD"}</p>
              <p><strong>Load-In:</strong> {location.loadIn || "TBD"}</p>
              <p><strong>Notes:</strong> {location.notes || "—"}</p>
            </div>
          ))}
        </PreviewSection>

        <PreviewSection title="Attachments / Documents">
          <Table
            headers={["Document", "Link", "Notes"]}
            rows={attachments.map((doc) => [
              doc.name || "Document",
              doc.url ? <a href={doc.url} target="_blank" rel="noreferrer">Open Link</a> : "—",
              doc.notes,
            ])}
          />
        </PreviewSection>

        <PreviewSection title="Crew / Vendors">
          <Table
            headers={["Name", "Role", "Call", "Phone", "Responsibilities"]}
            rows={crew.map((m) => [m.name, m.role, m.callTime, m.phone, m.responsibility])}
          />
        </PreviewSection>

        <PreviewSection title="Clients / Talent">
          <Table
            headers={["Name", "Role", "Call", "Contact", "Notes"]}
            rows={clients.map((c) => [c.name, c.role, c.callTime, c.contact, c.notes])}
          />
        </PreviewSection>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2>{title}</h2>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function PreviewSection({ title, children }) {
  return (
    <div style={styles.peopleSection}>
      <h2 style={styles.previewSectionTitle}>{title}</h2>
      {children}
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
        onChange={(e) => onChange(e.target.value)}
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
        onChange={(e) => onChange(e.target.value)}
        style={styles.textarea}
      />
    </label>
  );
}

function Table({ headers, rows }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} style={styles.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={j === 0 ? styles.tdStrong : styles.td}>
                {cell || "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
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
  editor: { display: "flex", flexDirection: "column", gap: 16 },
  muted: { color: "#64748b", marginTop: -10 },
  helpText: { color: "#475569", fontSize: 13, lineHeight: 1.4, margin: 0 },
  section: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  sectionBody: { display: "flex", flexDirection: "column", gap: 12 },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
  },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14 },
  textarea: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    minHeight: 70,
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
  weatherBox: {
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  weatherTitle: { margin: 0, fontSize: 16 },
  previewWeatherBox: {
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  dayTabs: { display: "flex", flexWrap: "wrap", gap: 8 },
  tabButton: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  activeTab: { background: "#0f172a", color: "white" },
  secondaryButton: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
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
    width: "8.5in",
    maxWidth: "100%",
    padding: "0.5in",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    alignSelf: "start",
    boxSizing: "border-box",
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
  previewTitle: { fontSize: 34, margin: "8px 0", color: "#020617", letterSpacing: -0.8 },
  headerMetaRow: { display: "flex", gap: 20, fontSize: 14, color: "#334155", marginTop: 6 },
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
  },
  logoPreview: {
    maxWidth: 160,
    maxHeight: 80,
    objectFit: "contain",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 8,
  },
  logoImage: { maxWidth: 170, maxHeight: 95, objectFit: "contain" },
  daySection: { marginTop: 34 },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    borderBottom: "2px solid #020617",
    paddingBottom: 14,
    marginBottom: 16,
  },
  dayTitle: { margin: "4px 0 0 0", fontSize: 28 },
  dayMeta: { textAlign: "right", fontSize: 14, color: "#334155", lineHeight: 1.6 },
  peopleSection: { marginTop: 38 },
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
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: {
    textAlign: "left",
    background: "#020617",
    color: "white",
    padding: "10px 12px",
    fontSize: 12,
    textTransform: "uppercase",
  },
  td: { borderTop: "1px solid #e2e8f0", padding: "10px 12px", verticalAlign: "top" },
  tdStrong: {
    borderTop: "1px solid #e2e8f0",
    padding: "10px 12px",
    verticalAlign: "top",
    fontWeight: "900",
  },
};
        
